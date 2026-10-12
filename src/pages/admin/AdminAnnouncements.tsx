import React, { useEffect, useState } from 'react';
import { Bell, Plus, Edit2, Trash2, Loader2, X } from 'lucide-react';
import { api } from '../../services/api';
import { AnnouncementItem } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.communication.getAdminAnnouncements();
      if (res.success) setAnnouncements(res.data);
    } catch (err: any) {
      error(err.message || 'Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setTitle('');
    setSummary('');
    setContent('');
    setImageUrl('');
    setModalOpen(true);
  };

  const openEdit = (a: AnnouncementItem) => {
    setEditingId(a.id);
    setTitle(a.title);
    setSummary(a.summary);
    setContent(a.content);
    setImageUrl(a.imageUrl || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary || !content) {
      error('Title, summary, and content are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = { title, summary, content, imageUrl };
      if (editingId) {
        const res = await api.communication.updateAnnouncement(editingId, payload);
        if (res.success) {
          success(res.message);
          setModalOpen(false);
          fetchAnnouncements();
        }
      } else {
        const res = await api.communication.createAnnouncement(payload);
        if (res.success) {
          success(res.message);
          setModalOpen(false);
          fetchAnnouncements();
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to save announcement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const res = await api.communication.deleteAnnouncement(id);
      if (res.success) {
        success(res.message);
        fetchAnnouncements();
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete announcement.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-plum-950 dark:text-ivory-50">
            Announcements & Bulletins
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Publish cultural news, audition alerts, and fest updates.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gold-600 hover:bg-gold-500 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading announcements...</div>
      ) : announcements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map(a => (
            <div
              key={a.id}
              className="p-5 rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-sm space-y-3 text-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-serif font-bold text-sm text-plum-950 dark:text-ivory-50">
                  {a.title}
                </h3>
                <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap">
                  {new Date(a.publishDate).toLocaleDateString()}
                </span>
              </div>
              <p className="text-plum-700 dark:text-ivory-300 leading-relaxed line-clamp-2">
                {a.summary}
              </p>
              <div className="pt-2 border-t border-ivory-200 dark:border-plum-800 flex justify-end gap-2">
                <button onClick={() => openEdit(a)} className="p-1 text-gold-600 hover:bg-gold-500/10 rounded">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(a.id)} className="p-1 text-rose-500 hover:bg-rose-500/10 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-gray-400 rounded-2xl border border-ivory-200 dark:border-plum-800">
          No announcements published yet.
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-ivory-200 dark:border-plum-800">
              <h3 className="font-serif font-bold text-sm text-plum-950 dark:text-ivory-50">
                {editingId ? 'Edit Announcement' : 'New Announcement'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Headline *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Swaralaya Vocal Fest Registrations Live"
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-800 bg-ivory-50 dark:bg-plum-950 text-plum-950 dark:text-ivory-50"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Brief Summary *</label>
                <input
                  type="text"
                  required
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="One sentence overview..."
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-800 bg-ivory-50 dark:bg-plum-950 text-plum-950 dark:text-ivory-50"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Full Content *</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-800 bg-ivory-50 dark:bg-plum-950 text-plum-950 dark:text-ivory-50 leading-relaxed"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1.5 rounded-lg border">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-1.5 rounded-lg bg-gold-600 text-white font-semibold">
                  {saving ? 'Saving...' : 'Save Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
