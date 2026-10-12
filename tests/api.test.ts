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
});

