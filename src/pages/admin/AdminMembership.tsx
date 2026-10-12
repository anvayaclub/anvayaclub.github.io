import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Download,
  Trash2,
  Loader2,
  Check,
  X,
  Phone,
  Mail,
} from 'lucide-react';
import { api } from '../../services/api';
import { MembershipApplication } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminMembership: React.FC = () => {
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { success, error } = useToast();

  const [detailModalApp, setDetailModalApp] = useState<MembershipApplication | null>(null);
  const [internalNotes, setInternalNotes] = useState('');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.membership.getAdminAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined,
      });
      if (res.success) {
        setApplications(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to fetch membership applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, search]);

  const handleUpdateStatus = async (id: string, newStatus: string, notes?: string) => {
    try {
      const res = await api.membership.updateStatus(id, newStatus, notes);
      if (res.success) {
        success(res.message);
        if (detailModalApp && detailModalApp.id === id) {
          setDetailModalApp({ ...detailModalApp, status: newStatus as any, notes });
        }
        fetchApplications();
      }
    } catch (err: any) {
      error(err.message || 'Failed to update application status.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete application for ${name}?`)) return;

    try {
      const res = await api.membership.delete(id);
      if (res.success) {
        success(res.message);
        if (detailModalApp?.id === id) setDetailModalApp(null);
        fetchApplications();
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete application.');
    }
  };

  const exportCSV = () => {
    if (applications.length === 0) return;

    const headers = ['FullName', 'USN', 'Year', 'Branch', 'Email', 'Phone', 'Interests', 'Status', 'SubmittedAt'];
    const rows = applications.map(a => [
      `"${a.fullName}"`,
      `"${a.usn}"`,
      `"${a.academicYear}"`,
      `"${a.branch}"`,
      `"${a.email}"`,
      `"${a.phone}"`,
      `"${a.interests.join('; ')}"`,
      `"${a.status}"`,
      `"${a.submittedAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Anvaya-Membership-Applicants-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Exported applicant CSV successfully.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-plum-950 dark:text-ivory-50">
            Membership Applications Review
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Review student recruitment submissions, audition preferences, and candidate status.
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={applications.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-plum-800 border border-ivory-300 dark:border-plum-700 hover:border-gold-500 shadow-sm transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-gold-500" />
          <span>Export Applicants CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by candidate name, USN, email..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === tab
                  ? 'bg-gold-500 text-white shadow-sm'
                  : 'bg-ivory-100 dark:bg-plum-800 text-plum-800 dark:text-ivory-200 hover:bg-gold-500/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-400">Loading student applications...</p>
        </div>
      ) : applications.length > 0 ? (
        <div className="rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100 dark:bg-plum-950 text-gray-500 uppercase tracking-wider text-[10px] font-mono border-b border-ivory-200 dark:border-plum-800">
                <tr>
                  <th className="px-5 py-3">Applicant Name</th>
                  <th className="px-4 py-3">USN</th>
                  <th className="px-4 py-3">Year / Branch</th>
                  <th className="px-4 py-3">Cultural Interests</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200 dark:divide-plum-800">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-ivory-50 dark:hover:bg-plum-850/50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-plum-950 dark:text-ivory-50">
                      <div>{app.fullName}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{app.email}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-gold-600 dark:text-gold-400 font-bold">
                      {app.usn}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500">
                      {app.academicYear} · {app.branch}
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {app.interests.slice(0, 3).map((int, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-ivory-100 dark:bg-plum-800 text-[10px] text-plum-800 dark:text-ivory-200"
                          >
                            {int}
                          </span>
                        ))}
                        {app.interests.length > 3 && (
                          <span className="text-[10px] text-gray-400">+{app.interests.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        app.status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : app.status === 'rejected'
                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setDetailModalApp(app);
                          setInternalNotes(app.notes || '');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-gold-500/10 text-gold-700 dark:text-gold-300 font-semibold hover:bg-gold-500/20 text-xs"
                      >
                        Review
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
          <UserCheck className="w-8 h-8 text-gold-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-plum-950 dark:text-ivory-50">No applications found</p>
        </div>
      )}

      {/* Review Application Detail Modal */}
      {detailModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ivory-200 dark:border-plum-800 pb-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-plum-950 dark:text-ivory-50">
                  {detailModalApp.fullName}
                </h3>
                <div className="text-xs text-gold-600 dark:text-gold-400 font-mono">
                  USN: {detailModalApp.usn} · {detailModalApp.academicYear} ({detailModalApp.branch})
                </div>
              </div>
              <button onClick={() => setDetailModalApp(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gold-500" />
                  <a href={`mailto:${detailModalApp.email}`} className="hover:underline">{detailModalApp.email}</a>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gold-500" />
                  <a href={`tel:${detailModalApp.phone}`} className="hover:underline">{detailModalApp.phone}</a>
                </span>
              </div>

              <div>
                <div className="font-semibold text-plum-950 dark:text-ivory-50 mb-1">Cultural Interests:</div>
                <div className="flex flex-wrap gap-1.5">
                  {detailModalApp.interests.map((int, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-gold-500/10 text-gold-700 dark:text-gold-300 font-medium">
                      {int}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-semibold text-plum-950 dark:text-ivory-50 mb-1">Skills & Background:</div>
                <p className="p-3 rounded-xl bg-ivory-100 dark:bg-plum-950 text-plum-800 dark:text-ivory-200 leading-relaxed">
                  {detailModalApp.skills}
                </p>
              </div>

              <div>
                <div className="font-semibold text-plum-950 dark:text-ivory-50 mb-1">Motivation for Joining:</div>
                <p className="p-3 rounded-xl bg-ivory-100 dark:bg-plum-950 text-plum-800 dark:text-ivory-200 leading-relaxed">
                  {detailModalApp.motivation}
                </p>
              </div>

              {detailModalApp.preferredRole && (
                <div>
                  <div className="font-semibold text-plum-950 dark:text-ivory-50 mb-1">Preferred Wing:</div>
                  <div className="text-gray-600 dark:text-gray-300">{detailModalApp.preferredRole}</div>
                </div>
              )}

              {/* Internal Coordinator Notes */}
              <div>
                <div className="font-semibold text-plum-950 dark:text-ivory-50 mb-1">Internal Review Notes:</div>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={e => setInternalNotes(e.target.value)}
                  placeholder="Notes on audition performance, role allocation..."
                  className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                />
              </div>

              {/* Decision Actions */}
              <div className="pt-3 border-t border-ivory-200 dark:border-plum-800 flex items-center justify-between">
                <button
                  onClick={() => handleDelete(detailModalApp.id, detailModalApp.fullName)}
                  className="text-xs text-rose-500 hover:underline inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Record</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(detailModalApp.id, 'rejected', internalNotes)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(detailModalApp.id, 'approved', internalNotes)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 shadow"
                  >
                    Approve Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
