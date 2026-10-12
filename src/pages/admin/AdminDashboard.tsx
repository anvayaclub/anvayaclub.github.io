import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Award,
  UserCheck,
  FolderGit2,
  Image,
  Bell,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    events: 0,
    team: 0,
    certConfigs: 0,
    applications: 0,
    projects: 0,
    ideas: 0,
    media: 0,
    inquiries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [eventsRes, teamRes, certRes, appRes, projRes, ideaRes, mediaRes, inqRes] = await Promise.all([
          api.events.getAdminAll(),
          api.team.getAdminAll(),
          api.certificates.getAdminConfigs(),
          api.membership.getAdminAll(),
          api.projects.getAdminAll(),
          api.projects.getIdeas(),
          api.gallery.getAdminMedia(),
          api.communication.getContactSubmissions(),
        ]);

        setStats({
          events: eventsRes.data?.length || 0,
          team: teamRes.data?.length || 0,
          certConfigs: certRes.data?.length || 0,
          applications: appRes.data?.length || 0,
          projects: projRes.data?.length || 0,
          ideas: ideaRes.data?.length || 0,
          media: mediaRes.data?.length || 0,
          inquiries: inqRes.data?.length || 0,
        });
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const metricCards = [
    { label: 'Published Events', count: stats.events, icon: <Calendar className="w-5 h-5 text-gold-500" />, path: '/admin/events' },
    { label: 'Membership Applicants', count: stats.applications, icon: <UserCheck className="w-5 h-5 text-emerald-500" />, path: '/admin/membership' },
    { label: 'Certificate Events', count: stats.certConfigs, icon: <Award className="w-5 h-5 text-peacock-500" />, path: '/admin/certificates' },
    { label: 'Team Members', count: stats.team, icon: <Users className="w-5 h-5 text-purple-500" />, path: '/admin/team' },
    { label: 'Showcase Projects', count: stats.projects, icon: <FolderGit2 className="w-5 h-5 text-blue-500" />, path: '/admin/projects' },
    { label: 'Pending Project Ideas', count: stats.ideas, icon: <Sparkles className="w-5 h-5 text-amber-500" />, path: '/admin/projects' },
    { label: 'Gallery Media', count: stats.media, icon: <Image className="w-5 h-5 text-rose-500" />, path: '/admin/gallery' },
    { label: 'Contact Inquiries', count: stats.inquiries, icon: <MessageSquare className="w-5 h-5 text-indigo-500" />, path: '/admin/inquiries' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-plum-950 dark:text-ivory-50">
          Executive Committee Overview
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Real-time metrics and administration for Anvaya Cultural Committee (KIT Tiptur).
        </p>
      </div>

      {/* Metrics Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-400">Loading metrics from database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((card, i) => (
            <Link
              key={i}
              to={card.path}
              className="p-5 rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-sm hover:shadow-md transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-ivory-100 dark:bg-plum-800">{card.icon}</div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-plum-950 dark:text-ivory-50">
                  {card.count}
                </div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                  {card.label}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 space-y-4">
          <h2 className="text-base font-serif font-bold text-plum-950 dark:text-ivory-50">
            Certificate Generation & Verification
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Upload participant spreadsheets in <code>Name, USN</code> format, preview before commit, configure up to 3 authorized signatories, and manage revocations.
          </p>
          <Link
            to="/admin/certificates"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gold-500 text-white hover:bg-gold-600 transition-colors"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Manage Certificates</span>
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 space-y-4">
          <h2 className="text-base font-serif font-bold text-plum-950 dark:text-ivory-50">
            Student Membership Recruitment
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Review incoming audition applications from students across all semesters, filter by cultural interests, add notes, and export applicant data.
          </p>
          <Link
            to="/admin/membership"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-peacock-600 text-white hover:bg-peacock-500 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Review Applications</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
