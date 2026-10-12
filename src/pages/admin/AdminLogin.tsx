import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  User as UserIcon,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  Database,
  ArrowRight,
} from 'lucide-react';
import { AnvayaLogo } from '../../components/common/AnvayaLogo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const AdminLogin: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Setup availability check
  const [setupAvailable, setSetupAvailable] = useState<boolean>(false);
  const [databaseConnected, setDatabaseConnected] = useState<boolean | null>(null);
  const [dbMessage, setDbMessage] = useState<string>('');

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const checkSetupStatus = async () => {
      try {
        const res = await api.auth.getSetupStatus();
        if (isMounted) {
          setSetupAvailable(res.setupAvailable);
          setDatabaseConnected(res.databaseConnected);
          if (res.message) setDbMessage(res.message);
        }
      } catch (err: any) {
        if (isMounted) {
          setSetupAvailable(false);
          setDatabaseConnected(false);
          setDbMessage(err.message || 'Unable to connect to the backend server. Please verify your backend deployment.');
        }
      }
    };

    checkSetupStatus();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      error('Please enter your USN or Email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(identifier.trim(), password);
      if (res.success) {
        success('Welcome to the Anvaya Administration Dashboard.');
        navigate('/admin');
      } else {
        error(res.message);
      }
    } catch (err: any) {
      error(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-2xl space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="inline-block p-2 rounded-2xl bg-ivory-100 dark:bg-plum-950/70 border border-ivory-300 dark:border-plum-800 mb-2">
            <AnvayaLogo size="md" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-plum-950 dark:text-ivory-50">
            Administrative Portal
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-sans">
            Cultural Committee · Department of ISE · KIT Tiptur
          </p>
        </div>

        {/* Database Notice if disconnected */}
        {databaseConnected === false && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
              <Database className="w-3.5 h-3.5 text-amber-600" />
              <span>Database Connection Required</span>
            </div>
            <p className="text-[10px] text-amber-700/90 dark:text-amber-300/80">
              {dbMessage || 'Please configure MONGODB_URI in your .env file with your MongoDB Atlas connection string to enable authentication.'}
            </p>
          </div>
        )}

        {/* Initial Setup Available Banner (shown ONLY when first-time setup is genuine) */}
        {setupAvailable && databaseConnected !== false && (
          <div className="p-3.5 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-gold-900 dark:text-gold-200 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-gold-800 dark:text-gold-300">
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span>First-Time Setup Available</span>
            </div>
            <p className="text-[11px] text-gold-800/90 dark:text-gold-300/80 leading-relaxed">
              No Technical Administrator account exists yet. Create your personal master account via the one-time setup portal.
            </p>
            <Link
              to="/admin/setup"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-plum-900 dark:text-gold-300 hover:underline pt-1"
            >
              <span>Initialize Technical Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
              USN or Institutional Email
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="Enter USN (e.g. 1KI22IS001) or Email"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
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

          <button
            type="submit"
            disabled={loading || databaseConnected === false}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-gold-600 via-saffron-500 to-gold-500 hover:from-gold-500 hover:to-saffron-600 shadow-md transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-gray-500 dark:text-gray-400 space-y-2">
          <p>
            Authorized committee members only. All authentication attempts are logged for security.
          </p>
          <div>
            <Link to="/" className="text-plum-700 dark:text-ivory-300 hover:underline">
              ← Return to Anvaya Public Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
