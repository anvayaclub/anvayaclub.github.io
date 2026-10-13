import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { memoryStore, SYSTEM_PERMISSIONS } from '../services/store.js';
import { Role } from '../models/Role.js';
import { User } from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { isCommitteeRole } from '../constants/roles.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    usn?: string;
    role: string;
    name?: string;
    permissions?: string[];
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required. No session token provided.' });
    return;
  }

  const secret = process.env.JWT_SECRET || 'anvaya_kit_secure_dev_secret_key_2026';

  try {
    const decoded = jwt.verify(token, secret) as any;
    const userId = decoded.id || decoded._id;

    // Verify account exists and is not deactivated
    let currentUser: any = null;
    if (isDbConnected()) {
      currentUser = await User.findById(userId);
    } else {
      currentUser = memoryStore.users.find(u => (u._id || u.id) === userId);
    }

    if (!currentUser) {
      res.status(401).json({ success: false, message: 'Account not found. Please log in again.' });
      return;
    }

    if (currentUser.status === 'deactivated' || currentUser.status === 'inactive') {
      res.status(403).json({ success: false, message: 'This account has been deactivated. Access revoked.' });
      return;
    }

    // Database role takes precedence over token payload
    const userRole = currentUser.role || decoded.role || 'student';
    let permissions: string[] = [];

    if (userRole === 'technical' || userRole === 'admin') {
      permissions = SYSTEM_PERMISSIONS.map(p => p.id);
    } else if (userRole === 'media-poster') {
      permissions = ['manage_gallery'];
    } else if (userRole === 'student' || isCommitteeRole(userRole)) {
      // Explicitly non-administrative: students and all committee positions have zero admin permissions
      permissions = [];
    } else {
      // Custom role lookup
      if (isDbConnected()) {
        const foundRole = await Role.findOne({ key: userRole, isActive: true });
        if (foundRole) {
          permissions = foundRole.permissions || [];
        }
      } else {
        const foundRole = memoryStore.roles.find(r => r.key === userRole && r.isActive);
        if (foundRole) {
          permissions = foundRole.permissions || [];
        }
      }
    }

    req.user = {
      id: userId,
      email: currentUser.email || decoded.email,
      usn: currentUser.usn || decoded.usn,
      role: userRole,
      name: currentUser.name || decoded.name,
      permissions,
    };
    next();
  } catch (err: any) {
    res.status(403).json({ success: false, message: 'Invalid or expired session token. Please log in again.' });
  }
};

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (req.user.role === 'technical' || req.user.role === 'admin' || req.user.permissions?.includes(permission)) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: `Access denied. Privileged permission '${permission}' required for this operation.`,
    });
  };
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (req.user.role === 'technical' || req.user.role === 'admin' || allowedRoles.includes(req.user.role)) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: `Access denied. Role in [${allowedRoles.join(', ')}] required.`,
    });
  };
};

// Aliases for convenience
export const requireTechnical = requireRole('technical', 'admin');
export const requireMediaPoster = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }
  if (
    req.user.role === 'technical' ||
    req.user.role === 'admin' ||
    req.user.role === 'media-poster' ||
    req.user.permissions?.includes('manage_gallery')
  ) {
    next();
    return;
  }
  res.status(403).json({ success: false, message: 'Access denied. Media Poster or Technical privileges required.' });
};

// Optional Authentication Middleware: populates req.user if a valid token is passed, but does not block guests
export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    next();
    return;
  }

  const secret = process.env.JWT_SECRET || 'anvaya_kit_secure_dev_secret_key_2026';

  try {
    const decoded = jwt.verify(token, secret) as any;
    const userId = decoded.id || decoded._id;

    let currentUser: any = null;
    if (isDbConnected()) {
      currentUser = await User.findById(userId);
    } else {
      currentUser = memoryStore.users.find(u => (u._id || u.id) === userId);
    }

    if (currentUser && currentUser.status !== 'deactivated' && currentUser.status !== 'inactive') {
      req.user = {
        id: userId,
        email: currentUser.email || decoded.email,
        usn: currentUser.usn || decoded.usn,
        role: currentUser.role || decoded.role || 'student',
        name: currentUser.name || decoded.name,
      };
    }
  } catch {
    // Ignore invalid token in optional authentication
  }

  next();
};

// Legacy backward-compatibility alias
export const requireAdmin = requireTechnical;
