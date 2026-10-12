import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  Award,
  ArrowRight,
  ShieldCheck,
  Music,
  HeartHandshake,
  Image as ImageIcon,
  Bell,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { AnvayaLogo } from '../components/common/AnvayaLogo';
import { api } from '../services/api';
import { EventItem, AnnouncementItem, GalleryMediaItem } from '../types';

export const Home: React.FC = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [recentMedia, setRecentMedia] = useState<GalleryMediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, annRes, mediaRes] = await Promise.all([
          api.events.getAll({ status: 'upcoming' }),
          api.communication.getAnnouncements(),
          api.gallery.getMedia({ type: 'photo' }),
        ]);

        if (eventsRes.success) setUpcomingEvents(eventsRes.data.slice(0, 3));
        if (annRes.success) setAnnouncements(annRes.data.slice(0, 3));
        if (mediaRes.success) setRecentMedia(mediaRes.data.slice(0, 4));
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-cultural-pattern">
        {/* Subtle decorative glowing gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-gold-500/10 to-plum-600/10 dark:from-gold-500/15 dark:to-plum-700/20 blur-3xl rounded-full pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Prominent Official Anvaya Logo with Elegant Golden Aura */}
            <div className="inline-flex flex-col items-center gap-4">
              <div className="relative group mx-auto">
                {/* Restrained warm golden ambient backlight */}
                <div className="absolute inset-0 -m-3 sm:-m-5 rounded-3xl bg-gradient-to-b from-gold-500/15 via-gold-500/5 to-transparent blur-2xl pointer-events-none -z-10 group-hover:from-gold-500/25 transition-all duration-500" />

                {/* Delicate gold-bordered, subtly tinted glass frame */}
                <div className="relative px-6 py-4 sm:px-8 sm:py-5 rounded-3xl bg-gradient-to-b from-white/90 to-ivory-100/80 dark:from-plum-900/80 dark:to-plum-950/80 backdrop-blur-md border border-gold-500/30 dark:border-gold-500/25 shadow-lg shadow-gold-950/5 dark:shadow-black/20 flex items-center justify-center transition-all duration-300">
                  <AnvayaLogo size="hero" />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-700 dark:text-gold-400 text-xs font-semibold tracking-wider uppercase font-sans shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
                <span>Cultural Committee · ISE Department · KIT Tiptur</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-plum-950 dark:text-ivory-50 tracking-tight leading-[1.15]">
              Celebration of Culture, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-gold-600 via-saffron-500 to-gold-500 bg-clip-text text-transparent">
                Creativity & Community
              </span>
            </h1>

            {/* Concise Introduction */}
            <p className="text-base sm:text-lg text-plum-800 dark:text-ivory-200 leading-relaxed font-sans max-w-2xl mx-auto">
              Anvaya is the cultural heartbeat of the Information Science and Engineering Department at Kalpataru Institute of Technology, Tiptur—empowering students in dance, music, theatre, fine arts, literature, and student leadership.
            </p>

            {/* Actions: Primary Join, Secondary Events, and Certificate Portal Route */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
              <Link
                to="/join"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-gold-600 to-saffron-500 hover:from-gold-500 hover:to-saffron-600 shadow-lg shadow-gold-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Join Anvaya</span>
              </Link>

              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold bg-white dark:bg-plum-900 text-plum-950 dark:text-ivory-50 border border-ivory-300 dark:border-plum-800 hover:border-gold-500 hover:text-gold-600 transition-all shadow-sm"
              >
                <Calendar className="w-4 h-4 text-gold-500" />
                <span>Explore Events</span>
              </Link>

              <Link
                to="/certificate"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-semibold text-peacock-700 dark:text-peacock-300 bg-peacock-500/10 hover:bg-peacock-500/20 border border-peacock-500/30 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-peacock-500" />
                <span>Verify Certificates</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS & IDENTITY HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-plum-900/60 backdrop-blur-sm border border-ivory-200 dark:border-plum-800/80 text-center">
            <div className="text-3xl sm:text-4xl font-serif font-bold text-gold-600 dark:text-gold-400">
              8+
            </div>
            <div className="text-xs uppercase font-medium tracking-wider text-plum-600 dark:text-ivory-300 mt-1">
              Active Domains
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/70 dark:bg-plum-900/60 backdrop-blur-sm border border-ivory-200 dark:border-plum-800/80 text-center">
            <div className="text-3xl sm:text-4xl font-serif font-bold text-peacock-600 dark:text-peacock-400">
              100%
            </div>
            <div className="text-xs uppercase font-medium tracking-wider text-plum-600 dark:text-ivory-300 mt-1">
              Verified Certificates
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/70 dark:bg-plum-900/60 backdrop-blur-sm border border-ivory-200 dark:border-plum-800/80 text-center">
            <div className="text-3xl sm:text-4xl font-serif font-bold text-saffron-600 dark:text-saffron-500">
              VTU
            </div>
            <div className="text-xs uppercase font-medium tracking-wider text-plum-600 dark:text-ivory-300 mt-1">
              Inter-College Fests
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/70 dark:bg-plum-900/60 backdrop-blur-sm border border-ivory-200 dark:border-plum-800/80 text-center">
            <div className="text-3xl sm:text-4xl font-serif font-bold text-purple-600 dark:text-purple-400">
              KIT
            </div>
            <div className="text-xs uppercase font-medium tracking-wider text-plum-600 dark:text-ivory-300 mt-1">
              Student Leadership
            </div>
          </div>
        </div>
      </section>

      {/* 3. UPCOMING EVENTS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gold-600 dark:text-gold-400 font-sans">
              Calendar Highlights
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-plum-950 dark:text-ivory-50 mt-1">
              Upcoming Cultural Programmes
            </h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gold-600 dark:text-gold-400 hover:text-gold-500 group"
          >
            <span>View Complete Calendar</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map(event => (
              <div
                key={event.id}
                className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-plum-900/80 border border-ivory-200 dark:border-plum-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {event.coverImage && (
                  <div className="h-44 w-full overflow-hidden relative">
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium">
                      {event.category}
                    </div>
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gold-600 dark:text-gold-400 font-semibold mb-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(event.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <h3 className="text-lg font-serif font-bold text-plum-950 dark:text-ivory-50 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-xs text-plum-700 dark:text-ivory-300 line-clamp-3 mt-2 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-ivory-200 dark:border-plum-800 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                      <MapPin className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </span>
                    <Link
                      to={`/events/${event.slug}`}
                      className="font-semibold text-gold-600 dark:text-gold-400 hover:text-gold-500 inline-flex items-center gap-1"
                    >
                      <span>Register</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white/50 dark:bg-plum-900/40 border border-ivory-200 dark:border-plum-800">
            <Calendar className="w-8 h-8 text-gold-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              No upcoming programmes scheduled at this moment.
            </p>
            <p className="text-xs text-gray-400 mt-1">Check the completed events archive or check back soon.</p>
          </div>
        )}
      </section>

      {/* 4. MISSION & COMMITTEE PURPOSE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-plum-900 via-plum-950 to-plum-900 text-ivory-50 border border-plum-800/80 shadow-xl relative overflow-hidden">
          <div className="max-w-3xl space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-400 text-xs font-semibold uppercase tracking-wider">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Our Purpose & Philosophy</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-extrabold tracking-tight text-white">
              Uniting Engineering Ingenuity with the Soul of Culture
            </h2>
            <p className="text-sm sm:text-base text-ivory-200 leading-relaxed font-sans">
              "Anvaya" signifies harmony, connection, and continuity. In the rigorous world of information science and engineering, Anvaya serves as a sanctuary for self-expression, stage arts, creative writing, and student fellowship. We bridge tradition with modern aspirations, fostering well-rounded technocrats ready to inspire.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gold-500 text-plum-950 hover:bg-gold-400 transition-colors shadow-md"
              >
                <span>Read Our Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/team"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-plum-800 hover:bg-plum-700 text-ivory-50 border border-plum-700 transition-colors"
              >
                <span>Meet Committee Leadership</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. RECENT GALLERY HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gold-600 dark:text-gold-400 font-sans">
              Visual Archives
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-plum-950 dark:text-ivory-50 mt-1">
              Moments from KIT Programmes
            </h2>
          </div>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gold-600 dark:text-gold-400 hover:text-gold-500 group"
          >
            <span>Explore Full Gallery</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {recentMedia.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentMedia.map(item => (
              <Link
                key={item.id}
                to={`/gallery?album=${item.albumId}`}
                className="group relative rounded-2xl overflow-hidden aspect-square border border-ivory-200 dark:border-plum-800 shadow-sm hover:shadow-lg transition-all"
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                  <div className="text-xs font-semibold line-clamp-1">{item.title}</div>
                  <div className="text-[10px] text-gray-300 mt-0.5">{item.date}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-400">
            Gallery moments will appear once albums are published.
          </div>
        )}
      </section>

      {/* 6. LATEST ANNOUNCEMENTS */}
      {announcements.length > 0 && (
        <section id="announcements" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-gold-600 dark:text-gold-400 font-sans">
              Bulletins
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-plum-950 dark:text-ivory-50 mt-1">
              Latest Announcements & News
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.map(ann => (
              <div
                key={ann.id}
                className="p-6 rounded-2xl bg-white dark:bg-plum-900/80 border border-ivory-200 dark:border-plum-800 space-y-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 text-[11px] text-gold-600 dark:text-gold-400 font-semibold">
                  <Bell className="w-3.5 h-3.5" />
                  <span>{new Date(ann.publishDate).toLocaleDateString()}</span>
                </div>
                <h3 className="text-base font-serif font-bold text-plum-950 dark:text-ivory-50 line-clamp-2">
                  {ann.title}
                </h3>
                <p className="text-xs text-plum-700 dark:text-ivory-300 leading-relaxed line-clamp-3">
                  {ann.summary}
                </p>
                {ann.relatedEventSlug && (
                  <Link
                    to={`/events/${ann.relatedEventSlug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gold-600 dark:text-gold-400 hover:text-gold-500 pt-1"
                  >
                    <span>Related Event</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. CLOSING CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-ivory-100 dark:bg-plum-900 border border-ivory-300 dark:border-plum-800 shadow-md space-y-4">
          <h2 className="text-3xl font-serif font-extrabold text-plum-950 dark:text-ivory-50">
            Ready to Take the Stage?
          </h2>
          <p className="text-sm text-plum-700 dark:text-ivory-300 max-w-xl mx-auto font-sans leading-relaxed">
            Whether your passion is vocals, classical choreography, acting, stage production, graphic design, or photography—there is a place for you in Anvaya.
          </p>
          <div className="pt-2">
            <Link
              to="/join"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-semibold text-white bg-gradient-to-r from-gold-600 to-saffron-500 hover:from-gold-500 hover:to-saffron-600 shadow-lg shadow-gold-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Apply for Committee Membership</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
