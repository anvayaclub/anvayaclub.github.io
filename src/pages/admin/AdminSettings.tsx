import React, { useEffect, useState } from 'react';
import { Settings, Save, Loader2, Sparkles, Radio, Music, Clock, MapPin, Bell } from 'lucide-react';
import { api } from '../../services/api';
import { SiteSettings } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminSettings: React.FC = () => {
  const [clubName, setClubName] = useState('Anvaya');
  const [institutionName, setInstitutionName] = useState('Kalpataru Institute of Technology, Tiptur');
  const [departmentName, setDepartmentName] = useState('Department of Information Science and Engineering');
  const [contactEmail, setContactEmail] = useState('clubanvaya@gmail.com');
  const [contactPhone, setContactPhone] = useState('+91 8431 674384');
  const [address, setAddress] = useState('KIT Campus, B.H. Road, Tiptur, Tumakuru District, Karnataka - 572201');
  const [instagram, setInstagram] = useState('https://www.instagram.com/kit.anvaya.ise?cplk=d3pjdGYzbDU3M3Nr');
  const [youtube, setYoutube] = useState('https://youtube.com/@houseofanvaya-n2s?si=0vV7z51qHgdM1_xN');
  const [linkedin, setLinkedin] = useState('https://in.linkedin.com/in/anvaya-club-011908443');
  const [github, setGithub] = useState('https://github.com/anvayaclub');
  const [mapUrl, setMapUrl] = useState('https://maps.google.com/?q=Kalpataru+Institute+of+Technology+Tiptur');

  // Annual Fest Microsite Mode State (Feature 4)
  const [festIsActive, setFestIsActive] = useState(false);
  const [festName, setFestName] = useState('Anvaya Taranga 2026');
  const [festTagline, setFestTagline] = useState('ISE Annual Cultural Fest & Exhibition');
  const [currentPerformance, setCurrentPerformance] = useState('Solo Classical Vocals Competition — Main Stage');
  const [currentVenue, setCurrentVenue] = useState('Main Auditorium Stage');
  const [nextPerformance, setNextPerformance] = useState('Western Group Dance Clash');
  const [nextTime, setNextTime] = useState('In 25 Mins (02:30 PM)');
  const [festAnnouncement, setFestAnnouncement] = useState('Audience voting is now live in the Events tab! • Food & Art stalls open at the Campus Quadrangle.');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.communication.getSettings();
        if (res.success && res.data) {
          const d = res.data;
          setClubName(d.clubName || 'Anvaya');
          setInstitutionName(d.institutionName || 'Kalpataru Institute of Technology, Tiptur');
          setDepartmentName(d.departmentName || 'Department of Information Science and Engineering');
          setContactEmail(d.contactEmail || 'clubanvaya@gmail.com');
          setContactPhone(d.contactPhone || '+91 8431 674384');
          setAddress(d.address || 'KIT Campus, B.H. Road, Tiptur, Tumakuru District, Karnataka - 572201');
          setInstagram(d.socialLinks?.instagram || '');
          setYoutube(d.socialLinks?.youtube || '');
          setLinkedin(d.socialLinks?.linkedin || '');
          setGithub(d.socialLinks?.github || '');
          setMapUrl(d.mapUrl || '');

          if (d.festMode) {
            setFestIsActive(d.festMode.isActive || false);
            if (d.festMode.festName) setFestName(d.festMode.festName);
            if (d.festMode.themeTagline) setFestTagline(d.festMode.themeTagline);
            if (d.festMode.happeningNow?.title) setCurrentPerformance(d.festMode.happeningNow.title);
            if (d.festMode.happeningNow?.venue) setCurrentVenue(d.festMode.happeningNow.venue);
            if (d.festMode.upNext?.title) setNextPerformance(d.festMode.upNext.title);
            if (d.festMode.upNext?.startTime) setNextTime(d.festMode.upNext.startTime);
            if (d.festMode.announcement) setFestAnnouncement(d.festMode.announcement);
          }
        }
      } catch (err: any) {
        error(err.message || 'Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.communication.updateSettings({
        clubName,
        institutionName,
        departmentName,
        contactEmail,
        contactPhone,
        address,
        socialLinks: {
          instagram,
          youtube,
          linkedin,
          github,
        },
        mapUrl,
        festMode: {
          isActive: festIsActive,
          festName: festName.trim(),
          themeTagline: festTagline.trim(),
          happeningNow: {
            title: currentPerformance.trim(),
            venue: currentVenue.trim(),
          },
          upNext: {
            title: nextPerformance.trim(),
            venue: currentVenue.trim(),
            startTime: nextTime.trim(),
          },
          announcement: festAnnouncement.trim(),
        },
      });

      if (res.success) {
        success('Site settings and Fest Live Mode updated successfully.');
      }
    } catch (err: any) {
      error(err.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-gray-400">Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-plum-950 dark:text-ivory-50">
          Public Settings & Social Links
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Manage centrally configured institutional information, contact details, and social channels.
        </p>
      </div>

      <form onSubmit={handleSave} className="p-8 rounded-3xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-sm space-y-5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
              Club / Committee Name
            </label>
            <input
              type="text"
              required
              value={clubName}
              onChange={e => setClubName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
              Associated Department
            </label>
            <input
              type="text"
              required
              value={departmentName}
              onChange={e => setDepartmentName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
            Institution Name
          </label>
          <input
            type="text"
            required
            value={institutionName}
            onChange={e => setInstitutionName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              required
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
              Contact Phone
            </label>
            <input
              type="text"
              required
              value={contactPhone}
              onChange={e => setContactPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
            Physical Campus Address
          </label>
          <input
            type="text"
            required
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
          />
        </div>

        {/* Social channels */}
        <div className="space-y-3 pt-3 border-t border-ivory-200 dark:border-plum-800">
          <div className="text-[11px] font-semibold text-gray-400">Social Channel Links</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-gray-500 mb-0.5">Instagram URL</label>
              <input
                type="url"
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full px-3 py-1.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 mb-0.5">YouTube URL</label>
              <input
                type="url"
                value={youtube}
                onChange={e => setYoutube(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full px-3 py-1.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 mb-0.5">LinkedIn URL</label>
              <input
                type="url"
                value={linkedin}
                onChange={e => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/..."
                className="w-full px-3 py-1.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 mb-0.5">GitHub URL</label>
              <input
                type="url"
                value={github}
                onChange={e => setGithub(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3 py-1.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
              />
            </div>
          </div>
        </div>

        {/* ANNUAL FEST MICROSITE LIVE MODE (FEATURE 4) */}
        <div className="space-y-4 pt-4 border-t border-ivory-200 dark:border-plum-800">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Radio className={`w-4 h-4 ${festIsActive ? 'text-emerald-500 animate-pulse' : 'text-gray-400'}`} />
                <span className="text-xs font-serif font-bold text-plum-950 dark:text-ivory-50">
                  Annual Fest Microsite Live Mode
                </span>
                {festIsActive ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Active on Homepage
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-500/15 text-gray-500">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                Transforms the public homepage during fest days with real-time "Happening Now" and "Up Next" stage broadcasts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFestIsActive(!festIsActive)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                festIsActive
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-ivory-200 dark:bg-plum-800 text-plum-900 dark:text-ivory-200 border-ivory-300 dark:border-plum-700'
              }`}
            >
              {festIsActive ? 'Fest Mode: ON' : 'Fest Mode: OFF'}
            </button>
          </div>

          <div className={`p-4 rounded-2xl border space-y-4 transition-all ${
            festIsActive
              ? 'bg-gradient-to-br from-gold-500/10 via-saffron-500/5 to-transparent border-gold-500/30'
              : 'bg-ivory-50 dark:bg-plum-950/50 border-ivory-200 dark:border-plum-800'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 font-medium">
                  Fest Name
                </label>
                <input
                  type="text"
                  value={festName}
                  onChange={(e) => setFestName(e.target.value)}
                  placeholder="e.g. Anvaya Taranga 2026"
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-plum-900 border border-ivory-300 dark:border-plum-700 text-plum-950 dark:text-ivory-50 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 font-medium">
                  Fest Tagline
                </label>
                <input
                  type="text"
                  value={festTagline}
                  onChange={(e) => setFestTagline(e.target.value)}
                  placeholder="e.g. Celebrating Art, Rhythm & Expression"
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-plum-900 border border-ivory-300 dark:border-plum-700 text-plum-950 dark:text-ivory-50 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-gold-700 dark:text-gold-400 mb-0.5 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
                  <span>Happening Now (Current Performance / Competition)</span>
                </label>
                <input
                  type="text"
                  value={currentPerformance}
                  onChange={(e) => setCurrentPerformance(e.target.value)}
                  placeholder="e.g. Classical Dance Finals — Main Stage"
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-plum-900 border border-ivory-300 dark:border-plum-700 text-plum-950 dark:text-ivory-50 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 font-medium">
                  Current Stage Venue
                </label>
                <input
                  type="text"
                  value={currentVenue}
                  onChange={(e) => setCurrentVenue(e.target.value)}
                  placeholder="e.g. KIT Main Auditorium"
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-plum-900 border border-ivory-300 dark:border-plum-700 text-plum-950 dark:text-ivory-50 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 font-medium">
                  Up Next (Next Performance)
                </label>
                <input
                  type="text"
                  value={nextPerformance}
                  onChange={(e) => setNextPerformance(e.target.value)}
                  placeholder="e.g. Rock Band Medley Clash"
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-plum-900 border border-ivory-300 dark:border-plum-700 text-plum-950 dark:text-ivory-50 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 font-medium">
                  Up Next Estimated Time / Countdown
                </label>
                <input
                  type="text"
                  value={nextTime}
                  onChange={(e) => setNextTime(e.target.value)}
                  placeholder="e.g. In 20 Mins (03:15 PM)"
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-plum-900 border border-ivory-300 dark:border-plum-700 text-plum-950 dark:text-ivory-50 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 font-medium">
                Live Announcement Ticker / Coordinator Note
              </label>
              <input
                type="text"
                value={festAnnouncement}
                onChange={(e) => setFestAnnouncement(e.target.value)}
                placeholder="e.g. Live audience polling is now open in Events! • Food stalls open at the Quadrangle."
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-plum-900 border border-ivory-300 dark:border-plum-700 text-plum-950 dark:text-ivory-50 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-ivory-200 dark:border-plum-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gold-600 hover:bg-gold-500 shadow disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
