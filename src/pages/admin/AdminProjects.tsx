import React, { useEffect, useState } from 'react';
import {
  FolderGit2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Loader2,
  X,
  ExternalLink,
} from 'lucide-react';
import { GithubIcon } from '../../components/common/SocialIcons';
import { api } from '../../services/api';
import { ProjectItem, ProjectIdea } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminProjects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  // Create/Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Application');
  const [status, setStatus] = useState<'ongoing' | 'completed'>('completed');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [teamMembersInput, setTeamMembersInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [completedDate, setCompletedDate] = useState('2026');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, ideaRes] = await Promise.all([
        api.projects.getAdminAll(),
        api.projects.getIdeas(),
      ]);
      if (projRes.success) setProjects(projRes.data);
      if (ideaRes.success) setIdeas(ideaRes.data);
    } catch (err: any) {
      error(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Web Application');
    setStatus('completed');
    setSummary('');
    setDescription('');
    setCoverImage('');
    setTechStackInput('React, TypeScript, Tailwind CSS');
    setTeamMembersInput('Ankush S, Akash');
    setGithubUrl('');
    setDemoUrl('');
    setCompletedDate('2026');
    setModalOpen(true);
  };

  const openEdit = (p: ProjectItem) => {
    setEditingId(p.id);
    setTitle(p.title);
    setCategory(p.category);
    setStatus(p.status);
    setSummary(p.summary);
    setDescription(p.description);
    setCoverImage(p.coverImage || '');
    setTechStackInput(p.techStack?.join(', ') || '');
    setTeamMembersInput(p.teamMembers?.join(', ') || '');
    setGithubUrl(p.githubUrl || '');
    setDemoUrl(p.demoUrl || '');
    setCompletedDate(p.completedDate || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary || !description) {
      error('Title, summary, and description are required.');
      return;
    }

    setSaving(true);
    try {
      const techStack = techStackInput.split(',').map(s => s.trim()).filter(Boolean);
      const teamMembers = teamMembersInput.split(',').map(s => s.trim()).filter(Boolean);

      const payload = {
        title,
        category,
        status,
        summary,
        description,
        coverImage,
        techStack,
        teamMembers,
        githubUrl,
        demoUrl,
        completedDate,
      };

      if (editingId) {
        const res = await api.projects.update(editingId, payload);
        if (res.success) {
          success(res.message);
          setModalOpen(false);
          fetchData();
        }
      } else {
        const res = await api.projects.create(payload);
        if (res.success) {
          success(res.message);
          setModalOpen(false);
          fetchData();
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, projTitle: string) => {
    if (!window.confirm(`Delete project "${projTitle}"?`)) return;

    try {
      const res = await api.projects.delete(id);
      if (res.success) {
        success(res.message);
        fetchData();
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete project.');
    }
  };

  const handleIdeaStatus = async (id: string, newStatus: string) => {
    try {
      const res = await api.projects.updateIdeaStatus(id, newStatus);
      if (res.success) {
        success(res.message);
        fetchData();
      }
    } catch (err: any) {
      error(err.message || 'Failed to update idea status.');
    }
  };

  return (
    <div className="space-y-10">
      {/* 1. Projects Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-plum-950 dark:text-ivory-50">
              Projects Showcase Management
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Add student-built projects, creative tech tools, and repository showcases.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gold-600 hover:bg-gold-500 shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Project</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading projects...</div>
        ) : projects.length > 0 ? (
          <div className="rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-ivory-100 dark:bg-plum-950 text-gray-500 uppercase tracking-wider text-[10px] font-mono border-b border-ivory-200 dark:border-plum-800">
                  <tr>
                    <th className="px-5 py-3">Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3">Links</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-200 dark:divide-plum-800">
                  {projects.map(p => (
                    <tr key={p.id} className="hover:bg-ivory-50 dark:hover:bg-plum-850/50">
                      <td className="px-5 py-3.5 font-semibold text-plum-950 dark:text-ivory-50 max-w-xs truncate">
                        {p.title}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500">{p.category}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold ${
                          p.status === 'completed' ? 'bg-emerald-500/15 text-emerald-700' : 'bg-amber-500/15 text-amber-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 max-w-[150px] truncate">
                        {p.teamMembers?.join(', ')}
                      </td>
                      <td className="px-4 py-3.5 text-gray-400 space-x-2">
                        {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="hover:text-gold-500"><GithubIcon className="w-3.5 h-3.5 inline" /></a>}
                        {p.demoUrl && <a href={p.demoUrl} target="_blank" rel="noreferrer" className="hover:text-gold-500"><ExternalLink className="w-3.5 h-3.5 inline" /></a>}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gold-500/10 text-gold-600 dark:text-gold-400">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id, p.title)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-400">No showcase projects yet.</div>
        )}
      </div>

      {/* 2. Project Ideas Proposals Moderation */}
      <div className="space-y-4 pt-6 border-t border-ivory-200 dark:border-plum-800">
        <div>
          <h2 className="text-xl font-serif font-bold text-plum-950 dark:text-ivory-50 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-500" />
            <span>Student-Submitted Project Proposals</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Incoming proposals submitted through the "Have an idea?" public section.
          </p>
        </div>

        {ideas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideas.map(idea => (
              <div
                key={idea.id}
                className="p-5 rounded-2xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 shadow-sm space-y-3 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif font-bold text-sm text-plum-950 dark:text-ivory-50">
                    {idea.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                    idea.status === 'approved'
                      ? 'bg-emerald-500/15 text-emerald-700'
                      : idea.status === 'rejected'
                      ? 'bg-rose-500/15 text-rose-700'
                      : 'bg-amber-500/15 text-amber-700'
                  }`}>
                    {idea.status}
                  </span>
                </div>

                <p className="text-plum-700 dark:text-ivory-300 leading-relaxed">
                  {idea.description}
                </p>

                <div className="pt-2 border-t border-ivory-200 dark:border-plum-800 grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                  <div>Lead: <strong className="text-plum-900 dark:text-ivory-100">{idea.studentName}</strong> ({idea.usn})</div>
                  <div>Contact: {idea.contactInfo}</div>
                  {idea.proposedTech && <div>Tech: {idea.proposedTech}</div>}
                  {idea.teamMembers && <div>Team: {idea.teamMembers}</div>}
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleIdeaStatus(idea.id, 'rejected')}
                    className="px-3 py-1 rounded-lg text-rose-600 hover:bg-rose-500/10 font-semibold"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleIdeaStatus(idea.id, 'approved')}
                    className="px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 font-semibold shadow"
                  >
                    Approve Idea
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-400 rounded-2xl border border-ivory-200 dark:border-plum-800">
            No pending student proposals at this time.
          </div>
        )}
      </div>

      {/* Project Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-xl bg-white dark:bg-plum-900 border border-ivory-200 dark:border-plum-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ivory-200 dark:border-plum-800 pb-3">
              <h3 className="text-base font-serif font-bold text-plum-950 dark:text-ivory-50">
                {editingId ? 'Edit Project' : 'Add Showcase Project'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. StageSync Low-Latency Controller"
                  className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="Web Application / Hardware Tech"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                  >
                    <option value="completed">Completed</option>
                    <option value="ongoing">Ongoing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                  Brief Summary *
                </label>
                <input
                  type="text"
                  required
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="Short 1-line summary..."
                  className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Comprehensive description of features and impact..."
                  className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                    Tech Stack (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={techStackInput}
                    onChange={e => setTechStackInput(e.target.value)}
                    placeholder="React, TypeScript, Node.js"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                    Team Members (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={teamMembersInput}
                    onChange={e => setTeamMembersInput(e.target.value)}
                    placeholder="Ankush S, Akash"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={e => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-plum-900 dark:text-ivory-200 mb-1">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={e => setDemoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-ivory-50 dark:bg-plum-950 border border-ivory-300 dark:border-plum-800 text-plum-950 dark:text-ivory-50"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-ivory-200 dark:border-plum-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gold-600 text-white font-semibold shadow hover:bg-gold-500 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
