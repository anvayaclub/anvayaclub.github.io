import React, { useEffect, useState } from 'react';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Users,
  Upload,
  Download,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { api } from '../../services/api';
import { CertificateConfig, CertificateParticipant } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminCertificates: React.FC = () => {
  const [configs, setConfigs] = useState<CertificateConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  // Create/Edit Config Modal
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [certificateTitle, setCertificateTitle] = useState('Certificate of Participation');
  const [bodyTemplate, setBodyTemplate] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [sig1Name, setSig1Name] = useState('Dr. Principal');
  const [sig1Role, setSig1Role] = useState('Principal, KIT Tiptur');
  const [sig2Name, setSig2Name] = useState('Dr. HOD');
  const [sig2Role, setSig2Role] = useState('HOD, Dept of ISE');
  const [sig3Name, setSig3Name] = useState('Ankush S');
  const [sig3Role, setSig3Role] = useState('President, Anvaya');
  const [savingConfig, setSavingConfig] = useState(false);

  // Manage Participants Modal
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [activeConfig, setActiveConfig] = useState<CertificateConfig | null>(null);
  const [participants, setParticipants] = useState<CertificateParticipant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');

  // Import Modal
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [rawInput, setRawInput] = useState('');
  const [parsedPreview, setParsedPreview] = useState<{ fullName: string; usn: string }[]>([]);
  const [importing, setImporting] = useState(false);

  // Single Add Participant
  const [singleName, setSingleName] = useState('');
  const [singleUsn, setSingleUsn] = useState('');
  const [addingSingle, setAddingSingle] = useState(false);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await api.certificates.getAdminConfigs();
      if (res.success) {
        setConfigs(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to fetch certificate configurations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const openCreateConfig = () => {
    setEditingConfigId(null);
    setEventTitle('');
    setEventDate('November 2026');
    setCertificateTitle('Certificate of Participation');
    setBodyTemplate('has actively participated and demonstrated exceptional cultural spirit in the programme organized by Anvaya Cultural Committee, Department of Information Science & Engineering, Kalpataru Institute of Technology, Tiptur.');
    setIsEnabled(true);
    setConfigModalOpen(true);
  };

  const openEditConfig = (c: CertificateConfig) => {
    setEditingConfigId((c as any)._id || c.id);
    setEventTitle(c.eventTitle);
    setEventDate(c.eventDate);
    setCertificateTitle(c.certificateTitle);
    setBodyTemplate(c.bodyTemplate);
    setIsEnabled(c.isEnabled);
    if (c.signatories && c.signatories[0]) {
      setSig1Name(c.signatories[0].name);
      setSig1Role(c.signatories[0].role);
    }
    if (c.signatories && c.signatories[1]) {
      setSig2Name(c.signatories[1].name);
      setSig2Role(c.signatories[1].role);
    }
    if (c.signatories && c.signatories[2]) {
      setSig3Name(c.signatories[2].name);
      setSig3Role(c.signatories[2].role);
    }
    setConfigModalOpen(true);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDate) {
      error('Event title and date are required.');
      return;
    }

    setSavingConfig(true);
    try {
      const signatories = [
        { name: sig1Name, role: sig1Role },
        { name: sig2Name, role: sig2Role },
        { name: sig3Name, role: sig3Role },
      ].filter(s => s.name.trim() !== '');

      const payload = {
        eventTitle,
        eventDate,
        certificateTitle,
        bodyTemplate,
        isEnabled,
        signatories,
      };

      if (editingConfigId) {
        const res = await api.certificates.updateConfig(editingConfigId, payload);
        if (res.success) {
          success(res.message);
          setConfigModalOpen(false);
          fetchConfigs();
        }
      } else {
        const res = await api.certificates.createConfig(payload);
        if (res.success) {
          success(res.message);
          setConfigModalOpen(false);
          fetchConfigs();
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to save configuration.');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleDeleteConfig = async (cfg: CertificateConfig) => {
    const configId = (cfg as any)._id || cfg.id;
    if (!configId) {
      error('Invalid certificate configuration identifier.');
      return;
    }

    const hasRecords = (cfg.participantsCount && cfg.participantsCount > 0);
    const confirmMessage = hasRecords
      ? `WARNING: Certificate configuration "${cfg.eventTitle}" has ${cfg.participantsCount} participant record(s). Deleting it will permanently delete these certificates. Are you sure you want to proceed?`
      : `Are you sure you want to delete certificate configuration "${cfg.eventTitle}"?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const res = await api.certificates.deleteConfig(configId, !!hasRecords);
      if (res.success) {
        success(res.message);
        setConfigs(prev => prev.filter(c => ((c as any)._id !== configId && c.id !== configId)));
        fetchConfigs();
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete configuration.');
    }
  };

  const openParticipants = async (c: CertificateConfig) => {
    const configId = (c as any)._id || c.id;
    setActiveConfig(c);
    setParticipantsModalOpen(true);
    setParticipantSearch('');
    fetchParticipants(configId);
  };

  const fetchParticipants = async (configId: string, search?: string) => {
    setLoadingParticipants(true);
    try {
      const res = await api.certificates.getParticipants(configId, search);
      if (res.success) {
        setParticipants(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to fetch participants.');
    } finally {
      setLoadingParticipants(false);
    }
  };

  // Parse raw pasted lines or CSV into array
  const handleParseInput = (text: string) => {
    setRawInput(text);
    const lines = text.split('\n');
    const records: { fullName: string; usn: string }[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      // Split by comma or tab or semicolon
      const parts = trimmed.split(/[,;\t]/);
      if (parts.length >= 2) {
        const fullName = parts[0].trim();
        const usn = parts[1].trim().toUpperCase();
        if (fullName && usn) {
          records.push({ fullName, usn });
        }
      }
    });

    setParsedPreview(records);
  };

  const handleCommitImport = async () => {
    if (!activeConfig || parsedPreview.length === 0) return;

    setImporting(true);
    try {
      const res = await api.certificates.importParticipants(activeConfig.id, parsedPreview);
      if (res.success) {
        success(res.message);
        setImportModalOpen(false);
        setRawInput('');
        setParsedPreview([]);
        fetchParticipants(activeConfig.id);
        fetchConfigs();
      }
    } catch (err: any) {
      error(err.message || 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  const handleAddSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConfig || !singleName || !singleUsn) return;

    setAddingSingle(true);
    try {
      const res = await api.certificates.addParticipant(activeConfig.id, {
        fullName: singleName.trim(),
        usn: singleUsn.trim().toUpperCase(),
      });
      if (res.success) {
        success(res.message);
        setSingleName('');
        setSingleUsn('');
        fetchParticipants(activeConfig.id);
        fetchConfigs();
      }
    } catch (err: any) {
      error(err.message || 'Failed to add participant.');
    } finally {
      setAddingSingle(false);
    }
  };

  const handleToggleRevoke = async (participantId: string, currentStatus: boolean) => {
    const reason = !currentStatus ? prompt('Enter reason for certificate revocation (optional):') || 'Administrative review' : undefined;

    try {
      const res = await api.certificates.toggleRevoke(participantId, {
        isRevoked: !currentStatus,
        revocationReason: reason,
      });
      if (res.success) {
        success(res.message);
        if (activeConfig) fetchParticipants(activeConfig.id);
      }
    } catch (err: any) {
      error(err.message || 'Revocation update failed.');
    }
  };

  const handleDeleteParticipant = async (participantId: string) => {
    if (!window.confirm('Remove this participant record?')) return;

    try {
      const res = await api.certificates.deleteParticipant(participantId);
      if (res.success) {
        success(res.message);
        if (activeConfig) {
          fetchParticipants(activeConfig.id);
          fetchConfigs();
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete participant.');
    }
  };

  const handleExportBackup = async (configId: string, evTitle: string) => {
    try {
      const res = await api.certificates.exportBackup(configId);
      if (res.success) {
        const jsonStr = JSON.stringify(res.backup, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Anvaya-CertBackup-${evTitle.replace(/\s+/g, '-')}.json`;
        a.click();
        success('JSON backup exported successfully.');
      }
    } catch (err: any) {
      error(err.message || 'Backup export failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-plum-950 dark:text-ivory-50">
            Certificate Events & Participant Issuance
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Configure certificate templates, signatories, batch import participant lists, and manage revocations.
          </p>
        </div>

        <button
          onClick={openCreateConfig}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gold-600 hover:bg-gold-500 shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Certificate Configuration</span>
        </button>
      </div>

      {/* Configs Table */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-400">Loading certificate configurations...</p>
        </div>
      ) : configs.length > 0 ? (
        <div className="rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100 dark:bg-plum-950 text-gray-500 uppercase tracking-wider text-[10px] font-mono border-b border-ivory-200 dark:border-plum-800">
                <tr>
                  <th className="px-5 py-3">Event Title</th>
                  <th className="px-4 py-3">Event Date</th>
                  <th className="px-4 py-3">Certificate Title</th>
                  <th className="px-4 py-3">Issuance</th>
                  <th className="px-4 py-3">Participants</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200 dark:divide-plum-800">
                {configs.map(cfg => (
                  <tr key={cfg.id} className="hover:bg-ivory-50 dark:hover:bg-plum-850/50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-plum-950 dark:text-ivory-50 max-w-xs truncate">
                      {cfg.eventTitle}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400">
                      {cfg.eventDate}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400">
                      {cfg.certificateTitle}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        cfg.isEnabled ? 'bg-emerald-500/15 text-emerald-700' : 'bg-rose-500/15 text-rose-700'
                      }`}>
                        {cfg.isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => openParticipants(cfg)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gold-500/10 hover:bg-gold-500/20 text-gold-700 dark:text-gold-300 font-mono text-[11px] font-bold"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{cfg.participantsCount || 0} Records</span>
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleExportBackup((cfg as any)._id || cfg.id, cfg.eventTitle)}
                        className="p-1.5 rounded-lg hover:bg-ivory-200 text-gray-500"
                        title="Export JSON Backup"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditConfig(cfg)}
                        className="p-1.5 rounded-lg hover:bg-gold-500/10 text-gold-600 dark:text-gold-400"
                        title="Edit template & signatories"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteConfig(cfg)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500"
                        title="Delete configuration"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800">
          <Award className="w-8 h-8 text-gold-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-plum-950 dark:text-ivory-50">No Certificate Configurations</p>
          <button onClick={openCreateConfig} className="mt-3 text-xs font-semibold text-gold-600 hover:underline">
            + Create First Certificate Event
          </button>
        </div>
      )}

      {/* Config Create/Edit Modal */}
      {configModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ivory-200 dark:border-plum-800 pb-3">
              <h3 className="text-base font-serif font-bold text-plum-950 dark:text-ivory-50">
                {editingConfigId ? 'Edit Certificate Template' : 'New Certificate Event'}
              </h3>
              <button onClick={() => setConfigModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventTitle}
                    onChange={e => setEventTitle(e.target.value)}
                    placeholder="e.g. Varnotsava Fine Arts Fest"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    placeholder="e.g. 28 September 2026"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                  Certificate Heading Title
                </label>
                <input
                  type="text"
                  required
                  value={certificateTitle}
                  onChange={e => setCertificateTitle(e.target.value)}
                  placeholder="Certificate of Participation / Merit"
                  className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                  Certificate Body Text Template
                </label>
                <textarea
                  rows={3}
                  required
                  value={bodyTemplate}
                  onChange={e => setBodyTemplate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50 leading-relaxed"
                />
              </div>

              {/* Signatories Configuration */}
              <div className="space-y-2 pt-2 border-t border-ivory-200 dark:border-plum-800">
                <div className="text-[11px] font-semibold text-gray-400">Authorized Signatories (Up to 3)</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={sig1Name}
                    onChange={e => setSig1Name(e.target.value)}
                    placeholder="Signatory 1 Name"
                    className="px-3 py-1.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                  />
                  <input
                    type="text"
                    value={sig1Role}
                    onChange={e => setSig1Role(e.target.value)}
                    placeholder="Signatory 1 Role"
                    className="px-3 py-1.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={sig2Name}
                    onChange={e => setSig2Name(e.target.value)}
                    placeholder="Signatory 2 Name"
                    className="px-3 py-1.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                  />
                  <input
                    type="text"
                    value={sig2Role}
                    onChange={e => setSig2Role(e.target.value)}
                    placeholder="Signatory 2 Role"
                    className="px-3 py-1.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={sig3Name}
                    onChange={e => setSig3Name(e.target.value)}
                    placeholder="Signatory 3 Name"
                    className="px-3 py-1.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                  />
                  <input
                    type="text"
                    value={sig3Role}
                    onChange={e => setSig3Role(e.target.value)}
                    placeholder="Signatory 3 Role"
                    className="px-3 py-1.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isEnabled"
                  checked={isEnabled}
                  onChange={e => setIsEnabled(e.target.checked)}
                  className="rounded text-gold-500 focus:ring-gold-500"
                />
                <label htmlFor="isEnabled" className="text-xs text-plum-900 dark:text-ivory-200">
                  Allow students to verify and generate certificates for this event
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-ivory-200 dark:border-plum-800">
                <button
                  type="button"
                  onClick={() => setConfigModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-5 py-2 rounded-xl bg-gold-600 text-white font-semibold shadow hover:bg-gold-500 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {savingConfig && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participants Management Modal */}
      {participantsModalOpen && activeConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-4xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ivory-200 dark:border-plum-800 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-plum-950 dark:text-ivory-50">
                  Participant Records & Certificate Numbers
                </h3>
                <div className="text-xs text-gold-600 dark:text-gold-400 font-medium">
                  {activeConfig.eventTitle} ({activeConfig.eventDate})
                </div>
              </div>
              <button onClick={() => setParticipantsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={participantSearch}
                  onChange={e => {
                    setParticipantSearch(e.target.value);
                    fetchParticipants(activeConfig.id, e.target.value);
                  }}
                  placeholder="Search participants by name, USN, certificate ID..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setImportModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gold-600 text-white hover:bg-gold-500 shadow"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Batch Import (CSV / Text)</span>
                </button>
              </div>
            </div>

            {/* Single Add Form */}
            <form onSubmit={handleAddSingle} className="p-3 rounded-xl bg-ivory-100 dark:bg-plum-950 border border-ivory-200 dark:border-plum-800 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-gray-500 text-[11px]">Add Single:</span>
              <input
                type="text"
                required
                value={singleName}
                onChange={e => setSingleName(e.target.value)}
                placeholder="Full Name (e.g. Sahana K)"
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-plum-900 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50 flex-1 min-w-[140px]"
              />
              <input
                type="text"
                required
                value={singleUsn}
                onChange={e => setSingleUsn(e.target.value.toUpperCase())}
                placeholder="USN (e.g. 1KI23IS045)"
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-plum-900 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50 uppercase font-mono w-32"
              />
              <button
                type="submit"
                disabled={addingSingle}
                className="px-3 py-1.5 rounded-lg bg-plum-950 text-white dark:bg-ivory-100 dark:text-plum-950 font-semibold disabled:opacity-50"
              >
                {addingSingle ? 'Adding...' : '+ Add'}
              </button>
            </form>

            {/* Participants Table */}
            {loadingParticipants ? (
              <div className="py-12 text-center text-xs text-gray-400">Loading participant records...</div>
            ) : participants.length > 0 ? (
              <div className="overflow-x-auto max-h-[50vh]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ivory-100 dark:bg-plum-950 text-gray-400 text-[10px] uppercase font-mono sticky top-0">
                    <tr>
                      <th className="p-2.5">Participant Name</th>
                      <th className="p-2.5">USN</th>
                      <th className="p-2.5">Certificate Number</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory-200 dark:divide-plum-800">
                    {participants.map(p => (
                      <tr key={p.id} className="hover:bg-ivory-50 dark:hover:bg-plum-850">
                        <td className="p-2.5 font-semibold text-plum-950 dark:text-ivory-50">{p.fullName}</td>
                        <td className="p-2.5 font-mono text-gold-600 dark:text-gold-400 font-bold">{p.usn}</td>
                        <td className="p-2.5 font-mono text-gray-500 text-[11px]">{p.certificateNumber}</td>
                        <td className="p-2.5">
                          {p.isRevoked ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/15 text-rose-600 font-semibold">
                              Revoked
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-600 font-semibold">
                              Valid
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-right space-x-1.5">
                          <button
                            onClick={() => handleToggleRevoke(p.id, p.isRevoked)}
                            className={`p-1 rounded-lg text-xs font-semibold ${
                              p.isRevoked ? 'text-emerald-600 hover:bg-emerald-500/10' : 'text-amber-600 hover:bg-amber-500/10'
                            }`}
                            title={p.isRevoked ? 'Re-enable certificate' : 'Revoke certificate'}
                          >
                            {p.isRevoked ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteParticipant(p.id)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-gray-400">
                No participants uploaded yet for this event. Use "Batch Import" above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Batch Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ivory-200 dark:border-plum-800 pb-3">
              <h3 className="text-base font-serif font-bold text-plum-950 dark:text-ivory-50">
                Batch Import Participant Records
              </h3>
              <button onClick={() => setImportModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>Paste participant lines in <code>Name, USN</code> format or CSV lines:</p>
              <pre className="p-2.5 rounded-lg bg-ivory-100 dark:bg-plum-950 text-[11px] font-mono text-plum-900 dark:text-ivory-200">
{`Adithya K S, 1KI22IS001
Bhavana M, 1KI22IS015
Chetan Kumar, 1KI23IS024`}
              </pre>
            </div>

            <textarea
              rows={6}
              value={rawInput}
              onChange={e => handleParseInput(e.target.value)}
              placeholder="Paste participant records here..."
              className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-xs font-mono leading-relaxed"
            />

            {/* Preview of Parsed Rows */}
            {parsedPreview.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-gold-600 dark:text-gold-400">
                  <span>Preview Before Commit:</span>
                  <span>{parsedPreview.length} valid rows detected</span>
                </div>
                <div className="max-h-36 overflow-y-auto rounded-xl border border-ivory-200 dark:border-plum-800 divide-y divide-ivory-200 dark:divide-plum-800 text-xs">
                  {parsedPreview.slice(0, 10).map((row, idx) => (
                    <div key={idx} className="p-2 flex items-center justify-between">
                      <span className="font-semibold text-plum-950 dark:text-ivory-50">{row.fullName}</span>
                      <span className="font-mono text-gray-500">{row.usn}</span>
                    </div>
                  ))}
                  {parsedPreview.length > 10 && (
                    <div className="p-2 text-center text-[10px] text-gray-400">
                      ...and {parsedPreview.length - 10} more rows
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-3 border-t border-ivory-200 dark:border-plum-800 text-xs">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={importing || parsedPreview.length === 0}
                onClick={handleCommitImport}
                className="px-5 py-2 rounded-xl bg-gold-600 text-white font-semibold shadow hover:bg-gold-500 disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {importing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{importing ? 'Importing Records...' : `Commit ${parsedPreview.length} Participants`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
