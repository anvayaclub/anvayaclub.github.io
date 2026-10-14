import React, { useState, useEffect } from 'react';
import { Vote, Trophy, CheckCircle2, Loader2, Sparkles, RefreshCw, AlertCircle, BarChart3 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface NomineeWithVotes {
  id: string;
  name: string;
  title: string;
  voteCount: number;
}

interface EventLivePollProps {
  eventId: string;
  eventTitle: string;
}

export const EventLivePoll: React.FC<EventLivePollProps> = ({ eventId, eventTitle }) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [poll, setPoll] = useState<{
    isOpen: boolean;
    title: string;
    nominees: NomineeWithVotes[];
  } | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [userVotedFor, setUserVotedFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [studentUsn, setStudentUsn] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPoll = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await api.events.getPoll(eventId);
      if (res.success && res.data?.poll) {
        setPoll(res.data.poll);
        setTotalVotes(res.data.totalVotes || 0);
        if (res.data.userVotedFor) {
          setUserVotedFor(res.data.userVotedFor);
        }
      } else {
        setPoll(null);
      }
    } catch (err: any) {
      if (!silent) {
        console.error('Failed to load live poll:', err);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPoll();
    // Auto-refresh poll results every 12 seconds when poll is active
    const interval = setInterval(() => {
      fetchPoll(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [eventId]);

  useEffect(() => {
    if (user?.usn) {
      setStudentUsn(user.usn);
    }
  }, [user]);

  const handleVote = async (nomineeId: string) => {
    const voterUsn = user?.usn || studentUsn.trim().toUpperCase();
    if (!voterUsn) {
      error('Please enter your college USN to cast your vote.');
      return;
    }

    setVotingId(nomineeId);
    try {
      const res = await api.events.votePoll(eventId, { nomineeId, usn: voterUsn });
      if (res.success) {
        success('Your vote has been cast successfully!');
        setUserVotedFor(nomineeId);
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
        fetchPoll(true);
      }
    } catch (err: any) {
      error(err.message || 'Failed to submit your vote.');
    } finally {
      setVotingId(null);
    }
  };

  if (loading) {
    return null;
  }

  if (!poll || !poll.nominees || poll.nominees.length === 0) {
    return null;
  }

  // Find leading nominee
  const sortedNominees = [...poll.nominees].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
  const leadingNominee = sortedNominees[0];
  const hasVotes = totalVotes > 0;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-ivory-50 via-white to-ivory-100 dark:from-plum-950 dark:via-plum-900/90 dark:to-plum-950 border-2 border-gold-500/30 shadow-xl overflow-hidden space-y-6 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory-200 dark:border-plum-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-gold-500/15 text-gold-600 dark:text-gold-400">
              <Vote className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
              Live Audience Voting
            </span>
            {poll.isOpen ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Now
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-500/15 text-gray-500 border border-gray-500/30">
                Poll Closed
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-plum-950 dark:text-ivory-50">
            {poll.title || 'Audience Choice Award'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {poll.isOpen
              ? 'Vote in real time for your favorite participant or team. 1 vote per student USN.'
              : 'Voting has concluded. Official audience choice final tally below.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-plum-950 dark:text-ivory-50">
              {totalVotes} {totalVotes === 1 ? 'Vote' : 'Total Votes'}
            </div>
            <div className="text-[10px] text-gray-400">
              {poll.isOpen ? 'Updates in real-time' : 'Final Results'}
            </div>
          </div>
          <button
            onClick={() => fetchPoll(true)}
            disabled={isRefreshing}
            title="Refresh poll results"
            className="p-2 rounded-xl bg-ivory-200 dark:bg-plum-800 text-plum-900 dark:text-ivory-100 hover:text-gold-500 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Winner Spotlight Banner if Poll Closed & Winner exists */}
      {!poll.isOpen && hasVotes && leadingNominee && leadingNominee.voteCount > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-gold-500/20 via-saffron-500/15 to-gold-500/20 border border-gold-500/40 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gold-500 text-white shadow-md">
            <Trophy className="w-6 h-6 text-plum-950" />
          </div>
          <div className="space-y-0.5">
            <div className="text-[11px] font-mono uppercase tracking-wider font-bold text-gold-700 dark:text-gold-300">
              Audience Choice Winner
            </div>
            <div className="text-base font-serif font-bold text-plum-950 dark:text-ivory-50">
              {leadingNominee.name} — <span className="font-sans font-medium text-sm text-plum-700 dark:text-ivory-200">{leadingNominee.title}</span>
            </div>
            <div className="text-xs text-gold-800 dark:text-gold-300">
              Secured first place with {leadingNominee.voteCount} votes ({Math.round((leadingNominee.voteCount / totalVotes) * 100)}% of the audience).
            </div>
          </div>
        </div>
      )}

      {/* USN entry box if voting is open and user not logged in */}
      {poll.isOpen && !user?.usn && !userVotedFor && (
        <div className="p-4 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-semibold text-plum-950 dark:text-ivory-50">
              Enter Student USN to Vote
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-[11px]">
              Every KIT student gets 1 verified vote.
            </div>
          </div>
          <input
            type="text"
            placeholder="e.g. 1KI22IS045"
            value={studentUsn}
            onChange={(e) => setStudentUsn(e.target.value.toUpperCase())}
            className="w-full sm:w-48 px-3 py-2 rounded-xl bg-white dark:bg-plum-900 border border-ivory-300 dark:border-plum-700 text-plum-950 dark:text-ivory-50 font-mono text-xs uppercase focus:outline-none focus:ring-2 focus:ring-gold-500/40"
          />
        </div>
      )}

      {/* Already Voted Banner */}
      {userVotedFor && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>
            You have cast your vote for <strong>{poll.nominees.find(n => n.id === userVotedFor)?.name || 'your selected nominee'}</strong>. Live results are reflected below.
          </span>
        </div>
      )}

      {/* Nominees Grid / Vote Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {poll.nominees.map((nominee) => {
          const voteCount = nominee.voteCount || 0;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const isSelected = userVotedFor === nominee.id;
          const isWinner = !poll.isOpen && leadingNominee?.id === nominee.id && voteCount > 0;

          return (
            <div
              key={nominee.id}
              className={`p-5 rounded-2xl border transition-all space-y-3.5 relative overflow-hidden ${
                isSelected
                  ? 'bg-gold-500/10 border-gold-500 shadow-md ring-2 ring-gold-500/30'
                  : isWinner
                  ? 'bg-gold-500/15 border-gold-500/60'
                  : 'bg-white dark:bg-plum-900 border-ivory-200 dark:border-plum-800 hover:border-gold-500/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-sm font-serif font-bold text-plum-950 dark:text-ivory-50 flex items-center gap-1.5">
                    <span>{nominee.name}</span>
                    {isWinner && <Trophy className="w-4 h-4 text-gold-500 flex-shrink-0" />}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {nominee.title}
                  </div>
                </div>

                {isSelected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    Voted
                  </span>
                ) : poll.isOpen && !userVotedFor ? (
                  <button
                    onClick={() => handleVote(nominee.id)}
                    disabled={votingId !== null}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gold-600 hover:bg-gold-500 shadow-sm transition-all disabled:opacity-50"
                  >
                    {votingId === nominee.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Vote className="w-3 h-3" />
                    )}
                    <span>Vote</span>
                  </button>
                ) : null}
              </div>

              {/* Vote Percentage Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-gray-500 dark:text-gray-400">
                    {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                  </span>
                  <span className="font-bold text-plum-950 dark:text-ivory-50">
                    {percentage}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-ivory-200 dark:bg-plum-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isSelected
                        ? 'bg-gradient-to-r from-gold-600 to-saffron-500'
                        : isWinner
                        ? 'bg-gradient-to-r from-gold-500 to-gold-400'
                        : 'bg-gold-500/70'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
