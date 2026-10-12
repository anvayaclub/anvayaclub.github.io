import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { TeamMember } from '../models/TeamMember.js';
import { AuditLog } from '../models/AuditLog.js';
import { Role } from '../models/Role.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore, SYSTEM_PERMISSIONS } from '../services/store.js';
import { AuthRequest } from '../middleware/auth.js';
import { recordFailedLoginAttempt, resetLoginAttempts } from '../middleware/rateLimiter.js';

// Mutex lock to protect initial bootstrap against concurrent race conditions
let isSetupInProgress = false;

// Validation helpers
export const isValidUsn = (usn: string): boolean => {
  // Matches VTU/KIT USN format: e.g. 1KI22IS001, 1KT21IS005, or alphanumeric 10-char format
  return /^1[A-Za-z0-9]{9}$/.test(usn.trim());
};

export const normalizeUsn = (usn: string): string => {
  return usn.trim().toUpperCase();
};

export const isValidPassword = (password: string): { valid: boolean; reason?: string } => {
  if (password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Za-z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one letter.' };
  }
  if (!/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one number or special character.' };
  }
  return { valid: true };
};

// 1. Check if First-Time Technical Setup is available
export const getSetupStatus = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const technicalCount = await User.countDocuments({ role: { $in: ['technical', 'admin'] } });
      res.json({
        success: true,
        setupAvailable: technicalCount === 0,
        databaseConnected: true,
      });
      return;
    }

    // In test environment, check memory store
    if (process.env.NODE_ENV === 'test') {
      const technicalCount = memoryStore.users.filter(u => u.role === 'technical' || u.role === 'admin').length;
      res.json({
        success: true,
        setupAvailable: technicalCount === 0,
        databaseConnected: true,
      });
      return;
    }

    // Database is not connected in runtime
    res.json({
      success: true,
      setupAvailable: false,
      databaseConnected: false,
      message: 'Database connection required: Please configure MONGODB_URI in your .env file with your MongoDB Atlas connection string.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to verify initial setup status.' });
  }
};

