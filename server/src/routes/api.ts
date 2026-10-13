import express, { Request, Response } from 'express';
import {
  getSetupStatus,
  setupInitialTechnicalAdmin,
  login,
  registerStudent,
  getMe,
  getUsers,
  createUser,
  updateUserRole,
  updateUserStatus,
  resetUserPassword,
  getAuditLogs,
  getStudents,
} from '../controllers/authController.js';
import { loginRateLimiter, setupRateLimiter } from '../middleware/rateLimiter.js';
import { getRoles, getPermissions, createRole, updateRole, deleteRole } from '../controllers/roleController.js';
import { getTeam, getAdminTeam, createTeamMember, updateTeamMember, deleteTeamMember } from '../controllers/teamController.js';
import {
  getEvents,
  getAdminEvents,
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getEventRegistrations,
  exportEventRegistrationsCsv,
} from '../controllers/eventController.js';
import {
  getActiveConfigs,
  verifyCertificate,
  getAdminConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
  getParticipants,
  importParticipants,
  addParticipant,
  toggleRevoke,
  deleteParticipant,
  exportBackup,
} from '../controllers/certificateController.js';
import {
  getProjects,
  getMyProjects,
  submitProjectIdea,
  getAdminProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectIdeas,
  updateProjectIdeaStatus,
} from '../controllers/projectController.js';
import {
  getAlbums,
  getMedia,
  getAdminAlbums,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getAdminMedia,
  createMedia,
  updateMedia,
  deleteMedia,
} from '../controllers/galleryController.js';
import {
  applyMembership,
  getAdminApplications,
  updateApplicationStatus,
  deleteApplication,
} from '../controllers/membershipController.js';
import {
  getAnnouncements,
  getAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  subscribeNewsletter,
  getNewsletterSubscribers,
  submitContact,
  getContactSubmissions,
  updateContactStatus,
  getSettings,
  updateSettings,
} from '../controllers/communicationController.js';
import { searchGlobal } from '../controllers/searchController.js';
import { authenticateToken, optionalAuth, requireTechnical, requireMediaPoster } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadMediaBuffer, generateCloudinarySignature, isCloudinaryConfigured } from '../services/mediaService.js';

const router = express.Router();

// 1. Authentication & Student Accounts
router.get('/auth/setup-status', getSetupStatus);
router.post('/auth/setup', setupRateLimiter, setupInitialTechnicalAdmin);
router.post('/auth/login', loginRateLimiter, login);
router.post('/auth/register', registerStudent);
router.get('/auth/me', authenticateToken, getMe);

// User Accounts & Privileges Management (Technical only)
router.get('/users', authenticateToken, requireTechnical, getUsers);
router.post('/users', authenticateToken, requireTechnical, createUser);
router.patch('/users/:id/role', authenticateToken, requireTechnical, updateUserRole);
router.patch('/users/:id/status', authenticateToken, requireTechnical, updateUserStatus);
router.post('/users/:id/reset-password', authenticateToken, requireTechnical, resetUserPassword);
router.get('/audit-logs', authenticateToken, requireTechnical, getAuditLogs);
router.get('/users/students', authenticateToken, requireTechnical, getStudents);

// 2. Roles & Permissions Management (Technical only)
router.get('/roles', authenticateToken, requireTechnical, getRoles);
router.get('/roles/permissions', authenticateToken, requireTechnical, getPermissions);
router.post('/roles', authenticateToken, requireTechnical, createRole);
router.put('/roles/:id', authenticateToken, requireTechnical, updateRole);
router.delete('/roles/:id', authenticateToken, requireTechnical, deleteRole);

// 3. Team & Committee Directory
router.get('/team', getTeam);
router.get('/team/admin', authenticateToken, requireTechnical, getAdminTeam);
router.post('/team', authenticateToken, requireTechnical, createTeamMember);
router.put('/team/:id', authenticateToken, requireTechnical, updateTeamMember);
router.delete('/team/:id', authenticateToken, requireTechnical, deleteTeamMember);

// 4. Cultural Events & Registrations
router.get('/events', getEvents);
router.get('/events/admin', authenticateToken, requireTechnical, getAdminEvents);
router.get('/events/:slug', getEventBySlug);
router.post('/events', authenticateToken, requireTechnical, createEvent);
router.put('/events/:id', authenticateToken, requireTechnical, updateEvent);
router.delete('/events/:id', authenticateToken, requireTechnical, deleteEvent);
router.post('/events/:id/register', optionalAuth, registerForEvent);
router.get('/events/:id/registrations', authenticateToken, requireTechnical, getEventRegistrations);
router.get('/events/:id/registrations/export', authenticateToken, requireTechnical, exportEventRegistrationsCsv);

