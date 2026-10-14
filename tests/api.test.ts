import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server/src/app.js';
import { memoryStore } from '../server/src/services/store.js';

describe('Anvaya Cultural Committee API Test Suite', () => {
  let technicalToken = '';
  let technicalUsn = '1KI22IS001';
  let studentToken = '';
  let studentUsn = '1KI23IS045';
  let createdUserId = '';

  it('GET /api/health should return online status and institution name', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('online');
    expect(res.body.institution).toContain('Kalpataru Institute of Technology');
  });

  it('GET /api/team should return active cultural committee team members', async () => {
    const res = await request(app).get('/api/team');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/events should return published events', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // Security test: Verify that hardcoded administrator credentials do NOT exist
  it('POST /api/auth/login should reject retired hardcoded admin credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@anvaya.kit', password: 'AnvayaAdminKIT2026!' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 1. Initial Setup Status
  it('GET /api/auth/setup-status should report setupAvailable when no technical account exists', async () => {
    const res = await request(app).get('/api/auth/setup-status');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.setupAvailable).toBe(true);
  });

  // 2. Reject invalid setup requests
  it('POST /api/auth/setup should reject incomplete or invalid form submissions', async () => {
    // Missing USN
    const res1 = await request(app)
      .post('/api/auth/setup')
      .send({ name: 'Adithya K S', password: 'MasterPassword123!', confirmPassword: 'MasterPassword123!' });
    expect(res1.status).toBe(400);

    // Mismatched passwords
    const res2 = await request(app)
      .post('/api/auth/setup')
      .send({
        name: 'Adithya K S',
        usn: technicalUsn,
        password: 'MasterPassword123!',
        confirmPassword: 'MismatchPassword123!',
      });
    expect(res2.status).toBe(400);

    // Short password
    const res3 = await request(app)
      .post('/api/auth/setup')
      .send({
        name: 'Adithya K S',
        usn: technicalUsn,
        password: 'short',
        confirmPassword: 'short',
      });
    expect(res3.status).toBe(400);
  });

  // 3. Create initial Technical Account
  it('POST /api/auth/setup should create the first technical account and assign technical role', async () => {
    const res = await request(app)
      .post('/api/auth/setup')
      .send({
        name: 'Adithya K S',
        usn: technicalUsn,
        email: 'adithya@kit-tiptur.ac.in',
        password: 'SecureMasterPassword2026!',
        confirmPassword: 'SecureMasterPassword2026!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('technical');
    expect(res.body.user.usn).toBe(technicalUsn);
    expect(res.body.token).toBeDefined();

    technicalToken = res.body.token;
  });

  // 4. Verify initial setup is permanently disabled after bootstrap
  it('GET /api/auth/setup-status should now report setupAvailable as false', async () => {
    const res = await request(app).get('/api/auth/setup-status');
    expect(res.status).toBe(200);
    expect(res.body.setupAvailable).toBe(false);
  });

  it('POST /api/auth/setup should permanently reject subsequent setup attempts', async () => {
    const res = await request(app)
      .post('/api/auth/setup')
      .send({
        name: 'Second Admin',
        usn: '1KI22IS002',
        password: 'AnotherPassword2026!',
        confirmPassword: 'AnotherPassword2026!',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // 5. Authentication with newly created technical account
  it('POST /api/auth/login should authenticate the technical account via USN', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: technicalUsn,
        password: 'SecureMasterPassword2026!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('technical');
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/login should authenticate the technical account via Email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'adithya@kit-tiptur.ac.in',
        password: 'SecureMasterPassword2026!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.usn).toBe(technicalUsn);
  });

  it('POST /api/auth/login with wrong password should return 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: technicalUsn, password: 'WrongPassword999' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 6. Public Student Registration & Privilege Enforcement
  it('POST /api/auth/register should create student account with student role only', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Tejaswini M',
        usn: studentUsn,
        email: 'tejaswini@kit-tiptur.ac.in',
        password: 'PasswordKIT2026!',
        branch: 'ISE',
        semester: '4th Semester',
        role: 'technical', // Attempt to self-elevate should be IGNORED
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.usn).toBe(studentUsn);
    expect(res.body.user.role).toBe('student'); // Must still be student!
    expect(res.body.token).toBeDefined();

    studentToken = res.body.token;
  });

  it('POST /api/auth/register should reject duplicate USN', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate Student',
        usn: studentUsn,
        email: 'duplicate@kit-tiptur.ac.in',
        password: 'PasswordKIT2026!',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 7. Route & Privilege Guard Tests
  it('POST /api/events should reject unauthorized event creation by student', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Unauthorized Fest',
        description: 'Should fail',
        venue: 'Auditorium',
        dateTime: '2026-12-01',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/users should reject unauthorized user management access by student', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // 8. Technical User Management Operations
  it('GET /api/users should allow technical user to list accounts', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${technicalToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('POST /api/users should allow technical user to create member account with temporary password', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${technicalToken}`)
      .send({
        name: 'Darshan K',
        usn: '1KI22IS020',
        email: 'darshan@kit-tiptur.ac.in',
        role: 'student',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.temporaryPassword).toBeDefined();
    expect(res.body.user.usn).toBe('1KI22IS020');

    createdUserId = res.body.user.id || res.body.user._id;
  });

  it('PATCH /api/users/:id/role should allow technical user to upgrade role to media-poster', async () => {
    const res = await request(app)
      .patch(`/api/users/${createdUserId}/role`)
      .set('Authorization', `Bearer ${technicalToken}`)
      .send({ role: 'media-poster', reason: 'Appointed cultural media coordinator' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('media-poster');
  });

  it('PATCH /api/users/:id/status should allow technical user to deactivate an account', async () => {
    const res = await request(app)
      .patch(`/api/users/${createdUserId}/status`)
      .set('Authorization', `Bearer ${technicalToken}`)
      .send({ status: 'deactivated', reason: 'Graduated / Inactive member' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('deactivated');
  });

  it('POST /api/users/:id/reset-password should reset member password and generate new credentials', async () => {
    const res = await request(app)
      .post(`/api/users/${createdUserId}/reset-password`)
      .set('Authorization', `Bearer ${technicalToken}`)
      .send({ reason: 'Requested by student via ISE HOD' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.temporaryPassword).toBeDefined();
  });

  it('GET /api/audit-logs should return security audit records for administrative actions', async () => {
    const res = await request(app)
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${technicalToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const setupLog = res.body.data.find((l: any) => l.action === 'INITIAL_TECHNICAL_SETUP');
    expect(setupLog).toBeDefined();
  });

  // 9. Public Certificate Verification
  it('POST /api/certificates/verify should verify valid participant', async () => {
    const res = await request(app)
      .post('/api/certificates/verify')
      .send({
        configId: 'cert_1',
        fullName: 'Adithya K S',
        usn: '1KI22IS001',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recipientName).toBe('Adithya K S');
  });

  // 10. Student Project Proposal
  it('POST /api/projects/idea should record a student project proposal', async () => {
    const res = await request(app)
      .post('/api/projects/idea')
      .send({
        title: 'Smart Stage Curtains',
        description: 'Automated motor-driven stage curtains triggered by event timer.',
        studentName: 'Naveen Kumar',
        usn: '1KI23IS055',
        contactInfo: 'naveen@kit-tiptur.ac.in',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  // 11. EIGHT COMMITTEE ROLES & PERMISSIONS TEST SUITE
  const committeePositions = [
    { key: 'president', name: 'President', designation: 'President' },
    { key: 'vice-president', name: 'Vice President', designation: 'Vice President' },
    { key: 'secretary', name: 'Secretary', designation: 'Secretary' },
    { key: 'treasurer', name: 'Treasurer', designation: 'Treasurer' },
    { key: 'speaker', name: 'Speaker', designation: 'Speaker' },
    { key: 'cultural', name: 'Cultural', designation: 'Cultural' },
    { key: 'sports', name: 'Sports', designation: 'Sports' },
    { key: 'event-management', name: 'Event Management', designation: 'Event Management' },
  ];

  it('GET /api/roles should return all eight committee positions along with system roles', async () => {
    const res = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${technicalToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const keys = res.body.data.map((r: any) => r.key);
    for (const cp of committeePositions) {
      expect(keys).toContain(cp.key);
    }
    expect(keys).toContain('technical');
    expect(keys).toContain('media-poster');
    expect(keys).toContain('student');
  });

  it('POST /api/team should allow Technical Admin to assign each of the 8 committee positions', async () => {
    let orderNum = 10;
    for (const cp of committeePositions) {
      orderNum++;
      const res = await request(app)
        .post('/api/team')
        .set('Authorization', `Bearer ${technicalToken}`)
        .send({
          name: `Leader ${cp.name}`,
          usn: `1KI24IS0${orderNum}`,
          role: cp.designation,
          appRole: cp.key,
          department: 'ISE',
          academicYear: 'Final Year',
          bio: `Dedicated committee member serving as ${cp.name}.`,
          order: orderNum,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.appRole).toBe(cp.key);
      expect(res.body.data.role).toBe(cp.designation);
    }
  });

  it('GET /api/team should return correct public designations for all committee members', async () => {
    const res = await request(app).get('/api/team');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const rolesList = res.body.data.map((m: any) => m.role);
    for (const cp of committeePositions) {
      expect(rolesList).toContain(cp.designation);
    }
  });

  // Verify Committee Member (e.g. President) Privileges and Restrictions
  let presidentToken = '';
  const presidentUsn = '1KI24IS099';

  it('POST /api/users should allow Technical Admin to create a user account with President role', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${technicalToken}`)
      .send({
        name: 'Darshan G',
        usn: presidentUsn,
        email: 'darshan@kit-tiptur.ac.in',
        role: 'president',
        branch: 'ISE',
        temporaryPassword: 'PresidentPassword2026!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('president');
  });

  it('POST /api/auth/login should authenticate President and return empty admin permissions', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: presidentUsn,
        password: 'PresidentPassword2026!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('president');
    expect(res.body.user.permissions).toEqual([]); // Zero administrative permissions!
    presidentToken = res.body.token;
  });

  it('SECURITY: Committee member (President) must be DENIED access to Admin Dashboard endpoints', async () => {
    // 1. Cannot fetch admin users
    const resUsers = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${presidentToken}`);
    expect(resUsers.status).toBe(403);

    // 2. Cannot create events
    const resEvent = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${presidentToken}`)
      .send({ title: 'Hacked Event', summary: 'test', description: 'test', dateTime: '2026-12-01' });
    expect(resEvent.status).toBe(403);

    // 3. Cannot manage roles
    const resRole = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${presidentToken}`)
      .send({ name: 'Hacked Role', key: 'hacked', description: 'test' });
    expect(resRole.status).toBe(403);

    // 4. Cannot manage committee members
    const resTeam = await request(app)
      .post('/api/team')
      .set('Authorization', `Bearer ${presidentToken}`)
      .send({ name: 'Hacked Member', role: 'President' });
    expect(resTeam.status).toBe(403);

    // 5. Cannot modify other users' roles
    const resUserRole = await request(app)
      .patch(`/api/users/${createdUserId}/role`)
      .set('Authorization', `Bearer ${presidentToken}`)
      .send({ role: 'technical' });
    expect(resUserRole.status).toBe(403);
  });

  it('ALLOWED: Committee member (President) can manage their OWN projects', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${presidentToken}`)
      .send({
        title: 'Cultural Event Mobile App',
        summary: 'Mobile guide for annual inter-college fest.',
        description: 'React Native application with real-time schedule, campus map, and live voting.',
        category: 'Creative Tech',
        techStack: 'React Native, TypeScript',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Cultural Event Mobile App');

    // Retrieve personal projects
    const myProjectsRes = await request(app)
      .get('/api/projects/my-projects')
      .set('Authorization', `Bearer ${presidentToken}`);
    expect(myProjectsRes.status).toBe(200);
    expect(myProjectsRes.body.data.length).toBeGreaterThan(0);
  });

  it('ALLOWED: Committee member (President) can use the public Certificate Portal', async () => {
    const res = await request(app)
      .post('/api/certificates/verify')
      .send({
        configId: 'cert_1',
        fullName: 'Adithya K S',
        usn: '1KI22IS001',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ==========================================
  // MASTER BUG FIX VERIFICATION TESTS
  // ==========================================

  // BUG 1: Contact Inquiry "Mark as Read"
  describe('Bug 1: Contact Inquiry Management & Status Updates', () => {
    let createdInquiryId = '';

    it('POST /api/contact should allow users to submit contact inquiries', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({
          name: 'Pooja Sharma',
          email: 'pooja.sharma@kit.edu',
          subject: 'Dance Audition Inquiry',
          message: 'Can 1st year students register for the folk dance competition?',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id || res.body.data._id).toBeDefined();
      createdInquiryId = res.body.data.id || res.body.data._id;
    });

    it('GET /api/contact/admin should return inquiries with a valid virtual id property', async () => {
      const res = await request(app)
        .get('/api/contact/admin')
        .set('Authorization', `Bearer ${technicalToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const target = res.body.data.find((item: any) => (item.id === createdInquiryId || item._id === createdInquiryId));
      expect(target).toBeDefined();
      expect(target.id).toBeDefined();
      expect(target.id).not.toBe('undefined');
    });

    it('PATCH /api/contact/admin/:id should successfully mark an inquiry as read', async () => {
      const res = await request(app)
        .patch(`/api/contact/admin/${createdInquiryId}`)
        .set('Authorization', `Bearer ${technicalToken}`)
        .send({ status: 'read' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('read');
    });

    it('PATCH /api/contact/admin/:id should reject string "undefined" as ID with HTTP 400', async () => {
      const res = await request(app)
        .patch('/api/contact/admin/undefined')
        .set('Authorization', `Bearer ${technicalToken}`)
        .send({ status: 'read' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid or missing contact inquiry identifier');
    });

    it('PATCH /api/contact/admin/:id should reject invalid status values with HTTP 400', async () => {
      const res = await request(app)
        .patch(`/api/contact/admin/${createdInquiryId}`)
        .set('Authorization', `Bearer ${technicalToken}`)
        .send({ status: 'invalid_status' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid status');
    });
  });

  // BUG 2: Event Registration Flow
  describe('Bug 2: Event Registration & Duplicate Prevention', () => {
    const regUsn = '1KI23IS099';

    it('POST /api/events/:id/register should allow registration using event ID', async () => {
      const res = await request(app)
        .post('/api/events/ev_1/register')
        .send({
          fullName: 'Suresh Kumar',
          usn: regUsn,
          email: 'suresh@kit-tiptur.ac.in',
          phone: '9876543210',
          branch: 'ISE',
          semester: '6th Semester',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.usn).toBe(regUsn);
      expect(res.body.data.id).toBeDefined();
    });

    it('POST /api/events/:id/register should reject duplicate registration for the same USN', async () => {
      const res = await request(app)
        .post('/api/events/ev_1/register')
        .send({
          fullName: 'Suresh Kumar',
          usn: regUsn,
          email: 'suresh@kit-tiptur.ac.in',
          phone: '9876543210',
          branch: 'ISE',
          semester: '6th Semester',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already registered');
    });

    it('POST /api/events/:id/register should allow registration using event slug', async () => {
      const res = await request(app)
        .post('/api/events/swaralaya-vocal-competition-2026/register')
        .send({
          fullName: 'Ananya Rao',
          usn: '1KI23IS088',
          email: 'ananya@kit-tiptur.ac.in',
          phone: '9845012345',
          branch: 'ISE',
          semester: '4th Semester',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.usn).toBe('1KI23IS088');
    });

    it('POST /api/events/:id/register should reject registration when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/events/ev_1/register')
        .send({
          fullName: 'Test Student',
          usn: '',
          email: 'test@kit.edu',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/events/:id/register should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/events/ev_1/register')
        .send({
          fullName: 'Test Student',
          usn: '1KI23IS077',
          email: 'invalid-email',
          phone: '9988776655',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // BUG 3: Certificate Configuration Deletion Flow
  describe('Bug 3: Certificate Configuration Deletion & Safety Safeguards', () => {
    let testConfigId = '';

    it('POST /api/certificates/admin/configs should create a test certificate configuration', async () => {
      const res = await request(app)
        .post('/api/certificates/admin/configs')
        .set('Authorization', `Bearer ${technicalToken}`)
        .send({
          eventId: 'ev_1',
          eventTitle: 'Rhythms of Tiptur',
          eventDate: '5 November 2026',
          certificateTitle: 'Certificate of Excellence',
          bodyTemplate: 'has demonstrated outstanding choreography in Rhythms of Tiptur.',
          isEnabled: true,
          signatories: [{ name: 'HOD ISE', role: 'Head of Department' }],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      testConfigId = res.body.data.id || res.body.data._id;
      expect(testConfigId).toBeDefined();
    });

    it('DELETE /api/certificates/admin/configs/:id should directly delete config with zero participants', async () => {
      const res = await request(app)
        .delete(`/api/certificates/admin/configs/${testConfigId}`)
        .set('Authorization', `Bearer ${technicalToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('DELETE /api/certificates/admin/configs/:id should return 409 Conflict when participants exist without force flag', async () => {
      // cert_1 has 4 participants
      const res = await request(app)
        .delete('/api/certificates/admin/configs/cert_1')
        .set('Authorization', `Bearer ${technicalToken}`);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.requiresConfirmation).toBe(true);
      expect(res.body.participantsCount).toBeGreaterThan(0);
    });

    it('DELETE /api/certificates/admin/configs/:id should reject string "undefined" as ID', async () => {
      const res = await request(app)
        .delete('/api/certificates/admin/configs/undefined')
        .set('Authorization', `Bearer ${technicalToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // BUG 4: Media Uploads & Streaming
  describe('Bug 4: Media Uploads, Signatures, and Memory Streaming', () => {
    it('GET /api/upload/signature should handle signature request safely', async () => {
      const res = await request(app)
        .get('/api/upload/signature')
        .set('Authorization', `Bearer ${technicalToken}`);

      expect([200, 503]).toContain(res.status);
      expect(typeof res.body.success).toBe('boolean');
    });

    it('POST /api/upload should reject upload when no file is attached', async () => {
      const res = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${technicalToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('No file uploaded.');
    });

    it('POST /api/upload should accept an image file buffer and return fileUrl', async () => {
      const testBuffer = Buffer.from('fake-png-image-binary-stream-for-anvaya');
      const res = await request(app)
        .post('/api/upload')
        .set('Authorization', `Bearer ${technicalToken}`)
        .attach('file', testBuffer, 'poster.png');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.fileUrl).toBeDefined();
    });
  });

  // STUDENT ACCOUNT MANAGEMENT & DELETION
  describe('Student Account Management, Profile Updates, USN Synchronization, and Permanent Deletion', () => {
    let testStudentId = '';
    const initialUsn = '1KI23IS088';
    const initialEmail = 'kavya@kit-tiptur.ac.in';
    const studentPassword = 'SecureStudentPassword2026!';

    it('PUT /api/users/:id should reject unauthenticated or non-technical requests', async () => {
      // Unauthenticated
      const res1 = await request(app)
        .put('/api/users/some-id')
        .send({ name: 'Hacked Name', usn: '1KI23IS099', email: 'hacked@kit.edu' });
      expect(res1.status).toBe(401);

      // Student token
      const res2 = await request(app)
        .put('/api/users/some-id')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ name: 'Hacked Name', usn: '1KI23IS099', email: 'hacked@kit.edu' });
      expect(res2.status).toBe(403);
    });

    it('POST /api/auth/register should create a test student account to be managed', async () => {
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Kavya N',
          usn: initialUsn,
          email: initialEmail,
          password: studentPassword,
          branch: 'ISE',
          semester: '6th Semester',
        });

      expect(regRes.status).toBe(201);
      expect(regRes.body.success).toBe(true);
      testStudentId = regRes.body.user.id || regRes.body.user._id;
      expect(testStudentId).toBeDefined();

      // Add a test team member linked to this student to test cascading USN updates
      memoryStore.teamMembers.push({
        _id: 'team_test_kavya',
        id: 'team_test_kavya',
        name: 'Kavya N',
        role: 'Cultural Lead',
        usn: initialUsn,
        linkedUserId: testStudentId,
        accountLinkStatus: 'linked',
        displayOrder: 99,
        isActive: true,
      });
    });

    it('PUT /api/users/:id should reject duplicate USN or duplicate email', async () => {
      // Duplicate USN of technical admin
      const resUsn = await request(app)
        .put(`/api/users/${testStudentId}`)
        .set('Authorization', `Bearer ${technicalToken}`)
        .send({
          name: 'Kavya N',
          usn: technicalUsn, // Already in use
          email: 'kavya.new@kit-tiptur.ac.in',
        });

      expect(resUsn.status).toBe(400);
      expect(resUsn.body.success).toBe(false);
      expect(resUsn.body.message).toContain('already exists with USN');

      // Duplicate email
      const resEmail = await request(app)
        .put(`/api/users/${testStudentId}`)
        .set('Authorization', `Bearer ${technicalToken}`)
        .send({
          name: 'Kavya N',
          usn: '1KI23IS099',
          email: 'adithya@kit-tiptur.ac.in', // Already in use by technical admin
        });

      expect(resEmail.status).toBe(400);
      expect(resEmail.body.success).toBe(false);
      expect(resEmail.body.message).toContain('already exists with email');
    });

    it('PUT /api/users/:id should successfully update student details and synchronize USN across records', async () => {
      const updatedUsn = '1KI23IS099';
      const updatedEmail = 'kavya.narayan@kit-tiptur.ac.in';
      const updatedName = 'Kavya Narayan';

      const updateRes = await request(app)
        .put(`/api/users/${testStudentId}`)
        .set('Authorization', `Bearer ${technicalToken}`)
        .send({
          name: updatedName,
          usn: updatedUsn,
          email: updatedEmail,
          branch: 'ISE',
          semester: '6th Semester',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.name).toBe(updatedName);
      expect(updateRes.body.data.usn).toBe(updatedUsn);
      expect(updateRes.body.data.email).toBe(updatedEmail);

      // Verify cascading sync in teamMembers
      const linkedTeamMember = memoryStore.teamMembers.find(tm => (tm._id || tm.id) === 'team_test_kavya');
      expect(linkedTeamMember).toBeDefined();
      expect(linkedTeamMember?.usn).toBe(updatedUsn);
      expect(linkedTeamMember?.name).toBe(updatedName);

      // Verify login with updated USN succeeds
      const newLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ identifier: updatedUsn, password: studentPassword });
      expect(newLoginRes.status).toBe(200);
      expect(newLoginRes.body.success).toBe(true);

      // Verify login with updated email succeeds
      const emailLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ identifier: updatedEmail, password: studentPassword });
      expect(emailLoginRes.status).toBe(200);
      expect(emailLoginRes.body.success).toBe(true);

      // Verify login with obsolete USN fails
      const oldLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ identifier: initialUsn, password: studentPassword });
      expect(oldLoginRes.status).toBe(401);
      expect(oldLoginRes.body.success).toBe(false);

      // Verify audit trail recorded ACCOUNT_UPDATED
      const auditRes = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${technicalToken}`);
      const updateAudit = auditRes.body.data.find(
        (l: any) => l.action === 'ACCOUNT_UPDATED' && l.targetUserUsn === updatedUsn
      );
      expect(updateAudit).toBeDefined();
    });

    it('DELETE /api/users/:id should reject unauthorized requests and protect the sole Technical Administrator', async () => {
      // Non-technical user forbidden
      const resNonTech = await request(app)
        .delete(`/api/users/${testStudentId}`)
        .set('Authorization', `Bearer ${studentToken}`);
      expect(resNonTech.status).toBe(403);

      // Technical admin cannot delete sole active technical administrator
      const techUser = memoryStore.users.find(u => u.role === 'technical' && u.usn === technicalUsn);
      const techId = techUser?._id || techUser?.id;

      const resSoleAdmin = await request(app)
        .delete(`/api/users/${techId}`)
        .set('Authorization', `Bearer ${technicalToken}`);
      expect(resSoleAdmin.status).toBe(400);
      expect(resSoleAdmin.body.message).toContain('sole active Technical Administrator');
    });

    it('DELETE /api/users/:id should permanently delete student account while safely unlinking associated records', async () => {
      const deleteRes = await request(app)
        .delete(`/api/users/${testStudentId}`)
        .set('Authorization', `Bearer ${technicalToken}`)
        .send({ reason: 'Student graduated / requested account closure' });

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // Verify student cannot log in after deletion
      const loginAfterDelete = await request(app)
        .post('/api/auth/login')
        .send({ identifier: '1KI23IS099', password: studentPassword });
      expect(loginAfterDelete.status).toBe(401);

      // Verify user document is removed
      const userInStore = memoryStore.users.find(u => (u._id || u.id) === testStudentId);
      expect(userInStore).toBeUndefined();

      // Verify team member was preserved and safely unlinked
      const teamMemberAfter = memoryStore.teamMembers.find(tm => (tm._id || tm.id) === 'team_test_kavya');
      expect(teamMemberAfter).toBeDefined();
      expect(teamMemberAfter?.linkedUserId).toBeUndefined();
      expect(teamMemberAfter?.accountLinkStatus).toBe('unlinked');

      // Verify audit log recorded ACCOUNT_DELETED
      const auditRes = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${technicalToken}`);
      const deleteAudit = auditRes.body.data.find(
        (l: any) => l.action === 'ACCOUNT_DELETED' && l.targetUserUsn === '1KI23IS099'
      );
      expect(deleteAudit).toBeDefined();
    });
  });
});

