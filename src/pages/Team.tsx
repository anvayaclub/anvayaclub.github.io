import React, { useEffect, useState } from 'react';
import { Mail, Users, Loader2 } from 'lucide-react';
import { LinkedinIcon, GithubIcon, InstagramIcon } from '../components/common/SocialIcons';
import { api } from '../services/api';
import { TeamMember } from '../types';
import { formatRoleDesignation } from '../constants/roles';

export const Team: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await api.team.getAll();
        if (res.success) {
          setMembers(res.data);
        }
      } catch (err) {
        console.error('Failed to load team directory:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Page Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-700 dark:text-gold-400 text-xs font-semibold uppercase tracking-wider font-sans">
          <span>Student Committee & Leadership</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-extrabold text-plum-950 dark:text-ivory-50 tracking-tight">
          Meet the Anvaya Team
        </h1>
        <p className="text-base text-plum-700 dark:text-ivory-200 leading-relaxed font-sans">
          The passionate student leaders and coordinators driving cultural celebrations, student advocacy, and artistic excellence in the ISE Department at KIT Tiptur.
        </p>
      </section>

      {/* Team Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
          <p className="text-xs text-gray-400 font-sans">Loading committee directory...</p>
        </div>
      ) : members.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {members.map(member => (
            <div
              key={member.id}
              id={member.name.toLowerCase().replace(/\s+/g, '-')}
              className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-plum-900/80 border border-ivory-200 dark:border-plum-800 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 to-saffron-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>

              <div>
                {/* Member Avatar / Fallback initials */}
                <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border-2 border-ivory-200 dark:border-plum-750 shadow-md mb-4 bg-ivory-100 dark:bg-plum-850 flex items-center justify-center">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-serif font-bold text-2xl text-gold-600 dark:text-gold-400 bg-gold-500/10">
                      {getInitials(member.name)}
                    </div>
                  )}
                </div>

                {/* Member Details */}
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-serif font-bold text-plum-950 dark:text-ivory-50 tracking-wide group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                    {member.name}
                  </h3>
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold-500/15 text-gold-700 dark:text-gold-300 border border-gold-500/30">
                    {formatRoleDesignation(member.role, member.appRole)}
                  </div>
                  <div className="text-[11px] font-medium text-plum-600 dark:text-ivory-400">
                    {member.academicYear} · ISE Department
                  </div>

                  {member.bio && (
                    <p className="text-xs text-plum-700 dark:text-ivory-300 pt-2 leading-relaxed line-clamp-3">
                      {member.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Social / Contact Links */}
              <div className="pt-4 mt-4 border-t border-ivory-200 dark:border-plum-800 flex items-center justify-center gap-2 text-plum-600 dark:text-ivory-400">
                {member.socialLinks?.linkedin && (
                  <a
                    href={member.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg hover:text-gold-500 hover:bg-gold-500/10 transition-colors"
                    aria-label={`${member.name} on LinkedIn`}
                  >
                    <LinkedinIcon className="w-4 h-4" />
                  </a>
                )}
                {member.socialLinks?.github && (
                  <a
                    href={member.socialLinks.github}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg hover:text-gold-500 hover:bg-gold-500/10 transition-colors"
                    aria-label={`${member.name} on GitHub`}
                  >
                    <GithubIcon className="w-4 h-4" />
                  </a>
                )}
                {member.socialLinks?.instagram && (
                  <a
                    href={member.socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg hover:text-gold-500 hover:bg-gold-500/10 transition-colors"
                    aria-label={`${member.name} on Instagram`}
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                )}
                {member.socialLinks?.email && (
                  <a
                    href={`mailto:${member.socialLinks.email}`}
                    className="p-1.5 rounded-lg hover:text-gold-500 hover:bg-gold-500/10 transition-colors"
                    aria-label={`Email ${member.name}`}
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white/50 dark:bg-plum-900/40 border border-ivory-200 dark:border-plum-800 max-w-lg mx-auto">
          <Users className="w-8 h-8 text-gold-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-plum-950 dark:text-ivory-50">
            No Active Committee Members Found
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Team directory records can be updated through the administration dashboard.
          </p>
        </div>
      )}
    </div>
  );
};
