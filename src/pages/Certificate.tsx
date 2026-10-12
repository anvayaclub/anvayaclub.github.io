import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Award,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  FileCheck2,
  Lock,
} from 'lucide-react';
import { AnvayaLogo } from '../components/common/AnvayaLogo';
import { CertificatePreview, VerifiedCertificateData } from '../components/certificate/CertificatePreview';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const Certificate: React.FC = () => {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(true);

  // Form inputs
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [fullName, setFullName] = useState('');
  const [usn, setUsn] = useState('');

  // Verification state
  const [verifying, setVerifying] = useState(false);
  const [verifiedData, setVerifiedData] = useState<VerifiedCertificateData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { success, error } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.usn) setUsn(user.usn);
    }
  }, [user]);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const res = await api.certificates.getActiveConfigs();
        if (res.success && res.data.length > 0) {
          setConfigs(res.data);
          setSelectedConfigId(res.data[0]._id || res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load active certificate events:', err);
      } finally {
        setLoadingConfigs(false);
      }
    };

    fetchConfigs();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setVerifiedData(null);

    if (!selectedConfigId || !fullName || !usn) {
      error('Please select an event and enter both your Full Name and USN.');
      return;
    }

    setVerifying(true);
    try {
      const res = await api.certificates.verify({
        configId: selectedConfigId,
        fullName: fullName.trim(),
        usn: usn.trim().toUpperCase(),
      });

      if (res.success && res.data) {
        setVerifiedData(res.data);
        success('Certificate verified successfully!');
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.5 } });
      } else {
        setErrorMessage(res.message || 'Verification failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'No authorized participant record was found matching these credentials.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* 1. HERO SECTION WITH LOGO PROMINENTLY ON THE LEFT */}
      <section className="p-8 sm:p-12 rounded-3xl bg-ivory-100 dark:bg-plum-900/90 border border-ivory-300 dark:border-plum-800 shadow-md">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Logo prominently on the LEFT side as specified in Section 10 */}
          <div className="flex-shrink-0 p-5 rounded-2xl bg-white dark:bg-plum-950/80 border border-ivory-300 dark:border-plum-800 shadow-sm flex items-center justify-center">
            <AnvayaLogo size="xl" />
          </div>

          {/* Hero text & title */}
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-700 dark:text-gold-400 text-xs font-semibold uppercase tracking-wider font-sans">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cryptographic Verification Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-extrabold text-plum-950 dark:text-ivory-50 tracking-tight">
              Anvaya Certificate Portal
            </h1>

            <p className="text-sm sm:text-base text-plum-800 dark:text-ivory-200 leading-relaxed font-sans max-w-2xl">
              Authentic participation and merit certificates issued by the Anvaya Cultural Committee, Department of Information Science & Engineering, Kalpataru Institute of Technology, Tiptur.
            </p>

            {/* Visual Indicators */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-500" />
                <span>Instant PDF & PNG Downloads</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-gold-500" />
                <span>Unique Cryptographic ID</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-peacock-500" />
                <span>Faculty Authorized Signatures</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PARTICIPANT VERIFICATION FORM */}
      <section className="max-w-3xl mx-auto">
        <div className="p-8 rounded-3xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-lg space-y-6">
          <div>
            <h2 className="text-xl font-serif font-bold text-plum-950 dark:text-ivory-50">
              Participant Certificate Verification
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select your programme and enter your name and USN exactly as recorded during event registration.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4 text-xs">
            {/* Event Selection */}
            <div>
              <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                Select Cultural Programme *
              </label>
              {loadingConfigs ? (
                <div className="py-2 text-gray-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gold-500" />
                  <span>Loading available events...</span>
                </div>
              ) : configs.length > 0 ? (
                <select
                  required
                  value={selectedConfigId}
                  onChange={e => setSelectedConfigId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                >
                  {configs.map(cfg => (
                    <option key={cfg._id || cfg.id} value={cfg._id || cfg.id}>
                      {cfg.eventTitle} ({cfg.eventDate})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 rounded-xl bg-gray-100 dark:bg-plum-950 text-gray-400">
                  No events with certificates currently enabled.
                </div>
              )}
            </div>

            {/* Full Name & USN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                  Participant Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Adithya K S"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                  University Seat Number (USN) *
                </label>
                <input
                  type="text"
                  required
                  value={usn}
                  onChange={e => setUsn(e.target.value.toUpperCase())}
                  placeholder="1KI22IS001"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-plum-950 dark:text-ivory-50 font-mono uppercase"
                />
              </div>
            </div>

            {/* Action button */}
            <button
              type="submit"
              disabled={verifying || configs.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-gold-600 via-saffron-500 to-gold-500 hover:from-gold-500 hover:to-saffron-600 shadow-md transition-all disabled:opacity-50"
            >
              {verifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>{verifying ? 'Verifying Participant Record...' : 'Verify & Get Certificate'}</span>
            </button>
          </form>

          {/* Error Message Feedback */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Verification Unsuccessful</div>
                <div className="mt-0.5 leading-relaxed">{errorMessage}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. VERIFIED CERTIFICATE DISPLAY & DOWNLOAD */}
      {verifiedData && (
        <section className="space-y-4">
          <CertificatePreview data={verifiedData} />
        </section>
      )}
    </div>
  );
};
