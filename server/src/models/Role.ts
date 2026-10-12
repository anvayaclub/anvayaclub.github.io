import mongoose, { Schema, Document } from 'mongoose';

export interface IRoleDocument extends Document {
  name: string;
  key: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
}

const RoleSchema = new Schema<IRoleDocument>({
  name: { type: String, required: true, trim: true },
  key: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true, trim: true },
  permissions: [{ type: String, trim: true }],
  isSystem: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const Role = mongoose.model<IRoleDocument>('Role', RoleSchema);
