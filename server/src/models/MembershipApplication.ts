import mongoose, { Schema, Document } from 'mongoose';

export interface IMembershipApplicationDocument extends Document {
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
  submittedAt: Date;
}

const MembershipApplicationSchema = new Schema<IMembershipApplicationDocument>({
  fullName: { type: String, required: true, trim: true },
  usn: { type: String, required: true, uppercase: true, trim: true, unique: true },
  academicYear: { type: String, required: true },
  branch: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  interests: [{ type: String, trim: true }],
  skills: { type: String, required: true },
  motivation: { type: String, required: true },
  preferredRole: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  notes: { type: String },
  submittedAt: { type: Date, default: Date.now },
});

MembershipApplicationSchema.set('toJSON', { virtuals: true });
MembershipApplicationSchema.set('toObject', { virtuals: true });

export const MembershipApplication = mongoose.model<IMembershipApplicationDocument>('MembershipApplication', MembershipApplicationSchema);
