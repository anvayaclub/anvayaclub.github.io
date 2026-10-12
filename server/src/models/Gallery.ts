import mongoose, { Schema, Document } from 'mongoose';

export interface IGalleryAlbumDocument extends Document {
  title: string;
  slug: string;
  description?: string;
  eventId?: mongoose.Types.ObjectId;
  coverImage?: string;
  year?: string;
  isPublished: boolean;
  createdAt: Date;
}

const GalleryAlbumSchema = new Schema<IGalleryAlbumDocument>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  coverImage: { type: String },
  year: { type: String, default: new Date().getFullYear().toString() },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const GalleryAlbum = mongoose.model<IGalleryAlbumDocument>('GalleryAlbum', GalleryAlbumSchema);

export interface IGalleryMediaDocument extends Document {
  albumId: mongoose.Types.ObjectId;
  title: string;
  type: 'photo' | 'video';
  url: string;
  thumbnailUrl?: string;
  date?: string;
  contributor?: string;
  altText?: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: Date;
}

const GalleryMediaSchema = new Schema<IGalleryMediaDocument>({
  albumId: { type: Schema.Types.ObjectId, ref: 'GalleryAlbum', required: true },
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ['photo', 'video'], default: 'photo' },
  url: { type: String, required: true },
  thumbnailUrl: { type: String },
  date: { type: String },
  contributor: { type: String },
  altText: { type: String },
  sortOrder: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const GalleryMedia = mongoose.model<IGalleryMediaDocument>('GalleryMedia', GalleryMediaSchema);
