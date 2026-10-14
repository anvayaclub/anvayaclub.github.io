import { Request, Response } from 'express';
import { isDbConnected } from '../config/db.js';
import { EventRegistration } from '../models/Event.js';
import { Project } from '../models/Project.js';
import { TeamMember } from '../models/TeamMember.js';
import { User } from '../models/User.js';
import { memoryStore } from '../services/store.js';
import { AuthRequest } from '../middleware/auth.js';

export interface BadgeItem {
  id: string;
  name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'purple' | 'diamond';
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

export const calculateBadgesAndPoints = (
  registrationsCount: number,
  attendedCount: number,
  projectsCount: number,
  isCommitteeMember: boolean
) => {
  // Point values:
  // Registration: 10 pts
  // Verified Attendance: 25 pts
  // Project Publication: 50 pts
  // Committee Pillar: 50 pts
  const points =
    registrationsCount * 10 +
    attendedCount * 25 +
    projectsCount * 50 +
    (isCommitteeMember ? 50 : 0);

  const badges: BadgeItem[] = [
    {
      id: 'cultural-explorer',
      name: 'Cultural Explorer',
      tier: 'bronze',
      description: 'Registered for your first cultural festival or event',
      icon: 'Compass',
      earned: registrationsCount >= 1,
    },
    {
      id: 'active-performer',
      name: 'Active Performer',
      tier: 'silver',
      description: 'Attended 2+ departmental cultural sessions or competitions',
      icon: 'Award',
      earned: attendedCount >= 2,
    },
    {
      id: 'cultural-maestro',
      name: 'Cultural Maestro',
      tier: 'gold',
      description: 'Attended 4+ events or accumulated 100+ cultural credits',
      icon: 'Sparkles',
      earned: attendedCount >= 4 || points >= 100,
    },
    {
      id: 'creative-innovator',
      name: 'Creative Innovator',
      tier: 'purple',
      description: 'Submitted an approved technical or creative showcase project',
      icon: 'Lightbulb',
      earned: projectsCount >= 1,
    },
    {
      id: 'committee-pillar',
      name: 'Committee Pillar',
      tier: 'gold',
      description: 'Active committee lead or student coordinator in Anvaya',
      icon: 'Shield',
      earned: isCommitteeMember,
    },
    {
      id: 'anvaya-legend',
      name: 'Anvaya Legend',
      tier: 'diamond',
      description: 'Reached elite milestone with 150+ cultural participation credits',
      icon: 'Crown',
      earned: points >= 150,
    },
  ];

  let nextTier = {
    name: 'Active Performer',
    requiredPoints: 50,
    remaining: Math.max(0, 50 - points),
  };
  if (points >= 150) {
    nextTier = { name: 'Maximum Honor Tier Achieved', requiredPoints: 150, remaining: 0 };
  } else if (points >= 100) {
    nextTier = { name: 'Anvaya Legend', requiredPoints: 150, remaining: 150 - points };
  } else if (points >= 50) {
    nextTier = { name: 'Cultural Maestro', requiredPoints: 100, remaining: 100 - points };
  }

  return { points, badges, nextTier };
};

export const getStudentCredits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rawUsn = req.params.usn || req.user?.usn;

    if (!rawUsn) {
      res.status(400).json({ success: false, message: 'Student USN is required to retrieve credits.' });
      return;
    }

    const usn = rawUsn.trim().toUpperCase();