// 2. First-Time Technical Account Setup (One-Time Bootstrap)
export const setupInitialTechnicalAdmin = async (req: Request, res: Response): Promise<void> => {
  if (isSetupInProgress) {
    res.status(409).json({
      success: false,
      message: 'Initial technical setup is currently in progress. Please wait a moment.',
    });
    return;
  }

  isSetupInProgress = true;

  try {
    // Database requirement check
    if (!isDbConnected() && process.env.NODE_ENV !== 'test') {
      res.status(503).json({
        success: false,
        code: 'DATABASE_NOT_CONFIGURED',
        message: 'MongoDB connection is required for initial setup. Please configure MONGODB_URI in .env with your MongoDB Atlas connection string.',
      });
      return;
    }

    // Verify whether a technical account already exists
    let technicalExists = false;
    if (isDbConnected()) {
      const count = await User.countDocuments({ role: { $in: ['technical', 'admin'] } });
      technicalExists = count > 0;
    } else {
      technicalExists = memoryStore.users.some(u => u.role === 'technical' || u.role === 'admin');
    }

    if (technicalExists) {
      res.status(403).json({
        success: false,
        message: 'Initial technical administrator setup has already been completed. Public setup is permanently disabled.',
      });
      return;
    }

    const { name, usn, email, password, confirmPassword } = req.body;

    // Validate inputs
    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Full name is required.' });
      return;
    }

    if (!usn || !usn.trim()) {
      res.status(400).json({ success: false, message: 'USN is required.' });
      return;
    }

    const normalizedUsn = normalizeUsn(usn);
    if (!isValidUsn(normalizedUsn)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-character USN (e.g., 1KI22IS001).',
      });
      return;
    }

    if (!password) {
      res.status(400).json({ success: false, message: 'Password is required.' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Password confirmation does not match.' });
      return;
    }

    const passCheck = isValidPassword(password);
    if (!passCheck.valid) {
      res.status(400).json({ success: false, message: passCheck.reason });
      return;
    }

    const normalizedEmail = email && email.trim() ? email.trim().toLowerCase() : undefined;
    if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      res.status(400).json({ success: false, message: 'Please provide a valid institutional email address.' });
      return;
    }

    // Check unique USN constraint
    if (isDbConnected()) {
      const existingUsn = await User.findOne({ usn: normalizedUsn });
      if (existingUsn) {
        res.status(400).json({
          success: false,
          message: `An account with USN ${normalizedUsn} already exists.`,
        });
        return;
      }

      if (normalizedEmail) {
        const existingEmail = await User.findOne({ email: normalizedEmail });
        if (existingEmail) {
          res.status(400).json({
            success: false,
            message: `An account with email ${normalizedEmail} already exists.`,
          });
          return;
        }
      }

      const passwordHash = await bcrypt.hash(password, 12);

      // Server explicitly assigns 'technical' role
      const newAdmin = await User.create({
        name: name.trim(),
        usn: normalizedUsn,
        email: normalizedEmail,
        passwordHash,
        role: 'technical',
        branch: 'ISE',
        status: 'active',
        lastLogin: new Date(),
      });

      // Link pending TeamMember if exists
      const pendingTeam = await TeamMember.findOne({ usn: normalizedUsn });
      if (pendingTeam) {
        pendingTeam.linkedUserId = newAdmin._id;
        pendingTeam.appRole = 'technical';
        pendingTeam.accountLinkStatus = 'linked';
        await pendingTeam.save();

        newAdmin.linkedTeamMemberId = pendingTeam._id;
        await newAdmin.save();
      }

      // Record audit record
      await AuditLog.create({
        action: 'INITIAL_TECHNICAL_SETUP',
        performedBy: newAdmin._id,
        performedByName: newAdmin.name,
        performedByRole: 'technical',
        targetUser: newAdmin._id,
        targetUserName: newAdmin.name,
        targetUserUsn: normalizedUsn,
        details: { message: 'Initial Technical Administrator created via setup portal.' },
        ipAddress: req.ip,
      });

      const secret = process.env.JWT_SECRET || 'anvaya_kit_secure_dev_secret_key_2026';
      const token = jwt.sign(
        {
          id: newAdmin._id,
          usn: newAdmin.usn,
          email: newAdmin.email,
          role: 'technical',
          name: newAdmin.name,
        },
        secret,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Initial Technical Administrator account created successfully! Welcome to Anvaya.',
        token,
        user: {
          id: newAdmin._id,
          name: newAdmin.name,
          usn: newAdmin.usn,
          email: newAdmin.email,
          role: 'technical',
          branch: newAdmin.branch,
          permissions: SYSTEM_PERMISSIONS.map(p => p.id),
        },
      });
    } else {
      // Memory Store fallback (for test environment)
      const existingUsn = memoryStore.users.find(u => u.usn?.toUpperCase() === normalizedUsn);
      if (existingUsn) {
        res.status(400).json({ success: false, message: `An account with USN ${normalizedUsn} already exists.` });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUserId = `usr_tech_${Date.now()}`;
      const newAdmin = {
        _id: newUserId,
        id: newUserId,
        name: name.trim(),
        usn: normalizedUsn,
        email: normalizedEmail,
        passwordHash,
        role: 'technical',
        branch: 'ISE',
        status: 'active',
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      memoryStore.users.push(newAdmin);

      // Record audit
      memoryStore.auditLogs.push({
        _id: `audit_${Date.now()}`,
        action: 'INITIAL_TECHNICAL_SETUP',
        performedByName: newAdmin.name,
        performedByRole: 'technical',
        targetUserName: newAdmin.name,
        targetUserUsn: normalizedUsn,
        details: { message: 'Initial Technical Administrator created via setup portal.' },
        createdAt: new Date().toISOString(),
      });

      const secret = process.env.JWT_SECRET || 'anvaya_kit_secure_dev_secret_key_2026';
      const token = jwt.sign(
        {
          id: newUserId,
          usn: normalizedUsn,
          email: normalizedEmail,
          role: 'technical',
          name: newAdmin.name,
        },
        secret,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Initial Technical Administrator account created successfully! Welcome to Anvaya.',
        token,
        user: {
          id: newUserId,
          name: newAdmin.name,
          usn: normalizedUsn,
          email: normalizedEmail,
          role: 'technical',
          branch: 'ISE',
          permissions: SYSTEM_PERMISSIONS.map(p => p.id),
        },
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Internal error during technical setup.' });
  } finally {
    isSetupInProgress = false;
  }
};

// 3. User Login (Authenticates Technical, Media-Poster, and Student accounts)
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Database requirement check
    if (!isDbConnected() && process.env.NODE_ENV !== 'test') {
      res.status(503).json({
        success: false,
        code: 'DATABASE_NOT_CONFIGURED',
        message: 'Database connection is required for authentication. Please configure MONGODB_URI in .env with your MongoDB Atlas connection string.',
      });
      return;
    }

    const { email, usn, identifier, password } = req.body;
    const loginIdentifier = (identifier || email || usn || '').trim();

    if (!loginIdentifier || !password) {
      res.status(400).json({ success: false, message: 'Please provide your Email or USN, along with your password.' });
      return;
    }

    const isEmail = loginIdentifier.includes('@');
    const normalizedIdentifier = isEmail ? loginIdentifier.toLowerCase() : loginIdentifier.toUpperCase();

    let user: any = null;
    let isMatch = false;

    if (isDbConnected()) {
      user = await User.findOne(
        isEmail ? { email: normalizedIdentifier } : { usn: normalizedIdentifier }
      );

      if (user) {
        if (user.status === 'deactivated' || user.status === 'inactive') {
          res.status(403).json({
            success: false,
            message: 'This account has been deactivated. Please contact the Technical Administrator.',
          });
          return;
        }
        isMatch = await user.comparePassword(password);
      }
    } else {
      user = memoryStore.users.find(u => {
        if (isEmail) {
          return u.email?.toLowerCase() === normalizedIdentifier;
        }
        return u.usn?.toUpperCase() === normalizedIdentifier;
      });

      if (user) {
        if (user.status === 'deactivated' || user.status === 'inactive') {
          res.status(403).json({
            success: false,
            message: 'This account has been deactivated. Please contact the Technical Administrator.',
          });
          return;
        }
        isMatch = await bcrypt.compare(password, user.passwordHash);
      }
    }

    if (!user || !isMatch) {
      recordFailedLoginAttempt(req);
      res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your Email/USN and password.' });
      return;
    }

    // Reset failed login attempts on successful login
    resetLoginAttempts(req);

    // Update lastLogin
    if (isDbConnected()) {
      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    }

    const secret = process.env.JWT_SECRET || 'anvaya_kit_secure_dev_secret_key_2026';
    const roleKey = user.role || 'student';

    let permissions: string[] = [];
    if (roleKey === 'technical' || roleKey === 'admin') {
      permissions = SYSTEM_PERMISSIONS.map(p => p.id);
    } else if (roleKey === 'media-poster') {
      permissions = ['manage_gallery'];
    } else if (roleKey === 'student') {
      permissions = [];
    } else {
      // Custom role lookup
      if (isDbConnected()) {
        const foundRole = await Role.findOne({ key: roleKey, isActive: true });
        if (foundRole) permissions = foundRole.permissions || [];
      } else {
        const foundRole = memoryStore.roles.find(r => r.key === roleKey && r.isActive);
        if (foundRole) permissions = foundRole.permissions || [];
      }
    }

    const token = jwt.sign(
      {
        id: user._id || user.id,
        email: user.email,
        usn: user.usn,
        role: roleKey,
        name: user.name,
      },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful. Welcome to Anvaya!',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        usn: user.usn,
        role: roleKey,
        branch: user.branch || 'ISE',
        semester: user.semester,
        status: user.status || 'active',
        isTemporaryPassword: user.isTemporaryPassword || false,
        permissions,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
  }
};

// 4. Public Student Registration
export const registerStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isDbConnected() && process.env.NODE_ENV !== 'test') {
      res.status(503).json({
        success: false,
        code: 'DATABASE_NOT_CONFIGURED',
        message: 'Database connection is required for student registration. Please configure MONGODB_URI in .env.',
      });
      return;
    }

    const { name, usn, email, password, branch, semester } = req.body;

    if (!name || !usn || !password) {
      res.status(400).json({ success: false, message: 'Full Name, USN, and Password are required.' });
      return;
    }

    const normalizedUsn = normalizeUsn(usn);
    if (!isValidUsn(normalizedUsn)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-character USN (e.g., 1KI22IS001).',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    const normalizedEmail = email && email.trim() ? email.trim().toLowerCase() : undefined;

    // Server forcibly assigns 'student' role (public users can NEVER self-elevate)
    const assignedRole = 'student';

    if (isDbConnected()) {
      const existingUsn = await User.findOne({ usn: normalizedUsn });
      if (existingUsn) {
        res.status(400).json({ success: false, message: `An account is already registered with USN ${normalizedUsn}. Please sign in.` });
        return;
      }

      if (normalizedEmail) {
        const existingEmail = await User.findOne({ email: normalizedEmail });
        if (existingEmail) {
          res.status(400).json({ success: false, message: `An account is already registered with email ${normalizedEmail}. Please sign in.` });
          return;
        }
      }

      // Check if team member entry exists with this USN
      const pendingTeam = await TeamMember.findOne({ usn: normalizedUsn });
      // If team member has a specific appRole pre-assigned by technical admin, link it
      const finalRole = pendingTeam?.appRole || assignedRole;

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        usn: normalizedUsn,
        passwordHash,
        role: finalRole,
        branch: (branch || 'ISE').trim(),
        semester: (semester || '6th Semester').trim(),
        status: 'active',
        lastLogin: new Date(),
        linkedTeamMemberId: pendingTeam?._id,
      });

      if (pendingTeam) {
        pendingTeam.linkedUserId = newUser._id;
        pendingTeam.accountLinkStatus = 'linked';
        await pendingTeam.save();
      }

      const secret = process.env.JWT_SECRET || 'anvaya_kit_secure_dev_secret_key_2026';
      const token = jwt.sign(
        {
          id: newUser._id,
          email: newUser.email,
          usn: newUser.usn,
          role: newUser.role,
          name: newUser.name,
        },
        secret,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Student account created successfully! You are now logged in.',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          usn: newUser.usn,
          role: newUser.role,
          branch: newUser.branch,
          semester: newUser.semester,
        },
      });
    } else {
      // Memory store fallback for test
      const existingUsn = memoryStore.users.find(u => u.usn?.toUpperCase() === normalizedUsn);
      if (existingUsn) {
        res.status(400).json({ success: false, message: `An account is already registered with USN ${normalizedUsn}. Please sign in.` });
        return;
      }

      if (normalizedEmail) {
        const existingEmail = memoryStore.users.find(u => u.email?.toLowerCase() === normalizedEmail);
        if (existingEmail) {
          res.status(400).json({ success: false, message: `An account is already registered with email ${normalizedEmail}. Please sign in.` });
          return;
        }
      }

      const pendingTeam = memoryStore.teamMembers.find(t => t.usn?.toUpperCase() === normalizedUsn);
      const finalRole = pendingTeam?.appRole || assignedRole;

      const passwordHash = await bcrypt.hash(password, 10);
      const newUserId = `usr_std_${Date.now()}`;
      const newUser = {
        _id: newUserId,
        id: newUserId,
        name: name.trim(),
        email: normalizedEmail,
        usn: normalizedUsn,
        passwordHash,
        role: finalRole,
        branch: (branch || 'ISE').trim(),
        semester: (semester || '6th Semester').trim(),
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      memoryStore.users.push(newUser);

      if (pendingTeam) {
        pendingTeam.linkedUserId = newUserId;
        pendingTeam.accountLinkStatus = 'linked';
      }

      const secret = process.env.JWT_SECRET || 'anvaya_kit_secure_dev_secret_key_2026';
      const token = jwt.sign(
        {
          id: newUser._id,
          email: newUser.email,
          usn: newUser.usn,
          role: newUser.role,
          name: newUser.name,
        },
        secret,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Student account created successfully! You are now logged in.',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          usn: newUser.usn,
          role: newUser.role,
          branch: newUser.branch,
          semester: newUser.semester,
        },
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
};

// 5. Get current authenticated user profile
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized session.' });
      return;
    }

    let userDetails: any = null;
    if (isDbConnected()) {
      userDetails = await User.findById(req.user.id).select('-passwordHash');
    } else {
      userDetails = memoryStore.users.find(u => (u._id || u.id) === req.user?.id);
    }

    res.json({
      success: true,
      user: {
        id: req.user.id,
        name: userDetails?.name || req.user.name,
        email: userDetails?.email || req.user.email,
        usn: userDetails?.usn || req.user.usn,
        role: req.user.role,
        branch: userDetails?.branch || 'ISE',
        semester: userDetails?.semester,
        status: userDetails?.status || 'active',
        permissions: req.user.permissions || [],
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch user session profile.' });
  }
};

// 6. User Management: Get list of users (Technical Administrator only)
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, role, status } = req.query;
    const s = String(search || '').trim().toLowerCase();
    const r = String(role || '').trim();
    const st = String(status || '').trim();

    if (isDbConnected()) {
      const query: any = {};
      if (s) {
        query.$or = [
          { name: { $regex: s, $options: 'i' } },
          { usn: { $regex: s, $options: 'i' } },
          { email: { $regex: s, $options: 'i' } },
        ];
      }
      if (r && r !== 'all') {
        query.role = r;
      }
      if (st && st !== 'all') {
        query.status = st;
      }

      const users = await User.find(query)
        .select('name usn email role branch semester status isTemporaryPassword lastLogin createdAt')
        .sort({ createdAt: -1 });

      res.json({ success: true, data: users });
    } else {
      let users = memoryStore.users.map(u => ({
        _id: u._id || u.id,
        id: u._id || u.id,
        name: u.name,
        usn: u.usn,
        email: u.email,
        role: u.role,
        branch: u.branch || 'ISE',
        semester: u.semester,
        status: u.status || 'active',
        isTemporaryPassword: u.isTemporaryPassword || false,
        lastLogin: u.lastLogin,
        createdAt: u.createdAt,
      }));

      if (s) {
        users = users.filter(u =>
          u.name?.toLowerCase().includes(s) ||
          u.usn?.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s)
        );
      }
      if (r && r !== 'all') {
        users = users.filter(u => u.role === r);
      }
      if (st && st !== 'all') {
        users = users.filter(u => u.status === st);
      }

      res.json({ success: true, data: users });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user accounts.' });
  }
};

