import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Filter,
  Search,
  Award,
  ArrowRight,
  ShieldCheck,
  Loader2,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { EventItem } from '../types';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('upcoming');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calendar month state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await api.events.getAll({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          search: searchQuery || undefined,
        });
        if (res.success) {
          setEvents(res.data);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [statusFilter, categoryFilter, searchQuery]);

  // Calendar navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const resetToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  // Calendar grid computation
  const { daysInMonth, startDayIndex, year, monthName } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    return {
      year,
      monthName,
      daysInMonth: lastDay.getDate(),
      startDayIndex: firstDay.getDay(),
    };
  }, [currentDate]);

  // Map of events by YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    events.forEach(e => {
      const dateKey = new Date(e.dateTime).toISOString().split('T')[0];
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(e);
    });
    return map;
  }, [events]);

  // Filter events by selected calendar date if any
  const displayedEvents = useMemo(() => {
    if (!selectedDate) return events;
    return events.filter(e => {
      const dateKey = new Date(e.dateTime).toISOString().split('T')[0];
      return dateKey === selectedDate;
    });
  }, [events, selectedDate]);

  const categories = [
    'all',
    'Dance',
    'Music and singing',
    'Drama and theatre',
    'Fine arts',
    'Literary and creative',
    'Cultural festivals',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-700 dark:text-gold-400 text-xs font-semibold uppercase tracking-wider font-sans">
          <span>Cultural Schedules & Competitions</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-extrabold text-plum-950 dark:text-ivory-50 tracking-tight">
          Events & Interactive Calendar
        </h1>
        <p className="text-base text-plum-700 dark:text-ivory-200 leading-relaxed font-sans">
          Discover upcoming performances, register for stage competitions, review past event results, and verify participant certificates.
        </p>
      </section>

      {/* Interactive Calendar & Filter Container */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Interactive Calendar Card (Left Col - 5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-serif font-bold text-plum-950 dark:text-ivory-50">
              {monthName} {year}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={resetToToday}
                className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-ivory-200 dark:bg-plum-800 hover:bg-gold-500 hover:text-white transition-colors"
              >
                Today
              </button>
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-ivory-300 dark:border-plum-700 hover:bg-gold-500/10 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-ivory-300 dark:border-plum-700 hover:bg-gold-500/10 transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400 mb-2 font-mono">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Blank offset spaces */}
            {Array.from({ length: startDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="p-2"></div>
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateString = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const hasEvents = eventsByDate.has(dateString);
              const isSelected = selectedDate === dateString;
              const isToday = new Date().toISOString().split('T')[0] === dateString;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateString)}
                  className={`p-2 rounded-xl transition-all relative flex flex-col items-center justify-center font-medium ${
                    isSelected
                      ? 'bg-gold-500 text-white font-bold shadow-md scale-105'
                      : isToday
                      ? 'border border-gold-500 text-gold-600 dark:text-gold-400 font-bold'
                      : hasEvents
                      ? 'bg-gold-500/15 text-gold-700 dark:text-gold-300 hover:bg-gold-500/30'
                      : 'hover:bg-ivory-200/50 dark:hover:bg-plum-800 text-plum-900 dark:text-ivory-100'
                  }`}
                >
                  <span>{day}</span>
                  {hasEvents && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-0.5"></span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div className="mt-4 pt-3 border-t border-ivory-200 dark:border-plum-800 flex items-center justify-between text-xs text-plum-700 dark:text-ivory-300">
              <span>Showing events for: <strong>{selectedDate}</strong></span>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-xs text-rose-500 hover:underline inline-flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Clear filter</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Controls (Right Col - 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Search & Status Tabs */}
          <div className="p-4 rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 space-y-4 shadow-sm">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search events by title or keywords..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50 placeholder-gray-400"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {(['upcoming', 'ongoing', 'completed', 'all'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider capitalize transition-all ${
                    statusFilter === tab
                      ? 'bg-gold-500 text-white shadow-sm'
                      : 'bg-ivory-100 dark:bg-plum-800 text-plum-800 dark:text-ivory-200 hover:bg-gold-500/10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Category Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-gray-400 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Category:
              </span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    categoryFilter === cat
                      ? 'bg-plum-950 text-white dark:bg-ivory-100 dark:text-plum-950 font-bold'
                      : 'bg-ivory-200/60 dark:bg-plum-800/80 text-plum-700 dark:text-ivory-300 hover:text-gold-500'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Notice to Certificate Portal */}
          <div className="p-4 rounded-2xl bg-peacock-500/10 border border-peacock-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs text-peacock-900 dark:text-peacock-200 font-medium">
              <ShieldCheck className="w-4 h-4 text-peacock-500 flex-shrink-0" />
              <span>Looking for your event certificate? Verify with your Name & USN.</span>
            </div>
            <Link
              to="/certificate"
              className="text-xs font-semibold text-peacock-600 dark:text-peacock-300 hover:underline flex-shrink-0"
            >
              Get Certificate →
            </Link>
          </div>
        </div>
      </section>

      {/* Events Card Collection */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-plum-950 dark:text-ivory-50">
            {selectedDate
              ? `Events for ${selectedDate}`
              : statusFilter === 'all'
              ? 'All Cultural Events'
              : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Events`}
            <span className="text-sm font-normal text-gray-400 ml-2 font-mono">
              ({displayedEvents.length})
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-400">Loading events directory...</p>
          </div>
        ) : displayedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedEvents.map(event => (
              <div
                key={event.id}
                className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-plum-900/80 border border-ivory-200 dark:border-plum-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {event.coverImage && (
                  <div className="h-48 w-full overflow-hidden relative">
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium">
                      {event.category}
                    </div>
                    {event.certificateAvailable && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-gold-500/90 text-white text-[10px] font-semibold flex items-center gap-1 shadow">
                        <Award className="w-3 h-3" />
                        <span>Certificates</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gold-600 dark:text-gold-400 font-semibold mb-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(event.dateTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <h3 className="text-lg font-serif font-bold text-plum-950 dark:text-ivory-50 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors line-clamp-2">
                      {event.title}
                    </h3>

                    <p className="text-xs text-plum-700 dark:text-ivory-300 line-clamp-3 mt-2 leading-relaxed">
                      {event.description}
                    </p>

                    {event.results?.winners && event.results.winners.length > 0 && (
                      <div className="mt-3 p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-xs">
                        <div className="font-semibold text-gold-700 dark:text-gold-400 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          <span>Results Announced:</span>
                        </div>
                        <div className="text-[11px] text-plum-800 dark:text-ivory-200 mt-1">
                          Winner: {event.results.winners[0].name} ({event.results.winners[0].position})
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-ivory-200 dark:border-plum-800 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 truncate max-w-[170px]">
                      <MapPin className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </span>

                    <Link
                      to={`/events/${event.slug}`}
                      className="font-semibold text-gold-600 dark:text-gold-400 hover:text-gold-500 inline-flex items-center gap-1"
                    >
                      <span>{event.status === 'completed' ? 'View Results' : 'Details'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center rounded-2xl bg-white/50 dark:bg-plum-900/40 border border-ivory-200 dark:border-plum-800 max-w-md mx-auto">
            <CalendarIcon className="w-8 h-8 text-gold-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-plum-950 dark:text-ivory-50">
              No Events Found Matching Filter
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try switching status tabs, clearing category filters, or selecting another date on the calendar.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
