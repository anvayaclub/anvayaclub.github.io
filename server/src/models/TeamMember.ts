import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamMemberDocument extends Document {
  name: string;
  usn?: string;
  role: string; // Public-facing title / designation (e.g., President, Media Coordinator)
  appRole: string; // Application access role (e.g., technical, media-poster, student)
  department: string;
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
  linkedUserId?: mongoose.Types.ObjectId;
  accountLinkStatus: 'linked' | 'pending' | 'unlinked';
  createdAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMemberDocument>({
  name: { type: String, required: true, trim: true },
  usn: { type: String, uppercase: true, trim: true },
  role: { type: String, required: true, trim: true },
  appRole: { type: String, default: 'student', trim: true },
  department: { type: String, default: 'ISE', trim: true },
  academicYear: { type: String, default: 'Final Year' },
  bio: { type: String, trim: true },
  photoUrl: { type: String, trim: true },
  contactEmail: { type: String, trim: true },
  contactPhone: { type: String, trim: true },
  socialLinks: {
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    instagram: { type: String, trim: true },
    email: { type: String, trim: true },
  },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  linkedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  accountLinkStatus: { type: String, enum: ['linked', 'pending', 'unlinked'], default: 'unlinked' },
  createdAt: { type: Date, default: Date.now },
});

TeamMemberSchema.set('toJSON', { virtuals: true });
TeamMemberSchema.set('toObject', { virtuals: true });

export const TeamMember = mongoose.model<ITeamMemberDocument>('TeamMember', TeamMemberSchema);
