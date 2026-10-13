import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { Event, EventRegistration } from '../models/Event.js';
import { CertificateConfig } from '../models/Certificate.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore } from '../services/store.js';
import { AuthRequest } from '../middleware/auth.js';

export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, category, search, all } = req.query;

    if (isDbConnected()) {
      const query: any = {};
      if (all !== 'true') {
        query.isPublished = true;
      }
      if (status && status !== 'all') {
        query.status = status;
      }
      if (category && category !== 'all') {
        query.category = { $regex: new RegExp(`^${category}$`, 'i') };
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { summary: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { venue: { $regex: search, $options: 'i' } },
        ];
      }
      const events = await Event.find(query).sort({ dateTime: 1 });
      res.json({ success: true, data: events });
    } else {
      let events = memoryStore.events;
      if (all !== 'true') {
        events = events.filter(e => e.isPublished);
      }
      if (status && status !== 'all') {
        events = events.filter(e => e.status === status);
      }
      if (category && category !== 'all') {
        events = events.filter(e => e.category?.toLowerCase() === String(category).toLowerCase());
      }
      if (search) {
        const s = String(search).toLowerCase();
        events = events.filter(
          e =>
            e.title?.toLowerCase().includes(s) ||
            e.summary?.toLowerCase().includes(s) ||
            e.description?.toLowerCase().includes(s) ||
            e.venue?.toLowerCase().includes(s)
        );
      }

      events.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
      res.json({ success: true, data: events });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve events.' });
  }
};

export const getAdminEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const events = await Event.find().sort({ createdAt: -1 });
      res.json({ success: true, data: events });
    } else {
      res.json({ success: true, data: memoryStore.events });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve events for administration.' });
  }
};

