import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Users,
  Award,
  Loader2,
  X,
  CheckCircle2,
  Clock,
  MapPin,
  Upload,
  Download,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { api } from '../../services/api';
import { EventItem, EventRegistration } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // All 17 Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Dance');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('04:30 PM');
  const [venue, setVenue] = useState('Main Auditorium, KIT Campus');
  const [registrationOpeningDate, setRegistrationOpeningDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [regCapacity, setRegCapacity] = useState('50');
  const [eligibilityCriteria, setEligibilityCriteria] = useState('Students of KIT Tiptur with valid College ID / USN.');
  const [registrationInstructions, setRegistrationInstructions] = useState('Report to registration desk 30 minutes before programme starts.');
  const [organizerContact, setOrganizerContact] = useState('Cultural Committee: cultural@anvaya.kit');
  const [externalRegUrl, setExternalRegUrl] = useState('');
  const [isInternalRegEnabled, setIsInternalRegEnabled] = useState(true);
  const [certificateAvailable, setCertificateAvailable] = useState(true);
  const [status, setStatus] = useState<'upcoming' | 'ongoing' | 'completed' | 'archived'>('upcoming');
  const [isPublished, setIsPublished] = useState(true);

  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);

  // Attendees Modal State
  const [attendeesModalOpen, setAttendeesModalOpen] = useState(false);
  const [currentEventId, setCurrentEventId] = useState('');
  const [currentEventTitle, setCurrentEventTitle] = useState('');
  const [attendees, setAttendees] = useState<EventRegistration[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.events.getAdminAll();
      if (res.success) {
        setEvents(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to fetch events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Dance');
    setSummary('');
    setDescription('');
    setCoverImage('');
    setDateTime(new Date().toISOString().slice(0, 16));
    setStartTime('10:00 AM');
    setEndTime('04:30 PM');
    setVenue('Main Auditorium, KIT Campus');
    setRegistrationOpeningDate(new Date().toISOString().slice(0, 10));
    setRegistrationDeadline('');
    setRegCapacity('50');
    setEligibilityCriteria('Students of KIT Tiptur with valid College ID / USN.');
    setRegistrationInstructions('Report to registration desk 30 minutes before programme starts.');
    setOrganizerContact('Cultural Committee: cultural@anvaya.kit');
    setExternalRegUrl('');
    setIsInternalRegEnabled(true);
    setCertificateAvailable(true);
    setStatus('upcoming');
    setIsPublished(true);
    setModalOpen(true);
  };

  const openEdit = (ev: EventItem) => {
    setEditingId(ev.id || ev._id || null);
    setTitle(ev.title);
    setCategory(ev.category);
    setSummary(ev.summary || '');
    setDescription(ev.description);
    setCoverImage(ev.coverImage || '');
    setDateTime(new Date(ev.dateTime).toISOString().slice(0, 16));
    setStartTime(ev.startTime || '10:00 AM');
    setEndTime(ev.endTime || '04:30 PM');
    setVenue(ev.venue);
    setRegistrationOpeningDate(ev.registrationOpeningDate ? new Date(ev.registrationOpeningDate).toISOString().slice(0, 10) : '');
    setRegistrationDeadline(ev.registrationDeadline ? new Date(ev.registrationDeadline).toISOString().slice(0, 10) : '');
    setRegCapacity(String(ev.regCapacity || 0));
    setEligibilityCriteria(ev.eligibilityCriteria || ev.eligibilityRules || '');
    setRegistrationInstructions(ev.registrationInstructions || '');
    setOrganizerContact(ev.organizerContact || '');
    setExternalRegUrl(ev.externalRegUrl || '');
    setIsInternalRegEnabled(ev.isInternalRegEnabled !== false);
    setCertificateAvailable(ev.certificateAvailable);
    setStatus(ev.status);
    setIsPublished(ev.isPublished !== false);
    setModalOpen(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.fileUrl) {
        setCoverImage(res.fileUrl);
        success('Event cover uploaded.');
      }
    } catch (err: any) {
      error(err.message || 'Cover upload failed.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async (publishedState: boolean) => {
    if (!title || !dateTime || !venue || !description) {
      error('Title, date/time, venue, and description are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        category,
        summary: summary || description.slice(0, 150),
        description,
        coverImage,
        dateTime: new Date(dateTime).toISOString(),
        startTime,
        endTime,
        venue,
        registrationOpeningDate: registrationOpeningDate ? new Date(registrationOpeningDate).toISOString() : undefined,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : undefined,
        regCapacity: Number(regCapacity) || 0,
        eligibilityCriteria,
        registrationInstructions,
        organizerContact,
        externalRegUrl,
        isInternalRegEnabled,
        certificateAvailable,
        status,
        isPublished: publishedState,
      };

      if (editingId) {
        const res = await api.events.update(editingId, payload);
        if (res.success) {
          success(res.message);
          setModalOpen(false);
          fetchEvents();
        }
      } else {
        const res = await api.events.create(payload);
        if (res.success) {
          success(res.message);
          setModalOpen(false);
          fetchEvents();
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, evTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${evTitle}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await api.events.delete(id);
      if (res.success) {
        success(res.message);
        fetchEvents();
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete event.');
    }
  };

  const openAttendees = async (ev: EventItem) => {
    const evId = ev.id || ev._id || '';
    setCurrentEventId(evId);
    setCurrentEventTitle(ev.title);
    setAttendeesModalOpen(true);
    setLoadingAttendees(true);
    try {
      const res = await api.events.getRegistrations(evId);
      if (res.success) {
        setAttendees(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load attendees.');
    } finally {
      setLoadingAttendees(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ivory-200 dark:border-plum-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gold-500" />
            <h1 className="text-2xl font-serif font-bold text-plum-950 dark:text-ivory-50">
              Cultural Programmes & Calendar Management
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Create, schedule, publish events, configure certificate issuance, and manage student rosters.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gold-600 hover:bg-gold-500 shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Events Table */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-400">Loading events...</p>
        </div>
      ) : events.length > 0 ? (
        <div className="rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100 dark:bg-plum-950 text-gray-500 uppercase tracking-wider text-[10px] font-mono border-b border-ivory-200 dark:border-plum-800">
                <tr>
                  <th className="px-5 py-3">Event Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Venue</th>
                  <th className="px-4 py-3 text-center">Registrations</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200 dark:divide-plum-800">
                {events.map(ev => {
                  const evId = ev.id || ev._id || '';

                  return (
                    <tr key={evId} className="hover:bg-ivory-50 dark:hover:bg-plum-850/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-plum-950 dark:text-ivory-50">{ev.title}</div>
                        <div className="text-[11px] text-gray-500 truncate max-w-xs">{ev.summary || ev.description}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-ivory-200 dark:bg-plum-800 text-plum-800 dark:text-ivory-200">
                          {ev.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-600 dark:text-gray-300">
                        {new Date(ev.dateTime).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-4 text-gray-600 dark:text-gray-300 truncate max-w-[150px]">
                        {ev.venue}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => openAttendees(ev)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold-500/10 text-gold-700 dark:text-gold-400 font-semibold hover:bg-gold-500/20 transition-colors"
                        >
                          <Users className="w-3 h-3" />
                          <span>{ev.regCount || 0}{ev.regCapacity ? ` / ${ev.regCapacity}` : ''}</span>
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              ev.status === 'completed'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-gold-500/15 text-gold-700 dark:text-gold-400'
                            }`}
                          >
                            {ev.status}
                          </span>
                          {!ev.isPublished && (
                            <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-600">
                              Draft
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/events/${ev.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-ivory-200 dark:hover:bg-plum-800 transition-colors"
                            title="Preview Public Page"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => openEdit(ev)}
                            className="p-1.5 rounded-lg text-plum-700 dark:text-ivory-200 hover:bg-ivory-200 dark:hover:bg-plum-800 transition-colors"
                            title="Edit Event"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(evId, ev.title)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete Event"
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
          <Calendar className="w-8 h-8 text-gold-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-plum-950 dark:text-ivory-50">No events found</p>
          <p className="text-xs text-gray-400 mt-1">Create your first cultural programme to publish it to the calendar.</p>
        </div>
      )}

      {/* CREATE / EDIT MODAL WITH ALL 17 FIELDS */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-white dark:bg-plum-900 rounded-3xl border border-ivory-300 dark:border-plum-800 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-ivory-200 dark:border-plum-800 flex items-center justify-between bg-ivory-50/60 dark:bg-plum-950/40">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold-500" />
                <h3 className="text-lg font-serif font-bold text-plum-950 dark:text-ivory-50">
                  {editingId ? 'Edit Cultural Programme' : 'Create New Cultural Programme'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-ivory-200 dark:hover:bg-plum-800 text-plum-600 dark:text-ivory-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Swaralaya — Solo & Western Vocal Showcase 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  >
                    <option value="Dance">Dance</option>
                    <option value="Music and singing">Music and singing</option>
                    <option value="Drama and theatre">Drama and theatre</option>
                    <option value="Fine arts">Fine arts</option>
                    <option value="Literary and creative">Literary and creative</option>
                    <option value="Cultural festivals">Cultural festivals</option>
                    <option value="Traditional celebrations">Traditional celebrations</option>
                    <option value="Photography">Photography</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Event Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={e => setDateTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    placeholder="04:30 PM"
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Venue *
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={e => setVenue(e.target.value)}
                    placeholder="Main Auditorium / Open Air Theatre"
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                  Short Summary
                </label>
                <textarea
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  rows={2}
                  placeholder="Brief 2-sentence teaser for calendar and homepage cards..."
                  className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                  Full Programme Description *
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Comprehensive event details, stages, guidelines, performance tracks..."
                  className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  required
                />
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                  Cover Image URL
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={coverImage}
                    onChange={e => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/... or upload"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  />
                  <label className="cursor-pointer px-4 py-2 rounded-xl border border-gold-500/40 bg-gold-500/10 hover:bg-gold-500/20 text-gold-600 dark:text-gold-400 text-xs font-semibold flex items-center gap-1.5 transition-all">
                    {uploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Upload Cover</span>
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  </label>
                </div>
                {coverImage && (
                  <div className="mt-2 h-20 w-32 rounded-lg overflow-hidden border border-ivory-300 dark:border-plum-700">
                    <img src={coverImage} alt="Event Cover" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Registration Opens
                  </label>
                  <input
                    type="date"
                    value={registrationOpeningDate}
                    onChange={e => setRegistrationOpeningDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    value={registrationDeadline}
                    onChange={e => setRegistrationDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Max Capacity (0 = Unlimited)
                  </label>
                  <input
                    type="number"
                    value={regCapacity}
                    onChange={e => setRegCapacity(e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Eligibility Criteria
                  </label>
                  <input
                    type="text"
                    value={eligibilityCriteria}
                    onChange={e => setEligibilityCriteria(e.target.value)}
                    placeholder="e.g. Open to all students of KIT Tiptur"
                    className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Organizer Contact Details
                  </label>
                  <input
                    type="text"
                    value={organizerContact}
                    onChange={e => setOrganizerContact(e.target.value)}
                    placeholder="e.g. Akash (Secretary): secretary@anvaya.kit"
                    className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                  Registration Instructions
                </label>
                <input
                  type="text"
                  value={registrationInstructions}
                  onChange={e => setRegistrationInstructions(e.target.value)}
                  placeholder="e.g. Report with original college ID card. Props must be inspected beforehand."
                  className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    External Registration URL (optional)
                  </label>
                  <input
                    type="url"
                    value={externalRegUrl}
                    onChange={e => setExternalRegUrl(e.target.value)}
                    placeholder="https://forms.google.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Schedule Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-ivory-300 dark:border-plum-800 bg-ivory-50/50 dark:bg-plum-950/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalRegEnabled}
                    onChange={e => setIsInternalRegEnabled(e.target.checked)}
                    className="rounded text-gold-600 focus:ring-gold-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-plum-950 dark:text-ivory-50 block">Enable On-Site Registration</span>
                    <span className="text-[10px] text-gray-500 block">Allow students to register via Anvaya form</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-ivory-300 dark:border-plum-800 bg-ivory-50/50 dark:bg-plum-950/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={certificateAvailable}
                    onChange={e => setCertificateAvailable(e.target.checked)}
                    className="rounded text-gold-600 focus:ring-gold-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-plum-950 dark:text-ivory-50 block">Certificate Portal Integration</span>
                    <span className="text-[10px] text-gray-500 block">Enable automated certificate generation</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-ivory-200 dark:border-plum-800 bg-ivory-50/50 dark:bg-plum-950/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-plum-700 dark:text-ivory-300 hover:bg-ivory-200 dark:hover:bg-plum-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-plum-900 dark:text-ivory-100 bg-ivory-200 dark:bg-plum-800 hover:bg-ivory-300 dark:hover:bg-plum-700 transition-all"
              >
                Save as Draft
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave(true)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-gold-600 to-saffron-500 hover:from-gold-500 hover:to-saffron-600 shadow-md shadow-gold-500/20 flex items-center gap-1.5 transition-all"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Publish Event</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDEES ROSTER MODAL WITH CSV EXPORT */}
      {attendeesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-white dark:bg-plum-900 rounded-3xl border border-ivory-300 dark:border-plum-800 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-ivory-200 dark:border-plum-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-plum-950 dark:text-ivory-50">
                  Registered Attendees
                </h3>
                <p className="text-xs text-gold-600 dark:text-gold-400 font-medium">
                  {currentEventTitle} ({attendees.length} student{attendees.length === 1 ? '' : 's'})
                </p>
              </div>

              <div className="flex items-center gap-3">
                {currentEventId && attendees.length > 0 && (
                  <a
                    href={api.events.getRegistrationsExportUrl(currentEventId)}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </a>
                )}
                <button
                  onClick={() => setAttendeesModalOpen(false)}
                  className="p-1 rounded-full hover:bg-ivory-200 dark:hover:bg-plum-800 text-plum-600 dark:text-ivory-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              {loadingAttendees ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-6 h-6 text-gold-500 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Loading attendee roster...</p>
                </div>
              ) : attendees.length > 0 ? (
                <div className="rounded-xl border border-ivory-200 dark:border-plum-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-ivory-100 dark:bg-plum-950 text-gray-500 uppercase tracking-wider text-[10px] font-mono border-b border-ivory-200 dark:border-plum-800">
                      <tr>
                        <th className="px-4 py-2.5">Student Name</th>
                        <th className="px-4 py-2.5">USN</th>
                        <th className="px-4 py-2.5">Branch & Semester</th>
                        <th className="px-4 py-2.5">Email</th>
                        <th className="px-4 py-2.5">Phone</th>
                        <th className="px-4 py-2.5">Registered At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ivory-200 dark:divide-plum-800">
                      {attendees.map((att, i) => (
                        <tr key={att.id || i} className="hover:bg-ivory-50 dark:hover:bg-plum-850/40">
                          <td className="px-4 py-3 font-semibold text-plum-950 dark:text-ivory-50">
                            {att.fullName}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-gold-600 dark:text-gold-400">
                            {att.usn}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                            {att.branch} {att.semester ? `· ${att.semester}` : ''}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                            {att.email}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-mono">
                            {att.phone}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-[11px]">
                            {new Date(att.registeredAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400 text-xs">
                  No registrations have been submitted for this event yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
