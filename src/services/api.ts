const rawApiBase = (import.meta.env.VITE_API_BASE_URL || '').trim();
const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');

function normalizeApiBase(base: string): string {
  if (!base) return isGitHubPages ? '' : '/api';
  // Strip trailing slashes
  const clean = base.replace(/\/+$/, '');
  // If the base URL does not end with /api, append /api
  if (!clean.endsWith('/api')) {
    return `${clean}/api`;
  }
  return clean;
}

const API_BASE = normalizeApiBase(rawApiBase);

export function getToken(): string | null {
  return localStorage.getItem('anvaya_auth_token');
}

export function setToken(token: string): void {
  localStorage.setItem('anvaya_auth_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('anvaya_auth_token');
  localStorage.removeItem('anvaya_auth_user');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // If hosted on GitHub Pages but backend API is not yet configured
  if (isGitHubPages && !rawApiBase) {
    throw new Error(
      'Backend API is not configured for this deployment. Please set the VITE_API_BASE_URL repository secret in GitHub with your deployed backend URL (e.g. https://your-backend.vercel.app/api).'
    );
  }

  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(
        `Backend service unavailable (HTTP ${response.status}). Please verify that your backend API is deployed and reachable at ${API_BASE || 'configured URL'}.`
      );
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message?.includes('fetch')) {
      throw new Error('Unable to connect to the backend server. Please verify your network connection and backend deployment.');
    }
    throw err;
  }
}