export const getEventBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    if (isDbConnected()) {
      const event = await Event.findOne({ slug });
      if (!event) {
        res.status(404).json({ success: false, message: 'Event not found.' });
        return;
      }
      res.json({ success: true, data: { ...event.toObject({ virtuals: true }), id: event._id.toString() } });
    } else {
      const event = memoryStore.events.find(e => e.slug === slug);
      if (!event) {
        res.status(404).json({ success: false, message: 'Event not found.' });
        return;
      }
      res.json({ success: true, data: { ...event, id: event._id || event.id } });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve event details.' });
  }
};

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      category,
      summary,
      description,
      coverImage,
      dateTime,
      startTime,
      endTime,
      venue,
      registrationOpeningDate,
      registrationDeadline,
      regCapacity,
      eligibilityCriteria,
      registrationInstructions,
      organizerContact,
      externalRegUrl,
      isInternalRegEnabled,
      certificateAvailable,
      status,
      isPublished,
    } = req.body;

    if (!title || !description || !venue || !dateTime) {
      res.status(400).json({ success: false, message: 'Title, description, venue, and date/time are required.' });
      return;
    }

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
      '-' +
      Date.now().toString().slice(-4);

    const eventDate = new Date(dateTime);

    if (isDbConnected()) {
      const event = await Event.create({
        title: title.trim(),
        slug,
        category: category || 'Cultural',
        summary: summary ? summary.trim() : description.slice(0, 160),
        description,
        coverImage,
        dateTime: eventDate,
        startTime,
        endTime,
        venue: venue.trim(),
        registrationOpeningDate: registrationOpeningDate ? new Date(registrationOpeningDate) : undefined,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
        regCapacity: Number(regCapacity) || 0,
        regCount: 0,
        eligibilityCriteria,
        registrationInstructions,
        organizerContact,
        externalRegUrl,
        isInternalRegEnabled: isInternalRegEnabled !== false,
        certificateAvailable: certificateAvailable === true,
        status: status || 'upcoming',
        isPublished: isPublished !== false,
      });

      // Synchronize with Certificate Portal if certificates are enabled
      if (certificateAvailable) {
        await CertificateConfig.create({
          eventId: event._id,
          eventTitle: event.title,
          eventDate: event.dateTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
          certificateTitle: `${event.title} — Certificate of Participation`,
          bodyTemplate: `has actively participated and demonstrated exceptional cultural dedication in ${event.title} organized by Anvaya Cultural Committee, Department of Information Science & Engineering, Kalpataru Institute of Technology, Tiptur.`,
          isEnabled: true,
          isPublished: event.isPublished,
          signatories: [
            { name: 'Dr. G.S. Suresh', role: 'Principal, KIT Tiptur' },
            { name: 'Dr. HOD', role: 'Head of Department, ISE' },
            { name: 'Ankush S', role: 'President, Anvaya' },
          ],
        });
      }

      res.status(201).json({ success: true, data: event, message: 'Cultural programme created successfully.' });
    } else {
      const eventId = `ev_${Date.now()}`;
      const newEvent = {
        _id: eventId,
        id: eventId,
        title: title.trim(),
        slug,
        category: category || 'Cultural',
        summary: summary ? summary.trim() : description.slice(0, 160),
        description,
        coverImage,
        dateTime: eventDate.toISOString(),
        startTime,
        endTime,
        venue: venue.trim(),
        registrationOpeningDate: registrationOpeningDate ? new Date(registrationOpeningDate).toISOString() : undefined,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : undefined,
        regCapacity: Number(regCapacity) || 0,
        regCount: 0,
        eligibilityCriteria,
        registrationInstructions,
        organizerContact,
        externalRegUrl,
        isInternalRegEnabled: isInternalRegEnabled !== false,
        certificateAvailable: certificateAvailable === true,
        status: status || 'upcoming',
        isPublished: isPublished !== false,
        createdAt: new Date().toISOString(),
      };

      memoryStore.events.push(newEvent);

      if (certificateAvailable) {
        const certId = `cert_${Date.now()}`;
        memoryStore.certificateConfigs.push({
          _id: certId,
          id: certId,
          eventId: eventId,
          eventTitle: newEvent.title,
          eventDate: eventDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
          certificateTitle: `${newEvent.title} — Certificate of Participation`,
          bodyTemplate: `has actively participated and demonstrated exceptional cultural dedication in ${newEvent.title} organized by Anvaya Cultural Committee, Department of Information Science & Engineering, Kalpataru Institute of Technology, Tiptur.`,
          isEnabled: true,
          isPublished: newEvent.isPublished,
          signatories: [
            { name: 'Dr. G.S. Suresh', role: 'Principal, KIT Tiptur' },
            { name: 'Dr. HOD', role: 'Head of Department, ISE' },
            { name: 'Ankush S', role: 'President, Anvaya' },
          ],
          participantsCount: 0,
          createdAt: new Date().toISOString(),
        });
      }

      res.status(201).json({ success: true, data: newEvent, message: 'Cultural programme created successfully.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create event.' });
  }
};

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (isDbConnected()) {
      const event = await Event.findByIdAndUpdate(id, updateData, { new: true });
      if (!event) {
        res.status(404).json({ success: false, message: 'Event not found.' });
        return;
      }

      // Sync Certificate Portal
      let certConfig = await CertificateConfig.findOne({ eventId: event._id });
      if (event.certificateAvailable) {
        if (!certConfig) {
          await CertificateConfig.create({
            eventId: event._id,
            eventTitle: event.title,
            eventDate: new Date(event.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
            certificateTitle: `${event.title} — Certificate of Participation`,
            bodyTemplate: `has actively participated and demonstrated exceptional cultural dedication in ${event.title} organized by Anvaya Cultural Committee, Department of Information Science & Engineering, Kalpataru Institute of Technology, Tiptur.`,
            isEnabled: true,
            isPublished: event.isPublished,
            signatories: [
              { name: 'Dr. G.S. Suresh', role: 'Principal, KIT Tiptur' },
              { name: 'Dr. HOD', role: 'Head of Department, ISE' },
              { name: 'Ankush S', role: 'President, Anvaya' },
            ],
          });
        } else {
          certConfig.eventTitle = event.title;
          certConfig.isEnabled = true;
          certConfig.isPublished = event.isPublished;
          await certConfig.save();
        }
      } else if (certConfig) {
        certConfig.isEnabled = false;
        await certConfig.save();
      }

      res.json({ success: true, data: event, message: 'Event updated successfully.' });
    } else {
      const index = memoryStore.events.findIndex(e => e._id === id || e.id === id);
      if (index === -1) {
        res.status(404).json({ success: false, message: 'Event not found.' });
        return;
      }

      memoryStore.events[index] = { ...memoryStore.events[index], ...updateData };
      const updatedEvent = memoryStore.events[index];

      // Sync certificate config in memory
      let certConfig = memoryStore.certificateConfigs.find(c => c.eventId === id || c.eventId === updatedEvent._id);
      if (updatedEvent.certificateAvailable) {
        if (!certConfig) {
          const certId = `cert_${Date.now()}`;
          memoryStore.certificateConfigs.push({
            _id: certId,
            id: certId,
            eventId: updatedEvent._id,
            eventTitle: updatedEvent.title,
            eventDate: new Date(updatedEvent.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
            certificateTitle: `${updatedEvent.title} — Certificate of Participation`,
            bodyTemplate: `has actively participated in ${updatedEvent.title} organized by Anvaya Cultural Committee, Department of Information Science & Engineering, Kalpataru Institute of Technology, Tiptur.`,
            isEnabled: true,
            isPublished: updatedEvent.isPublished,
            signatories: [
              { name: 'Dr. G.S. Suresh', role: 'Principal, KIT Tiptur' },
              { name: 'Dr. HOD', role: 'Head of Department, ISE' },
              { name: 'Ankush S', role: 'President, Anvaya' },
            ],
            participantsCount: 0,
            createdAt: new Date().toISOString(),
          });
        } else {
          certConfig.eventTitle = updatedEvent.title;
          certConfig.isEnabled = true;
          certConfig.isPublished = updatedEvent.isPublished;
        }
      } else if (certConfig) {
        certConfig.isEnabled = false;
      }

      res.json({ success: true, data: updatedEvent, message: 'Event updated successfully.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update event.' });
  }
};

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const event = await Event.findByIdAndDelete(id);
      if (!event) {
        res.status(404).json({ success: false, message: 'Event not found.' });
        return;
      }
      await EventRegistration.deleteMany({ eventId: id });
      await CertificateConfig.deleteMany({ eventId: id });
      res.json({ success: true, message: 'Event and associated records deleted.' });
    } else {
      const index = memoryStore.events.findIndex(e => e._id === id || e.id === id);
      if (index === -1) {
        res.status(404).json({ success: false, message: 'Event not found.' });
        return;
      }
      memoryStore.events.splice(index, 1);
      memoryStore.eventRegistrations = memoryStore.eventRegistrations.filter(r => r.eventId !== id);
      memoryStore.certificateConfigs = memoryStore.certificateConfigs.filter(c => c.eventId !== id);
      res.json({ success: true, message: 'Event and associated records deleted.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete event.' });
  }
};

