import mongoose, { Schema, Document } from 'mongoose';

export interface IEventWinner {
  position: string;
  name: string;
  usn?: string;
}

export interface IEventDocument extends Document {
  title: string;
  slug: string;
  category: string;
  summary: string;
  description: string;
  coverImage?: string;
  dateTime: Date;
  startTime?: string;
  endTime?: string;
  venue: string;
  registrationOpeningDate?: Date;
  registrationDeadline?: Date;
  regCapacity?: number;
  regCount: number;
  eligibilityCriteria?: string;
  registrationInstructions?: string;
  organizerContact?: string;
  isExternalReg: boolean;
  externalRegUrl?: string;
  isInternalRegEnabled: boolean;
  certificateAvailable: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'archived';
  isPublished: boolean;
  results?: {
    summary?: string;
    winners?: IEventWinner[];
  };
  relatedAlbumId?: string;
  createdAt: Date;
}

const EventWinnerSchema = new Schema<IEventWinner>({
  position: { type: String, required: true },
  name: { type: String, required: true },
  usn: { type: String },
}, { _id: false });

const EventSchema = new Schema<IEventDocument>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  category: { type: String, required: true, trim: true },
  summary: { type: String, default: '', trim: true },
  description: { type: String, required: true },
  coverImage: { type: String },
  dateTime: { type: Date, required: true },
  startTime: { type: String, trim: true },
  endTime: { type: String, trim: true },
  venue: { type: String, required: true },
  registrationOpeningDate: { type: Date },
  registrationDeadline: { type: Date },
  regCapacity: { type: Number, default: 0 },
  regCount: { type: Number, default: 0 },
  eligibilityCriteria: { type: String, trim: true },
  registrationInstructions: { type: String, trim: true },
  organizerContact: { type: String, trim: true },
  isExternalReg: { type: Boolean, default: false },
  externalRegUrl: { type: String, trim: true },
  isInternalRegEnabled: { type: Boolean, default: true },
  certificateAvailable: { type: Boolean, default: false },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'archived'], default: 'upcoming' },
  isPublished: { type: Boolean, default: true },
  results: {
    summary: { type: String },
    winners: [EventWinnerSchema],
  },
  relatedAlbumId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Event = mongoose.model<IEventDocument>('Event', EventSchema);

export interface IEventRegistrationDocument extends Document {
  eventId: mongoose.Types.ObjectId;
  eventTitle: string;
  userId?: mongoose.Types.ObjectId;
  fullName: string;
  usn: string;
  email: string;
  phone: string;
  branch: string;
  semester?: string;
  academicYear: string;
  registeredAt: Date;
}

const EventRegistrationSchema = new Schema<IEventRegistrationDocument>({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  eventTitle: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  fullName: { type: String, required: true, trim: true },
  usn: { type: String, required: true, uppercase: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  branch: { type: String, required: true, trim: true },
  semester: { type: String, trim: true },
  academicYear: { type: String, required: true, trim: true },
  registeredAt: { type: Date, default: Date.now },
});

EventRegistrationSchema.index({ eventId: 1, usn: 1 }, { unique: true });

export const EventRegistration = mongoose.model<IEventRegistrationDocument>('EventRegistration', EventRegistrationSchema);