// 5. Certificates & Verification
router.get('/certificates/configs', getActiveConfigs);
router.post('/certificates/verify', verifyCertificate);
router.get('/certificates/admin/configs', authenticateToken, requireTechnical, getAdminConfigs);
router.post('/certificates/admin/configs', authenticateToken, requireTechnical, createConfig);
router.put('/certificates/admin/configs/:id', authenticateToken, requireTechnical, updateConfig);
router.delete('/certificates/admin/configs/:id', authenticateToken, requireTechnical, deleteConfig);
router.get('/certificates/admin/configs/:id/participants', authenticateToken, requireTechnical, getParticipants);
router.post('/certificates/admin/configs/:id/participants', authenticateToken, requireTechnical, addParticipant);
router.post('/certificates/admin/configs/:id/import', authenticateToken, requireTechnical, importParticipants);
router.patch('/certificates/admin/participants/:participantId/revoke', authenticateToken, requireTechnical, toggleRevoke);
router.delete('/certificates/admin/participants/:participantId', authenticateToken, requireTechnical, deleteParticipant);
router.get('/certificates/admin/configs/:id/backup', authenticateToken, requireTechnical, exportBackup);

// 6. Student Projects & Showcase
router.get('/projects', getProjects);
router.get('/projects/my', authenticateToken, getMyProjects);
router.get('/projects/my-projects', authenticateToken, getMyProjects);
router.post('/projects', authenticateToken, createProject);
router.put('/projects/:id', authenticateToken, updateProject);
router.delete('/projects/:id', authenticateToken, deleteProject);
router.get('/projects/admin', authenticateToken, requireTechnical, getAdminProjects);
router.post('/projects/idea', submitProjectIdea);
router.get('/projects/admin/ideas', authenticateToken, requireTechnical, getProjectIdeas);
router.patch('/projects/admin/ideas/:id', authenticateToken, requireTechnical, updateProjectIdeaStatus);

// 7. Gallery & Media Management (Technical & Media-Poster)
router.get('/gallery/albums', getAlbums);
router.get('/gallery/media', getMedia);
router.get('/gallery/admin/albums', authenticateToken, requireMediaPoster, getAdminAlbums);
router.post('/gallery/admin/albums', authenticateToken, requireMediaPoster, createAlbum);
router.put('/gallery/admin/albums/:id', authenticateToken, requireMediaPoster, updateAlbum);
router.delete('/gallery/admin/albums/:id', authenticateToken, requireMediaPoster, deleteAlbum);
router.get('/gallery/admin/media', authenticateToken, requireMediaPoster, getAdminMedia);
router.post('/gallery/admin/media', authenticateToken, requireMediaPoster, createMedia);
router.put('/gallery/admin/media/:id', authenticateToken, requireMediaPoster, updateMedia);
router.delete('/gallery/admin/media/:id', authenticateToken, requireMediaPoster, deleteMedia);

// 8. Membership Applications
router.post('/membership/apply', applyMembership);
router.get('/membership/admin', authenticateToken, requireTechnical, getAdminApplications);
router.patch('/membership/:id/status', authenticateToken, requireTechnical, updateApplicationStatus);
router.delete('/membership/:id', authenticateToken, requireTechnical, deleteApplication);

// 9. Announcements, Newsletters & Inquiries
router.get('/announcements', getAnnouncements);
router.get('/announcements/admin', authenticateToken, requireTechnical, getAdminAnnouncements);
router.post('/announcements', authenticateToken, requireTechnical, createAnnouncement);
router.put('/announcements/:id', authenticateToken, requireTechnical, updateAnnouncement);
router.delete('/announcements/:id', authenticateToken, requireTechnical, deleteAnnouncement);

router.post('/newsletter/subscribe', subscribeNewsletter);
router.get('/newsletter/admin', authenticateToken, requireTechnical, getNewsletterSubscribers);

router.post('/contact', submitContact);
router.get('/contact/admin', authenticateToken, requireTechnical, getContactSubmissions);
router.patch('/contact/admin/:id', authenticateToken, requireTechnical, updateContactStatus);

router.get('/settings', getSettings);
router.put('/settings', authenticateToken, requireTechnical, updateSettings);

// 10. Global Search
router.get('/search', searchGlobal);

// 11. Secure Media Upload
router.get('/upload/signature', optionalAuth, (req: Request, res: Response) => {
  try {
    if (!isCloudinaryConfigured()) {
      res.status(503).json({
        success: false,
        message: 'Direct Cloudinary upload is not configured on the server. CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be set.',
      });
      return;
    }
    const folder = (req.query.folder as string) || 'anvaya';
    const signatureData = generateCloudinarySignature(folder);
    res.json({
      success: true,
      ...signatureData,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to generate upload signature.' });
  }
});

router.post('/upload', optionalAuth, upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded.' });
    return;
  }

  try {
    const folder = (req.body.folder as string) || 'anvaya';
    const result = await uploadMediaBuffer(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      folder
    );

    res.json({
      success: true,
      fileUrl: result.fileUrl,
      filename: result.filename,
      size: result.bytes,
      publicId: result.publicId,
      resourceType: result.resourceType,
      message: 'File uploaded successfully.',
    });
  } catch (error: any) {
    console.error('Upload processing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Media upload service failed. Please check server logs and configuration.',
    });
  }
});

export default router;
