import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  User as UserIcon,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Database,
  ArrowRight,
} from 'lucide-react';
import { AnvayaLogo } from '../../components/common/AnvayaLogo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const AdminSetup: React.FC = () => {
  const [name, setName] = useState('');
  const [usn, setUsn] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [checkingStatus, setCheckingStatus] = useState(true);
  const [setupAvailable, setSetupAvailable] = useState<boolean | null>(null);
  const [databaseConnected, setDatabaseConnected] = useState<boolean | null>(null);
  const [dbMessage, setDbMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const { setupTechnicalAdmin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Check setup status on mount
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      try {
        const res = await api.auth.getSetupStatus();
        if (isMounted) {
          setSetupAvailable(res.setupAvailable);
          setDatabaseConnected(res.databaseConnected);
          if (res.message) setDbMessage(res.message);

          // If setup is already complete and DB connected, redirect to login
          if (res.databaseConnected && !res.setupAvailable) {
            navigate('/admin/login', { replace: true });
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setSetupAvailable(false);
          setDatabaseConnected(false);
          setDbMessage(err.message || 'Unable to connect to backend server.');
        }
      } finally {
        if (isMounted) setCheckingStatus(false);
      }
    };

    checkStatus();
    return () => { isMounted = false; };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      error('Please enter your full name.');
      return;
    }

    const cleanUsn = usn.trim().toUpperCase();
    if (!cleanUsn) {
      error('Please enter your USN.');
      return;
    }

    if (cleanUsn.length !== 10) {
      error('Please enter a valid 10-character USN (e.g., 1KI22IS001).');
      return;
    }

    if (password.length < 8) {
      error('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      error('Passwords do not match. Please re-enter.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await setupTechnicalAdmin({
        name: name.trim(),
        usn: cleanUsn,
        email: email.trim() ? email.trim() : undefined,
        password,
        confirmPassword,
      });

      if (res.success) {
        success('Technical Administrator account created! Welcome to the Anvaya Administration Portal.');
        navigate('/admin');
      } else {
        error(res.message);
      }
    } catch (err: any) {
      error(err.message || 'Setup request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
        <p className="text-xs text-gray-500 font-sans">Checking system initialization status...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl p-8 rounded-3xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-block p-2 rounded-2xl bg-ivory-100 dark:bg-plum-950/70 border border-ivory-300 dark:border-plum-800 mb-2">
            <AnvayaLogo size="md" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-700 dark:text-gold-300 text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>One-Time System Initialization</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-plum-950 dark:text-ivory-50">
            Initial Technical Administrator Setup
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-sans max-w-md mx-auto">
            Create your official Anvaya master account. Once this primary technical account is established, public setup will be permanently locked.
          </p>
        </div>

        {/* Database Status Alert */}
        {databaseConnected === false && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-xs text-amber-800 dark:text-amber-300">
              <Database className="w-4 h-4 shrink-0 text-amber-600" />
              <span>MongoDB Atlas Connection Required</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-700/90 dark:text-amber-300/80">
              {dbMessage || 'Account persistence requires a connected MongoDB instance. Please configure MONGODB_URI in your .env file with your MongoDB Atlas connection string.'}
            </p>
          </div>
        )}

        {/* Setup Already Initialized Message */}
        {setupAvailable === false && databaseConnected === true && (
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200 space-y-3 text-center">
            <div className="flex items-center justify-center gap-2 font-semibold text-xs text-blue-800 dark:text-blue-300">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Initial Setup Already Completed</span>
            </div>
            <p className="text-xs text-blue-700/90 dark:text-blue-300/80">
              A primary Technical Administrator account is already configured for Anvaya. Public bootstrap is permanently disabled.
            </p>
            <div>
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-plum-800 hover:bg-plum-700"
              >
                <span>Proceed to Administrative Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Setup Form */}
        {setupAvailable !== false && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Adithya K S"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                />
              </div>
            </div>

            {/* USN & Email Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                  College USN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={usn}
                  onChange={e => setUsn(e.target.value.toUpperCase())}
                  placeholder="1KI22IS001"
                  className="w-full px-3 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50 font-mono"
                />
                <p className="text-[10px] text-gray-400 mt-1">Unique student identifier</p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                  Institutional Email (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="yourname@kit-tiptur.ac.in"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">For account notifications</p>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                  Master Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-2.5 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3 rounded-xl bg-ivory-100 dark:bg-plum-950/60 border border-ivory-200 dark:border-plum-800 text-[11px] text-gray-600 dark:text-gray-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
              <span>
                The server will hash your password securely with bcrypt and irrevocably assign the <strong>Technical Administrator</strong> role to this account.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || databaseConnected === false}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-gold-600 via-saffron-500 to-gold-500 hover:from-gold-500 hover:to-saffron-600 shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>{submitting ? 'Creating Technical Account...' : 'Complete Technical Setup & Enter Dashboard'}</span>
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            to="/admin/login"
            className="text-xs text-plum-700 dark:text-ivory-300 hover:underline"
          >
            Already initialized? Go to Administrative Sign In →
          </Link>
        </div>
      </div>
    </div>
  );
};
