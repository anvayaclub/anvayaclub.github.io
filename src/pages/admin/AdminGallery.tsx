import React, { useEffect, useState } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  Video,
  Loader2,
  X,
  FolderPlus,
  FolderOpen,
} from 'lucide-react';
import { api } from '../../services/api';
import { GalleryAlbum, GalleryMediaItem } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminGallery: React.FC = () => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [mediaList, setMediaList] = useState<GalleryMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  // Album Modal
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDesc, setAlbumDesc] = useState('');
  const [albumYear, setAlbumYear] = useState('2026');
  const [savingAlbum, setSavingAlbum] = useState(false);

  // Media Modal
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaAlbumId, setMediaAlbumId] = useState('');
  const [contributor, setContributor] = useState('Anvaya Media Team');
  const [altText, setAltText] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [savingMedia, setSavingMedia] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [albRes, medRes] = await Promise.all([
        api.gallery.getAdminAlbums(),
        api.gallery.getAdminMedia(),
      ]);
      if (albRes.success) {
        setAlbums(albRes.data);
        if (albRes.data.length > 0) setMediaAlbumId(albRes.data[0].id || albRes.data[0]._id);
      }
      if (medRes.success) setMediaList(medRes.data);
    } catch (err: any) {
      error(err.message || 'Failed to fetch gallery.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumTitle) return;

    setSavingAlbum(true);
    try {
      const res = await api.gallery.createAlbum({
        title: albumTitle,
        description: albumDesc,
        year: albumYear,
      });
      if (res.success) {
        success(res.message);
        setAlbumModalOpen(false);
        setAlbumTitle('');
        setAlbumDesc('');
        fetchData();
      }
    } catch (err: any) {
      error(err.message || 'Failed to create album.');
    } finally {
      setSavingAlbum(false);
    }
  };

  const handleDeleteAlbum = async (id: string, title: string) => {
    if (!window.confirm(`Delete album "${title}" and all its photos?`)) return;

    try {
      const res = await api.gallery.deleteAlbum(id);
      if (res.success) {
        success(res.message);
        fetchData();
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete album.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const res = await api.upload(file);
      if (res.success && res.fileUrl) {
        setMediaUrl(res.fileUrl);
        success('File uploaded successfully!');
      }
    } catch (err: any) {
      error(err.message || 'File upload failed.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCreateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaTitle || !mediaUrl || !mediaAlbumId) {
      error('Title, media URL/file, and album are required.');
      return;
    }

    setSavingMedia(true);
    try {
      const res = await api.gallery.createMedia({
        albumId: mediaAlbumId,
        title: mediaTitle,
        type: mediaType,
        url: mediaUrl,
        contributor,
        altText: altText || mediaTitle,
      });
      if (res.success) {
        success(res.message);
        setMediaModalOpen(false);
        setMediaTitle('');
        setMediaUrl('');
        setAltText('');
        fetchData();
      }
    } catch (err: any) {
      error(err.message || 'Failed to add media item.');
    } finally {
      setSavingMedia(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!window.confirm('Delete this media item?')) return;

    try {
      const res = await api.gallery.deleteMedia(id);
      if (res.success) {
        success(res.message);
        fetchData();
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete media item.');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-plum-950 dark:text-ivory-50">
            Gallery & Media Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Organize programme albums and upload high-resolution photos and video highlights.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAlbumModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-plum-800 border border-ivory-300 dark:border-plum-700 hover:border-gold-500 shadow-sm"
          >
            <FolderPlus className="w-4 h-4 text-gold-500" />
            <span>New Album</span>
          </button>
          <button
            onClick={() => setMediaModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gold-600 hover:bg-gold-500 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Photo / Video</span>
          </button>
        </div>
      </div>

      {/* 1. Albums Strip */}
      <div className="space-y-3">
        <h2 className="text-sm font-serif font-bold text-gray-500 uppercase tracking-wider">
          Active Albums
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {albums.map(alb => (
            <div
              key={alb.id}
              className="p-4 rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-sm space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <FolderOpen className="w-4 h-4 text-gold-500" />
                  <span>{alb.year}</span>
                </div>
                <h3 className="text-sm font-serif font-bold text-plum-950 dark:text-ivory-50 mt-1 line-clamp-1">
                  {alb.title}
                </h3>
                {alb.description && (
                  <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{alb.description}</p>
                )}
              </div>
              <div className="pt-2 border-t border-ivory-200 dark:border-plum-800 flex justify-end">
                <button
                  onClick={() => handleDeleteAlbum(alb.id, alb.title)}
                  className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg text-xs"
                  title="Delete album"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Media Grid */}
      <div className="space-y-3 pt-4 border-t border-ivory-200 dark:border-plum-800">
        <h2 className="text-sm font-serif font-bold text-gray-500 uppercase tracking-wider">
          Uploaded Media ({mediaList.length})
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading gallery items...</div>
        ) : mediaList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mediaList.map(item => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 aspect-square shadow-sm"
              >
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between text-white text-xs">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDeleteMedia(item.id)}
                      className="p-1 rounded-lg bg-rose-500 text-white hover:bg-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <div className="font-semibold line-clamp-1">{item.title}</div>
                    <div className="text-[10px] text-gray-300 uppercase">{item.type}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-400 rounded-2xl border border-ivory-200 dark:border-plum-800">
            No media uploaded yet.
          </div>
        )}
      </div>

      {/* Create Album Modal */}
      {albumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-ivory-200 dark:border-plum-800">
              <h3 className="font-serif font-bold text-sm text-plum-950 dark:text-ivory-50">Create Album</h3>
              <button onClick={() => setAlbumModalOpen(false)} className="p-1 text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateAlbum} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Album Title *</label>
                <input
                  type="text"
                  required
                  value={albumTitle}
                  onChange={e => setAlbumTitle(e.target.value)}
                  placeholder="e.g. Swaralaya 2026 Gala"
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-800 bg-ivory-50 dark:bg-plum-950"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Year</label>
                <input
                  type="text"
                  value={albumYear}
                  onChange={e => setAlbumYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-800 bg-ivory-50 dark:bg-plum-950"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={albumDesc}
                  onChange={e => setAlbumDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-800 bg-ivory-50 dark:bg-plum-950"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setAlbumModalOpen(false)} className="px-3 py-1.5 rounded-lg border">Cancel</button>
                <button type="submit" disabled={savingAlbum} className="px-4 py-1.5 rounded-lg bg-gold-600 text-white font-semibold">
                  {savingAlbum ? 'Creating...' : 'Create Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Media Modal */}
      {mediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-ivory-200 dark:border-plum-800">
              <h3 className="font-serif font-bold text-sm text-plum-950 dark:text-ivory-50">Upload Photo or Video</h3>
              <button onClick={() => setMediaModalOpen(false)} className="p-1 text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateMedia} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Select Album *</label>
                <select
                  required
                  value={mediaAlbumId}
                  onChange={e => setMediaAlbumId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-800 bg-ivory-50 dark:bg-plum-950"
                >
                  {albums.map(a => (
                    <option key={a.id} value={a.id}>{a.title} ({a.year})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Media Title *</label>
                  <input
                    type="text"
                    required
                    value={mediaTitle}
                    onChange={e => setMediaTitle(e.target.value)}
                    placeholder="e.g. Classical Lamp Lighting"
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-800 bg-ivory-50 dark:bg-plum-950"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Format</label>
                  <select
                    value={mediaType}
                    onChange={e => setMediaType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-800 bg-ivory-50 dark:bg-plum-950"
                  >
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">File Upload or Direct URL *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={mediaUrl}
                    onChange={e => setMediaUrl(e.target.value)}
                    placeholder="Upload file or enter URL..."
                    className="flex-1 px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-800 bg-ivory-50 dark:bg-plum-950"
                  />
                  <label className="cursor-pointer px-3 py-2 rounded-xl bg-ivory-200 dark:bg-plum-800 text-plum-900 dark:text-ivory-100 flex items-center gap-1.5 border">
                    {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-gold-500" />}
                    <span>Upload</span>
                    <input type="file" accept={mediaType === 'video' ? 'video/*' : 'image/*'} onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setMediaModalOpen(false)} className="px-3 py-1.5 rounded-lg border">Cancel</button>
                <button type="submit" disabled={savingMedia} className="px-4 py-1.5 rounded-lg bg-gold-600 text-white font-semibold">
                  {savingMedia ? 'Saving...' : 'Add to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