    if (isDbConnected()) {
      const [regs, projects, teamMembers, userDoc] = await Promise.all([
        EventRegistration.find({ usn }),
        Project.find({ authorUsn: usn, status: 'published' }),
        TeamMember.find({ usn, isActive: true }),
        User.findOne({ usn }),
      ]);

      const registrationsCount = regs.length;
      const attendedCount = regs.filter(r => r.attended).length;
      const projectsCount = projects.length;
      const isCommitteeMember = teamMembers.length > 0;
      const studentName = userDoc?.name || (regs[0]?.fullName) || usn;

      const { points, badges, nextTier } = calculateBadgesAndPoints(
        registrationsCount,
        attendedCount,
        projectsCount,
        isCommitteeMember
      );

      res.json({
        success: true,
        data: {
          usn,
          studentName,
          totalCredits: points,
          registrationsCount,
          attendedCount,
          projectsCount,
          isCommitteeMember,
          badges,
          nextTier,
        },
      });
    } else {
      const regs = memoryStore.eventRegistrations.filter(r => r.usn?.toUpperCase() === usn);
      const projects = memoryStore.projects.filter(p => p.authorUsn?.toUpperCase() === usn && p.status === 'published');
      const teamMembers = memoryStore.teamMembers.filter(t => t.usn?.toUpperCase() === usn && t.isActive !== false);
      const user = memoryStore.users.find(u => u.usn?.toUpperCase() === usn);

      const registrationsCount = regs.length;
      const attendedCount = regs.filter(r => r.attended).length;
      const projectsCount = projects.length;
      const isCommitteeMember = teamMembers.length > 0;
      const studentName = user?.name || (regs[0]?.fullName) || usn;

      const { points, badges, nextTier } = calculateBadgesAndPoints(
        registrationsCount,
        attendedCount,
        projectsCount,
        isCommitteeMember
      );

      res.json({
        success: true,
        data: {
          usn,
          studentName,
          totalCredits: points,
          registrationsCount,
          attendedCount,
          projectsCount,
          isCommitteeMember,
          badges,
          nextTier,
        },
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to calculate cultural credits.' });
  }
};

export const getCreditsLeaderboard = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const [allRegs, allProjects, allTeam] = await Promise.all([
        EventRegistration.find(),
        Project.find({ status: 'published' }),
        TeamMember.find({ isActive: true }),
      ]);

      // Group by USN
      const scoresByUsn: Record<string, { usn: string; name: string; regs: number; attended: number; projects: number; isTeam: boolean }> = {};

      allRegs.forEach(r => {
        if (!r.usn) return;
        if (!scoresByUsn[r.usn]) {
          scoresByUsn[r.usn] = { usn: r.usn, name: r.fullName, regs: 0, attended: 0, projects: 0, isTeam: false };
        }
        scoresByUsn[r.usn].regs += 1;
        if (r.attended) scoresByUsn[r.usn].attended += 1;
      });

      allProjects.forEach(p => {
        if (!p.authorUsn) return;
        if (!scoresByUsn[p.authorUsn]) {
          scoresByUsn[p.authorUsn] = { usn: p.authorUsn, name: p.authorName || p.authorUsn, regs: 0, attended: 0, projects: 0, isTeam: false };
        }
        scoresByUsn[p.authorUsn].projects += 1;
      });

      allTeam.forEach(t => {
        if (!t.usn) return;
        if (!scoresByUsn[t.usn]) {
          scoresByUsn[t.usn] = { usn: t.usn, name: t.name, regs: 0, attended: 0, projects: 0, isTeam: true };
        } else {
          scoresByUsn[t.usn].isTeam = true;
        }
      });

      const leaderboard = Object.values(scoresByUsn).map(item => {
        const { points, badges } = calculateBadgesAndPoints(item.regs, item.attended, item.projects, item.isTeam);
        return {
          usn: item.usn,
          name: item.name,
          totalCredits: points,
          attendedCount: item.attended,
          projectsCount: item.projects,
          isCommitteeMember: item.isTeam,
          badgesCount: badges.filter(b => b.earned).length,
        };
      });

      leaderboard.sort((a, b) => b.totalCredits - a.totalCredits);

      res.json({ success: true, data: leaderboard.slice(0, 15) });
    } else {
      const scoresByUsn: Record<string, { usn: string; name: string; regs: number; attended: number; projects: number; isTeam: boolean }> = {};

      memoryStore.eventRegistrations.forEach(r => {
        if (!r.usn) return;
        if (!scoresByUsn[r.usn]) {
          scoresByUsn[r.usn] = { usn: r.usn, name: r.fullName, regs: 0, attended: 0, projects: 0, isTeam: false };
        }
        scoresByUsn[r.usn].regs += 1;
        if (r.attended) scoresByUsn[r.usn].attended += 1;
      });

      memoryStore.projects.forEach(p => {
        if (!p.authorUsn) return;
        if (!scoresByUsn[p.authorUsn]) {
          scoresByUsn[p.authorUsn] = { usn: p.authorUsn, name: p.authorName || p.authorUsn, regs: 0, attended: 0, projects: 0, isTeam: false };
        }
        scoresByUsn[p.authorUsn].projects += 1;
      });

      memoryStore.teamMembers.forEach(t => {
        if (!t.usn) return;
        if (!scoresByUsn[t.usn]) {
          scoresByUsn[t.usn] = { usn: t.usn, name: t.name, regs: 0, attended: 0, projects: 0, isTeam: true };
        } else {
          scoresByUsn[t.usn].isTeam = true;
        }
      });

      const leaderboard = Object.values(scoresByUsn).map(item => {
        const { points, badges } = calculateBadgesAndPoints(item.regs, item.attended, item.projects, item.isTeam);
        return {
          usn: item.usn,
          name: item.name,
          totalCredits: points,
          attendedCount: item.attended,
          projectsCount: item.projects,
          isCommitteeMember: item.isTeam,
          badgesCount: badges.filter(b => b.earned).length,
        };
      });

      leaderboard.sort((a, b) => b.totalCredits - a.totalCredits);

      res.json({ success: true, data: leaderboard.slice(0, 15) });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve cultural leaderboard.' });
  }
};
