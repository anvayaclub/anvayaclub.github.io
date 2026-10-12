import { Request, Response } from 'express';
import { GalleryAlbum, GalleryMedia } from '../models/Gallery.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore } from '../services/store.js';

export const getAlbums = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const albums = await GalleryAlbum.find({ isPublished: true }).sort({ createdAt: -1 });
      const albumsWithCounts = await Promise.all(
        albums.map(async (a: any) => {
          const count = await GalleryMedia.countDocuments({ albumId: a._id, isPublished: true });
          return { ...a.toObject(), mediaCount: count };
        })
      );
      res.json({ success: true, data: albumsWithCounts });
    } else {
      const albumsWithCounts = memoryStore.galleryAlbums
        .filter(a => a.isPublished)
        .map(a => {
          const count = memoryStore.galleryMedia.filter(m => (m.albumId === a._id || m.albumId === a.id) && m.isPublished).length;
          return { ...a, mediaCount: count };
        });
      res.json({ success: true, data: albumsWithCounts });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve gallery albums.' });
  }
};

export const getMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { albumId, type } = req.query;

    if (isDbConnected()) {
      const query: any = { isPublished: true };
      if (albumId && albumId !== 'all') {
        query.albumId = albumId;
      }
      if (type && type !== 'all') {
        query.type = type;
      }
      const media = await GalleryMedia.find(query).sort({ sortOrder: 1, createdAt: -1 });
      res.json({ success: true, data: media });
    } else {
      let media = memoryStore.galleryMedia.filter(m => m.isPublished);
      if (albumId && albumId !== 'all') {
        media = media.filter(m => m.albumId === albumId);
      }
      if (type && type !== 'all') {
        media = media.filter(m => m.type === type);
      }
      media.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      res.json({ success: true, data: media });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve gallery media items.' });
  }
};

export const getAdminAlbums = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const albums = await GalleryAlbum.find().sort({ createdAt: -1 });
      res.json({ success: true, data: albums });
    } else {
      res.json({ success: true, data: memoryStore.galleryAlbums });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve albums for admin.' });
  }
};

export const createAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, coverImage, year, isPublished } = req.body;

    if (!title) {
      res.status(400).json({ success: false, message: 'Album title is required.' });
      return;
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    if (isDbConnected()) {
      const album = await GalleryAlbum.create({
        title,
        slug,
        description,
        coverImage,
        year: year || new Date().getFullYear().toString(),
        isPublished: isPublished !== false,
      });
      res.status(201).json({ success: true, data: album, message: 'Album created.' });
    } else {
      const newAlbum = {
        _id: `alb_${Date.now()}`,
        id: `alb_${Date.now()}`,
        title,
        slug,
        description,
        coverImage,
        year: year || new Date().getFullYear().toString(),
        isPublished: isPublished !== false,
        createdAt: new Date().toISOString(),
      };
      memoryStore.galleryAlbums.push(newAlbum);
      res.status(201).json({ success: true, data: newAlbum, message: 'Album created.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create album.' });
  }
};

export const updateAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (isDbConnected()) {
      const album = await GalleryAlbum.findByIdAndUpdate(id, updateData, { new: true });
      if (!album) {
        res.status(404).json({ success: false, message: 'Album not found.' });
        return;
      }
      res.json({ success: true, data: album, message: 'Album updated.' });
    } else {
      const idx = memoryStore.galleryAlbums.findIndex(a => a._id === id || a.id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Album not found.' });
        return;
      }
      memoryStore.galleryAlbums[idx] = { ...memoryStore.galleryAlbums[idx], ...updateData };
      res.json({ success: true, data: memoryStore.galleryAlbums[idx], message: 'Album updated.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update album.' });
  }
};

export const deleteAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      await GalleryAlbum.findByIdAndDelete(id);
      await GalleryMedia.deleteMany({ albumId: id });
      res.json({ success: true, message: 'Album and its media items deleted.' });
    } else {
      const idx = memoryStore.galleryAlbums.findIndex(a => a._id === id || a.id === id);
      if (idx !== -1) {
        memoryStore.galleryAlbums.splice(idx, 1);
        memoryStore.galleryMedia = memoryStore.galleryMedia.filter(m => m.albumId !== id);
      }
      res.json({ success: true, message: 'Album and its media items deleted.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete album.' });
  }
};

export const getAdminMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { albumId } = req.query;

    if (isDbConnected()) {
      const query: any = {};
      if (albumId) query.albumId = albumId;
      const media = await GalleryMedia.find(query).sort({ sortOrder: 1 });
      res.json({ success: true, data: media });
    } else {
      let media = memoryStore.galleryMedia;
      if (albumId) {
        media = media.filter(m => m.albumId === albumId);
      }
      res.json({ success: true, data: media });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve media.' });
  }
};

export const createMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { albumId, title, type, url, thumbnailUrl, date, contributor, altText, sortOrder, isPublished } = req.body;

    if (!albumId || !title || !url) {
      res.status(400).json({ success: false, message: 'Album ID, title, and media URL are required.' });
      return;
    }

    if (isDbConnected()) {
      const item = await GalleryMedia.create({
        albumId,
        title,
        type: type || 'photo',
        url,
        thumbnailUrl,
        date: date || new Date().toLocaleDateString(),
        contributor,
        altText,
        sortOrder: Number(sortOrder) || 0,
        isPublished: isPublished !== false,
      });
      res.status(201).json({ success: true, data: item, message: 'Media item added.' });
    } else {
      const newItem = {
        _id: `med_${Date.now()}`,
        id: `med_${Date.now()}`,
        albumId,
        title,
        type: type || 'photo',
        url,
        thumbnailUrl,
        date: date || new Date().toLocaleDateString(),
        contributor,
        altText,
        sortOrder: Number(sortOrder) || 0,
        isPublished: isPublished !== false,
        createdAt: new Date().toISOString(),
      };
      memoryStore.galleryMedia.push(newItem);
      res.status(201).json({ success: true, data: newItem, message: 'Media item added.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create media item.' });
  }
};

export const updateMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (isDbConnected()) {
      const media = await GalleryMedia.findByIdAndUpdate(id, updateData, { new: true });
      if (!media) {
        res.status(404).json({ success: false, message: 'Media item not found.' });
        return;
      }
      res.json({ success: true, data: media, message: 'Media item updated.' });
    } else {
      const idx = memoryStore.galleryMedia.findIndex(m => m._id === id || m.id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Media item not found.' });
        return;
      }
      memoryStore.galleryMedia[idx] = { ...memoryStore.galleryMedia[idx], ...updateData };
      res.json({ success: true, data: memoryStore.galleryMedia[idx], message: 'Media item updated.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update media item.' });
  }
};

export const deleteMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      await GalleryMedia.findByIdAndDelete(id);
      res.json({ success: true, message: 'Media item deleted.' });
    } else {
      const idx = memoryStore.galleryMedia.findIndex(m => m._id === id || m.id === id);
      if (idx !== -1) {
        memoryStore.galleryMedia.splice(idx, 1);
      }
      res.json({ success: true, message: 'Media item deleted.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete media item.' });
  }
};

