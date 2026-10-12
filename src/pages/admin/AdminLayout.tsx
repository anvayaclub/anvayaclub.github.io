import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Award,
  UserCheck,
  FolderGit2,
  Image,
  Bell,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  Lock,
} from 'lucide-react';
import { AnvayaLogo } from '../../components/common/AnvayaLogo';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isTechnical, isMediaPoster, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-gray-400">Verifying administrator session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // If user is neither technical nor media-poster, deny admin access
  if (!isTechnical && !isMediaPoster) {
    return (
      <div className="min-h-screen bg-ivory-50 dark:bg-plum-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-3xl bg-white dark:bg-plum-900 border border-ivory-300 dark:border-plum-800 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif font-bold text-plum-950 dark:text-ivory-50">
            Access Restricted
          </h2>
          <p className="text-xs text-plum-700 dark:text-ivory-300">
            Your account ({user?.email}) has the <strong className="uppercase">{user?.role}</strong> role, which does not have permission to enter the administration dashboard.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-ivory-200 dark:bg-plum-800 text-plum-900 dark:text-ivory-100"
            >
              Back to Home
            </Link>
            <button
              onClick={() => { logout(); navigate('/admin/login'); }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gold-600 hover:bg-gold-500"
            >
              Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Media-poster role is scoped only to Gallery management
  if (isMediaPoster && !isTechnical && location.pathname !== '/admin/gallery') {
    return <Navigate to="/admin/gallery" replace />;
  }

  const technicalNavItems = [
    { label: 'Overview', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Events & Rosters', path: '/admin/events', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Team & Accounts', path: '/admin/team', icon: <Users className="w-4 h-4" /> },
    { label: 'Roles & Access Control', path: '/admin/roles', icon: <KeyRound className="w-4 h-4" /> },
    { label: 'Certificates & Issuance', path: '/admin/certificates', icon: <Award className="w-4 h-4" /> },
    { label: 'Membership Applications', path: '/admin/membership', icon: <UserCheck className="w-4 h-4" /> },
    { label: 'Projects Moderation', path: '/admin/projects', icon: <FolderGit2 className="w-4 h-4" /> },
    { label: 'Gallery & Media', path: '/admin/gallery', icon: <Image className="w-4 h-4" /> },
    { label: 'Announcements', path: '/admin/announcements', icon: <Bell className="w-4 h-4" /> },
    { label: 'Inquiries & Subscribers', path: '/admin/inquiries', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Settings & Contacts', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const mediaPosterNavItems = [
    { label: 'Gallery & Media Management', path: '/admin/gallery', icon: <Image className="w-4 h-4" /> },
  ];

  const navItems = isTechnical ? technicalNavItems : mediaPosterNavItems;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-ivory-50 dark:bg-plum-950 text-plum-950 dark:text-ivory-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-ivory-200 dark:border-plum-800 bg-white/80 dark:bg-plum-900/80 backdrop-blur-md p-4">
        <div className="space-y-6">
          {/* Logo Header */}
          <div className="px-2 pt-2 flex items-center justify-between">
            <Link to="/" className="inline-block" title="Back to Public Site">
              <AnvayaLogo size="sm" showText={true} />
            </Link>
          </div>

          <div className="px-2 py-1.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-[11px] font-semibold text-gold-700 dark:text-gold-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
              <span>{isTechnical ? 'Technical Console' : 'Media Dashboard'}</span>
            </div>
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-gold-500/20">
              {user?.role}
            </span>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-gold-500 text-white shadow-md'
                      : 'text-plum-800 dark:text-ivory-200 hover:bg-gold-500/10 hover:text-gold-600'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="pt-4 border-t border-ivory-200 dark:border-plum-800 space-y-3">
          <div className="px-2 text-xs">
            <div className="font-bold text-plum-950 dark:text-ivory-50 truncate">{user?.name}</div>
            <div className="text-[10px] text-gray-500 truncate">{user?.email}</div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-1 py-2 px-3 text-[11px] font-semibold rounded-xl border border-ivory-300 dark:border-plum-800 hover:bg-ivory-200 dark:hover:bg-plum-800 text-plum-800 dark:text-ivory-200"
            >
              <ExternalLink className="w-3 h-3" />
              <span>View Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-ivory-200 dark:border-plum-800 bg-white/80 dark:bg-plum-900/80">
          <Link to="/">
            <AnvayaLogo size="sm" showText={true} />
          </Link>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg border border-ivory-300 dark:border-plum-800 text-plum-900 dark:text-ivory-100"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileSidebarOpen && (
          <div className="lg:hidden p-4 bg-white dark:bg-plum-900 border-b border-ivory-200 dark:border-plum-800 space-y-2">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                  location.pathname === item.path ? 'bg-gold-500 text-white' : 'text-plum-900 dark:text-ivory-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-ivory-200 dark:border-plum-800 flex justify-between items-center">
              <Link to="/" className="text-xs text-gold-600 font-semibold">
                Back to Public Site
              </Link>
              <button onClick={handleLogout} className="text-xs text-red-500 font-semibold">
                Logout
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
