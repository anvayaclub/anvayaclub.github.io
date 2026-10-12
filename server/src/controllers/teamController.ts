import { Request, Response } from 'express';
import { TeamMember } from '../models/TeamMember.js';
import { User } from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore } from '../services/store.js';

export const getTeam = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const members = await TeamMember.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
      res.json({ success: true, data: members });
    } else {
      const members = memoryStore.teamMembers
        .filter(m => m.isActive)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      res.json({ success: true, data: members });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch team directory.' });
  }
};

export const getAdminTeam = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const members = await TeamMember.find().sort({ order: 1 });
      res.json({ success: true, data: members });
    } else {
      const members = [...memoryStore.teamMembers].sort((a, b) => (a.order || 0) - (b.order || 0));
      res.json({ success: true, data: members });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch team members for administration.' });
  }
};

export const createTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      usn,
      role,
      appRole,
      department,
      academicYear,
      bio,
      photoUrl,
      contactEmail,
      contactPhone,
      socialLinks,
      order,
      isActive,
    } = req.body;

    if (!name || !role) {
      res.status(400).json({ success: false, message: 'Member full name and committee role/designation are required.' });
      return;
    }

    const normalizedUsn = usn ? usn.trim().toUpperCase() : undefined;
    const assignedAppRole = appRole || 'student';

    if (isDbConnected()) {
      let linkedUser: any = null;
      let linkStatus: 'linked' | 'pending' | 'unlinked' = 'unlinked';

      if (normalizedUsn) {
        linkedUser = await User.findOne({ usn: normalizedUsn });
        if (linkedUser) {
          linkStatus = 'linked';
          linkedUser.role = assignedAppRole;
          await linkedUser.save();
        } else {
          linkStatus = 'pending';
        }
      }

      const member = await TeamMember.create({
        name: name.trim(),
        usn: normalizedUsn,
        role: role.trim(),
        appRole: assignedAppRole,
        department: department || 'ISE',
        academicYear: academicYear || 'Final Year',
        bio: bio?.trim(),
        photoUrl,
        contactEmail: contactEmail?.trim(),
        contactPhone: contactPhone?.trim(),
        socialLinks: socialLinks || {},
        order: Number(order) || 0,
        isActive: isActive !== false,
        linkedUserId: linkedUser?._id,
        accountLinkStatus: linkStatus,
      });

      if (linkedUser) {
        linkedUser.linkedTeamMemberId = member._id;
        await linkedUser.save();
      }

      res.status(201).json({
        success: true,
        data: member,
        message: linkStatus === 'linked'
          ? `Team profile added and automatically linked to ${linkedUser.name}'s account (${assignedAppRole} role assigned)!`
          : linkStatus === 'pending'
          ? `Team profile added. Invitation pending: ${assignedAppRole} role will activate when USN ${normalizedUsn} registers.`
          : 'Team member profile created successfully.',
      });
    } else {
      let linkedUser: any = null;
      let linkStatus: 'linked' | 'pending' | 'unlinked' = 'unlinked';

      if (normalizedUsn) {
        linkedUser = memoryStore.users.find(u => u.usn?.toUpperCase() === normalizedUsn);
        if (linkedUser) {
          linkStatus = 'linked';
          linkedUser.role = assignedAppRole;
        } else {
          linkStatus = 'pending';
        }
      }

      const memberId = `tm_${Date.now()}`;
      const newMember = {
        _id: memberId,
        id: memberId,
        name: name.trim(),
        usn: normalizedUsn,
        role: role.trim(),
        appRole: assignedAppRole,
        department: department || 'ISE',
        academicYear: academicYear || 'Final Year',
        bio: bio?.trim() || '',
        photoUrl: photoUrl || '',
        contactEmail: contactEmail?.trim() || '',
        contactPhone: contactPhone?.trim() || '',
        socialLinks: socialLinks || {},
        order: Number(order) || memoryStore.teamMembers.length + 1,
        isActive: isActive !== false,
        linkedUserId: linkedUser?._id || linkedUser?.id,
        accountLinkStatus: linkStatus,
        createdAt: new Date().toISOString(),
      };

      memoryStore.teamMembers.push(newMember);

      res.status(201).json({
        success: true,
        data: newMember,
        message: linkStatus === 'linked'
          ? `Team profile added and automatically linked to ${linkedUser.name}'s account (${assignedAppRole} role assigned)!`
          : linkStatus === 'pending'
          ? `Team profile added. Invitation pending: ${assignedAppRole} role will activate when USN ${normalizedUsn} registers.`
          : 'Team member profile created successfully.',
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create team member.' });
  }
};

export const updateTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.usn) {
      updateData.usn = updateData.usn.trim().toUpperCase();
    }

    if (isDbConnected()) {
      const member = await TeamMember.findById(id);
      if (!member) {
        res.status(404).json({ success: false, message: 'Team member not found.' });
        return;
      }

      // Check USN changes or role changes
      const targetUsn = updateData.usn !== undefined ? updateData.usn : member.usn;
      const targetAppRole = updateData.appRole !== undefined ? updateData.appRole : member.appRole;

      if (targetUsn) {
        const linkedUser = await User.findOne({ usn: targetUsn });
        if (linkedUser) {
          updateData.linkedUserId = linkedUser._id;
          updateData.accountLinkStatus = 'linked';
          linkedUser.role = targetAppRole;
          await linkedUser.save();
        } else {
          updateData.linkedUserId = undefined;
          updateData.accountLinkStatus = 'pending';
        }
      } else {
        updateData.accountLinkStatus = 'unlinked';
        updateData.linkedUserId = undefined;
      }

      const updated = await TeamMember.findByIdAndUpdate(id, updateData, { new: true });
      res.json({ success: true, data: updated, message: 'Team member updated successfully.' });
    } else {
      const index = memoryStore.teamMembers.findIndex(m => m._id === id || m.id === id);
      if (index === -1) {
        res.status(404).json({ success: false, message: 'Team member not found.' });
        return;
      }

      const member = memoryStore.teamMembers[index];
      const targetUsn = updateData.usn !== undefined ? updateData.usn : member.usn;
      const targetAppRole = updateData.appRole !== undefined ? updateData.appRole : member.appRole;

      if (targetUsn) {
        const linkedUser = memoryStore.users.find(u => u.usn?.toUpperCase() === targetUsn);
        if (linkedUser) {
          updateData.linkedUserId = linkedUser._id || linkedUser.id;
          updateData.accountLinkStatus = 'linked';
          linkedUser.role = targetAppRole;
        } else {
          updateData.linkedUserId = undefined;
          updateData.accountLinkStatus = 'pending';
        }
      } else {
        updateData.accountLinkStatus = 'unlinked';
        updateData.linkedUserId = undefined;
      }

      memoryStore.teamMembers[index] = { ...member, ...updateData };
      res.json({ success: true, data: memoryStore.teamMembers[index], message: 'Team member updated successfully.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update team member.' });
  }
};

export const deleteTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const member = await TeamMember.findById(id);
      if (!member) {
        res.status(404).json({ success: false, message: 'Team member not found.' });
        return;
      }

      // Revert user role back to student if linked
      if (member.linkedUserId) {
        await User.findByIdAndUpdate(member.linkedUserId, { role: 'student' });
      }

      await TeamMember.findByIdAndDelete(id);
      res.json({ success: true, message: 'Team member removed successfully.' });
    } else {
      const index = memoryStore.teamMembers.findIndex(m => m._id === id || m.id === id);
      if (index === -1) {
        res.status(404).json({ success: false, message: 'Team member not found.' });
        return;
      }

      const member = memoryStore.teamMembers[index];
      if (member.linkedUserId) {
        const user = memoryStore.users.find(u => u._id === member.linkedUserId || u.id === member.linkedUserId);
        if (user) user.role = 'student';
      }

      memoryStore.teamMembers.splice(index, 1);
      res.json({ success: true, message: 'Team member removed successfully.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete team member.' });
  }
};
