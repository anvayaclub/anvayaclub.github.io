import React, { useEffect, useState } from 'react';
import { Settings, Save, Loader2 } from 'lucide-react';
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
      });

      if (res.success) {
        success('Site settings and links updated successfully.');
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
