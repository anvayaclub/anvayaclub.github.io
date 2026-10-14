import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { CertificateConfig, CertificateParticipant } from '../models/Certificate.js';
import { Event, EventRegistration } from '../models/Event.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore } from '../services/store.js';

// Resilient name matching helper (handles middle initials, whitespace, case, punctuation)
export function isNameMatching(inputName: string, recordName: string): boolean {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const cInput = clean(inputName);
  const cRecord = clean(recordName);

  if (!cInput || !cRecord) return false;
  if (cInput === cRecord) return true;
  if (cRecord.includes(cInput) || cInput.includes(cRecord)) return true;

  const inputTokens = cInput.split(' ').filter(Boolean);
  const recordTokens = cRecord.split(' ').filter(Boolean);

  const sigInput = inputTokens.filter(t => t.length > 1);
  const sigRecord = recordTokens.filter(t => t.length > 1);

  if (sigInput.length > 0 && sigInput.every(t => recordTokens.includes(t))) {
    return true;
  }
  if (sigRecord.length > 0 && sigRecord.every(t => inputTokens.includes(t))) {
    return true;
  }

  const matchedTokens = inputTokens.filter(t => recordTokens.includes(t));
  if (matchedTokens.length >= 2 || (matchedTokens.length === 1 && matchedTokens[0].length >= 3 && (inputTokens.length === 1 || recordTokens.length === 1))) {
    return true;
  }

  return false;
}

// Public endpoint: list active certificate configs
export const getActiveConfigs = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const configs = await CertificateConfig.find({ isEnabled: true, isPublished: true })
        .select('eventTitle eventDate certificateTitle isEnabled')
        .sort({ createdAt: -1 });
      const data = configs.map(c => ({
        ...c.toObject({ virtuals: true }),
        id: c._id.toString(),
      }));
      res.json({ success: true, data });
    } else {
      const configs = memoryStore.certificateConfigs
        .filter(c => c.isEnabled && c.isPublished)
        .map(c => ({
          ...c,
          _id: c._id || c.id,
          id: c.id || c._id,
          eventTitle: c.eventTitle,
          eventDate: c.eventDate,
          certificateTitle: c.certificateTitle,
          isEnabled: c.isEnabled,
        }));
      res.json({ success: true, data: configs });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve active certificate events.' });
  }
};

