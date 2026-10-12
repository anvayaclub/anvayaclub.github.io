import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  FolderGit2,
  ExternalLink,
  Code2,
  Users,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  Loader2,
  X,
  PlusCircle,
  Edit2,
  Trash2,
  Upload,
  Calendar,
  Award,
  Layers,
  Eye,
  FileText,
} from 'lucide-react';
import { GithubIcon } from '../components/common/SocialIcons';
import { api } from '../services/api';
import { ProjectItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AuthModal } from '../components/auth/AuthModal';

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'completed' | 'my'>('all');

  // Auth context
  const { user, isAuthenticated, isTechnical } = useAuth();
  const { success, error } = useToast();

  // Auth Modal trigger
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Project Creation & Editing Modal State
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Project Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Creative Tech');
  const [status, setStatus] = useState<'ongoing' | 'completed'>('completed');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [teamMembersInput, setTeamMembersInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [completedDate, setCompletedDate] = useState('');
  const [achievements, setAchievements] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProject, setSavingProject] = useState(false);

  // Idea Submission Modal State
  const [ideaModalOpen, setIdeaModalOpen] = useState(false);
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDesc, setIdeaDesc] = useState('');
  const [studentName, setStudentName] = useState('');
  const [usn, setUsn] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [proposedTech, setProposedTech] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [submittingIdea, setSubmittingIdea] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      if (activeTab === 'my') {
        const res = await api.projects.getMyProjects();
        if (res.success) setProjects(res.data);
      } else {
        const res = await api.projects.getAll({
          status: activeTab !== 'all' ? activeTab : undefined,
        });
        if (res.success) setProjects(res.data);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [activeTab]);

  const openCreateModal = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    setEditingProjectId(null);
    setTitle('');
    setCategory('Creative Tech');
    setStatus('completed');
    setSummary('');
    setDescription('');
    setCoverImage('');
    setTechStackInput('');
    setTeamMembersInput(user ? `${user.name} (${user.usn || 'ISE'})` : '');
    setGithubUrl('');
    setDemoUrl('');
    setCompletedDate('');
    setAchievements('');
    setProjectModalOpen(true);
  };

  const openEditModal = (proj: ProjectItem) => {
    setEditingProjectId(proj.id || proj._id || null);
    setTitle(proj.title);
    setCategory(proj.category);
    setStatus(proj.status);
    setSummary(proj.summary);
    setDescription(proj.description);
    setCoverImage(proj.coverImage || '');
    setTechStackInput(proj.techStack ? proj.techStack.join(', ') : '');
    setTeamMembersInput(proj.teamMembers ? proj.teamMembers.join(', ') : '');
    setGithubUrl(proj.githubUrl || '');
    setDemoUrl(proj.demoUrl || '');
    setCompletedDate(proj.completedDate || '');
    setAchievements(proj.achievements || '');
    setProjectModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.fileUrl) {
        setCoverImage(res.fileUrl);
        success('Cover image uploaded successfully.');
      }
    } catch (err: any) {
      error(err.message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProject = async (isPublished: boolean) => {
    if (!title || !summary || !description) {
      error('Please fill in the project title, summary, and description.');
      return;
    }

    setSavingProject(true);
    try {
      const payload = {
        title,
        category,
        status,
        summary,
        description,
        coverImage,
        techStack: techStackInput,
        teamMembers: teamMembersInput,
        githubUrl,
        demoUrl,
        completedDate,
        achievements,
        isPublished,
      };

      if (editingProjectId) {
        const res = await api.projects.update(editingProjectId, payload);
        if (res.success) {
          success(res.message);
          setProjectModalOpen(false);
          fetchProjects();
        }
      } else {
        const res = await api.projects.create(payload);
        if (res.success) {
          success(res.message);
          confetti({ particleCount: 75, spread: 60, origin: { y: 0.5 } });
          setProjectModalOpen(false);
          fetchProjects();
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to save project.');
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async (projId: string, projTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${projTitle}"?`)) return;

    try {
      const res = await api.projects.delete(projId);
      if (res.success) {
        success('Project deleted successfully.');
        setProjects(prev => prev.filter(p => (p.id || p._id) !== projId));
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete project.');
    }
  };

  const handleIdeaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle || !ideaDesc || !studentName || !usn || !contactInfo) {
      error('Please complete all required proposal fields.');
      return;
    }

    setSubmittingIdea(true);
    try {
      const res = await api.projects.submitIdea({
        title: ideaTitle,
        description: ideaDesc,
        studentName,
        usn: usn.trim().toUpperCase(),
        teamMembers,
        proposedTech,
        expectedOutcome,
        repoUrl,
        contactInfo,
      });

      if (res.success) {
        success(res.message);
        confetti({ particleCount: 65, spread: 60, origin: { y: 0.6 } });
        setIdeaModalOpen(false);
        setIdeaTitle('');
        setIdeaDesc('');
        setStudentName('');
        setUsn('');
        setTeamMembers('');
        setProposedTech('');
        setExpectedOutcome('');
        setRepoUrl('');
        setContactInfo('');
      }
    } catch (err: any) {
      error(err.message || 'Failed to submit proposal.');
    } finally {
      setSubmittingIdea(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* 1. Page Introduction & Breadcrumb */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Link to="/" className="hover:text-gold-500 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-plum-950 dark:text-ivory-50 font-semibold">Projects</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-700 dark:text-gold-400 text-xs font-semibold uppercase tracking-wider font-sans">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Student Publishing Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-extrabold text-plum-950 dark:text-ivory-50 tracking-tight">
              Projects Showcase
            </h1>
            <p className="text-sm sm:text-base text-plum-700 dark:text-ivory-200 leading-relaxed font-sans">
              Celebrating student-engineered software tools, interactive stage technologies, creative digital media, and cultural initiatives built by students of KIT Tiptur.
            </p>
          </div>

          {/* Prominent Action Button: Submit a Project */}
          <div className="shrink-0">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-gold-600 via-saffron-500 to-gold-500 hover:from-gold-500 hover:to-saffron-600 shadow-lg shadow-gold-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit a Project</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Filter Bar & Projects Display */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ivory-300 dark:border-plum-800 pb-4">
          <div>
            <div className="text-xs uppercase font-semibold text-gold-600 dark:text-gold-400 font-sans">
              Student Creations
            </div>
            <h2 className="text-2xl font-serif font-bold text-plum-950 dark:text-ivory-50">
              {activeTab === 'my' ? 'My Published & Draft Projects' : 'All Published Works'}
            </h2>
          </div>

          {/* Status Tabs + "My Projects" tab */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-ivory-200/60 dark:bg-plum-900 border border-ivory-300/80 dark:border-plum-800">
            {(['all', 'ongoing', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-white dark:bg-plum-800 text-gold-600 dark:text-gold-400 shadow-sm font-bold'
                    : 'text-plum-700 dark:text-ivory-300 hover:text-gold-500'
                }`}
              >
                {tab}
              </button>
            ))}

            {isAuthenticated && (
              <button
                onClick={() => setActiveTab('my')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 ${
                  activeTab === 'my'
                    ? 'bg-white dark:bg-plum-800 text-peacock-600 dark:text-peacock-400 shadow-sm font-bold'
                    : 'text-plum-700 dark:text-ivory-300 hover:text-peacock-500'
                }`}
              >
                <FolderGit2 className="w-3 h-3" />
                <span>My Projects</span>
              </button>
            )}
          </div>
        </div>

        {/* Project Cards Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-400">Loading student projects from database...</p>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(proj => {
              const projId = proj.id || proj._id || '';
              const isOwner = user && (proj.authorId === user.id || (user.usn && proj.authorUsn === user.usn));
              const canManage = isOwner || isTechnical;

              return (
                <div
                  key={projId}
                  id={proj.slug}
                  className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-plum-900/80 border border-ivory-200 dark:border-plum-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative"
                >
                  {/* Card Cover Image */}
                  {proj.coverImage ? (
                    <div className="h-44 w-full overflow-hidden relative">
                      <img
                        src={proj.coverImage}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium">
                        {proj.category}
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        {!proj.isPublished && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-purple-600/90 text-white">
                            Draft
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            proj.status === 'completed'
                              ? 'bg-emerald-500/90 text-white'
                              : 'bg-amber-500/90 text-white'
                          }`}
                        >
                          {proj.status}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-28 w-full bg-gradient-to-r from-plum-900/10 to-gold-500/10 dark:from-plum-800 dark:to-plum-950 p-4 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-gold-500/20 text-gold-700 dark:text-gold-400 text-xs font-semibold">
                        {proj.category}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-gray-500">
                        {proj.status}
                      </span>
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Author badge if available */}
                      {proj.authorName && (
                        <div className="text-[11px] font-medium text-gold-600 dark:text-gold-400 mb-1">
                          By {proj.authorName} {proj.authorUsn ? `(${proj.authorUsn})` : ''}
                        </div>
                      )}

                      <h3 className="text-lg font-serif font-bold text-plum-950 dark:text-ivory-50 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-plum-700 dark:text-ivory-300 line-clamp-3 mt-2 leading-relaxed">
                        {proj.summary}
                      </p>

                      {/* Achievements badge */}
                      {proj.achievements && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                          <Award className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{proj.achievements}</span>
                        </div>
                      )}

                      {/* Tech stack badges */}
                      {proj.techStack && proj.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {proj.techStack.map((tech, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-ivory-100 dark:bg-plum-800 text-[10px] font-mono text-plum-800 dark:text-ivory-200 border border-ivory-200 dark:border-plum-700"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Team contributors */}
                      {proj.teamMembers && proj.teamMembers.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 mt-3">
                          <Users className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
                          <span className="truncate">{proj.teamMembers.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Links & Ownership controls */}
                    <div className="pt-4 border-t border-ivory-200 dark:border-plum-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-plum-800 dark:text-ivory-200 hover:text-gold-500 transition-colors"
                            aria-label={`GitHub repository for ${proj.title}`}
                          >
                            <GithubIcon className="w-4 h-4" />
                            <span>Code</span>
                          </a>
                        )}
                        {proj.demoUrl && (
                          <a
                            href={proj.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-peacock-600 dark:text-peacock-400 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Live Demo</span>
                          </a>
                        )}
                      </div>

                      {/* Owner / Technical Management Buttons */}
                      {canManage ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(proj)}
                            className="p-1.5 rounded-lg text-plum-700 dark:text-ivory-300 hover:bg-gold-500/10 hover:text-gold-600 transition-colors"
                            title="Edit Project"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(projId, proj.title)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        proj.completedDate && (
                          <span className="text-[10px] text-gray-400 italic">
                            {proj.completedDate}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center rounded-2xl bg-white/50 dark:bg-plum-900/40 border border-ivory-200 dark:border-plum-800 max-w-md mx-auto">
            <Code2 className="w-8 h-8 text-gold-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-plum-950 dark:text-ivory-50">
              {activeTab === 'my' ? "You haven't submitted any projects yet" : 'No Projects Found'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {activeTab === 'my'
                ? 'Click the button below to submit and publish your first student initiative!'
                : 'Be the first to publish a student initiative or submit your project proposal!'}
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gold-600 hover:bg-gold-500 transition-all shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit a Project</span>
            </button>
          </div>
        )}
      </section>

      {/* 3. "HAVE AN IDEA?" PROPOSAL SECTION */}
      <section className="p-8 sm:p-12 rounded-3xl bg-ivory-100 dark:bg-plum-900 border border-ivory-300 dark:border-plum-800 shadow-md text-center space-y-4">
        <div className="inline-flex items-center gap-2 p-2 rounded-full bg-gold-500/15 text-gold-600 dark:text-gold-400 mx-auto">
          <Lightbulb className="w-5 h-5" />
        </div>
        <h2 className="text-3xl font-serif font-extrabold text-plum-950 dark:text-ivory-50">
          Have an Idea in Progress?
        </h2>
        <p className="text-xs sm:text-sm text-plum-700 dark:text-ivory-300 max-w-xl mx-auto font-sans leading-relaxed">
          Working on a stage audio controller, lighting switcher, creative web tool, or campus craft? Submit your proposal for committee mentorship, technical resources, and showcase support.
        </p>
        <div className="pt-2">
          <button
            onClick={() => setIdeaModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-semibold text-white bg-gradient-to-r from-gold-600 to-saffron-500 hover:from-gold-500 hover:to-saffron-600 shadow-lg shadow-gold-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Submit a Project Idea</span>
          </button>
        </div>
      </section>

      {/* 4. STUDENT PROJECT SUBMISSION & EDITING MODAL */}
      {projectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-plum-900 rounded-3xl border border-ivory-300 dark:border-plum-800 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-ivory-200 dark:border-plum-800 flex items-center justify-between bg-ivory-50/60 dark:bg-plum-950/40">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-gold-500" />
                <h3 className="text-lg font-serif font-bold text-plum-950 dark:text-ivory-50">
                  {editingProjectId ? 'Edit Project' : 'Submit Student Project'}
                </h3>
              </div>
              <button
                onClick={() => setProjectModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-ivory-200 dark:hover:bg-plum-800 text-plum-600 dark:text-ivory-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. StageSync — Multi-Track Stage Cue Controller"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                  >
                    <option value="Creative Tech">Creative Tech</option>
                    <option value="Web Application">Web Application</option>
                    <option value="Audio & Hardware Tech">Audio & Hardware Tech</option>
                    <option value="Creative Media">Creative Media</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="AI & Digital Arts">AI & Digital Arts</option>
                    <option value="Cultural Operations">Cultural Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Project Status *
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                  >
                    <option value="completed">Completed</option>
                    <option value="ongoing">Ongoing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                  Short Summary (for cards) *
                </label>
                <textarea
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  rows={2}
                  placeholder="A concise 2-sentence summary highlighting the core problem and creative solution..."
                  className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                  Full Description *
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Detailed architecture, student team roles, creative process, and results..."
                  className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                  required
                />
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                  Project Cover Image
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={coverImage}
                    onChange={e => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/... or upload file"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  />
                  <label className="cursor-pointer px-4 py-2 rounded-xl border border-gold-500/40 bg-gold-500/10 hover:bg-gold-500/20 text-gold-600 dark:text-gold-400 text-xs font-semibold flex items-center gap-1.5 transition-all">
                    {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                {coverImage && (
                  <div className="mt-2 h-20 w-32 rounded-lg overflow-hidden border border-ivory-300 dark:border-plum-700">
                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Tech Stack (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={techStackInput}
                    onChange={e => setTechStackInput(e.target.value)}
                    placeholder="React, TypeScript, ESP32, Tailwind"
                    className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Team Members
                  </label>
                  <input
                    type="text"
                    value={teamMembersInput}
                    onChange={e => setTeamMembersInput(e.target.value)}
                    placeholder="Adithya K S (3rd Year), Akash (3rd Year)"
                    className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    GitHub Repository URL
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={e => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Live Demo URL (optional)
                  </label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={e => setDemoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Completion Date / Period (optional)
                  </label>
                  <input
                    type="text"
                    value={completedDate}
                    onChange={e => setCompletedDate(e.target.value)}
                    placeholder="e.g. October 2026"
                    className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Verified Achievement / Award (optional)
                  </label>
                  <input
                    type="text"
                    value={achievements}
                    onChange={e => setAchievements(e.target.value)}
                    placeholder="e.g. 1st Place at KIT Tech Fest 2026"
                    className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-ivory-200 dark:border-plum-800 bg-ivory-50/50 dark:bg-plum-950/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setProjectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-plum-700 dark:text-ivory-300 hover:bg-ivory-200 dark:hover:bg-plum-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={savingProject}
                onClick={() => handleSaveProject(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-plum-900 dark:text-ivory-100 bg-ivory-200 dark:bg-plum-800 hover:bg-ivory-300 dark:hover:bg-plum-700 transition-all"
              >
                Save as Draft
              </button>

              <button
                type="button"
                disabled={savingProject}
                onClick={() => handleSaveProject(true)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-gold-600 to-saffron-500 hover:from-gold-500 hover:to-saffron-600 shadow-md shadow-gold-500/20 flex items-center gap-1.5 transition-all"
              >
                {savingProject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Publish Project</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. PROJECT IDEA MODAL */}
      {ideaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-plum-900 rounded-3xl border border-ivory-300 dark:border-plum-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-ivory-200 dark:border-plum-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-gold-500" />
                <h3 className="text-lg font-serif font-bold text-plum-950 dark:text-ivory-50">
                  Submit a Project Proposal
                </h3>
              </div>
              <button
                onClick={() => setIdeaModalOpen(false)}
                className="p-1 rounded-full hover:bg-ivory-200 dark:hover:bg-plum-800 text-plum-600 dark:text-ivory-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIdeaSubmit} className="p-6 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                  Proposed Project Title *
                </label>
                <input
                  type="text"
                  value={ideaTitle}
                  onChange={e => setIdeaTitle(e.target.value)}
                  placeholder="e.g. Smart Stage Curtains Controller"
                  className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  value={ideaDesc}
                  onChange={e => setIdeaDesc(e.target.value)}
                  rows={3}
                  placeholder="Explain what the project aims to accomplish, components needed, and event applications..."
                  className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                    USN *
                  </label>
                  <input
                    type="text"
                    value={usn}
                    onChange={e => setUsn(e.target.value.toUpperCase())}
                    placeholder="1KI23IS..."
                    className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs uppercase focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-plum-700 dark:text-ivory-300 mb-1">
                  Email / Contact Phone *
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={e => setContactInfo(e.target.value)}
                  placeholder="phone or college email address"
                  className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-plum-700 bg-white dark:bg-plum-950/60 text-plum-950 dark:text-ivory-50 text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIdeaModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-plum-700 dark:text-ivory-300 hover:bg-ivory-200 dark:hover:bg-plum-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingIdea}
                  className="px-5 py-2 text-xs font-semibold text-white bg-gold-600 hover:bg-gold-500 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  {submittingIdea ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Submit Proposal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal for Unauthenticated Users */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onSuccess={openCreateModal} />
    </div>
  );
};