// 7. User Management: Technical admin creates an account for a student/member
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, usn, email, role, branch, semester, temporaryPassword } = req.body;

    if (!name || !name.trim() || !usn || !usn.trim()) {
      res.status(400).json({ success: false, message: 'Full Name and USN are required.' });
      return;
    }

    const normalizedUsn = normalizeUsn(usn);
    if (!isValidUsn(normalizedUsn)) {
      res.status(400).json({ success: false, message: 'Please provide a valid 10-character USN (e.g. 1KI22IS001).' });
      return;
    }

    const normalizedEmail = email && email.trim() ? email.trim().toLowerCase() : undefined;
    const assignedRole = role && role.trim() ? role.trim() : 'student';

    // Generate or use temporary password
    const tempPassword = temporaryPassword && temporaryPassword.trim()
      ? temporaryPassword.trim()
      : `Anvaya@${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const passwordHash = await bcrypt.hash(tempPassword, 10);

    if (isDbConnected()) {
      const existingUsn = await User.findOne({ usn: normalizedUsn });
      if (existingUsn) {
        res.status(400).json({ success: false, message: `An account already exists with USN ${normalizedUsn}.` });
        return;
      }

      if (normalizedEmail) {
        const existingEmail = await User.findOne({ email: normalizedEmail });
        if (existingEmail) {
          res.status(400).json({ success: false, message: `An account already exists with email ${normalizedEmail}.` });
          return;
        }
      }

      const newUser = await User.create({
        name: name.trim(),
        usn: normalizedUsn,
        email: normalizedEmail,
        passwordHash,
        role: assignedRole,
        branch: (branch || 'ISE').trim(),
        semester: (semester || '6th Semester').trim(),
        status: 'active',
        isTemporaryPassword: true,
      });

      // Link pending TeamMember if exists
      const pendingTeam = await TeamMember.findOne({ usn: normalizedUsn });
      if (pendingTeam) {
        pendingTeam.linkedUserId = newUser._id;
        pendingTeam.appRole = assignedRole;
        pendingTeam.accountLinkStatus = 'linked';
        await pendingTeam.save();
      }

      // Record Audit
      await AuditLog.create({
        action: 'ACCOUNT_CREATED',
        performedBy: req.user?.id as any,
        performedByName: req.user?.name || 'Administrator',
        performedByRole: req.user?.role || 'technical',
        targetUser: newUser._id,
        targetUserName: newUser.name,
        targetUserUsn: normalizedUsn,
        details: { assignedRole, createdViaAdmin: true },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully. Provide the temporary password to the student.',
        temporaryPassword: tempPassword,
        user: {
          id: newUser._id,
          name: newUser.name,
          usn: newUser.usn,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          isTemporaryPassword: true,
        },
      });
    } else {
      // Memory store fallback
      const existingUsn = memoryStore.users.find(u => u.usn?.toUpperCase() === normalizedUsn);
      if (existingUsn) {
        res.status(400).json({ success: false, message: `An account already exists with USN ${normalizedUsn}.` });
        return;
      }

      const newUserId = `usr_${Date.now()}`;
      const newUser = {
        _id: newUserId,
        id: newUserId,
        name: name.trim(),
        usn: normalizedUsn,
        email: normalizedEmail,
        passwordHash,
        role: assignedRole,
        branch: (branch || 'ISE').trim(),
        semester: (semester || '6th Semester').trim(),
        status: 'active',
        isTemporaryPassword: true,
        createdAt: new Date().toISOString(),
      };
      memoryStore.users.push(newUser);

      // Record Audit
      memoryStore.auditLogs.push({
        _id: `audit_${Date.now()}`,
        action: 'ACCOUNT_CREATED',
        performedByName: req.user?.name || 'Administrator',
        performedByRole: req.user?.role || 'technical',
        targetUserName: newUser.name,
        targetUserUsn: normalizedUsn,
        details: { assignedRole, createdViaAdmin: true },
        createdAt: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully. Provide the temporary password to the student.',
        temporaryPassword: tempPassword,
        user: {
          id: newUserId,
          name: newUser.name,
          usn: normalizedUsn,
          email: normalizedEmail,
          role: assignedRole,
          status: 'active',
          isTemporaryPassword: true,
        },
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create user account.' });
  }
};

// 8. User Management: Technical admin updates user role
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, reason } = req.body;

    if (!role || !role.trim()) {
      res.status(400).json({ success: false, message: 'New role is required.' });
      return;
    }

    const newRole = role.trim();

    if (isDbConnected()) {
      const targetUser = await User.findById(id);
      if (!targetUser) {
        res.status(404).json({ success: false, message: 'User account not found.' });
        return;
      }

      // Prevent demoting the last technical administrator
      if (targetUser.role === 'technical' && newRole !== 'technical') {
        const technicalCount = await User.countDocuments({ role: 'technical', status: 'active' });
        if (technicalCount <= 1) {
          res.status(400).json({
            success: false,
            message: 'Cannot demote the sole active Technical Administrator. Assign another Technical Administrator first.',
          });
          return;
        }
      }

      const previousRole = targetUser.role;
      targetUser.role = newRole;
      await targetUser.save();

      // Update linked TeamMember appRole if present
      if (targetUser.usn) {
        await TeamMember.updateMany({ usn: targetUser.usn }, { appRole: newRole });
      }

      // Record Audit
      await AuditLog.create({
        action: 'ROLE_CHANGED',
        performedBy: req.user?.id as any,
        performedByName: req.user?.name || 'Administrator',
        performedByRole: req.user?.role || 'technical',
        targetUser: targetUser._id,
        targetUserName: targetUser.name,
        targetUserUsn: targetUser.usn,
        details: { previousRole, newRole, reason: reason || 'Administrative role adjustment' },
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: `Role for ${targetUser.name} updated from '${previousRole}' to '${newRole}'.`,
        data: { id: targetUser._id, name: targetUser.name, usn: targetUser.usn, role: targetUser.role },
      });
    } else {
      // Memory store fallback
      const targetUser = memoryStore.users.find(u => (u._id || u.id) === id);
      if (!targetUser) {
        res.status(404).json({ success: false, message: 'User account not found.' });
        return;
      }

      if (targetUser.role === 'technical' && newRole !== 'technical') {
        const technicalCount = memoryStore.users.filter(u => u.role === 'technical' && u.status === 'active').length;
        if (technicalCount <= 1) {
          res.status(400).json({
            success: false,
            message: 'Cannot demote the sole active Technical Administrator. Assign another Technical Administrator first.',
          });
          return;
        }
      }

      const previousRole = targetUser.role;
      targetUser.role = newRole;

      // Update linked team members
      if (targetUser.usn) {
        memoryStore.teamMembers.forEach(tm => {
          if (tm.usn?.toUpperCase() === targetUser.usn?.toUpperCase()) {
            tm.appRole = newRole;
          }
        });
      }

      memoryStore.auditLogs.push({
        _id: `audit_${Date.now()}`,
        action: 'ROLE_CHANGED',
        performedByName: req.user?.name || 'Administrator',
        performedByRole: req.user?.role || 'technical',
        targetUserName: targetUser.name,
        targetUserUsn: targetUser.usn,
        details: { previousRole, newRole, reason: reason || 'Administrative role adjustment' },
        createdAt: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: `Role for ${targetUser.name} updated from '${previousRole}' to '${newRole}'.`,
        data: { id, name: targetUser.name, usn: targetUser.usn, role: targetUser.role },
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update user role.' });
  }
};

// 9. User Management: Technical admin activates or deactivates an account
export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!status || !['active', 'deactivated'].includes(status)) {
      res.status(400).json({ success: false, message: "Status must be either 'active' or 'deactivated'." });
      return;
    }

    if (isDbConnected()) {
      const targetUser = await User.findById(id);
      if (!targetUser) {
        res.status(404).json({ success: false, message: 'User account not found.' });
        return;
      }

      // Prevent deactivating oneself if sole active technical admin
      if (targetUser.role === 'technical' && status === 'deactivated') {
        const activeTechnicalCount = await User.countDocuments({ role: 'technical', status: 'active' });
        if (activeTechnicalCount <= 1) {
          res.status(400).json({
            success: false,
            message: 'Cannot deactivate the sole active Technical Administrator.',
          });
          return;
        }
      }

      targetUser.status = status;
      await targetUser.save();

      // Record Audit
      await AuditLog.create({
        action: status === 'active' ? 'ACCOUNT_ACTIVATED' : 'ACCOUNT_DEACTIVATED',
        performedBy: req.user?.id as any,
        performedByName: req.user?.name || 'Administrator',
        performedByRole: req.user?.role || 'technical',
        targetUser: targetUser._id,
        targetUserName: targetUser.name,
        targetUserUsn: targetUser.usn,
        details: { status, reason: reason || 'Administrative status toggle' },
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: `Account for ${targetUser.name} has been ${status === 'active' ? 'activated' : 'deactivated'}.`,
        data: { id: targetUser._id, name: targetUser.name, status: targetUser.status },
      });
    } else {
      // Memory store fallback
      const targetUser = memoryStore.users.find(u => (u._id || u.id) === id);
      if (!targetUser) {
        res.status(404).json({ success: false, message: 'User account not found.' });
        return;
      }

      if (targetUser.role === 'technical' && status === 'deactivated') {
        const activeTechnicalCount = memoryStore.users.filter(u => u.role === 'technical' && u.status === 'active').length;
        if (activeTechnicalCount <= 1) {
          res.status(400).json({
            success: false,
            message: 'Cannot deactivate the sole active Technical Administrator.',
          });
          return;
        }
      }

      targetUser.status = status;

      memoryStore.auditLogs.push({
        _id: `audit_${Date.now()}`,
        action: status === 'active' ? 'ACCOUNT_ACTIVATED' : 'ACCOUNT_DEACTIVATED',
        performedByName: req.user?.name || 'Administrator',
        performedByRole: req.user?.role || 'technical',
        targetUserName: targetUser.name,
        targetUserUsn: targetUser.usn,
        details: { status, reason: reason || 'Administrative status toggle' },
        createdAt: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: `Account for ${targetUser.name} has been ${status === 'active' ? 'activated' : 'deactivated'}.`,
        data: { id, name: targetUser.name, status },
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update account status.' });
  }
};

// 10. User Management: Technical admin resets a user's password
export const resetUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { temporaryPassword, reason } = req.body;

    const tempPassword = temporaryPassword && temporaryPassword.trim()
      ? temporaryPassword.trim()
      : `Anvaya@${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const passwordHash = await bcrypt.hash(tempPassword, 10);

    if (isDbConnected()) {
      const targetUser = await User.findById(id);
      if (!targetUser) {
        res.status(404).json({ success: false, message: 'User account not found.' });
        return;
      }

      targetUser.passwordHash = passwordHash;
      targetUser.isTemporaryPassword = true;
      await targetUser.save();

      // Record Audit
      await AuditLog.create({
        action: 'PASSWORD_RESET',
        performedBy: req.user?.id as any,
        performedByName: req.user?.name || 'Administrator',
        performedByRole: req.user?.role || 'technical',
        targetUser: targetUser._id,
        targetUserName: targetUser.name,
        targetUserUsn: targetUser.usn,
        details: { reason: reason || 'Administrative password reset' },
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: `Password reset successfully for ${targetUser.name}. Share the temporary password securely with the user.`,
        temporaryPassword: tempPassword,
      });
    } else {
      // Memory store fallback
      const targetUser = memoryStore.users.find(u => (u._id || u.id) === id);
      if (!targetUser) {
        res.status(404).json({ success: false, message: 'User account not found.' });
        return;
      }

      targetUser.passwordHash = passwordHash;
      targetUser.isTemporaryPassword = true;

      memoryStore.auditLogs.push({
        _id: `audit_${Date.now()}`,
        action: 'PASSWORD_RESET',
        performedByName: req.user?.name || 'Administrator',
        performedByRole: req.user?.role || 'technical',
        targetUserName: targetUser.name,
        targetUserUsn: targetUser.usn,
        details: { reason: reason || 'Administrative password reset' },
        createdAt: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: `Password reset successfully for ${targetUser.name}. Share the temporary password securely with the user.`,
        temporaryPassword: tempPassword,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to reset user password.' });
  }
};

// 11. Audit Logs: Review role changes and account actions
export const getAuditLogs = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
      res.json({ success: true, data: logs });
    } else {
      const logs = [...memoryStore.auditLogs].reverse().slice(0, 100);
      res.json({ success: true, data: logs });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve audit records.' });
  }
};

// Legacy alias for student search in team linking
export const getStudents = getUsers;
