import mongoose, { Schema, Document } from 'mongoose';

export interface ISignatory {
  name: string;
  role: string;
  signatureUrl?: string;
}

export interface ICertificateConfigDocument extends Document {
  eventId?: mongoose.Types.ObjectId;
  eventTitle: string;
  eventDate: string;
  certificateTitle: string;
  bodyTemplate: string;
  isEnabled: boolean;
  signatories: ISignatory[];
  participantsCount: number;
  isPublished: boolean;
  createdAt: Date;
}

const SignatorySchema = new Schema<ISignatory>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  signatureUrl: { type: String },
}, { _id: false });

const CertificateConfigSchema = new Schema<ICertificateConfigDocument>({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  eventTitle: { type: String, required: true, trim: true },
  eventDate: { type: String, required: true },
  certificateTitle: { type: String, default: 'Certificate of Participation' },
  bodyTemplate: {
    type: String,
    default: 'has actively participated and demonstrated exceptional cultural spirit in the programme organized by Anvaya Cultural Committee, Department of Information Science & Engineering, Kalpataru Institute of Technology, Tiptur.'
  },
  isEnabled: { type: Boolean, default: true },
  signatories: [SignatorySchema],
  participantsCount: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

CertificateConfigSchema.set('toJSON', { virtuals: true });
CertificateConfigSchema.set('toObject', { virtuals: true });

export const CertificateConfig = mongoose.model<ICertificateConfigDocument>('CertificateConfig', CertificateConfigSchema);

export interface ICertificateParticipantDocument extends Document {
  configId: mongoose.Types.ObjectId;
  fullName: string;
  usn: string;
  certificateNumber: string;
  isRevoked: boolean;
  revocationReason?: string;
  issuedAt: Date;
}

const CertificateParticipantSchema = new Schema<ICertificateParticipantDocument>({
  configId: { type: Schema.Types.ObjectId, ref: 'CertificateConfig', required: true },
  fullName: { type: String, required: true, trim: true },
  usn: { type: String, required: true, uppercase: true, trim: true },
  certificateNumber: { type: String, required: true, unique: true },
  isRevoked: { type: Boolean, default: false },
  revocationReason: { type: String },
  issuedAt: { type: Date, default: Date.now },
});

CertificateParticipantSchema.index({ configId: 1, usn: 1 }, { unique: true });

CertificateParticipantSchema.set('toJSON', { virtuals: true });
CertificateParticipantSchema.set('toObject', { virtuals: true });

export const CertificateParticipant = mongoose.model<ICertificateParticipantDocument>('CertificateParticipant', CertificateParticipantSchema);
