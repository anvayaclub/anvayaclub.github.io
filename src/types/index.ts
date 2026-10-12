export type UserRole = string;

export interface User {
  id: string;
  _id?: string;
  name: string;
  email?: string;
  usn?: string;
  role: string;
  branch?: string;
  semester?: string;
  status?: 'active' | 'inactive' | 'deactivated';
  isTemporaryPassword?: boolean;
  lastLogin?: string;
  permissions?: string[];
  token?: string;
  createdAt?: string;
}

export interface AuditLogItem {
  _id?: string;
  id?: string;
  action: string;
  performedByName: string;
  performedByRole: string;
  targetUserName?: string;
  targetUserUsn?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface SetupStatusResponse {
  success: boolean;
  setupAvailable: boolean;
  databaseConnected: boolean;
  message?: string;
}

export interface PermissionItem {
  id: string;
  name: string;
  description: string;
}

export interface RoleItem {
  id: string;
  _id?: string;
  name: string;
  key: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface TeamMember {
  id: string;
  _id?: string;
  name: string;
  usn?: string;
  role: string; // Public-facing title
  appRole?: string; // Application access role
  department?: string;
  academicYear: string;
  bio?: string;
  photoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    instagram?: string;
    email?: string;
  };
  order: number;
  isActive: boolean;
  linkedUserId?: string;
  accountLinkStatus?: 'linked' | 'pending' | 'unlinked';
  createdAt?: string;
}

export interface EventWinner {
  position: string;
  name: string;
  usn?: string;
}

export interface EventItem {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  category: string;
  summary?: string;
  description: string;
  coverImage?: string;
  dateTime: string;
  startTime?: string;
  endTime?: string;
  venue: string;
  registrationOpeningDate?: string;
  registrationDeadline?: string;
  regCapacity?: number;
  regCount?: number;
  eligibilityCriteria?: string;
  eligibilityRules?: string;
  registrationInstructions?: string;
  organizerContact?: string;
  isExternalReg: boolean;
  externalRegUrl?: string;
  isInternalRegEnabled?: boolean;
  certificateAvailable: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'archived';
  isPublished: boolean;
  results?: {
    summary?: string;
    winners?: EventWinner[];
  };
  relatedAlbumId?: string;
  createdAt?: string;
}

export interface EventRegistration {
  id: string;
  _id?: string;
  eventId: string;
  eventTitle: string;
  userId?: string;
  fullName: string;
  usn: string;
  email: string;
  phone: string;
  branch: string;
  semester?: string;
  academicYear: string;
  registeredAt: string;
}

export interface MembershipApplication {
  id: string;
  _id?: string;
  fullName: string;
  usn: string;
  academicYear: string;
  branch: string;
  email: string;
  phone: string;
  interests: string[];
  skills: string;
  motivation: string;
  preferredRole?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  submittedAt: string;
}

export interface Signatory {
  name: string;
  role: string;
  signatureUrl?: string;
}

export interface CertificateConfig {
  id: string;
  _id?: string;
  eventId?: string;
  eventTitle: string;
  eventDate: string;
  certificateTitle: string;
  bodyTemplate: string;
  isEnabled: boolean;
  signatories: Signatory[];
  participantsCount?: number;
  isPublished: boolean;
  createdAt?: string;
}

export interface CertificateParticipant {
  id: string;
  _id?: string;
  configId: string;
  fullName: string;
  usn: string;
  certificateNumber: string;
  isRevoked: boolean;
  revocationReason?: string;
  issuedAt?: string;
}

export interface ProjectItem {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  category: string;
  status: 'ongoing' | 'completed';
  summary: string;
  description: string;
  coverImage?: string;
  techStack: string[];
  teamMembers: string[];
  githubUrl?: string;
  demoUrl?: string;
  completedDate?: string;
  achievements?: string;
  authorId?: string;
  authorName?: string;
  authorUsn?: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectIdea {
  id: string;
  _id?: string;
  title: string;
  description: string;
  studentName: string;
  usn: string;
  teamMembers?: string;
  proposedTech?: string;
  expectedOutcome?: string;
  repoUrl?: string;
  contactInfo: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface GalleryAlbum {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  description?: string;
  eventId?: string;
  coverImage?: string;
  year?: string;
  isPublished: boolean;
  mediaCount?: number;
  createdAt?: string;
}

export interface GalleryMediaItem {
  id: string;
  _id?: string;
  albumId: string;
  albumTitle?: string;
  title: string;
  type: 'photo' | 'video';
  url: string;
  thumbnailUrl?: string;
  date?: string;
  contributor?: string;
  altText?: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt?: string;
}

export interface AnnouncementItem {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  imageUrl?: string;
  publishDate: string;
  expiryDate?: string;
  relatedEventSlug?: string;
  isPublished: boolean;
  createdAt?: string;
}

export interface NewsletterSubscriber {
  id: string;
  _id?: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
}

export interface ContactSubmission {
  id: string;
  _id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

export interface SiteSettings {
  clubName: string;
  institutionName: string;
  departmentName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    instagram?: string;
    youtube?: string;
    whatsapp?: string;
    linkedin?: string;
    github?: string;
    discord?: string;
  };
  mapUrl?: string;
}

export interface SearchResultItem {
  type: 'event' | 'project' | 'team' | 'announcement' | 'gallery';
  id: string;
  title: string;
  subtitle: string;
  url: string;
}