export const registerForEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fullName, usn, email, phone, branch, semester, academicYear } = req.body;

    if (!id || id === 'undefined' || id === 'null') {
      res.status(400).json({ success: false, message: 'Invalid or missing event identifier.' });
      return;
    }

    if (!fullName || !fullName.trim() || !usn || !usn.trim() || !email || !email.trim() || !phone || !phone.trim()) {
      res.status(400).json({ success: false, message: 'Full Name, USN, Email, and Phone number are required for registration.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }

    const normalizedUsn = usn.trim().toUpperCase();

    if (isDbConnected()) {
      let event: any = null;
      if (mongoose.isValidObjectId(id)) {
        event = await Event.findById(id);
      }
      if (!event) {
        event = await Event.findOne({ slug: id });
      }

      if (!event) {
        res.status(404).json({ success: false, message: 'Event not found.' });
        return;
      }

      if (!event.isPublished) {
        res.status(400).json({ success: false, message: 'This event is not published for registration.' });
        return;
      }

      if (event.isInternalRegEnabled === false) {
        res.status(400).json({ success: false, message: 'Internal registration is disabled for this event. Please check external registration details.' });
        return;
      }

      if (event.registrationOpeningDate && new Date() < new Date(event.registrationOpeningDate)) {
        res.status(400).json({ success: false, message: 'Registration has not opened yet for this event.' });
        return;
      }

      if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
        res.status(400).json({ success: false, message: 'Registration deadline has passed for this event.' });
        return;
      }

      if (event.regCapacity && event.regCapacity > 0 && event.regCount >= event.regCapacity) {
        res.status(400).json({ success: false, message: 'Registration capacity has been reached for this event.' });
        return;
      }

      const existing = await EventRegistration.findOne({ eventId: event._id, usn: normalizedUsn });
      if (existing) {
        res.status(400).json({ success: false, message: `USN ${normalizedUsn} is already registered for this event.` });
        return;
      }

      let userObjectId: any = undefined;
      if (req.user?.id && mongoose.isValidObjectId(req.user.id)) {
        userObjectId = req.user.id;
      }

      const registration = await EventRegistration.create({
        eventId: event._id,
        eventTitle: event.title,
        userId: userObjectId,
        fullName: fullName.trim(),
        usn: normalizedUsn,
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        branch: branch || 'ISE',
        semester: semester || '6th Semester',
        academicYear: academicYear || '3rd Year',
      });

      await Event.findByIdAndUpdate(event._id, { $inc: { regCount: 1 } });

      res.status(201).json({
        success: true,
        message: 'Registration confirmed! Your seat has been successfully reserved.',
        data: {
          ...registration.toObject({ virtuals: true }),
          id: registration._id.toString(),
        },
      });
    } else {
      const event = memoryStore.events.find(
        e => (e._id || e.id) === id || e.slug === id
      );
      if (!event) {
        res.status(404).json({ success: false, message: 'Event not found.' });
        return;
      }

      if (!event.isPublished) {
        res.status(400).json({ success: false, message: 'This event is not published for registration.' });
        return;
      }

      if (event.isInternalRegEnabled === false) {
        res.status(400).json({ success: false, message: 'Internal registration is disabled for this event. Please check external registration details.' });
        return;
      }

      if (event.registrationOpeningDate && new Date() < new Date(event.registrationOpeningDate)) {
        res.status(400).json({ success: false, message: 'Registration has not opened yet for this event.' });
        return;
      }

      if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
        res.status(400).json({ success: false, message: 'Registration deadline has passed for this event.' });
        return;
      }

      if (event.regCapacity && event.regCapacity > 0 && (event.regCount || 0) >= event.regCapacity) {
        res.status(400).json({ success: false, message: 'Registration capacity has been reached for this event.' });
        return;
      }

      const existing = memoryStore.eventRegistrations.find(
        r => (r.eventId === id || r.eventId === event._id || r.eventId === event.id) && r.usn === normalizedUsn
      );
      if (existing) {
        res.status(400).json({ success: false, message: `USN ${normalizedUsn} is already registered for this event.` });
        return;
      }

      const regId = `reg_${Date.now()}`;
      const newReg = {
        _id: regId,
        id: regId,
        eventId: event._id || event.id || id,
        eventTitle: event.title,
        userId: req.user?.id,
        fullName: fullName.trim(),
        usn: normalizedUsn,
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        branch: branch || 'ISE',
        semester: semester || '6th Semester',
        academicYear: academicYear || '3rd Year',
        registeredAt: new Date().toISOString(),
      };

      memoryStore.eventRegistrations.push(newReg);
      event.regCount = (event.regCount || 0) + 1;

      res.status(201).json({
        success: true,
        message: 'Registration confirmed! Your seat has been successfully reserved.',
        data: newReg,
      });
    }
  } catch (error: any) {
    console.error('Error submitting event registration:', error);
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'You have already registered for this event with this USN.' });
      return;
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to submit registration.' });
  }
};

