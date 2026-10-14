import React, { useState, useEffect } from 'react';
import {
  Award,
  Trophy,
  Star,
  CheckCircle2,
  Lock,
  Search,
  Sparkles,
  Users,
  ShieldCheck,
  Calendar,
  X,
  Loader2,
  Flame,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CulturalCreditsData, LeaderboardEntry } from '../../types';

interface CulturalCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUsn?: string;
}

export const CulturalCreditsModal: React.FC<CulturalCreditsModalProps> = ({
  isOpen,
  onClose,
  initialUsn = '',
}) => {
  const { user } = useAuth();
  const { error } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'leaderboard'>('profile');
  const [usnInput, setUsnInput] = useState(initialUsn || user?.usn || '');
  const [creditsData, setCreditsData] = useState<CulturalCreditsData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const fetchCredits = async (targetUsn: string) => {
    if (!targetUsn.trim()) return;
    setLoading(true);
    try {
      const res = await api.credits.getStudentCredits(targetUsn.trim().toUpperCase());
      if (res.success && res.data) {
        setCreditsData(res.data);
      }
    } catch (err: any) {
      error(err.message || 'No credits record found for this USN.');
      setCreditsData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await api.credits.getLeaderboard();
      if (res.success && res.data) {
        setLeaderboard(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const defaultUsn = initialUsn || user?.usn || '1KI22IS001';
      setUsnInput(defaultUsn);
      fetchCredits(defaultUsn);
      fetchLeaderboard();
    }
  }, [isOpen, initialUsn, user]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCredits(usnInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white dark:bg-plum-900 rounded-3xl border border-ivory-300 dark:border-plum-800 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-ivory-200 dark:border-plum-800 flex items-center justify-between bg-gradient-to-r from-ivory-50 via-white to-ivory-50 dark:from-plum-950 dark:via-plum-900 dark:to-plum-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gold-500/15 text-gold-600 dark:text-gold-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-plum-950 dark:text-ivory-50">
                Cultural Credits & Gamified Badges
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Recognizing student active participation, performance & leadership
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab switch */}
            <div className="p-1 rounded-xl bg-ivory-200 dark:bg-plum-800 flex text-xs">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-white dark:bg-plum-900 text-plum-950 dark:text-ivory-50 shadow-sm'
                    : 'text-gray-500 hover:text-plum-900 dark:hover:text-ivory-100'
                }`}
              >
                My Badges
              </button>
              <button
                onClick={() => {
                  setActiveTab('leaderboard');
                  if (leaderboard.length === 0) fetchLeaderboard();
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'leaderboard'
                    ? 'bg-white dark:bg-plum-900 text-plum-950 dark:text-ivory-50 shadow-sm'
                    : 'text-gray-500 hover:text-plum-900 dark:hover:text-ivory-100'
                }`}
              >
                Honor Roll
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-ivory-200 dark:hover:bg-plum-800 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'profile' ? (
            <>
              {/* USN Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-2 text-xs">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={usnInput}
                    onChange={(e) => setUsnInput(e.target.value.toUpperCase())}
                    placeholder="Enter Student USN (e.g. 1KI22IS001)"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 font-mono uppercase text-plum-950 dark:text-ivory-50 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
                </div>
                <button
                  type="submit"
                  disabled={loading || !usnInput.trim()}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gold-600 hover:bg-gold-500 shadow transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Check Credits</span>
                </button>
              </form>

              {loading ? (
                <div className="py-16 text-center text-xs text-gray-400">
                  <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-2" />
                  Calculating student cultural credits and verifying badges...
                </div>
              ) : creditsData ? (
                <div className="space-y-6">
                  {/* Student Hero Banner */}
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-gold-500/15 via-saffron-500/10 to-transparent border border-gold-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-gold-700 dark:text-gold-400 font-bold">
                        Student Cultural Profile
                      </div>
                      <h4 className="text-xl font-serif font-bold text-plum-950 dark:text-ivory-50">
                        {creditsData.studentName}
                      </h4>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        USN: <span className="font-bold text-gold-600 dark:text-gold-400">{creditsData.usn}</span>
                        {creditsData.isCommitteeMember && (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-purple-500/15 text-purple-700 dark:text-purple-300 font-sans font-semibold">
                            Committee Member
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-plum-900 border border-gold-500/30 text-center shadow-md min-w-[120px]">
                        <div className="text-2xl font-serif font-extrabold text-gold-600 dark:text-gold-400">
                          {creditsData.totalCredits}
                        </div>
                        <div className="text-[10px] uppercase font-mono tracking-wider text-gray-500">
                          Cultural Points
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress to next tier */}
                  {creditsData.nextTier && creditsData.nextTier.remaining > 0 && (
                    <div className="p-4 rounded-2xl bg-ivory-100 dark:bg-plum-950 border border-ivory-200 dark:border-plum-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-plum-900 dark:text-ivory-200">
                          Next Milestone: <strong className="text-gold-600 dark:text-gold-400">{creditsData.nextTier.name}</strong>
                        </span>
                        <span className="font-mono text-gray-500 text-[11px]">
                          {creditsData.nextTier.remaining} points needed
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-ivory-200 dark:bg-plum-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-gold-600 to-saffron-500 transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(((creditsData.nextTier.requiredPoints - creditsData.nextTier.remaining) / creditsData.nextTier.requiredPoints) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Badges Showcase Grid */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-500 font-mono flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-gold-500" />
                      <span>Badges & Accolades ({creditsData.badges.filter(b => b.earned).length} / {creditsData.badges.length} Unlocked)</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {creditsData.badges.map((badge) => {
                        const isEarned = badge.earned;
                        return (
                          <div
                            key={badge.id}
                            className={`p-4 rounded-2xl border transition-all space-y-2 relative overflow-hidden ${
                              isEarned
                                ? 'bg-white dark:bg-plum-900 border-gold-500/40 shadow-md ring-1 ring-gold-500/20'
                                : 'bg-ivory-100/50 dark:bg-plum-950/40 border-ivory-300/40 dark:border-plum-800/40 opacity-70'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="text-2xl">{badge.icon || '🏅'}</span>
                              {isEarned ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  Unlocked
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider bg-gray-500/15 text-gray-500">
                                  <Lock className="w-2.5 h-2.5" />
                                  Locked
                                </span>
                              )}
                            </div>

                            <div>
                              <div className="font-serif font-bold text-sm text-plum-950 dark:text-ivory-50">
                                {badge.name}
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                                {badge.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Points Breakdown Activity */}
                  <div className="p-4 rounded-2xl bg-ivory-50 dark:bg-plum-950 border border-ivory-200 dark:border-plum-800 space-y-3 text-xs">
                    <div className="text-[11px] font-mono uppercase tracking-wider font-bold text-gray-500">
                      Credits Breakdown
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800">
                        <div className="text-base font-bold text-plum-950 dark:text-ivory-50">
                          {creditsData.registrationsCount}
                        </div>
                        <div className="text-[10px] text-gray-400">Registrations (+10)</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800">
                        <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                          {creditsData.attendedCount}
                        </div>
                        <div className="text-[10px] text-gray-400">Attended (+25)</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800">
                        <div className="text-base font-bold text-peacock-600 dark:text-peacock-400">
                          {creditsData.projectsCount}
                        </div>
                        <div className="text-[10px] text-gray-400">Projects (+50)</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800">
                        <div className="text-base font-bold text-purple-600 dark:text-purple-400">
                          {creditsData.isCommitteeMember ? 'Yes' : 'No'}
                        </div>
                        <div className="text-[10px] text-gray-400">Committee (+50)</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-gray-400">
                  Please enter a valid student USN to view cultural credits and badges.
                </div>
              )}
            </>
          ) : (
            /* HONOR ROLL LEADERBOARD TAB */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-serif font-bold text-plum-950 dark:text-ivory-50">
                    Department Cultural Honor Roll
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Top student performers and contributors ranked by verified participation.
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full text-[10px] font-mono font-semibold bg-gold-500/15 text-gold-700 dark:text-gold-400 border border-gold-500/30">
                  Updated Live
                </div>
              </div>

              {loadingLeaderboard ? (
                <div className="py-16 text-center text-xs text-gray-400">
                  <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-2" />
                  Loading leaderboard ranks...
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="rounded-2xl border border-ivory-200 dark:border-plum-800 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-ivory-100 dark:bg-plum-950 text-gray-500 uppercase tracking-wider text-[10px] font-mono border-b border-ivory-200 dark:border-plum-800">
                      <tr>
                        <th className="px-4 py-3 text-center">Rank</th>
                        <th className="px-4 py-3">Student Name</th>
                        <th className="px-4 py-3">USN</th>
                        <th className="px-4 py-3 text-center">Events Attended</th>
                        <th className="px-4 py-3 text-center">Badges</th>
                        <th className="px-4 py-3 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ivory-200 dark:divide-plum-800">
                      {leaderboard.map((item, idx) => (
                        <tr
                          key={item.usn}
                          className={`hover:bg-ivory-50 dark:hover:bg-plum-850/50 transition-colors ${
                            idx === 0
                              ? 'bg-gold-500/10 font-medium'
                              : idx === 1
                              ? 'bg-slate-500/5'
                              : idx === 2
                              ? 'bg-amber-600/5'
                              : ''
                          }`}
                        >
                          <td className="px-4 py-3 text-center">
                            {idx === 0 ? (
                              <span className="text-base" title="1st Place">🥇</span>
                            ) : idx === 1 ? (
                              <span className="text-base" title="2nd Place">🥈</span>
                            ) : idx === 2 ? (
                              <span className="text-base" title="3rd Place">🥉</span>
                            ) : (
                              <span className="font-mono text-gray-400">#{idx + 1}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold text-plum-950 dark:text-ivory-50">
                            {item.name}
                            {item.isCommitteeMember && (
                              <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] bg-purple-500/15 text-purple-700 dark:text-purple-300">
                                Committee
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-gold-600 dark:text-gold-400">
                            {item.usn}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                            {item.attendedCount}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-gold-500/15 text-gold-700 dark:text-gold-400 font-bold">
                              {item.badgesCount}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-serif font-extrabold text-gold-600 dark:text-gold-400 text-sm">
                            {item.totalCredits}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-gray-400">
                  No activity recorded on the honor roll yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
