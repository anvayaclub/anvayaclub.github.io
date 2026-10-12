import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserDocument extends Document {
  name: string;
  email?: string;
  usn: string;
  passwordHash: string;
  role: string;
  branch?: string;
  semester?: string;
  status: 'active' | 'inactive' | 'deactivated';
  isTemporaryPassword?: boolean;
  linkedTeamMemberId?: mongoose.Types.ObjectId;
  lastLogin?: Date;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  usn: { type: String, required: true, unique: true, uppercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'student', trim: true },
  branch: { type: String, default: 'ISE', trim: true },
  semester: { type: String, trim: true },
  status: { type: String, enum: ['active', 'inactive', 'deactivated'], default: 'active' },
  isTemporaryPassword: { type: Boolean, default: false },
  linkedTeamMemberId: { type: Schema.Types.ObjectId, ref: 'TeamMember' },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model<IUserDocument>('User', UserSchema);