export const getEventRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      let eventId = id;
      if (!mongoose.isValidObjectId(id)) {
        const ev = await Event.findOne({ slug: id });
        if (ev) eventId = ev._id.toString();
      }
      const registrations = await EventRegistration.find({ eventId }).sort({ registeredAt: -1 });
      const data = registrations.map(r => ({
        ...r.toObject({ virtuals: true }),
        id: r._id.toString(),
      }));
      res.json({ success: true, data });
    } else {
      const registrations = memoryStore.eventRegistrations.filter(r => r.eventId === id);
      res.json({ success: true, data: registrations });
    }
  } catch (error: any) {
    console.error('Error retrieving event registrations:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve event registrations.' });
  }
};

export const exportEventRegistrationsCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let eventTitle = 'Event';
    let registrations: any[] = [];

    if (isDbConnected()) {
      const event = await Event.findById(id);
      if (event) eventTitle = event.title;
      registrations = await EventRegistration.find({ eventId: id }).sort({ registeredAt: 1 });
    } else {
      const event = memoryStore.events.find(e => e._id === id || e.id === id);
      if (event) eventTitle = event.title;
      registrations = memoryStore.eventRegistrations.filter(r => r.eventId === id);
    }

    const header = 'Full Name,USN,Email,Phone,Branch,Semester,Registered At\n';
    const rows = registrations
      .map(r => `"${r.fullName}","${r.usn}","${r.email}","${r.phone}","${r.branch}","${r.semester || ''}","${r.registeredAt}"`)
      .join('\n');

    const csvContent = header + rows;
    const sanitizedTitle = eventTitle.replace(/[^a-zA-Z0-9_-]/g, '_');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}_Registrations.csv"`);
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to export registrations.' });
  }
};
