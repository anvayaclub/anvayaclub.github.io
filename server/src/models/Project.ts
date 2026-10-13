import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectDocument extends Document {
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
  authorId?: mongoose.Types.ObjectId;
  authorName?: string;
  authorUsn?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProjectDocument>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  category: { type: String, required: true, trim: true },
  status: { type: String, enum: ['ongoing', 'completed'], default: 'completed' },
  summary: { type: String, required: true },
  description: { type: String, required: true },
  coverImage: { type: String },
  techStack: [{ type: String, trim: true }],
  teamMembers: [{ type: String, trim: true }],
  githubUrl: { type: String, trim: true },
  demoUrl: { type: String, trim: true },
  completedDate: { type: String },
  achievements: { type: String, trim: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String, trim: true },
  authorUsn: { type: String, uppercase: true, trim: true },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toObject', { virtuals: true });

export const Project = mongoose.model<IProjectDocument>('Project', ProjectSchema);

export interface IProjectIdeaDocument extends Document {
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
  createdAt: Date;
}

const ProjectIdeaSchema = new Schema<IProjectIdeaDocument>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  studentName: { type: String, required: true, trim: true },
  usn: { type: String, required: true, uppercase: true, trim: true },
  teamMembers: { type: String },
  proposedTech: { type: String },
  expectedOutcome: { type: String },
  repoUrl: { type: String },
  contactInfo: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

ProjectIdeaSchema.set('toJSON', { virtuals: true });
ProjectIdeaSchema.set('toObject', { virtuals: true });

export const ProjectIdea = mongoose.model<IProjectIdeaDocument>('ProjectIdea', ProjectIdeaSchema);
