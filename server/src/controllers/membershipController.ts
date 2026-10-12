import { Request, Response } from 'express';
import { MembershipApplication } from '../models/MembershipApplication.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore } from '../services/store.js';

export const applyMembership = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, usn, academicYear, branch, email, phone, interests, skills, motivation, preferredRole } = req.body;

    if (!fullName || !usn || !academicYear || !branch || !email || !phone || !skills || !motivation) {
      res.status(400).json({ success: false, message: 'Please complete all required fields.' });
      return;
    }

    if (!Array.isArray(interests) || interests.length === 0) {
      res.status(400).json({ success: false, message: 'Please select at least one cultural interest or area of contribution.' });
      return;
    }

    const normalizedUsn = usn.trim().toUpperCase();

    if (isDbConnected()) {
      const existing = await MembershipApplication.findOne({ usn: normalizedUsn });
      if (existing) {
        res.status(400).json({
          success: false,
          message: `An application with USN "${normalizedUsn}" has already been submitted (Status: ${existing.status}). Please contact the committee coordinators if you need to update it.`,
        });
        return;
      }

      const application = await MembershipApplication.create({
        fullName: fullName.trim(),
        usn: normalizedUsn,
        academicYear,
        branch,
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        interests,
        skills: skills.trim(),
        motivation: motivation.trim(),
        preferredRole: preferredRole?.trim(),
        status: 'pending',
      });

      res.status(201).json({
        success: true,
        message: 'Your application to join Anvaya has been submitted successfully! The committee leadership will review your profile.',
        data: {
          id: application._id,
          fullName: application.fullName,
          usn: application.usn,
          status: application.status,
          submittedAt: application.submittedAt,
        },
      });
    } else {
      const existing = memoryStore.membershipApplications.find(a => a.usn === normalizedUsn);
      if (existing) {
        res.status(400).json({
          success: false,
          message: `An application with USN "${normalizedUsn}" has already been submitted (Status: ${existing.status}). Please contact the committee coordinators if you need to update it.`,
        });
        return;
      }

      const newApp = {
        _id: `mem_${Date.now()}`,
        id: `mem_${Date.now()}`,
        fullName: fullName.trim(),
        usn: normalizedUsn,
        academicYear,
        branch,
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        interests,
        skills: skills.trim(),
        motivation: motivation.trim(),
        preferredRole: preferredRole?.trim(),
        status: 'pending' as const,
        submittedAt: new Date().toISOString(),
      };
      memoryStore.membershipApplications.push(newApp);

      res.status(201).json({
        success: true,
        message: 'Your application to join Anvaya has been submitted successfully! The committee leadership will review your profile.',
        data: {
          id: newApp.id,
          fullName: newApp.fullName,
          usn: newApp.usn,
          status: newApp.status,
          submittedAt: newApp.submittedAt,
        },
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to submit membership application.' });
  }
};

// Admin: Get all applications with search and filters
export const getAdminApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, year, interest, search } = req.query;

    if (isDbConnected()) {
      const query: any = {};
      if (status && status !== 'all') {
        query.status = status;
      }
      if (year && year !== 'all') {
        query.academicYear = year;
      }
      if (interest && interest !== 'all') {
        query.interests = interest;
      }
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { usn: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const applications = await MembershipApplication.find(query).sort({ submittedAt: -1 });
      res.json({ success: true, data: applications });
    } else {
      let applications = [...memoryStore.membershipApplications];

      if (status && status !== 'all') {
        applications = applications.filter(a => a.status === status);
      }
      if (year && year !== 'all') {
        applications = applications.filter(a => a.academicYear === year);
      }
      if (interest && interest !== 'all') {
        applications = applications.filter(a => a.interests?.includes(String(interest)));
      }
      if (search) {
        const s = String(search).toLowerCase();
        applications = applications.filter(
          a =>
            a.fullName.toLowerCase().includes(s) ||
            a.usn.toLowerCase().includes(s) ||
            a.email.toLowerCase().includes(s)
        );
      }

      applications.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      res.json({ success: true, data: applications });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve membership applications.' });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status must be pending, approved, or rejected.' });
      return;
    }

    if (isDbConnected()) {
      const app = await MembershipApplication.findByIdAndUpdate(
        id,
        { status, ...(notes !== undefined && { notes }) },
        { new: true }
      );
      if (!app) {
        res.status(404).json({ success: false, message: 'Application not found.' });
        return;
      }
      res.json({ success: true, data: app, message: `Application status updated to ${status}.` });
    } else {
      const app = memoryStore.membershipApplications.find(a => a._id === id || a.id === id);
      if (!app) {
        res.status(404).json({ success: false, message: 'Application not found.' });
        return;
      }
      app.status = status;
      if (notes !== undefined) app.notes = notes;
      res.json({ success: true, data: app, message: `Application status updated to ${status}.` });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update application status.' });
  }
};

export const deleteApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      await MembershipApplication.findByIdAndDelete(id);
      res.json({ success: true, message: 'Application deleted.' });
    } else {
      const idx = memoryStore.membershipApplications.findIndex(a => a._id === id || a.id === id);
      if (idx !== -1) {
        memoryStore.membershipApplications.splice(idx, 1);
      }
      res.json({ success: true, message: 'Application deleted.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete application.' });
  }
};
