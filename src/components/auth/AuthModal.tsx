import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, BookOpen, GraduationCap, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AnvayaLogo } from '../common/AnvayaLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
  onSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration fields
  const [name, setName] = useState('');
  const [usn, setUsn] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState('ISE');
  const [semester, setSemester] = useState('6th Semester');
  const [regPassword, setRegPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login, signup } = useAuth();
  const { success, error } = useToast();

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identifier || !password) {
      setErrorMsg('Please enter your USN or Email, and your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(identifier, password);
      if (res.success) {
        success('Logged in successfully!');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name || !usn || !email || !regPassword) {
      setErrorMsg('Full Name, USN, College Email, and Password are required.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await signup({
        name,
        usn: usn.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        password: regPassword,
        branch,
        semester,
      });

      if (res.success) {
        success('Account created! Welcome to Anvaya.');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-plum-900 rounded-3xl border border-ivory-300 dark:border-plum-800 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-plum-600 dark:text-ivory-300 hover:bg-ivory-200 dark:hover:bg-plum-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 text-center border-b border-ivory-200 dark:border-plum-800/80 bg-ivory-50/50 dark:bg-plum-950/40">
          <div className="flex justify-center mb-2">
            <AnvayaLogo size="sm" />
          </div>
          <h3 className="text-xl font-serif font-bold text-plum-950 dark:text-ivory-50">
            {tab === 'login' ? 'Sign In to Anvaya' : 'Student Registration'}
          </h3>
          <p className="text-xs text-plum-600 dark:text-ivory-300 mt-1">
            ISE Department · Kalpataru Institute of Technology
          </p>

          {/* Tab Switcher */}
          <div className="flex p-1 mt-4 rounded-xl bg-ivory-200/80 dark:bg-plum-800/60">
            <button
              type="button"
              onClick={() => { setTab('login'); setErrorMsg(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-white dark:bg-plum-900 text-plum-950 dark:text-ivory-50 shadow-sm'
                  : 'text-plum-700 dark:text-ivory-300 hover:text-plum-950 dark:hover:text-ivory-100'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setErrorMsg(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-white dark:bg-plum-900 text-plum-950 dark:text-ivory-50 shadow-sm'
                  : 'text-plum-700 dark:text-ivory-300 hover:text-plum-950 dark:hover:text-ivory-100'
              }`}
            >
              New Student
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                  USN or Email Address
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-plum-400 dark:text-ivory-400" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="Enter your USN or College Email"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-plum-400 dark:text-ivory-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-gold-600 to-saffron-500 hover:from-gold-500 hover:to-saffron-600 shadow-md shadow-gold-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>Sign In</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Adithya K S"
                  className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    University Seat No. (USN)
                  </label>
                  <input
                    type="text"
                    value={usn}
                    onChange={e => setUsn(e.target.value.toUpperCase())}
                    placeholder="1KI22IS001"
                    className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs uppercase focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={e => setSemester(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@kit-tiptur.ac.in"
                  className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                  Password (min. 6 characters)
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-gold-600 to-saffron-500 hover:from-gold-500 hover:to-saffron-600 shadow-md shadow-gold-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Create Student Account</span>
              </button>
            </form>
          )}

          <div className="mt-5 pt-4 text-center border-t border-ivory-200 dark:border-plum-800/80">
            <span className="text-[11px] text-plum-500 dark:text-ivory-400">
              Technical Coordinator or Admin?{' '}
              <a href="/admin/login" className="text-gold-600 dark:text-gold-400 font-semibold hover:underline">
                Go to Administrative Portal
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
