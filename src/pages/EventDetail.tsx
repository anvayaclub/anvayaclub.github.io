import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  User,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { EventItem } from '../types';
import { useToast } from '../context/ToastContext';

import { useAuth } from '../context/AuthContext';

export const EventDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();
  const { user } = useAuth();

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [usn, setUsn] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [branch, setBranch] = useState('ISE');
  const [academicYear, setAcademicYear] = useState('3rd Year');
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.usn) setUsn(user.usn);
      if (user.email) setEmail(user.email);
      if (user.branch) setBranch(user.branch);
      if (user.semester) setAcademicYear(user.semester);
    }
  }, [user]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await api.events.getBySlug(slug);
        if (res.success) {
          setEvent(res.data);
        }
      } catch (err: any) {
        error(err.message || 'Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    if (!fullName || !usn || !email || !phone) {
      error('Please complete all registration fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.events.register(event.id, {
        fullName,
        usn: usn.trim().toUpperCase(),
        email,
        phone,
        branch,
        academicYear,
      });

      if (res.success) {
        setRegistered(true);
        success(res.message);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        // Update local event reg count
        setEvent(prev => prev ? { ...prev, regCount: (prev.regCount || 0) + 1 } : null);
      }
    } catch (err: any) {
      error(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-2" />
        <p className="text-xs text-gray-400">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-plum-950 dark:text-ivory-50">
          Event Not Found
        </h2>
        <p className="text-sm text-gray-500">
          The requested cultural programme may have been moved or unpublished.
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events Calendar</span>
        </Link>
      </div>
    );
  }

  const isClosed =
    event.status === 'completed' ||
    event.status === 'archived' ||
    (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) ||
    (event.regCapacity && event.regCapacity > 0 && (event.regCount || 0) >= event.regCapacity);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-600 dark:text-gold-400 hover:text-gold-500"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gold-500/15 text-gold-700 dark:text-gold-300 border border-gold-500/30">
            {event.category}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-ivory-200 dark:bg-plum-800 text-plum-900 dark:text-ivory-100">
            {event.status}
          </span>
        </div>
      </div>

      {/* Main Hero Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Details) */}
        <div className="lg:col-span-7 space-y-6">
          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-plum-950 dark:text-ivory-50 tracking-tight leading-snug">
            {event.title}
          </h1>

          {/* Logistics strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-sm text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-gray-400 text-[10px] uppercase font-semibold">Date & Time</div>
                <div className="font-semibold text-plum-950 dark:text-ivory-50">
                  {new Date(event.dateTime).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-peacock-500/10 text-peacock-600 dark:text-peacock-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-gray-400 text-[10px] uppercase font-semibold">Venue</div>
                <div className="font-semibold text-plum-950 dark:text-ivory-50">{event.venue}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-lg font-serif font-bold text-plum-950 dark:text-ivory-50">
              Programme Overview
            </h2>
            <p className="text-sm text-plum-700 dark:text-ivory-200 leading-relaxed whitespace-pre-line font-sans">
              {event.description}
            </p>
          </div>

          {/* Eligibility Rules */}
          {event.eligibilityRules && (
            <div className="space-y-2 p-5 rounded-2xl bg-ivory-100 dark:bg-plum-950/80 border border-ivory-300 dark:border-plum-800 text-xs">
              <h3 className="font-serif font-bold text-sm text-plum-950 dark:text-ivory-50">
                Eligibility & Rules
              </h3>
              <p className="text-plum-700 dark:text-ivory-300 leading-relaxed font-sans">
                {event.eligibilityRules}
              </p>
            </div>
          )}

          {/* Organizers contact */}
          {event.organizerContact && (
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Users className="w-4 h-4 text-gold-500" />
              <span>Coordinator: {event.organizerContact}</span>
            </div>
          )}

          {/* Results / Winners Section for Completed Events */}
          {event.results && (
            <div className="p-6 rounded-2xl bg-gold-500/10 border border-gold-500/30 space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                <h3 className="text-base font-serif font-bold text-plum-950 dark:text-ivory-50">
                  Event Results & Accolades
                </h3>
              </div>

              {event.results.summary && (
                <p className="text-xs text-plum-800 dark:text-ivory-200 leading-relaxed">
                  {event.results.summary}
                </p>
              )}

              {event.results.winners && event.results.winners.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-semibold uppercase text-gold-700 dark:text-gold-400 font-mono">
                    Official Awardees:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {event.results.winners.map((w, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/80 dark:bg-plum-900/80 border border-gold-500/20 text-xs"
                      >
                        <div className="font-bold text-plum-950 dark:text-ivory-50">{w.name}</div>
                        <div className="text-[11px] text-gold-600 dark:text-gold-400 font-medium">
                          {w.position} {w.usn ? `(${w.usn})` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {event.certificateAvailable && (
                <div className="pt-2">
                  <Link
                    to="/certificate"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700 dark:text-gold-400 hover:underline"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Download Participation Certificate in Certificate Portal →</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (Cover Image & Internal Registration Form) */}
        <div className="lg:col-span-5 space-y-6">
          {event.coverImage && (
            <div className="rounded-2xl overflow-hidden border border-ivory-200 dark:border-plum-800 shadow-md">
              <img
                src={event.coverImage}
                alt={event.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Registration Section */}
          <div className="p-6 rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-plum-950 dark:text-ivory-50">
                Event Registration
              </h3>
              {event.regCapacity && event.regCapacity > 0 ? (
                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {event.regCount || 0} / {event.regCapacity} Slots
                </div>
              ) : null}
            </div>

            {/* Registration Progress Bar */}
            {event.regCapacity && event.regCapacity > 0 && (
              <div className="w-full bg-ivory-200 dark:bg-plum-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gold-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (((event.regCount || 0) / event.regCapacity) * 100))}%`,
                  }}
                ></div>
              </div>
            )}

            {registered ? (
              <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Registration Confirmed!</span>
                </div>
                <p>
                  Your registration for <strong>{event.title}</strong> has been successfully recorded. Please report with your college ID at the venue.
                </p>
              </div>
            ) : isClosed ? (
              <div className="p-4 rounded-xl bg-gray-500/10 border border-gray-500/20 text-gray-600 dark:text-gray-400 text-xs">
                Registrations for this programme are closed or have reached maximum capacity.
              </div>
            ) : event.isExternalReg && event.externalRegUrl ? (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This competition accepts entries through the official external registration portal.
                </p>
                <a
                  href={event.externalRegUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold text-white bg-gold-600 hover:bg-gold-500 shadow-md transition-all"
                >
                  <span>Open External Registration</span>
                </a>
              </div>
            ) : (
              /* Internal Registration Form */
              <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Adithya K S"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                      USN *
                    </label>
                    <input
                      type="text"
                      required
                      value={usn}
                      onChange={e => setUsn(e.target.value.toUpperCase())}
                      placeholder="1KI22IS001"
                      className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50 uppercase font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                      Academic Year *
                    </label>
                    <select
                      value={academicYear}
                      onChange={e => setAcademicYear(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                      Department / Branch *
                    </label>
                    <select
                      value={branch}
                      onChange={e => setBranch(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                    >
                      <option value="ISE">ISE</option>
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="AIML">AIML</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="9845012345"
                      className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                    Student Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="student@kit-tiptur.ac.in"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-gold-600 to-saffron-500 hover:from-gold-500 hover:to-saffron-600 shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{submitting ? 'Submitting Registration...' : 'Confirm Registration'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
