import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncementDocument extends Document {
  title: string;
  slug: string;
  content: string;
  summary: string;
  imageUrl?: string;
  publishDate: Date;
  expiryDate?: Date;
  relatedEventSlug?: string;
  isPublished: boolean;
  createdAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncementDocument>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  content: { type: String, required: true },
  summary: { type: String, required: true },
  imageUrl: { type: String },
  publishDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  relatedEventSlug: { type: String },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

AnnouncementSchema.set('toJSON', { virtuals: true });
AnnouncementSchema.set('toObject', { virtuals: true });

export const Announcement = mongoose.model<IAnnouncementDocument>('Announcement', AnnouncementSchema);

export interface INewsletterSubscriberDocument extends Document {
  email: string;
  subscribedAt: Date;
  isActive: boolean;
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriberDocument>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  subscribedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

NewsletterSubscriberSchema.set('toJSON', { virtuals: true });
NewsletterSubscriberSchema.set('toObject', { virtuals: true });

export const NewsletterSubscriber = mongoose.model<INewsletterSubscriberDocument>('NewsletterSubscriber', NewsletterSubscriberSchema);

export interface IContactSubmissionDocument extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: Date;
}

const ContactSubmissionSchema = new Schema<IContactSubmissionDocument>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
  createdAt: { type: Date, default: Date.now },
});

ContactSubmissionSchema.set('toJSON', { virtuals: true });
ContactSubmissionSchema.set('toObject', { virtuals: true });

export const ContactSubmission = mongoose.model<IContactSubmissionDocument>('ContactSubmission', ContactSubmissionSchema);

export interface ISiteSettingsDocument extends Document {
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
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettingsDocument>({
  clubName: { type: String, default: 'Anvaya' },
  institutionName: { type: String, default: 'Kalpataru Institute of Technology, Tiptur' },
  departmentName: { type: String, default: 'Department of Information Science and Engineering' },
  contactEmail: { type: String, default: 'clubanvaya@gmail.com' },
  contactPhone: { type: String, default: '+91 8431 674384' },
  address: { type: String, default: 'KIT Campus, B.H. Road, Tiptur, Tumakuru District, Karnataka - 572201' },
  socialLinks: {
    instagram: { type: String, default: 'https://www.instagram.com/kit.anvaya.ise?cplk=d3pjdGYzbDU3M3Nr' },
    youtube: { type: String, default: 'https://youtube.com/@anvaya_kit' },
    whatsapp: { type: String, default: '' },
    linkedin: { type: String, default: 'https://linkedin.com/company/anvaya-kit' },
    github: { type: String, default: 'https://github.com/anvayaclub' },
    discord: { type: String, default: '' },
  },
  mapUrl: { type: String, default: 'https://maps.google.com/?q=Kalpataru+Institute+of+Technology+Tiptur' },
  updatedAt: { type: Date, default: Date.now },
});

SiteSettingsSchema.set('toJSON', { virtuals: true });
SiteSettingsSchema.set('toObject', { virtuals: true });

export const SiteSettings = mongoose.model<ISiteSettingsDocument>('SiteSettings', SiteSettingsSchema);