export const api = {
  // Authentication & Accounts
  auth: {
    getSetupStatus: () => request<{ success: boolean; setupAvailable: boolean; databaseConnected: boolean; message?: string }>('/auth/setup-status'),
    setup: (body: { name: string; usn: string; email?: string; password: string; confirmPassword: string }) =>
      request<{ success: boolean; token: string; user: any; message: string }>('/auth/setup', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    login: (body: { email?: string; usn?: string; identifier?: string; password: string }) =>
      request<{ success: boolean; token: string; user: any; message: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    registerStudent: (body: { name: string; usn: string; email?: string; password: string; branch?: string; semester?: string }) =>
      request<{ success: boolean; token: string; user: any; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    getMe: () => request<{ success: boolean; user: any }>('/auth/me'),
    getStudents: (search?: string) => {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      return request<{ success: boolean; data: any[] }>(`/users/students${q}`);
    },
  },

  // User Accounts & Privileges Management (Technical only)
  users: {
    getAll: (params?: { search?: string; role?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.search) q.append('search', params.search);
      if (params?.role) q.append('role', params.role);
      if (params?.status) q.append('status', params.status);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request<{ success: boolean; data: any[] }>(`/users${queryStr}`);
    },
    create: (body: any) =>
      request<{ success: boolean; user: any; temporaryPassword?: string; message: string }>('/users', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateRole: (id: string, body: { role: string; reason?: string }) =>
      request<{ success: boolean; message: string; data: any }>(`/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    updateStatus: (id: string, body: { status: 'active' | 'deactivated'; reason?: string }) =>
      request<{ success: boolean; message: string; data: any }>(`/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    resetPassword: (id: string, body?: { temporaryPassword?: string; reason?: string }) =>
      request<{ success: boolean; message: string; temporaryPassword?: string }>(`/users/${id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify(body || {}),
      }),
    update: (id: string, body: { name: string; usn?: string; email: string; branch?: string; semester?: number | string }) =>
      request<{ success: boolean; message: string; data: any }>(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    delete: (id: string, body?: { reason?: string }) =>
      request<{ success: boolean; message: string }>(`/users/${id}`, {
        method: 'DELETE',
        body: JSON.stringify(body || {}),
      }),
  },

  // Audit Logs
  audit: {
    getLogs: () => request<{ success: boolean; data: any[] }>('/audit-logs'),
  },

  // Roles & Access Control
  roles: {
    getAll: () => request<{ success: boolean; data: any[] }>('/roles'),
    getPermissions: () => request<{ success: boolean; data: any[] }>('/roles/permissions'),
    create: (body: any) => request<{ success: boolean; data: any; message: string }>('/roles', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<{ success: boolean; data: any; message: string }>(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<{ success: boolean; message: string }>(`/roles/${id}`, { method: 'DELETE' }),
  },

  // Team
  team: {
    getAll: () => request<{ success: boolean; data: any[] }>('/team'),
    getAdminAll: () => request<{ success: boolean; data: any[] }>('/team/admin'),
    create: (body: any) => request<{ success: boolean; data: any; message: string }>('/team', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<{ success: boolean; data: any; message: string }>(`/team/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<{ success: boolean; message: string }>(`/team/${id}`, { method: 'DELETE' }),
  },

  // Events & Registration
  events: {
    getAll: (params?: { status?: string; category?: string; search?: string; all?: boolean }) => {
      const q = new URLSearchParams();
      if (params?.status) q.append('status', params.status);
      if (params?.category) q.append('category', params.category);
      if (params?.search) q.append('search', params.search);
      if (params?.all) q.append('all', 'true');
      return request<{ success: boolean; data: any[] }>(`/events?${q.toString()}`);
    },
    getBySlug: (slug: string) => request<{ success: boolean; data: any }>(`/events/${slug}`),
    register: (id: string, body: any) =>
      request<{ success: boolean; message: string; data: any }>(`/events/${id}/register`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    getAdminAll: () => request<{ success: boolean; data: any[] }>('/events/admin'),
    create: (body: any) => request<{ success: boolean; data: any; message: string }>('/events', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<{ success: boolean; data: any; message: string }>(`/events/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<{ success: boolean; message: string }>(`/events/${id}`, { method: 'DELETE' }),
    getRegistrations: (id: string) => request<{ success: boolean; data: any[] }>(`/events/${id}/registrations`),
    getRegistrationsExportUrl: (id: string) => `${API_BASE}/events/${id}/registrations/export`,
    verifyTicket: (id: string, body: { ticketCode?: string; usn?: string }) =>
      request<{ success: boolean; message: string; alreadyCheckedIn?: boolean; registration?: any }>(`/events/${id}/verify-ticket`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    sendReminders: (id: string, body?: { customNote?: string }) =>
      request<{ success: boolean; message: string; count?: number }>(`/events/${id}/send-reminders`, {
        method: 'POST',
        body: JSON.stringify(body || {}),
      }),
    getPoll: (id: string, usn?: string) => {
      const q = usn ? `?usn=${encodeURIComponent(usn)}` : '';
      return request<{ success: boolean; data: any }>(`/events/${id}/poll${q}`);
    },
    configurePoll: (id: string, body: { title?: string; isOpen?: boolean; nominees?: any[] }) =>
      request<{ success: boolean; message: string; data: any }>(`/events/${id}/poll`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    votePoll: (id: string, body: { nomineeId: string; usn?: string }) =>
      request<{ success: boolean; message: string; data: any }>(`/events/${id}/poll/vote`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  // Cultural Credits & Badges
  credits: {
    getStudentCredits: (usn: string) => request<{ success: boolean; data: any }>(`/credits/student/${encodeURIComponent(usn)}`),
    getMyCredits: () => request<{ success: boolean; data: any }>('/credits/me'),
    getLeaderboard: () => request<{ success: boolean; data: any[] }>('/credits/leaderboard'),
  },

  // Certificates
  certificates: {
    getActiveConfigs: () => request<{ success: boolean; data: any[] }>('/certificates/configs'),
    verify: (body: { configId: string; fullName: string; usn: string }) =>
      request<{ success: boolean; message: string; data: any }>('/certificates/verify', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    getAdminConfigs: () => request<{ success: boolean; data: any[] }>('/certificates/admin/configs'),
    createConfig: (body: any) => request<{ success: boolean; data: any; message: string }>('/certificates/admin/configs', { method: 'POST', body: JSON.stringify(body) }),
    updateConfig: (id: string, body: any) => request<{ success: boolean; data: any; message: string }>(`/certificates/admin/configs/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteConfig: (id: string, force = false) => request<{ success: boolean; message: string }>(`/certificates/admin/configs/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' }),
    getParticipants: (configId: string, search?: string) => {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      return request<{ success: boolean; data: any[] }>(`/certificates/admin/configs/${configId}/participants${q}`);
    },
    addParticipant: (configId: string, body: { fullName: string; usn: string }) =>
      request<{ success: boolean; data: any; message: string }>(`/certificates/admin/configs/${configId}/participants`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    importParticipants: (configId: string, records: { fullName: string; usn: string }[]) =>
      request<{ success: boolean; message: string; stats: any }>(`/certificates/admin/configs/${configId}/import`, {
        method: 'POST',
        body: JSON.stringify({ records }),
      }),
    toggleRevoke: (participantId: string, body: { isRevoked: boolean; revocationReason?: string }) =>
      request<{ success: boolean; data: any; message: string }>(`/certificates/admin/participants/${participantId}/revoke`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    deleteParticipant: (participantId: string) =>
      request<{ success: boolean; message: string }>(`/certificates/admin/participants/${participantId}`, { method: 'DELETE' }),
    exportBackup: (configId: string) => request<{ success: boolean; backup: any }>(`/certificates/admin/configs/${configId}/backup`),
    syncRegistrations: (configId: string) =>
      request<{ success: boolean; message: string; count: number; totalParticipants?: number }>(`/certificates/admin/configs/${configId}/sync-registrations`, {
        method: 'POST',
      }),
  },

  // Projects
  projects: {
    getAll: (params?: { status?: string; category?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.append('status', params.status);
      if (params?.category) q.append('category', params.category);
      if (params?.search) q.append('search', params.search);
      return request<{ success: boolean; data: any[] }>(`/projects?${q.toString()}`);
    },
    getMyProjects: () => request<{ success: boolean; data: any[] }>('/projects/my'),
    submitIdea: (body: any) =>
      request<{ success: boolean; message: string; data: any }>('/projects/idea', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    getAdminAll: () => request<{ success: boolean; data: any[] }>('/projects/admin'),
    create: (body: any) => request<{ success: boolean; data: any; message: string }>('/projects', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<{ success: boolean; data: any; message: string }>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<{ success: boolean; message: string }>(`/projects/${id}`, { method: 'DELETE' }),
    getIdeas: () => request<{ success: boolean; data: any[] }>('/projects/admin/ideas'),
    updateIdeaStatus: (id: string, status: string) =>
      request<{ success: boolean; data: any; message: string }>(`/projects/admin/ideas/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // Gallery
  gallery: {
    getAlbums: () => request<{ success: boolean; data: any[] }>('/gallery/albums'),
    getMedia: (params?: { albumId?: string; type?: string }) => {
      const q = new URLSearchParams();
      if (params?.albumId) q.append('albumId', params.albumId);
      if (params?.type) q.append('type', params.type);
      return request<{ success: boolean; data: any[] }>(`/gallery/media?${q.toString()}`);
    },
    getAdminAlbums: () => request<{ success: boolean; data: any[] }>('/gallery/admin/albums'),
    createAlbum: (body: any) => request<{ success: boolean; data: any; message: string }>('/gallery/admin/albums', { method: 'POST', body: JSON.stringify(body) }),
    updateAlbum: (id: string, body: any) => request<{ success: boolean; data: any; message: string }>(`/gallery/admin/albums/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteAlbum: (id: string) => request<{ success: boolean; message: string }>(`/gallery/admin/albums/${id}`, { method: 'DELETE' }),
    getAdminMedia: (albumId?: string) => {
      const q = albumId ? `?albumId=${albumId}` : '';
      return request<{ success: boolean; data: any[] }>(`/gallery/admin/media${q}`);
    },
    createMedia: (body: any) => request<{ success: boolean; data: any; message: string }>('/gallery/admin/media', { method: 'POST', body: JSON.stringify(body) }),
    updateMedia: (id: string, body: any) => request<{ success: boolean; data: any; message: string }>(`/gallery/admin/media/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteMedia: (id: string) => request<{ success: boolean; message: string }>(`/gallery/admin/media/${id}`, { method: 'DELETE' }),
  },

  // Membership Applications
  membership: {
    apply: (body: any) => request<{ success: boolean; message: string; data: any }>('/membership/apply', { method: 'POST', body: JSON.stringify(body) }),
    getAdminAll: (params?: { status?: string; year?: string; interest?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.append('status', params.status);
      if (params?.year) q.append('year', params.year);
      if (params?.interest) q.append('interest', params.interest);
      if (params?.search) q.append('search', params.search);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request<{ success: boolean; data: any[] }>(`/membership/admin${queryStr}`);
    },
    updateStatus: (id: string, status: string, notes?: string) =>
      request<{ success: boolean; data: any; message: string }>(`/membership/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      }),
    delete: (id: string) => request<{ success: boolean; message: string }>(`/membership/${id}`, { method: 'DELETE' }),
  },

  // Communication & Settings
  communication: {
    getAnnouncements: () => request<{ success: boolean; data: any[] }>('/announcements'),
    getAdminAnnouncements: () => request<{ success: boolean; data: any[] }>('/announcements/admin'),
    createAnnouncement: (body: any) => request<{ success: boolean; data: any; message: string }>('/announcements', { method: 'POST', body: JSON.stringify(body) }),
    updateAnnouncement: (id: string, body: any) => request<{ success: boolean; data: any; message: string }>(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteAnnouncement: (id: string) => request<{ success: boolean; message: string }>(`/announcements/${id}`, { method: 'DELETE' }),

    subscribeNewsletter: (email: string) =>
      request<{ success: boolean; message: string }>('/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    getNewsletterSubscribers: () => request<{ success: boolean; data: any[] }>('/newsletter/admin'),

    submitContact: (body: any) => request<{ success: boolean; message: string; data: any }>('/contact', { method: 'POST', body: JSON.stringify(body) }),
    getContactSubmissions: () => request<{ success: boolean; data: any[] }>('/contact/admin'),
    updateContactStatus: (id: string, status: string) =>
      request<{ success: boolean; data: any; message: string }>(`/contact/admin/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),

    getSettings: () => request<{ success: boolean; data: any }>('/settings'),
    updateSettings: (body: any) => request<{ success: boolean; data: any; message: string }>('/settings', { method: 'PUT', body: JSON.stringify(body) }),
  },

  // Search
  search: Object.assign(
    (q: string) => request<{ success: boolean; data: any[] }>(`/search?q=${encodeURIComponent(q)}`),
    {
      query: (q: string) => request<{ success: boolean; data: any[] }>(`/search?q=${encodeURIComponent(q)}`),
    }
  ),

  // Upload file (cover images, team photos, gallery media)
  uploadFile: async (file: File): Promise<{ success: boolean; fileUrl: string; filename: string }> => {
    if (isGitHubPages && !rawApiBase) {
      throw new Error('Media upload requires a deployed backend API. Please configure VITE_API_BASE_URL.');
    }

    const token = getToken();

    // 1. Direct Cloudinary upload for large files (> 4MB) to bypass Vercel serverless request limits
    if (file.size > 4 * 1024 * 1024) {
      try {
        const sigRes = await fetch(`${API_BASE}/upload/signature?folder=anvaya`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (sigRes.ok) {
          const sigData = await sigRes.json();
          if (sigData.success && sigData.signature) {
            const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.name);
            const endpoint = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/${isVideo ? 'video' : 'auto'}/upload`;
            const cloudFormData = new FormData();
            cloudFormData.append('file', file);
            cloudFormData.append('api_key', sigData.apiKey);
            cloudFormData.append('timestamp', String(sigData.timestamp));
            cloudFormData.append('signature', sigData.signature);
            cloudFormData.append('folder', sigData.folder || 'anvaya');

            const cRes = await fetch(endpoint, {
              method: 'POST',
              body: cloudFormData,
            });
            const cJson = await cRes.json();
            if (cRes.ok && (cJson.secure_url || cJson.url)) {
              return {
                success: true,
                fileUrl: cJson.secure_url || cJson.url,
                filename: cJson.original_filename || file.name,
              };
            }
          }
        }
      } catch (directErr) {
        console.warn('Direct upload bypass attempt was skipped or failed; proceeding with standard upload:', directErr);
      }
    }

    // 2. Standard upload via backend endpoint
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res: Response;
    try {
      res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
    } catch (netErr: any) {
      throw new Error(`Media upload network error: ${netErr.message || 'Cannot reach API server.'}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const errorText = await res.text();
      if (res.status === 413) {
        throw new Error('File exceeds serverless payload size limit (4.5MB). Please choose a smaller file or configure Cloudinary.');
      }
      throw new Error(`Media upload failed (HTTP ${res.status}): ${errorText.slice(0, 150) || 'Ensure backend is reachable.'}`);
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'File upload failed');
    return data;
  },
  upload: async (file: File) => {
    return api.uploadFile(file);
  },
};
