export interface RoleDefinition {
  key: string;
  name: string;
  designation: string;
  description: string;
  category: 'committee' | 'system';
  isAdministrative: boolean;
}

export const COMMITTEE_ROLES: RoleDefinition[] = [
  {
    key: 'president',
    name: 'President',
    designation: 'President',
    description: 'Executive student leadership of Anvaya Cultural Committee',
    category: 'committee',
    isAdministrative: false,
  },
  {
    key: 'vice-president',
    name: 'Vice President',
    designation: 'Vice President',
    description: 'Vice executive leadership and committee operations',
    category: 'committee',
    isAdministrative: false,
  },
  {
    key: 'secretary',
    name: 'Secretary',
    designation: 'Secretary',
    description: 'Official committee correspondence, records, and documentation',
    category: 'committee',
    isAdministrative: false,
  },
  {
    key: 'treasurer',
    name: 'Treasurer',
    designation: 'Treasurer',
    description: 'Financial accounting, budgets, and cultural sponsorships',
    category: 'committee',
    isAdministrative: false,
  },
  {
    key: 'speaker',
    name: 'Speaker',
    designation: 'Speaker',
    description: 'Student assembly representation, announcements, and hosting',
    category: 'committee',
    isAdministrative: false,
  },
  {
    key: 'cultural',
    name: 'Cultural',
    designation: 'Cultural',
    description: 'Cultural coordination, artistic curation, and performing arts',
    category: 'committee',
    isAdministrative: false,
  },
  {
    key: 'sports',
    name: 'Sports',
    designation: 'Sports',
    description: 'Sports activities and athletic event coordination',
    category: 'committee',
    isAdministrative: false,
  },
  {
    key: 'event-management',
    name: 'Event Management',
    designation: 'Event Management',
    description: 'Stage logistics, event planning, and venue management',
    category: 'committee',
    isAdministrative: false,
  },
];

export const SYSTEM_ROLES: RoleDefinition[] = [
  {
    key: 'technical',
    name: 'Technical',
    designation: 'Technical Administrator',
    description: 'Superuser with full administrative privileges across all modules',
    category: 'system',
    isAdministrative: true,
  },
  {
    key: 'media-poster',
    name: 'Media Poster',
    designation: 'Media Coordinator',
    description: 'Gallery coordinator with permissions to upload and publish media albums',
    category: 'system',
    isAdministrative: false,
  },
  {
    key: 'student',
    name: 'Student',
    designation: 'Student Member',
    description: 'General student member with public viewing and personal project features',
    category: 'system',
    isAdministrative: false,
  },
];

export const ALL_STANDARD_ROLES = [...COMMITTEE_ROLES, ...SYSTEM_ROLES];
export const COMMITTEE_ROLE_KEYS = COMMITTEE_ROLES.map(r => r.key);
export const ALL_STANDARD_ROLE_KEYS = ALL_STANDARD_ROLES.map(r => r.key);

export const normalizeRoleKey = (role: string): string => {
  return (role || '').trim().toLowerCase().replace(/\s+/g, '-');
};

export const isCommitteeRole = (role: string): boolean => {
  const normalized = normalizeRoleKey(role);
  return COMMITTEE_ROLE_KEYS.includes(normalized);
};

export const isAdministrativeRole = (role: string): boolean => {
  const normalized = normalizeRoleKey(role);
  return normalized === 'technical' || normalized === 'admin';
};

export const getRoleDefinition = (role: string): RoleDefinition | undefined => {
  const normalized = normalizeRoleKey(role);
  return ALL_STANDARD_ROLES.find(r => r.key === normalized);
};

export const formatRoleDesignation = (role: string, appRole?: string): string => {
  if (role && role.trim()) {
    const match = ALL_STANDARD_ROLES.find(
      r => r.key === normalizeRoleKey(role) || r.name.toLowerCase() === role.trim().toLowerCase()
    );
    if (match) return match.designation;
    return role.trim();
  }
  if (appRole) {
    const match = ALL_STANDARD_ROLES.find(r => r.key === normalizeRoleKey(appRole));
    if (match) return match.designation;
    return appRole;
  }
  return 'Committee Member';
};
