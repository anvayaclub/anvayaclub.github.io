import { Request, Response } from 'express';
import { Announcement, NewsletterSubscriber, ContactSubmission, SiteSettings } from '../models/Communication.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore } from '../services/store.js';

// Announcements
export const getAnnouncements = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const announcements = await Announcement.find({ isPublished: true }).sort({ publishDate: -1 });
      res.json({ success: true, data: announcements });
    } else {
      const announcements = memoryStore.announcements
        .filter(a => a.isPublished)
        .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
      res.json({ success: true, data: announcements });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve announcements.' });
  }
};

export const getAdminAnnouncements = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const announcements = await Announcement.find().sort({ publishDate: -1 });
      res.json({ success: true, data: announcements });
    } else {
      res.json({ success: true, data: memoryStore.announcements });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve admin announcements.' });
  }
};

export const createAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, summary, content, imageUrl, relatedEventSlug, isPublished } = req.body;

    if (!title || !summary || !content) {
      res.status(400).json({ success: false, message: 'Title, summary, and content are required.' });
      return;
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    if (isDbConnected()) {
      const ann = await Announcement.create({
        title,
        slug,
        summary,
        content,
        imageUrl,
        relatedEventSlug,
        isPublished: isPublished !== false,
      });
      res.status(201).json({ success: true, data: ann, message: 'Announcement created.' });
    } else {
      const newAnn = {
        _id: `ann_${Date.now()}`,
        id: `ann_${Date.now()}`,
        title,
        slug,
        summary,
        content,
        imageUrl,
        relatedEventSlug,
        isPublished: isPublished !== false,
        publishDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      memoryStore.announcements.push(newAnn);
      res.status(201).json({ success: true, data: newAnn, message: 'Announcement created.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create announcement.' });
  }
};

export const updateAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (isDbConnected()) {
      const ann = await Announcement.findByIdAndUpdate(id, updateData, { new: true });
      if (!ann) {
        res.status(404).json({ success: false, message: 'Announcement not found.' });
        return;
      }
      res.json({ success: true, data: ann, message: 'Announcement updated.' });
    } else {
      const idx = memoryStore.announcements.findIndex(a => a._id === id || a.id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Announcement not found.' });
        return;
      }
      memoryStore.announcements[idx] = { ...memoryStore.announcements[idx], ...updateData };
      res.json({ success: true, data: memoryStore.announcements[idx], message: 'Announcement updated.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update announcement.' });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      await Announcement.findByIdAndDelete(id);
      res.json({ success: true, message: 'Announcement deleted.' });
    } else {
      const idx = memoryStore.announcements.findIndex(a => a._id === id || a.id === id);
      if (idx !== -1) {
        memoryStore.announcements.splice(idx, 1);
      }
      res.json({ success: true, message: 'Announcement deleted.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete announcement.' });
  }
};

// Newsletter
export const subscribeNewsletter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      const existing = await NewsletterSubscriber.findOne({ email: normalizedEmail });
      if (existing) {
        res.json({ success: true, message: 'You are already subscribed to the Anvaya cultural bulletin!' });
        return;
      }

      await NewsletterSubscriber.create({ email: normalizedEmail });
      res.status(201).json({ success: true, message: 'Thank you for subscribing! You will receive future event announcements and bulletins.' });
    } else {
      const existing = memoryStore.newsletterSubscribers.find(s => s.email === normalizedEmail);
      if (existing) {
        res.json({ success: true, message: 'You are already subscribed to the Anvaya cultural bulletin!' });
        return;
      }

      memoryStore.newsletterSubscribers.push({
        _id: `sub_${Date.now()}`,
        id: `sub_${Date.now()}`,
        email: normalizedEmail,
        subscribedAt: new Date().toISOString(),
        isActive: true,
      });
      res.status(201).json({ success: true, message: 'Thank you for subscribing! You will receive future event announcements and bulletins.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to process newsletter subscription.' });
  }
};

export const getNewsletterSubscribers = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const subscribers = await NewsletterSubscriber.find().sort({ subscribedAt: -1 });
      res.json({ success: true, data: subscribers });
    } else {
      res.json({ success: true, data: memoryStore.newsletterSubscribers });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve newsletter subscribers.' });
  }
};

// Contact
export const submitContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json({ success: false, message: 'All contact fields are required.' });
      return;
    }

    if (isDbConnected()) {
      const submission = await ContactSubmission.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'unread',
      });
      res.status(201).json({
        success: true,
        message: 'Your inquiry has been delivered to the Anvaya cultural committee. We will respond shortly.',
        data: submission,
      });
    } else {
      const newSub = {
        _id: `con_${Date.now()}`,
        id: `con_${Date.now()}`,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'unread' as const,
        createdAt: new Date().toISOString(),
      };
      memoryStore.contactSubmissions.push(newSub);
      res.status(201).json({
        success: true,
        message: 'Your inquiry has been delivered to the Anvaya cultural committee. We will respond shortly.',
        data: newSub,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to deliver message.' });
  }
};

export const getContactSubmissions = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const submissions = await ContactSubmission.find().sort({ createdAt: -1 });
      res.json({ success: true, data: submissions });
    } else {
      res.json({ success: true, data: memoryStore.contactSubmissions });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve contact inquiries.' });
  }
};

export const updateContactStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (isDbConnected()) {
      const sub = await ContactSubmission.findByIdAndUpdate(id, { status }, { new: true });
      res.json({ success: true, data: sub });
    } else {
      const sub = memoryStore.contactSubmissions.find(c => c._id === id || c.id === id);
      if (sub) sub.status = status;
      res.json({ success: true, data: sub });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update contact inquiry status.' });
  }
};

// Site Settings
export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      let settings = await SiteSettings.findOne();
      if (!settings) {
        settings = await SiteSettings.create(memoryStore.settings);
      }
      res.json({ success: true, data: settings });
    } else {
      res.json({ success: true, data: memoryStore.settings });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve site settings.' });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const updateData = req.body;

    if (isDbConnected()) {
      let settings = await SiteSettings.findOne();
      if (!settings) {
        settings = await SiteSettings.create({ ...memoryStore.settings, ...updateData });
      } else {
        Object.assign(settings, updateData);
        settings.updatedAt = new Date();
        await settings.save();
      }
      res.json({ success: true, data: settings, message: 'Settings updated.' });
    } else {
      memoryStore.settings = { ...memoryStore.settings, ...updateData, updatedAt: new Date().toISOString() };
      res.json({ success: true, data: memoryStore.settings, message: 'Settings updated.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update site settings.' });
  }
};
