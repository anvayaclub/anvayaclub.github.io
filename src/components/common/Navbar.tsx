import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Sparkles, ShieldCheck, User as UserIcon, LogOut, ChevronDown, PlusCircle, FolderGit2, Image as ImageIcon } from 'lucide-react';
import { AnvayaLogo } from './AnvayaLogo';
import { ThemeToggle } from './ThemeToggle';
import { SearchModal } from './SearchModal';
import { AuthModal } from '../auth/AuthModal';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const location = useLocation();
  const { user, isAuthenticated, isTechnical, isMediaPoster, isStudent, logout } = useAuth();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Team', path: '/team' },
    { label: 'Events & Calendar', path: '/events' },
    { label: 'Projects', path: '/projects' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Certificate Portal', path: '/certificate' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-ivory-50/90 dark:bg-plum-950/85 border-b border-ivory-200/80 dark:border-plum-850/80 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Identity */}
            <Link
              to="/"
              className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-gold-500/50 rounded-lg p-1"
              aria-label="Anvaya Home"
            >
              <AnvayaLogo size="sm" showText={true} />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Main Navigation">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'text-gold-600 dark:text-gold-400 bg-gold-500/10 font-semibold shadow-sm'
                      : 'text-plum-800 dark:text-ivory-200 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-ivory-200/50 dark:hover:bg-plum-900/60'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions: Search, Theme Toggle, User Portal, Join CTA */}
            <div className="hidden sm:flex items-center gap-2.5">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-gray-500 dark:text-gray-300 hover:text-plum-900 dark:hover:text-ivory-50 bg-ivory-200/60 dark:bg-plum-900/60 border border-ivory-300/60 dark:border-plum-800/80 hover:border-gold-500/40 transition-all"
                title="Search published content (Ctrl+K)"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5 text-gold-500" />
                <span className="hidden xl:inline">Search...</span>
                <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/60 dark:bg-plum-950/60 border border-ivory-300 dark:border-plum-700">
                  ⌘K
                </kbd>
              </button>

              <ThemeToggle />

              {/* User Session Dropdown or Sign In Button */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-ivory-200/80 dark:bg-plum-900 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50 hover:border-gold-500/50 transition-all"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-gold-600 to-saffron-500 text-white flex items-center justify-center text-[10px] font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                    {user.usn && <span className="text-[10px] text-gold-600 dark:text-gold-400 font-mono">({user.usn})</span>}
                    <ChevronDown className="w-3 h-3 text-plum-500 dark:text-ivory-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-plum-900 rounded-2xl border border-ivory-300 dark:border-plum-800 shadow-xl py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-ivory-200 dark:border-plum-800 text-left">
                        <p className="text-xs font-bold text-plum-950 dark:text-ivory-50 truncate">{user.name}</p>
                        <p className="text-[10px] text-plum-600 dark:text-ivory-300 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-gold-500/15 text-gold-700 dark:text-gold-400 uppercase tracking-wider">
                          Role: {user.role}
                        </span>
                      </div>

                      <div className="py-1">
                        {isStudent && (
                          <>
                            <Link
                              to="/projects"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs text-plum-800 dark:text-ivory-200 hover:bg-ivory-100 dark:hover:bg-plum-800/60"
                            >
                              <FolderGit2 className="w-3.5 h-3.5 text-gold-500" />
                              <span>My Projects</span>
                            </Link>
                          </>
                        )}

                        {isMediaPoster && !isTechnical && (
                          <Link
                            to="/admin/gallery"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-plum-800 dark:text-ivory-200 hover:bg-ivory-100 dark:hover:bg-plum-800/60"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-peacock-500" />
                            <span>Gallery Dashboard</span>
                          </Link>
                        )}

                        {isTechnical && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-plum-800 dark:text-ivory-200 hover:bg-ivory-100 dark:hover:bg-plum-800/60"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-ivory-200 dark:border-plum-800">
                        <button
                          onClick={() => { logout(); setUserDropdownOpen(false); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-plum-800 dark:text-ivory-200 hover:text-gold-600 dark:hover:text-gold-400 border border-ivory-300 dark:border-plum-800 bg-white/60 dark:bg-plum-900/60 hover:border-gold-500/40 transition-all"
                >
                  <UserIcon className="w-3.5 h-3.5 text-gold-500" />
                  <span>Sign In</span>
                </button>
              )}

              <Link
                to="/join"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-gold-600 via-saffron-500 to-gold-500 hover:from-gold-500 hover:to-saffron-600 shadow-sm hover:shadow-gold-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Join Anvaya</span>
              </Link>
            </div>

            {/* Mobile menu trigger */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-xl text-plum-700 dark:text-ivory-200 border border-ivory-300/60 dark:border-plum-800"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-plum-900 dark:text-ivory-50 border border-ivory-300/60 dark:border-plum-800"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-ivory-200 dark:border-plum-800 bg-ivory-50/98 dark:bg-plum-950/98 px-4 pt-3 pb-6 space-y-2 animate-slide-up shadow-xl">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-gold-600 dark:text-gold-400 bg-gold-500/10 font-semibold'
                    : 'text-plum-900 dark:text-ivory-100 hover:bg-ivory-200/50 dark:hover:bg-plum-900/60'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-ivory-200 dark:border-plum-800 flex flex-col gap-2">
              {isAuthenticated && user ? (
                <div className="p-3 rounded-xl bg-ivory-200/50 dark:bg-plum-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-plum-950 dark:text-ivory-50">{user.name}</p>
                      <p className="text-[10px] text-gold-600 dark:text-gold-400">{user.usn || user.role}</p>
                    </div>
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="text-xs text-red-500 hover:underline flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                  {isTechnical && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-center py-2 rounded-lg bg-plum-800 text-ivory-50 text-xs font-semibold"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-ivory-300 dark:border-plum-800 text-plum-900 dark:text-ivory-100 bg-white/60 dark:bg-plum-900/60"
                >
                  <UserIcon className="w-4 h-4 text-gold-500" />
                  <span>Student Sign In / Register</span>
                </button>
              )}

              <Link
                to="/join"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-gold-600 to-saffron-500 shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Join Anvaya</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Dialog */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Student Authentication Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};
