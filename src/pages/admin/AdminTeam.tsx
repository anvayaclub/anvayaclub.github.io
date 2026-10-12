import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Upload,
  CheckCircle2,
  Loader2,
  X,
  ArrowUpDown,
  Mail,
  Phone,
  Link as LinkIcon,
  Search,
  ShieldCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { api } from '../../services/api';
import { TeamMember, RoleItem } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminTeam: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [usn, setUsn] = useState('');
  const [role, setRole] = useState(''); // Public title
  const [appRole, setAppRole] = useState('student'); // Access role
  const [department, setDepartment] = useState('ISE');
  const [academicYear, setAcademicYear] = useState('Final Year');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [order, setOrder] = useState('1');
  const [isActive, setIsActive] = useState(true);
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [instagram, setInstagram] = useState('');

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // USN Search / Validation state
  const [matchedAccount, setMatchedAccount] = useState<any | null>(null);
  const [searchingStudent, setSearchingStudent] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teamRes, rolesRes] = await Promise.all([
        api.team.getAdminAll(),
        api.roles.getAll(),
      ]);
      if (teamRes.success) setMembers(teamRes.data);
      if (rolesRes.success) setRoles(rolesRes.data);
    } catch (err: any) {
      error(err.message || 'Failed to fetch team data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setUsn('');
    setRole('');
    setAppRole('student');
    setDepartment('ISE');
    setAcademicYear('Final Year');
    setBio('');
    setPhotoUrl('');
    setContactEmail('');
    setContactPhone('');
    setOrder(String(members.length + 1));
    setIsActive(true);
    setLinkedin('');
    setGithub('');
    setInstagram('');
    setMatchedAccount(null);
    setModalOpen(true);
  };

  const openEdit = (m: TeamMember) => {
    setEditingId(m.id || m._id || null);
    setName(m.name);
    setUsn(m.usn || '');
    setRole(m.role);
    setAppRole(m.appRole || 'student');
    setDepartment(m.department || 'ISE');
    setAcademicYear(m.academicYear);
    setBio(m.bio || '');
    setPhotoUrl(m.photoUrl || '');
    setContactEmail(m.contactEmail || m.socialLinks?.email || '');
    setContactPhone(m.contactPhone || '');
    setOrder(String(m.order || 1));
    setIsActive(m.isActive);
    setLinkedin(m.socialLinks?.linkedin || '');
    setGithub(m.socialLinks?.github || '');
    setInstagram(m.socialLinks?.instagram || '');
    setMatchedAccount(m.accountLinkStatus === 'linked' ? { linked: true } : null);
    setModalOpen(true);
  };

  const checkUsnAccount = async (targetUsn: string) => {
    if (!targetUsn || targetUsn.length < 5) {
      setMatchedAccount(null);
      return;
    }
    setSearchingStudent(true);
    try {
      const res = await api.auth.getStudents(targetUsn);
      if (res.success && res.data.length > 0) {
        const found = res.data.find(s => s.usn?.toUpperCase() === targetUsn.toUpperCase());
        setMatchedAccount(found || null);
      } else {
        setMatchedAccount(null);
      }
    } catch {
      setMatchedAccount(null);
    } finally {
      setSearchingStudent(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.fileUrl) {
        setPhotoUrl(res.fileUrl);
        success('Photograph uploaded successfully!');
      }
    } catch (err: any) {
      error(err.message || 'Photo upload failed.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) {
      error('Full Name and Committee Role are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        usn: usn.trim().toUpperCase(),
        role,
        appRole,
        department,
        academicYear,
        bio,
        photoUrl,
        contactEmail,
        contactPhone,
        socialLinks: {
          linkedin: linkedin.trim(),
          github: github.trim(),
          instagram: instagram.trim(),
          email: contactEmail.trim(),
        },
        order: Number(order) || 1,
        isActive,
      };

      if (editingId) {
        const res = await api.team.update(editingId, payload);
        if (res.success) {
          success(res.message);
          setModalOpen(false);
          fetchData();
        }
      } else {
        const res = await api.team.create(payload);
        if (res.success) {
          success(res.message);
          setModalOpen(false);
          fetchData();
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to save member.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, memberName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${memberName}" from the committee?`)) {
      return;
    }

    try {
      const res = await api.team.delete(id);
      if (res.success) {
        success(res.message);
        fetchData();
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete member.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ivory-200 dark:border-plum-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gold-500" />
            <h1 className="text-2xl font-serif font-bold text-plum-950 dark:text-ivory-50">
              Cultural Committee & Leadership Directory
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage public committee designations, link student accounts by USN, and assign administrative application roles.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gold-600 hover:bg-gold-500 shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Committee Member</span>
        </button>
      </div>

      {/* Team Table */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-400">Loading committee directory...</p>
        </div>
      ) : members.length > 0 ? (
        <div className="rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100 dark:bg-plum-950 text-gray-500 uppercase tracking-wider text-[10px] font-mono border-b border-ivory-200 dark:border-plum-800">
                <tr>
                  <th className="px-5 py-3">Member</th>
                  <th className="px-4 py-3">Public Designation</th>
                  <th className="px-4 py-3">Assigned App Role</th>
                  <th className="px-4 py-3">Account Status</th>
                  <th className="px-4 py-3 text-center">Display Order</th>
                  <th className="px-4 py-3 text-center">Active</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200 dark:divide-plum-800">
                {members.map(m => {
                  const memberId = m.id || m._id || '';
                  const initials = m.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                  return (
                    <tr key={memberId} className="hover:bg-ivory-50 dark:hover:bg-plum-850/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {m.photoUrl ? (
                            <img src={m.photoUrl} alt={m.name} className="w-10 h-10 rounded-full object-cover border border-gold-500/30" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gold-500/20 text-gold-700 dark:text-gold-400 font-bold flex items-center justify-center text-xs">
                              {initials}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-plum-950 dark:text-ivory-50">{m.name}</div>
                            <div className="text-[11px] text-gray-500 font-mono">
                              {m.usn ? m.usn : 'No USN linked'} · {m.academicYear}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 font-medium text-plum-800 dark:text-ivory-200">
                        {m.role}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono text-[10px] font-semibold bg-ivory-200 dark:bg-plum-800 text-gold-700 dark:text-gold-400">
                          <ShieldCheck className="w-3 h-3 text-gold-500" />
                          {m.appRole || 'student'}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {m.accountLinkStatus === 'linked' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Linked Account</span>
                          </span>
                        ) : m.accountLinkStatus === 'pending' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending Reg</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">Unlinked</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-center font-mono">{m.order}</td>

                      <td className="px-4 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${m.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-500/10 text-gray-400'}`}>
                          {m.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(m)}
                            className="p-1.5 rounded-lg text-plum-700 dark:text-ivory-200 hover:bg-ivory-200 dark:hover:bg-plum-800 transition-colors"
                            title="Edit Member"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(memberId, m.name)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-16 text-center rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800">
          <Users className="w-8 h-8 text-gold-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-plum-950 dark:text-ivory-50">No committee members found</p>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-plum-900 rounded-3xl border border-ivory-300 dark:border-plum-800 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-ivory-200 dark:border-plum-800 flex items-center justify-between bg-ivory-50/60 dark:bg-plum-950/40">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gold-500" />
                <h3 className="text-lg font-serif font-bold text-plum-950 dark:text-ivory-50">
                  {editingId ? 'Edit Committee Member' : 'Add Committee Member'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full hover:bg-ivory-200 dark:hover:bg-plum-800 text-plum-600 dark:text-ivory-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Ankush S"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-sm focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Student USN (for Account Association)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={usn}
                      onChange={e => {
                        const val = e.target.value.toUpperCase();
                        setUsn(val);
                        checkUsnAccount(val);
                      }}
                      placeholder="e.g. 1KT21IS005"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-sm font-mono uppercase focus:outline-none"
                    />
                    {searchingStudent && (
                      <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-gold-500" />
                    )}
                  </div>
                  {matchedAccount ? (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Account registered: {matchedAccount.name || 'Found'}
                    </p>
                  ) : usn.length > 5 ? (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pending registration (role will auto-link upon signup)
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Public Committee Designation *
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    placeholder="e.g. President / Media Lead / Cultural Secretary"
                    className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Application Access Role (Permissions) *
                  </label>
                  <select
                    value={appRole}
                    onChange={e => setAppRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs font-mono focus:outline-none"
                  >
                    <option value="student">student (Standard member)</option>
                    <option value="media-poster">media-poster (Gallery coordinator)</option>
                    <option value="technical">technical (Full administrator)</option>
                    {roles
                      .filter(r => !['technical', 'media-poster', 'student'].includes(r.key))
                      .map(r => (
                        <option key={r.key} value={r.key}>
                          {r.key} ({r.name})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="ISE"
                    className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Semester / Year
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={e => setAcademicYear(e.target.value)}
                    placeholder="Final Year / 7th Sem"
                    className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Display Priority Order
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={e => setOrder(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo Upload with Initials Fallback */}
              <div>
                <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                  Profile Photograph / Selfie
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-gold-500/30 bg-gold-500/10 flex items-center justify-center shrink-0">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-gold-600 text-xs">
                        {name ? name.slice(0, 2).toUpperCase() : 'KIT'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={photoUrl}
                      onChange={e => setPhotoUrl(e.target.value)}
                      placeholder="Photo URL or upload below"
                      className="w-full px-3 py-1.5 rounded-lg border border-ivory-300 dark:border-plum-700 text-xs bg-white dark:bg-plum-950/60"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/10 border border-gold-500/30 text-gold-600 dark:text-gold-400 text-xs font-semibold hover:bg-gold-500/20 transition-colors">
                      {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>Upload Photograph</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                  Biography or Role Focus
                </label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={2}
                  placeholder="Summary of responsibilities and cultural contributions..."
                  className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder="student@kit-tiptur.ac.in"
                    className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Phone Number (internal)
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="9845012345"
                    className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={linkedin}
                  onChange={e => setLinkedin(e.target.value)}
                  placeholder="LinkedIn URL"
                  className="px-3 py-1.5 rounded-lg border border-ivory-300 dark:border-plum-700 text-xs"
                />
                <input
                  type="text"
                  value={github}
                  onChange={e => setGithub(e.target.value)}
                  placeholder="GitHub URL"
                  className="px-3 py-1.5 rounded-lg border border-ivory-300 dark:border-plum-700 text-xs"
                />
                <input
                  type="text"
                  value={instagram}
                  onChange={e => setInstagram(e.target.value)}
                  placeholder="Instagram URL"
                  className="px-3 py-1.5 rounded-lg border border-ivory-300 dark:border-plum-700 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveMember"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="rounded text-gold-600 focus:ring-gold-500"
                />
                <label htmlFor="isActiveMember" className="text-xs text-plum-800 dark:text-ivory-200">
                  Visible in public Team directory
                </label>
              </div>

              <div className="pt-4 border-t border-ivory-200 dark:border-plum-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-plum-700 dark:text-ivory-300 hover:bg-ivory-200 dark:hover:bg-plum-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-gold-600 hover:bg-gold-500 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Member Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
