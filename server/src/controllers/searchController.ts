import { Request, Response } from 'express';
import { Event } from '../models/Event.js';
import { Project } from '../models/Project.js';
import { TeamMember } from '../models/TeamMember.js';
import { Announcement } from '../models/Communication.js';
import { GalleryAlbum, GalleryMedia } from '../models/Gallery.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore } from '../services/store.js';

export interface SearchResult {
  type: 'event' | 'project' | 'team' | 'announcement' | 'gallery';
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

export const searchGlobal = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = String(req.query.q || '').trim().toLowerCase();

    if (!query || query.length < 2) {
      res.json({ success: true, data: [] });
      return;
    }

    const results: SearchResult[] = [];

    if (isDbConnected()) {
      // 1. Published Events
      const events = await Event.find({
        isPublished: true,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
          { venue: { $regex: query, $options: 'i' } },
        ],
      }).limit(5);

      events.forEach(e => {
        results.push({
          type: 'event',
          id: String(e._id),
          title: e.title,
          subtitle: `${e.category} · ${new Date(e.dateTime).toLocaleDateString()}`,
          url: `/events/${e.slug}`,
        });
      });

      // 2. Published Projects
      const projects = await Project.find({
        isPublished: true,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { summary: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
        ],
      }).limit(5);

      projects.forEach(p => {
        results.push({
          type: 'project',
          id: String(p._id),
          title: p.title,
          subtitle: `${p.category} · ${p.status}`,
          url: `/projects#${p.slug}`,
        });
      });

      // 3. Active Team Members
      const team = await TeamMember.find({
        isActive: true,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { role: { $regex: query, $options: 'i' } },
          { bio: { $regex: query, $options: 'i' } },
        ],
      }).limit(5);

      team.forEach(t => {
        results.push({
          type: 'team',
          id: String(t._id),
          title: t.name,
          subtitle: `${t.role} · ${t.academicYear}`,
          url: `/team#${t.name.toLowerCase().replace(/\s+/g, '-')}`,
        });
      });

      // 4. Published Announcements
      const announcements = await Announcement.find({
        isPublished: true,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { summary: { $regex: query, $options: 'i' } },
        ],
      }).limit(5);

      announcements.forEach(a => {
        results.push({
          type: 'announcement',
          id: String(a._id),
          title: a.title,
          subtitle: `Announcement · ${new Date(a.publishDate).toLocaleDateString()}`,
          url: `/#announcements`,
        });
      });

      // 5. Gallery
      const albums = await GalleryAlbum.find({
        isPublished: true,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
      }).limit(5);

      albums.forEach(al => {
        results.push({
          type: 'gallery',
          id: String(al._id),
          title: al.title,
          subtitle: `Gallery Album · ${al.year || ''}`,
          url: `/gallery?album=${al._id}`,
        });
      });
    } else {
      // Memory store fallback
      // Events
      memoryStore.events
        .filter(e => e.isPublished && (e.title.toLowerCase().includes(query) || e.description.toLowerCase().includes(query) || e.category.toLowerCase().includes(query)))
        .slice(0, 5)
        .forEach(e => {
          results.push({
            type: 'event',
            id: e._id || e.id,
            title: e.title,
            subtitle: `${e.category} · ${new Date(e.dateTime).toLocaleDateString()}`,
            url: `/events/${e.slug}`,
          });
        });

      // Projects
      memoryStore.projects
        .filter(p => p.isPublished && (p.title.toLowerCase().includes(query) || p.summary.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)))
        .slice(0, 5)
        .forEach(p => {
          results.push({
            type: 'project',
            id: p._id || p.id,
            title: p.title,
            subtitle: `${p.category} · ${p.status}`,
            url: `/projects#${p.slug}`,
          });
        });

      // Team
      memoryStore.teamMembers
        .filter(t => t.isActive && (t.name.toLowerCase().includes(query) || t.role.toLowerCase().includes(query) || (t.bio && t.bio.toLowerCase().includes(query))))
        .slice(0, 5)
        .forEach(t => {
          results.push({
            type: 'team',
            id: t._id || t.id,
            title: t.name,
            subtitle: `${t.role} · ${t.academicYear}`,
            url: `/team#${t.name.toLowerCase().replace(/\s+/g, '-')}`,
          });
        });

      // Announcements
      memoryStore.announcements
        .filter(a => a.isPublished && (a.title.toLowerCase().includes(query) || a.summary.toLowerCase().includes(query)))
        .slice(0, 5)
        .forEach(a => {
          results.push({
            type: 'announcement',
            id: a._id || a.id,
            title: a.title,
            subtitle: `Announcement · ${new Date(a.publishDate).toLocaleDateString()}`,
            url: `/#announcements`,
          });
        });

      // Gallery
      memoryStore.galleryAlbums
        .filter(al => al.isPublished && (al.title.toLowerCase().includes(query) || (al.description && al.description.toLowerCase().includes(query))))
        .slice(0, 5)
        .forEach(al => {
          results.push({
            type: 'gallery',
            id: al._id || al.id,
            title: al.title,
            subtitle: `Gallery Album · ${al.year || ''}`,
            url: `/gallery?album=${al._id || al.id}`,
          });
        });
    }

    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Global search failed.' });
  }
};
