import React, { useEffect, useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  PlusCircle,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  Lock,
  Sparkles,
  Users,
  Search,
  Filter,
  UserPlus,
  RefreshCw,
  Power,
  Key,
  History,
  Copy,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';
import { RoleItem, PermissionItem, User, AuditLogItem } from '../../types';
import { useToast } from '../../context/ToastContext';
import { COMMITTEE_ROLES, isCommitteeRole } from '../../constants/roles';

export const AdminRoles: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'audit'>('users');

  // Roles & Permissions state
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Role Modal State
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleKey, setRoleKey] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isRoleActive, setIsRoleActive] = useState(true);
  const [savingRole, setSavingRole] = useState(false);

  // Users State
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create User Modal State
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsn, setNewUserUsn] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('student');
  const [newUserBranch, setNewUserBranch] = useState('ISE');
  const [newUserSemester, setNewUserSemester] = useState('6th Semester');
  const [newUserTempPassword, setNewUserTempPassword] = useState('');
  const [createdTempPassword, setCreatedTempPassword] = useState<string | null>(null);
  const [savingUser, setSavingUser] = useState(false);

  // Change Role Modal State
  const [changeRoleModalOpen, setChangeRoleModalOpen] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const [targetRole, setTargetRole] = useState('student');
  const [roleChangeReason, setRoleChangeReason] = useState('');
  const [updatingRole, setUpdatingRole] = useState(false);

  // Status Confirmation Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedUserForStatus, setSelectedUserForStatus] = useState<User | null>(null);
  const [targetStatus, setTargetStatus] = useState<'active' | 'deactivated'>('active');
  const [statusReason, setStatusReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Password Reset Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
  const [resetTempPassword, setResetTempPassword] = useState('');
  const [resetSuccessPassword, setResetSuccessPassword] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const { success, error } = useToast();

  const fetchRolesAndPermissions = async () => {
    setLoadingRoles(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.roles.getAll(),
        api.roles.getPermissions(),
      ]);
      if (rolesRes.success) setRoles(rolesRes.data);
      if (permsRes.success) setPermissions(permsRes.data);
    } catch (err: any) {
      error(err.message || 'Failed to load roles and permissions.');
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.users.getAll({
        search: searchQuery || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load user accounts.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const res = await api.audit.getLogs();
      if (res.success) {
        setAuditLogs(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load audit records.');
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    fetchRolesAndPermissions();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab, searchQuery, roleFilter, statusFilter]);

  // Handle Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserUsn.trim()) {
      error('Full Name and USN are required.');
      return;
    }

    setSavingUser(true);
    try {
      const res = await api.users.create({
        name: newUserName.trim(),
        usn: newUserUsn.trim().toUpperCase(),
        email: newUserEmail.trim() ? newUserEmail.trim() : undefined,
        role: newUserRole,
        branch: newUserBranch,
        semester: newUserSemester,
        temporaryPassword: newUserTempPassword.trim() || undefined,
      });

      if (res.success) {
        success('Account created successfully.');
        setCreatedTempPassword(res.temporaryPassword || 'Generated');
        fetchUsers();
      } else {
        error(res.message);
      }
    } catch (err: any) {
      error(err.message || 'Failed to create user account.');
    } finally {
      setSavingUser(false);
    }
  };

  // Handle Role Change
  const handleChangeRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForRole) return;

    setUpdatingRole(true);
    try {
      const res = await api.users.updateRole(selectedUserForRole.id || (selectedUserForRole as any)._id, {
        role: targetRole,
        reason: roleChangeReason.trim() || 'Administrative privilege adjustment',
      });
      if (res.success) {
        success(res.message);
        setChangeRoleModalOpen(false);
        fetchUsers();
      } else {
        error(res.message);
      }
    } catch (err: any) {
      error(err.message || 'Failed to update user role.');
    } finally {
      setUpdatingRole(false);
    }
  };

  // Handle Status Toggle
  const handleStatusSubmit = async () => {
    if (!selectedUserForStatus) return;

    setUpdatingStatus(true);
    try {
      const res = await api.users.updateStatus(selectedUserForStatus.id || (selectedUserForStatus as any)._id, {
        status: targetStatus,
        reason: statusReason.trim() || `Administrative ${targetStatus} action`,
      });
      if (res.success) {
        success(res.message);
        setStatusModalOpen(false);
        fetchUsers();
      } else {
        error(res.message);
      }
    } catch (err: any) {
      error(err.message || 'Failed to update account status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Password Reset
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset) return;

    setResettingPassword(true);
    try {
      const res = await api.users.resetPassword(selectedUserForReset.id || (selectedUserForReset as any)._id, {
        temporaryPassword: resetTempPassword.trim() || undefined,
        reason: 'Administrative password reset',
      });
      if (res.success) {
        success('Password has been reset.');
        setResetSuccessPassword(res.temporaryPassword || 'Reset');
        fetchUsers();
      } else {
        error(res.message);
      }
    } catch (err: any) {
      error(err.message || 'Failed to reset password.');
    } finally {
      setResettingPassword(false);
    }
  };

  // Role Form Handlers
  const openCreateRoleModal = () => {
    setEditingRoleId(null);
    setRoleName('');
    setRoleKey('');
    setRoleDescription('');
    setSelectedPermissions([]);
    setIsRoleActive(true);
    setRoleModalOpen(true);
  };

  const openEditRoleModal = (role: RoleItem) => {
    setEditingRoleId(role.id || role._id || null);
    setRoleName(role.name);
    setRoleKey(role.key);
    setRoleDescription(role.description);
    setSelectedPermissions(role.permissions || []);
    setIsRoleActive(role.isActive !== false);
    setRoleModalOpen(true);
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleRoleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim() || !roleKey.trim() || !roleDescription.trim()) {
      error('Please complete all required fields.');
      return;
    }

    setSavingRole(true);
    try {
      if (editingRoleId) {
        const res = await api.roles.update(editingRoleId, {
          name: roleName.trim(),
          description: roleDescription.trim(),
          permissions: selectedPermissions,
          isActive: isRoleActive,
        });
        if (res.success) {
          success('Application role updated successfully.');
          setRoleModalOpen(false);
          fetchRolesAndPermissions();
        } else {
          error(res.message);
        }
      } else {
        const res = await api.roles.create({
          name: roleName.trim(),
          key: roleKey.trim().toLowerCase().replace(/\s+/g, '-'),
          description: roleDescription.trim(),
          permissions: selectedPermissions,
          isActive: isRoleActive,
        });
        if (res.success) {
          success('Application role created successfully.');
          setRoleModalOpen(false);
          fetchRolesAndPermissions();
        } else {
          error(res.message);
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to save application role.');
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteRole = async (roleId: string, roleTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete custom role "${roleTitle}"? This cannot be undone.`)) return;
    try {
      const res = await api.roles.delete(roleId);
      if (res.success) {
        success('Role removed.');
        fetchRolesAndPermissions();
      } else {
        error(res.message);
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete role.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    success('Temporary password copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-gold-600 dark:text-gold-400" />
            <h1 className="text-xl font-serif font-bold text-plum-950 dark:text-ivory-50">
              User Accounts & Role-Based Access Control
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage authenticated student accounts, assign security roles, and monitor administrative audit records.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-ivory-200 dark:bg-plum-950/80 rounded-xl border border-ivory-300 dark:border-plum-800 self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveTab('users')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-white dark:bg-plum-900 text-plum-950 dark:text-ivory-50 shadow-sm'
                : 'text-gray-500 hover:text-plum-900 dark:hover:text-ivory-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Accounts ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'roles'
                ? 'bg-white dark:bg-plum-900 text-plum-950 dark:text-ivory-50 shadow-sm'
                : 'text-gray-500 hover:text-plum-900 dark:hover:text-ivory-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Roles ({roles.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'audit'
                ? 'bg-white dark:bg-plum-900 text-plum-950 dark:text-ivory-50 shadow-sm'
                : 'text-gray-500 hover:text-plum-900 dark:hover:text-ivory-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USER ACCOUNTS & PRIVILEGES */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name, USN, or email..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-1 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                />
              </div>

              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none text-plum-950 dark:text-ivory-50"
              >
                <option value="all">All Roles</option>
                <optgroup label="System Roles">
                  <option value="technical">Technical</option>
                  <option value="media-poster">Media Poster</option>
                  <option value="student">Student</option>
                </optgroup>
                <optgroup label="Committee Roles">
                  {COMMITTEE_ROLES.map(cr => (
                    <option key={cr.key} value={cr.key}>{cr.name}</option>
                  ))}
                </optgroup>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none text-plum-950 dark:text-ivory-50"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>

            <button
              onClick={() => {
                setNewUserName('');
                setNewUserUsn('');
                setNewUserEmail('');
                setNewUserRole('student');
                setNewUserBranch('ISE');
                setNewUserSemester('6th Semester');
                setNewUserTempPassword('');
                setCreatedTempPassword(null);
                setCreateUserModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gold-600 hover:bg-gold-500 shadow-sm transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Accounts Table */}
          <div className="rounded-2xl border border-ivory-200 dark:border-plum-800 bg-white dark:bg-plum-900 overflow-hidden shadow-sm">
            {loadingUsers ? (
              <div className="p-12 text-center text-xs text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-gold-500" />
                <span>Loading authenticated user accounts...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Users className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600" />
                <p className="text-xs text-gray-500">No user accounts found matching your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ivory-100 dark:bg-plum-950/70 border-b border-ivory-200 dark:border-plum-800 text-gray-600 dark:text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">User & USN</th>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Assigned Role</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3">Last Login</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory-200 dark:divide-plum-800/60 font-sans">
                    {users.map(u => (
                      <tr key={u.id || (u as any)._id} className="hover:bg-ivory-50/50 dark:hover:bg-plum-800/30 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-plum-950 dark:text-ivory-50">{u.name}</div>
                          <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400">{u.usn || 'No USN'}</div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 font-mono text-[11px]">
                          {u.email || <span className="text-gray-400 italic">None</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              u.role === 'technical'
                                ? 'bg-gold-500/15 text-gold-700 dark:text-gold-300 border border-gold-500/30'
                                : u.role === 'media-poster'
                                ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                                : 'bg-ivory-200 dark:bg-plum-800 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              u.status === 'deactivated'
                                ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {u.status || 'active'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 text-[11px]">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Change Role Button */}
                            <button
                              onClick={() => {
                                setSelectedUserForRole(u);
                                setTargetRole(u.role);
                                setRoleChangeReason('');
                                setChangeRoleModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-plum-700 dark:text-ivory-200 hover:bg-ivory-200 dark:hover:bg-plum-800"
                              title="Change Role & Privileges"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {/* Reset Password Button */}
                            <button
                              onClick={() => {
                                setSelectedUserForReset(u);
                                setResetTempPassword('');
                                setResetSuccessPassword(null);
                                setResetModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-500/10"
                              title="Reset Password"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>

                            {/* Activate / Deactivate Toggle */}
                            <button
                              onClick={() => {
                                setSelectedUserForStatus(u);
                                setTargetStatus(u.status === 'deactivated' ? 'active' : 'deactivated');
                                setStatusReason('');
                                setStatusModalOpen(true);
                              }}
                              className={`p-1.5 rounded-lg ${
                                u.status === 'deactivated'
                                  ? 'text-emerald-600 hover:bg-emerald-500/10'
                                  : 'text-red-500 hover:bg-red-500/10'
                              }`}
                              title={u.status === 'deactivated' ? 'Activate Account' : 'Deactivate Account'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ROLES & GRANULAR PERMISSIONS */}
      {/* ========================================================================= */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              System roles cannot be renamed or deleted, but custom roles can be defined for committee coordinators.
            </p>
            <button
              onClick={openCreateRoleModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-gold-600 hover:bg-gold-500 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Custom Role</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map(role => (
              <div
                key={role.id || role._id}
                className="p-5 rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-base text-plum-950 dark:text-ivory-50">
                      {role.name}
                    </span>
                    {role.isSystem ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold-500/15 text-gold-700 dark:text-gold-300 border border-gold-500/30">
                        <Lock className="w-2.5 h-2.5" />
                        <span>System</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                        <span>Custom</span>
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] font-mono text-gray-400">
                    key: <code>{role.key}</code>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                    {role.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-ivory-200 dark:border-plum-800 space-y-2">
                  <div className="text-[11px] font-semibold text-gray-500">
                    Permissions ({role.permissions?.length || 0}):
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions && role.permissions.length > 0 ? (
                      role.permissions.map(p => (
                        <span
                          key={p}
                          className="px-2 py-0.5 rounded bg-ivory-100 dark:bg-plum-950 text-[10px] font-mono text-plum-900 dark:text-ivory-200"
                        >
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">No administrative permissions (standard member)</span>
                    )}
                  </div>

                  {!role.isSystem && (
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => openEditRoleModal(role)}
                        className="p-1.5 rounded-lg text-plum-700 dark:text-ivory-200 hover:bg-ivory-200 dark:hover:bg-plum-800"
                        title="Edit Role"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.id || role._id || '', role.name)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10"
                        title="Delete Role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AUDIT TRAIL */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Chronological security log of all administrative role adjustments, account setups, activations, and password resets.
            </p>
            <button
              onClick={fetchAuditLogs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-ivory-200 dark:bg-plum-800 text-plum-900 dark:text-ivory-100 hover:opacity-80"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Log</span>
            </button>
          </div>

          <div className="rounded-2xl border border-ivory-200 dark:border-plum-800 bg-white dark:bg-plum-900 overflow-hidden shadow-sm">
            {loadingAudit ? (
              <div className="p-12 text-center text-xs text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-gold-500" />
                <span>Loading security audit records...</span>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <History className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600" />
                <p className="text-xs text-gray-500">No security audit records recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ivory-100 dark:bg-plum-950/70 border-b border-ivory-200 dark:border-plum-800 text-gray-600 dark:text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Security Action</th>
                      <th className="px-4 py-3">Performed By</th>
                      <th className="px-4 py-3">Target User</th>
                      <th className="px-4 py-3">Audit Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory-200 dark:divide-plum-800/60 font-sans">
                    {auditLogs.map((log, idx) => (
                      <tr key={log.id || log._id || idx} className="hover:bg-ivory-50/50 dark:hover:bg-plum-800/30 transition-colors">
                        <td className="px-4 py-3.5 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              log.action === 'INITIAL_TECHNICAL_SETUP'
                                ? 'bg-gold-500/15 text-gold-700 dark:text-gold-300 border border-gold-500/30'
                                : log.action === 'ROLE_CHANGED'
                                ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300'
                                : log.action === 'ACCOUNT_DEACTIVATED'
                                ? 'bg-red-500/15 text-red-600'
                                : log.action === 'PASSWORD_RESET'
                                ? 'bg-amber-500/15 text-amber-600'
                                : 'bg-emerald-500/15 text-emerald-600'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-plum-950 dark:text-ivory-100">
                          {log.performedByName} <span className="text-[10px] text-gray-400 uppercase font-mono">({log.performedByRole})</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-plum-900 dark:text-ivory-200">{log.targetUserName || 'System'}</div>
                          {log.targetUserUsn && <div className="text-[10px] font-mono text-gray-400">{log.targetUserUsn}</div>}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 text-[11px]">
                          {log.details ? JSON.stringify(log.details).replace(/[{"}]/g, ' ') : 'Action recorded'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE STUDENT / MEMBER ACCOUNT */}
      {/* ========================================================================= */}
      {createUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-ivory-200 dark:border-plum-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-gold-600" />
                <h3 className="text-base font-serif font-bold text-plum-950 dark:text-ivory-50">
                  Create Student or Member Account
                </h3>
              </div>
              <button onClick={() => setCreateUserModalOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {createdTempPassword ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-xs text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Account Successfully Created!</span>
                </div>
                <p className="text-xs">
                  Provide this temporary password to the student. They will use their USN and this password to log in.
                </p>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-plum-950 border border-emerald-500/40">
                  <span className="font-mono text-sm font-bold flex-1 text-plum-950 dark:text-ivory-50">
                    {createdTempPassword}
                  </span>
                  <button
                    onClick={() => copyToClipboard(createdTempPassword)}
                    className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => setCreateUserModalOpen(false)}
                  className="w-full py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                    Student Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    placeholder="e.g. Rohith Gowda"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                      USN <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newUserUsn}
                      onChange={e => setNewUserUsn(e.target.value.toUpperCase())}
                      placeholder="1KI23IS045"
                      className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                      Initial Application Role
                    </label>
                    <select
                      value={newUserRole}
                      onChange={e => setNewUserRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                    >
                      <optgroup label="Committee Positions (Non-Administrative)">
                        {COMMITTEE_ROLES.map(cr => (
                          <option key={cr.key} value={cr.key}>{cr.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="System Access Roles">
                        <option value="student">Student (Standard Member)</option>
                        <option value="media-poster">Media Poster (Gallery Access)</option>
                        <option value="technical">Technical Administrator</option>
                      </optgroup>
                      {roles.filter(r => !r.isSystem && !COMMITTEE_ROLES.some(c => c.key === r.key)).map(r => (
                        <option key={r.key} value={r.key}>{r.name} (Custom)</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                    Institutional Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    placeholder="student@kit-tiptur.ac.in"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                    Custom Temporary Password (Leave blank to auto-generate)
                  </label>
                  <input
                    type="text"
                    value={newUserTempPassword}
                    onChange={e => setNewUserTempPassword(e.target.value)}
                    placeholder="Leave blank for auto-generated temporary password"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setCreateUserModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-ivory-300 dark:border-plum-800 text-gray-600 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingUser}
                    className="px-4 py-2 rounded-xl font-semibold bg-gold-600 text-white hover:bg-gold-500 disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {savingUser && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Create & Generate Credentials</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CHANGE ROLE WITH CONFIRMATION */}
      {/* ========================================================================= */}
      {changeRoleModalOpen && selectedUserForRole && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-ivory-200 dark:border-plum-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-gold-600" />
                <h3 className="text-base font-serif font-bold text-plum-950 dark:text-ivory-50">
                  Adjust Account Role
                </h3>
              </div>
              <button onClick={() => setChangeRoleModalOpen(false)} className="p-1 rounded-lg text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-300">
              Modifying application privileges for <strong>{selectedUserForRole.name}</strong> ({selectedUserForRole.usn}).
            </p>

            <form onSubmit={handleChangeRoleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                  Target Application Role
                </label>
                <select
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50 font-semibold"
                >
                  <optgroup label="Committee Positions (Non-Administrative)">
                    {COMMITTEE_ROLES.map(cr => (
                      <option key={cr.key} value={cr.key}>{cr.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="System Access Roles">
                    <option value="student">student (Standard member)</option>
                    <option value="media-poster">media-poster (Gallery admin)</option>
                    <option value="technical">technical (Superuser admin)</option>
                  </optgroup>
                  {roles.filter(r => !r.isSystem && !COMMITTEE_ROLES.some(c => c.key === r.key)).map(r => (
                    <option key={r.key} value={r.key}>{r.name} (Custom)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                  Reason for Role Change (Audit Trail)
                </label>
                <input
                  type="text"
                  value={roleChangeReason}
                  onChange={e => setRoleChangeReason(e.target.value)}
                  placeholder="e.g. Appointed Cultural Media Lead"
                  className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setChangeRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-ivory-300 dark:border-plum-800 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingRole}
                  className="px-4 py-2 rounded-xl font-semibold bg-gold-600 text-white hover:bg-gold-500 disabled:opacity-50"
                >
                  {updatingRole ? 'Updating...' : 'Confirm Role Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: STATUS TOGGLE CONFIRMATION */}
      {/* ========================================================================= */}
      {statusModalOpen && selectedUserForStatus && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-red-600 font-bold text-base font-serif">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm {targetStatus === 'deactivated' ? 'Deactivation' : 'Activation'}</span>
            </div>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Are you sure you want to <strong>{targetStatus}</strong> the account of <strong>{selectedUserForStatus.name}</strong> ({selectedUserForStatus.usn})?
              {targetStatus === 'deactivated' && ' This will immediately invalidate their active sessions and prevent further login until reactivated.'}
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                Reason (Recorded in Audit Trail)
              </label>
              <input
                type="text"
                value={statusReason}
                onChange={e => setStatusReason(e.target.value)}
                placeholder="Reason for status adjustment"
                className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-ivory-300 dark:border-plum-800 text-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusSubmit}
                disabled={updatingStatus}
                className={`px-4 py-2 rounded-xl font-semibold text-white ${
                  targetStatus === 'deactivated' ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {updatingStatus ? 'Processing...' : `Confirm ${targetStatus === 'deactivated' ? 'Deactivate' : 'Activate'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PASSWORD RESET */}
      {/* ========================================================================= */}
      {resetModalOpen && selectedUserForReset && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-ivory-200 dark:border-plum-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-serif font-bold text-plum-950 dark:text-ivory-50">
                  Reset Account Password
                </h3>
              </div>
              <button onClick={() => setResetModalOpen(false)} className="p-1 rounded-lg text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetSuccessPassword ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-xs text-amber-800 dark:text-amber-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  <span>Password Reset Completed!</span>
                </div>
                <p className="text-xs">
                  A temporary password has been set for <strong>{selectedUserForReset.name}</strong>. Share it with the user securely:
                </p>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-plum-950 border border-amber-500/40">
                  <span className="font-mono text-sm font-bold flex-1 text-plum-950 dark:text-ivory-50">
                    {resetSuccessPassword}
                  </span>
                  <button
                    onClick={() => copyToClipboard(resetSuccessPassword)}
                    className="p-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-500"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => setResetModalOpen(false)}
                  className="w-full py-2 rounded-xl text-xs font-semibold bg-amber-600 text-white hover:bg-amber-500"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Resetting password for <strong>{selectedUserForReset.name}</strong> ({selectedUserForReset.usn}). Existing passwords are encrypted and cannot be viewed.
                </p>

                <div>
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                    Custom Temporary Password (Optional)
                  </label>
                  <input
                    type="text"
                    value={resetTempPassword}
                    onChange={e => setResetTempPassword(e.target.value)}
                    placeholder="Leave blank to auto-generate a secure password"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-ivory-300 dark:border-plum-800 text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resettingPassword}
                    className="px-4 py-2 rounded-xl font-semibold bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50"
                  >
                    {resettingPassword ? 'Resetting...' : 'Generate Temporary Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: CREATE / EDIT ROLE MODAL */}
      {/* ========================================================================= */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-ivory-200 dark:border-plum-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-gold-600" />
                <h3 className="text-base font-serif font-bold text-plum-950 dark:text-ivory-50">
                  {editingRoleId ? 'Edit Application Role' : 'Create Custom Application Role'}
                </h3>
              </div>
              <button onClick={() => setRoleModalOpen(false)} className="p-1 rounded-lg text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRoleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                    Role Display Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={roleName}
                    onChange={e => setRoleName(e.target.value)}
                    placeholder="e.g. Stage Coordinator"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                    Role Key Identifier <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingRoleId}
                    value={roleKey}
                    onChange={e => setRoleKey(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder="e.g. stage-coordinator"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50 font-mono disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={roleDescription}
                  onChange={e => setRoleDescription(e.target.value)}
                  placeholder="Detail the committee responsibilities and privileges granted by this role..."
                  className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                />
              </div>

              {/* Granular Permissions Checkboxes */}
              <div>
                <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-2">
                  Assign Granular System Permissions:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {permissions.map(perm => (
                    <label
                      key={perm.id}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl border border-ivory-200 dark:border-plum-800 hover:bg-ivory-50 dark:hover:bg-plum-950/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="mt-0.5 rounded text-gold-600 focus:ring-gold-500"
                      />
                      <div>
                        <div className="font-semibold text-plum-950 dark:text-ivory-100 text-[11px]">{perm.name}</div>
                        <div className="text-[10px] text-gray-500 leading-tight">{perm.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-ivory-200 dark:border-plum-800">
                <button
                  type="button"
                  onClick={() => setRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-ivory-300 dark:border-plum-800 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRole}
                  className="px-4 py-2 rounded-xl font-semibold bg-gold-600 text-white hover:bg-gold-500 disabled:opacity-50"
                >
                  {savingRole ? 'Saving...' : 'Save Application Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
