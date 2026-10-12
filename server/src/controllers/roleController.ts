import { Request, Response } from 'express';
import { Role } from '../models/Role.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore, SYSTEM_PERMISSIONS } from '../services/store.js';
import { ALL_STANDARD_ROLES, ALL_STANDARD_ROLE_KEYS } from '../constants/roles.js';

export const ensureDefaultRolesInDb = async () => {
  if (!isDbConnected()) return;
  for (const r of ALL_STANDARD_ROLES) {
    const exists = await Role.findOne({ key: r.key });
    if (!exists) {
      await Role.create({
        name: r.name,
        key: r.key,
        description: r.description,
        permissions: r.key === 'technical' ? SYSTEM_PERMISSIONS.map(p => p.id) : (r.key === 'media-poster' ? ['manage_gallery'] : []),
        isSystem: true,
        isActive: true,
      });
    }
  }
};

export const getRoles = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      await ensureDefaultRolesInDb();
      const roles = await Role.find().sort({ isSystem: -1, createdAt: 1 });
      res.json({ success: true, data: roles });
    } else {
      res.json({ success: true, data: memoryStore.roles });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve roles.' });
  }
};

export const getPermissions = async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: SYSTEM_PERMISSIONS });
};

export const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, key, description, permissions, isActive } = req.body;

    if (!name || !key || !description) {
      res.status(400).json({ success: false, message: 'Role Name, Unique Key, and Description are required.' });
      return;
    }

    const normalizedKey = key.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    if (ALL_STANDARD_ROLE_KEYS.includes(normalizedKey) || ['admin'].includes(normalizedKey)) {
      res.status(400).json({ success: false, message: `Cannot override built-in role key '${normalizedKey}'.` });
      return;
    }

    if (isDbConnected()) {
      const existing = await Role.findOne({ key: normalizedKey });
      if (existing) {
        res.status(400).json({ success: false, message: `A role with key '${normalizedKey}' already exists.` });
        return;
      }

      const role = await Role.create({
        name: name.trim(),
        key: normalizedKey,
        description: description.trim(),
        permissions: Array.isArray(permissions) ? permissions : [],
        isSystem: false,
        isActive: isActive !== false,
      });

      res.status(201).json({ success: true, data: role, message: 'Custom role created successfully.' });
    } else {
      const existing = memoryStore.roles.find(r => r.key === normalizedKey);
      if (existing) {
        res.status(400).json({ success: false, message: `A role with key '${normalizedKey}' already exists.` });
        return;
      }

      const newRole = {
        _id: `role_${Date.now()}`,
        id: `role_${Date.now()}`,
        name: name.trim(),
        key: normalizedKey,
        description: description.trim(),
        permissions: Array.isArray(permissions) ? permissions : [],
        isSystem: false,
        isActive: isActive !== false,
        createdAt: new Date().toISOString(),
      };

      memoryStore.roles.push(newRole);
      res.status(201).json({ success: true, data: newRole, message: 'Custom role created successfully.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create role.' });
  }
};

export const updateRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, permissions, isActive } = req.body;

    if (isDbConnected()) {
      const role = await Role.findById(id);
      if (!role) {
        res.status(404).json({ success: false, message: 'Role not found.' });
        return;
      }

      if (role.isSystem && role.key === 'technical') {
        res.status(400).json({ success: false, message: 'Cannot modify permissions of core Technical Administrator role.' });
        return;
      }

      if (name) role.name = name.trim();
      if (description) role.description = description.trim();
      if (permissions && Array.isArray(permissions)) role.permissions = permissions;
      if (typeof isActive === 'boolean') role.isActive = isActive;

      await role.save();
      res.json({ success: true, data: role, message: 'Role updated successfully.' });
    } else {
      const idx = memoryStore.roles.findIndex(r => r._id === id || r.id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Role not found.' });
        return;
      }

      const role = memoryStore.roles[idx];
      if (role.isSystem && role.key === 'technical') {
        res.status(400).json({ success: false, message: 'Cannot modify permissions of core Technical Administrator role.' });
        return;
      }

      memoryStore.roles[idx] = {
        ...role,
        name: name ? name.trim() : role.name,
        description: description ? description.trim() : role.description,
        permissions: Array.isArray(permissions) ? permissions : role.permissions,
        isActive: typeof isActive === 'boolean' ? isActive : role.isActive,
      };

      res.json({ success: true, data: memoryStore.roles[idx], message: 'Role updated successfully.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update role.' });
  }
};

export const deleteRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const role = await Role.findById(id);
      if (!role) {
        res.status(404).json({ success: false, message: 'Role not found.' });
        return;
      }

      if (role.isSystem || ALL_STANDARD_ROLE_KEYS.includes(role.key)) {
        res.status(400).json({ success: false, message: 'Built-in system and committee roles cannot be deleted.' });
        return;
      }

      await Role.findByIdAndDelete(id);
      res.json({ success: true, message: 'Custom role deleted successfully.' });
    } else {
      const idx = memoryStore.roles.findIndex(r => r._id === id || r.id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Role not found.' });
        return;
      }

      if (memoryStore.roles[idx].isSystem || ALL_STANDARD_ROLE_KEYS.includes(memoryStore.roles[idx].key)) {
        res.status(400).json({ success: false, message: 'Built-in system and committee roles cannot be deleted.' });
        return;
      }

      memoryStore.roles.splice(idx, 1);
      res.json({ success: true, message: 'Custom role deleted successfully.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete role.' });
  }
};