// Public endpoint: Verify student details and generate certificate data
export const verifyCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { configId, fullName, usn } = req.body;

    if (!configId || !fullName || !usn) {
      res.status(400).json({
        success: false,
        message: 'Please provide the Event, your Full Name, and USN as per college records.',
      });
      return;
    }

    const normalizedUsn = usn.trim().toUpperCase();

    let config: any = null;
    let participant: any = null;

    if (isDbConnected()) {
      config = await CertificateConfig.findById(configId);
      if (!config) {
        res.status(404).json({ success: false, message: 'Invalid event selected. Please select an event from the list.' });
        return;
      }

      if (!config.isEnabled || !config.isPublished) {
        res.status(400).json({ success: false, message: 'Certificates for this event are not yet published or have been temporarily disabled.' });
        return;
      }

      // 1. Query participant by config and USN
      participant = await CertificateParticipant.findOne({
        configId: config._id,
        usn: normalizedUsn,
      });

      // 2. Fallback / Auto-resolution: If not in CertificateParticipant, check EventRegistration
      if (!participant) {
        const regQuery: any = { usn: normalizedUsn };
        if (config.eventId) {
          regQuery.eventId = config.eventId;
        } else if (config.eventTitle) {
          regQuery.eventTitle = { $regex: new RegExp(`^${config.eventTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
        }

        const registration = await EventRegistration.findOne(regQuery);

        if (registration) {
          if (!isNameMatching(fullName, registration.fullName)) {
            res.status(400).json({
              success: false,
              message: `Name verification failed. The provided name does not match the registered participant record for USN "${normalizedUsn}".`,
            });
            return;
          }

          const currentYear = new Date().getFullYear();
          const certNumber = `ANVAYA-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;

          try {
            participant = await CertificateParticipant.create({
              configId: config._id,
              fullName: registration.fullName || fullName.trim(),
              usn: normalizedUsn,
              certificateNumber: certNumber,
              isRevoked: false,
              issuedAt: registration.attendedAt || new Date(),
            });

            await CertificateConfig.findByIdAndUpdate(config._id, {
              $inc: { participantsCount: 1 },
            });
          } catch (createErr: any) {
            // Handled in case of simultaneous requests
            participant = await CertificateParticipant.findOne({
              configId: config._id,
              usn: normalizedUsn,
            });
            if (!participant) {
              throw createErr;
            }
          }
        }
      }

      if (!participant) {
        res.status(404).json({
          success: false,
          message: `No authorized participant record found for USN "${normalizedUsn}" in this event. Please verify your details or contact the cultural committee.`,
        });
        return;
      }

      // Check name match against participant record
      if (!isNameMatching(fullName, participant.fullName)) {
        res.status(400).json({
          success: false,
          message: `Name verification failed. The provided name does not match the registered participant record for USN "${normalizedUsn}".`,
        });
        return;
      }

      if (participant.isRevoked) {
        res.status(403).json({
          success: false,
          message: `This certificate was revoked. Reason: ${participant.revocationReason || 'Administrative revocation'}.`,
        });
        return;
      }
    } else {
      config = memoryStore.certificateConfigs.find(c => c._id === configId || c.id === configId);
      if (!config) {
        res.status(404).json({ success: false, message: 'Invalid event selected. Please select an event from the list.' });
        return;
      }

      if (!config.isEnabled || !config.isPublished) {
        res.status(400).json({ success: false, message: 'Certificates for this event are not yet published or have been temporarily disabled.' });
        return;
      }

      participant = memoryStore.certificateParticipants.find(
        p => (p.configId === configId || p.configId === config._id) && p.usn === normalizedUsn
      );

      // Memory store fallback to eventRegistrations
      if (!participant) {
        const cfgId = config._id || config.id;
        const reg = memoryStore.eventRegistrations.find(
          r => r.usn.toUpperCase() === normalizedUsn && (
            (config.eventId && (r.eventId === config.eventId || r.eventId === cfgId)) ||
            (config.eventTitle && r.eventTitle.toLowerCase() === config.eventTitle.toLowerCase())
          )
        );

        if (reg) {
          if (!isNameMatching(fullName, reg.fullName)) {
            res.status(400).json({
              success: false,
              message: `Name verification failed. The provided name does not match the registered participant record for USN "${normalizedUsn}".`,
            });
            return;
          }

          const currentYear = new Date().getFullYear();
          const certNumber = `ANVAYA-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
          participant = {
            _id: `cp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            id: `cp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            configId: cfgId,
            fullName: reg.fullName || fullName.trim(),
            usn: normalizedUsn,
            certificateNumber: certNumber,
            isRevoked: false,
            issuedAt: new Date().toISOString(),
          };
          memoryStore.certificateParticipants.push(participant);
          config.participantsCount = (config.participantsCount || 0) + 1;
        }
      }

      if (!participant) {
        res.status(404).json({
          success: false,
          message: `No authorized participant record found for USN "${normalizedUsn}" in this event. Please verify your details or contact the cultural committee.`,
        });
        return;
      }

      if (!isNameMatching(fullName, participant.fullName)) {
        res.status(400).json({
          success: false,
          message: `Name verification failed. The provided name does not match the registered participant record for USN "${normalizedUsn}".`,
        });
        return;
      }

      if (participant.isRevoked) {
        res.status(403).json({
          success: false,
          message: `This certificate was revoked. Reason: ${participant.revocationReason || 'Administrative revocation'}.`,
        });
        return;
      }
    }

    // Return complete verified certificate payload
    res.json({
      success: true,
      message: 'Certificate successfully verified and authorized.',
      data: {
        certificateNumber: participant.certificateNumber,
        recipientName: participant.fullName,
        usn: participant.usn,
        eventTitle: config.eventTitle,
        eventDate: config.eventDate,
        certificateTitle: config.certificateTitle,
        bodyTemplate: config.bodyTemplate,
        signatories: config.signatories || [],
        issuedAt: participant.issuedAt || new Date().toISOString(),
        institutionName: 'Kalpataru Institute of Technology, Tiptur',
        departmentName: 'Department of Information Science and Engineering',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Internal server error while verifying certificate.' });
  }
};

// Admin: Get all certificate configs with participant counts
export const getAdminConfigs = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const configs = await CertificateConfig.find().sort({ createdAt: -1 });
      const configsWithCounts = await Promise.all(
        configs.map(async (c: any) => {
          const count = await CertificateParticipant.countDocuments({ configId: c._id });
          return {
            ...c.toObject({ virtuals: true }),
            id: c._id.toString(),
            participantsCount: count,
          };
        })
      );
      res.json({ success: true, data: configsWithCounts });
    } else {
      const configsWithCounts = memoryStore.certificateConfigs.map(c => {
        const count = memoryStore.certificateParticipants.filter(p => p.configId === c._id || p.configId === c.id).length;
        return {
          ...c,
          id: c._id || c.id,
          participantsCount: count,
        };
      });
      res.json({ success: true, data: configsWithCounts });
    }
  } catch (error: any) {
    console.error('Failed to retrieve certificate configurations:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve certificate configurations.' });
  }
};

// Admin: Create certificate config
export const createConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventTitle, eventDate, certificateTitle, bodyTemplate, isEnabled, signatories, isPublished, eventId } = req.body;

    if (!eventTitle || !eventDate) {
      res.status(400).json({ success: false, message: 'Event title and event date are required.' });
      return;
    }

    if (isDbConnected()) {
      const config = await CertificateConfig.create({
        eventTitle,
        eventDate,
        certificateTitle: certificateTitle || 'Certificate of Participation',
        bodyTemplate: bodyTemplate || 'has actively participated and demonstrated exceptional cultural spirit in the programme organized by Anvaya Cultural Committee, Department of Information Science & Engineering, Kalpataru Institute of Technology, Tiptur.',
        isEnabled: isEnabled !== false,
        signatories: signatories || [],
        isPublished: isPublished !== false,
        eventId,
      });
      res.status(201).json({ success: true, data: config, message: 'Certificate event configuration created.' });
    } else {
      const newConfig = {
        _id: `cert_${Date.now()}`,
        id: `cert_${Date.now()}`,
        eventTitle,
        eventDate,
        certificateTitle: certificateTitle || 'Certificate of Participation',
        bodyTemplate: bodyTemplate || 'has actively participated and demonstrated exceptional cultural spirit in the programme organized by Anvaya Cultural Committee, Department of Information Science & Engineering, Kalpataru Institute of Technology, Tiptur.',
        isEnabled: isEnabled !== false,
        signatories: signatories || [],
        isPublished: isPublished !== false,
        eventId,
        participantsCount: 0,
        createdAt: new Date().toISOString(),
      };
      memoryStore.certificateConfigs.push(newConfig);
      res.status(201).json({ success: true, data: newConfig, message: 'Certificate event configuration created.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create certificate configuration.' });
  }
};

// Admin: Update config
export const updateConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (isDbConnected()) {
      const config = await CertificateConfig.findByIdAndUpdate(id, updateData, { new: true });
      if (!config) {
        res.status(404).json({ success: false, message: 'Certificate configuration not found.' });
        return;
      }
      res.json({ success: true, data: config, message: 'Certificate configuration updated.' });
    } else {
      const index = memoryStore.certificateConfigs.findIndex(c => c._id === id || c.id === id);
      if (index === -1) {
        res.status(404).json({ success: false, message: 'Certificate configuration not found.' });
        return;
      }
      memoryStore.certificateConfigs[index] = { ...memoryStore.certificateConfigs[index], ...updateData };
      res.json({ success: true, data: memoryStore.certificateConfigs[index], message: 'Certificate configuration updated.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update certificate configuration.' });
  }
};

// Admin: Delete config and participants
export const deleteConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const force = req.query.force === 'true' || req.body?.force === true;

    if (!id || id === 'undefined' || id === 'null') {
      res.status(400).json({ success: false, message: 'Invalid or missing certificate configuration identifier.' });
      return;
    }

    if (isDbConnected()) {
      if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ success: false, message: 'Invalid certificate configuration identifier format.' });
        return;
      }

      const config = await CertificateConfig.findById(id);
      if (!config) {
        res.status(404).json({ success: false, message: 'Certificate configuration not found or already deleted.' });
        return;
      }

      const participantCount = await CertificateParticipant.countDocuments({ configId: id });
      if (participantCount > 0 && !force) {
        res.status(409).json({
          success: false,
          hasParticipants: true,
          requiresConfirmation: true,
          participantCount,
          participantsCount: participantCount,
          message: `Cannot delete configuration: ${participantCount} issued participant record(s) exist. Confirm deletion with force parameter to proceed with deleting all associated records.`,
        });
        return;
      }

      await CertificateConfig.findByIdAndDelete(id);
      if (participantCount > 0) {
        await CertificateParticipant.deleteMany({ configId: id });
      }
      res.json({ success: true, message: 'Configuration and associated participant records deleted.' });
    } else {
      const index = memoryStore.certificateConfigs.findIndex(c => (c._id || c.id) === id);
      if (index === -1) {
        res.status(404).json({ success: false, message: 'Certificate configuration not found or already deleted.' });
        return;
      }

      const targetId = memoryStore.certificateConfigs[index]._id || memoryStore.certificateConfigs[index].id;
      const participantCount = memoryStore.certificateParticipants.filter(p => p.configId === targetId || p.configId === id).length;

      if (participantCount > 0 && !force) {
        res.status(409).json({
          success: false,
          hasParticipants: true,
          requiresConfirmation: true,
          participantCount,
          participantsCount: participantCount,
          message: `Cannot delete configuration: ${participantCount} issued participant record(s) exist. Confirm deletion with force parameter to proceed with deleting all associated records.`,
        });
        return;
      }

      memoryStore.certificateConfigs.splice(index, 1);
      memoryStore.certificateParticipants = memoryStore.certificateParticipants.filter(p => p.configId !== targetId && p.configId !== id);
      res.json({ success: true, message: 'Configuration and associated participant records deleted.' });
    }
  } catch (error: any) {
    console.error('Error in deleteConfig:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete certificate configuration.' });
  }
};

// Admin: Get participants for a config
export const getParticipants = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { search } = req.query;

    if (isDbConnected()) {
      const query: any = { configId: id };
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { usn: { $regex: search, $options: 'i' } },
          { certificateNumber: { $regex: search, $options: 'i' } },
        ];
      }
      const participants = await CertificateParticipant.find(query).sort({ issuedAt: -1 });
      res.json({ success: true, data: participants });
    } else {
      let participants = memoryStore.certificateParticipants.filter(p => p.configId === id);
      if (search) {
        const s = String(search).toLowerCase();
        participants = participants.filter(
          p => p.fullName.toLowerCase().includes(s) || p.usn.toLowerCase().includes(s) || p.certificateNumber.toLowerCase().includes(s)
        );
      }
      res.json({ success: true, data: participants });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve participant list.' });
  }
};

// Admin: Batch import participants
export const importParticipants = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { records } = req.body; // Array of { fullName, usn }

    if (!Array.isArray(records) || records.length === 0) {
      res.status(400).json({ success: false, message: 'Please provide an array of valid participant records.' });
      return;
    }

    let importedCount = 0;
    let skippedDuplicates = 0;
    let invalidRows = 0;

    const currentYear = new Date().getFullYear();

    for (let i = 0; i < records.length; i++) {
      const item = records[i];
      if (!item.fullName || !item.usn) {
        invalidRows++;
        continue;
      }

      const fullName = item.fullName.trim();
      const usn = item.usn.trim().toUpperCase();

      if (isDbConnected()) {
        const existing = await CertificateParticipant.findOne({ configId: id, usn });
        if (existing) {
          skippedDuplicates++;
          continue;
        }

        const certNumber = `ANVAYA-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
        await CertificateParticipant.create({
          configId: id,
          fullName,
          usn,
          certificateNumber: certNumber,
          isRevoked: false,
          issuedAt: new Date(),
        });
        importedCount++;
      } else {
        const existing = memoryStore.certificateParticipants.find(p => p.configId === id && p.usn === usn);
        if (existing) {
          skippedDuplicates++;
          continue;
        }

        const certNumber = `ANVAYA-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
        memoryStore.certificateParticipants.push({
          _id: `cp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          id: `cp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          configId: id,
          fullName,
          usn,
          certificateNumber: certNumber,
          isRevoked: false,
          issuedAt: new Date().toISOString(),
        });
        importedCount++;
      }
    }

    res.json({
      success: true,
      message: `Import processed. ${importedCount} participants added, ${skippedDuplicates} duplicate USNs skipped, ${invalidRows} invalid rows ignored.`,
      stats: { importedCount, skippedDuplicates, invalidRows },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to import participant records.' });
  }
};

// Admin: Add single participant
export const addParticipant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fullName, usn } = req.body;

    if (!fullName || !usn) {
      res.status(400).json({ success: false, message: 'Full name and USN are required.' });
      return;
    }

    const normalizedUsn = usn.trim().toUpperCase();
    const currentYear = new Date().getFullYear();
    const certNumber = `ANVAYA-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;

    if (isDbConnected()) {
      const existing = await CertificateParticipant.findOne({ configId: id, usn: normalizedUsn });
      if (existing) {
        res.status(400).json({ success: false, message: `USN ${normalizedUsn} already exists for this event.` });
        return;
      }

      const participant = await CertificateParticipant.create({
        configId: id,
        fullName: fullName.trim(),
        usn: normalizedUsn,
        certificateNumber: certNumber,
        isRevoked: false,
      });

      res.status(201).json({ success: true, data: participant, message: 'Participant added.' });
    } else {
      const existing = memoryStore.certificateParticipants.find(p => p.configId === id && p.usn === normalizedUsn);
      if (existing) {
        res.status(400).json({ success: false, message: `USN ${normalizedUsn} already exists for this event.` });
        return;
      }

      const newParticipant = {
        _id: `cp_${Date.now()}`,
        id: `cp_${Date.now()}`,
        configId: id,
        fullName: fullName.trim(),
        usn: normalizedUsn,
        certificateNumber: certNumber,
        isRevoked: false,
        issuedAt: new Date().toISOString(),
      };
      memoryStore.certificateParticipants.push(newParticipant);

      res.status(201).json({ success: true, data: newParticipant, message: 'Participant added.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to add participant.' });
  }
};

// Admin: Toggle certificate revocation
export const toggleRevoke = async (req: Request, res: Response): Promise<void> => {
  try {
    const { participantId } = req.params;
    const { isRevoked, revocationReason } = req.body;

    if (isDbConnected()) {
      const participant = await CertificateParticipant.findByIdAndUpdate(
        participantId,
        { isRevoked: Boolean(isRevoked), revocationReason },
        { new: true }
      );
      if (!participant) {
        res.status(404).json({ success: false, message: 'Participant not found.' });
        return;
      }
      res.json({ success: true, data: participant, message: isRevoked ? 'Certificate revoked.' : 'Revocation removed.' });
    } else {
      const p = memoryStore.certificateParticipants.find(item => item._id === participantId || item.id === participantId);
      if (!p) {
        res.status(404).json({ success: false, message: 'Participant not found.' });
        return;
      }
      p.isRevoked = Boolean(isRevoked);
      p.revocationReason = revocationReason;
      res.json({ success: true, data: p, message: isRevoked ? 'Certificate revoked.' : 'Revocation removed.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to toggle revocation.' });
  }
};

// Admin: Delete participant
export const deleteParticipant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { participantId } = req.params;

    if (isDbConnected()) {
      await CertificateParticipant.findByIdAndDelete(participantId);
      res.json({ success: true, message: 'Participant removed.' });
    } else {
      const idx = memoryStore.certificateParticipants.findIndex(p => p._id === participantId || p.id === participantId);
      if (idx !== -1) {
        memoryStore.certificateParticipants.splice(idx, 1);
      }
      res.json({ success: true, message: 'Participant removed.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete participant.' });
  }
};

// Admin: Export backup
export const exportBackup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const config = await CertificateConfig.findById(id);
      const participants = await CertificateParticipant.find({ configId: id });
      res.json({
        success: true,
        backup: {
          config,
          participants,
          exportedAt: new Date().toISOString(),
          version: '1.0',
        },
      });
    } else {
      const config = memoryStore.certificateConfigs.find(c => c._id === id || c.id === id);
      const participants = memoryStore.certificateParticipants.filter(p => p.configId === id);
      res.json({
        success: true,
        backup: {
          config,
          participants,
          exportedAt: new Date().toISOString(),
          version: '1.0',
        },
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to export backup.' });
  }
};

// Admin: Synchronize event registrations directly into certificate participants
export const syncEventRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined' || id === 'null') {
      res.status(400).json({ success: false, message: 'Invalid configuration identifier.' });
      return;
    }

    let config: any = null;
    let registrations: any[] = [];
    const currentYear = new Date().getFullYear();
    let syncedCount = 0;
    let existingCount = 0;

    if (isDbConnected()) {
      config = await CertificateConfig.findById(id);
      if (!config) {
        res.status(404).json({ success: false, message: 'Certificate configuration not found.' });
        return;
      }

      const regQuery: any = {};
      if (config.eventId) {
        regQuery.eventId = config.eventId;
      } else if (config.eventTitle) {
        regQuery.eventTitle = { $regex: new RegExp(`^${config.eventTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
      }

      registrations = await EventRegistration.find(regQuery);

      for (const reg of registrations) {
        const normalizedUsn = reg.usn.trim().toUpperCase();
        const existing = await CertificateParticipant.findOne({
          configId: config._id,
          usn: normalizedUsn,
        });

        if (existing) {
          existingCount++;
          continue;
        }

        const certNumber = `ANVAYA-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
        await CertificateParticipant.create({
          configId: config._id,
          fullName: reg.fullName.trim(),
          usn: normalizedUsn,
          certificateNumber: certNumber,
          isRevoked: false,
          issuedAt: reg.attendedAt || new Date(),
        });
        syncedCount++;
      }

      const totalCount = await CertificateParticipant.countDocuments({ configId: config._id });
      await CertificateConfig.findByIdAndUpdate(config._id, { participantsCount: totalCount });

      res.json({
        success: true,
        message: `Successfully synchronized ${syncedCount} participant(s) from event registrations (${existingCount} already present).`,
        count: syncedCount,
        totalParticipants: totalCount,
      });
    } else {
      config = memoryStore.certificateConfigs.find(c => c._id === id || c.id === id);
      if (!config) {
        res.status(404).json({ success: false, message: 'Certificate configuration not found.' });
        return;
      }

      const cfgId = config._id || config.id;
      registrations = memoryStore.eventRegistrations.filter(r =>
        (config.eventId && (r.eventId === config.eventId || r.eventId === cfgId)) ||
        (config.eventTitle && r.eventTitle.toLowerCase() === config.eventTitle.toLowerCase())
      );

      for (const reg of registrations) {
        const normalizedUsn = reg.usn.trim().toUpperCase();
        const existing = memoryStore.certificateParticipants.find(
          p => (p.configId === cfgId || p.configId === id) && p.usn === normalizedUsn
        );

        if (existing) {
          existingCount++;
          continue;
        }

        const certNumber = `ANVAYA-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
        memoryStore.certificateParticipants.push({
          _id: `cp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          id: `cp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          configId: cfgId,
          fullName: reg.fullName.trim(),
          usn: normalizedUsn,
          certificateNumber: certNumber,
          isRevoked: false,
          issuedAt: new Date().toISOString(),
        });
        syncedCount++;
      }

      config.participantsCount = memoryStore.certificateParticipants.filter(p => p.configId === cfgId || p.configId === id).length;

      res.json({
        success: true,
        message: `Successfully synchronized ${syncedCount} participant(s) from event registrations (${existingCount} already present).`,
        count: syncedCount,
        totalParticipants: config.participantsCount,
      });
    }
  } catch (error: any) {
    console.error('Error in syncEventRegistrations:', error);
    res.status(500).json({ success: false, message: 'Failed to synchronize event registrations.' });
  }
};

