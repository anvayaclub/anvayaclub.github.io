import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLogDocument extends Document {
  action: string;
  performedBy?: mongoose.Types.ObjectId;
  performedByName: string;
  performedByRole: string;
  targetUser?: mongoose.Types.ObjectId;
  targetUserName?: string;
  targetUserUsn?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>({
  action: { type: String, required: true, trim: true },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  performedByName: { type: String, required: true, trim: true },
  performedByRole: { type: String, required: true, trim: true },
  targetUser: { type: Schema.Types.ObjectId, ref: 'User' },
  targetUserName: { type: String, trim: true },
  targetUserUsn: { type: String, uppercase: true, trim: true },
  details: { type: Schema.Types.Mixed },
  ipAddress: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ targetUserUsn: 1 });
AuditLogSchema.index({ action: 1 });

AuditLogSchema.set('toJSON', { virtuals: true });
AuditLogSchema.set('toObject', { virtuals: true });

export const AuditLog = mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
