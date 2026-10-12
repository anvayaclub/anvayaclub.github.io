import { Request, Response } from 'express';
import { Project, ProjectIdea } from '../models/Project.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore } from '../services/store.js';
import { AuthRequest } from '../middleware/auth.js';

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, category, search, all } = req.query;

    if (isDbConnected()) {
      const query: any = {};
      if (all !== 'true') {
        query.isPublished = true;
      }
      if (status && status !== 'all') {
        query.status = status;
      }
      if (category && category !== 'all') {
        query.category = { $regex: new RegExp(`^${category}$`, 'i') };
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { summary: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { techStack: { $regex: search, $options: 'i' } },
          { authorName: { $regex: search, $options: 'i' } },
        ];
      }
      const projects = await Project.find(query).sort({ createdAt: -1 });
      res.json({ success: true, data: projects });
    } else {
      let projects = memoryStore.projects;
      if (all !== 'true') {
        projects = projects.filter(p => p.isPublished);
      }
      if (status && status !== 'all') {
        projects = projects.filter(p => p.status === status);
      }
      if (category && category !== 'all') {
        projects = projects.filter(p => p.category?.toLowerCase() === String(category).toLowerCase());
      }
      if (search) {
        const s = String(search).toLowerCase();
        projects = projects.filter(
          p =>
            p.title?.toLowerCase().includes(s) ||
            p.summary?.toLowerCase().includes(s) ||
            p.authorName?.toLowerCase().includes(s) ||
            (Array.isArray(p.techStack) && p.techStack.some((t: string) => t.toLowerCase().includes(s)))
        );
      }
      res.json({ success: true, data: projects });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve projects.' });
  }
};

export const getMyProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const userId = req.user.id;

    if (isDbConnected()) {
      const myProjects = await Project.find({ authorId: userId }).sort({ createdAt: -1 });
      res.json({ success: true, data: myProjects });
    } else {
      const myProjects = memoryStore.projects.filter(p => p.authorId === userId);
      res.json({ success: true, data: myProjects });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch personal projects.' });
  }
};

export const getAdminProjects = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const projects = await Project.find().sort({ createdAt: -1 });
      res.json({ success: true, data: projects });
    } else {
      res.json({ success: true, data: memoryStore.projects });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve admin projects.' });
  }
};

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
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
      achievements,
      isPublished,
    } = req.body;

    if (!title || !summary || !description) {
      res.status(400).json({ success: false, message: 'Project title, summary, and description are required.' });
      return;
    }

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
      '-' +
      Date.now().toString().slice(-4);

    const authorId = req.user?.id;
    const authorName = req.user?.name || 'Student Creator';
    const authorUsn = req.user?.usn || '';

    const parsedTechStack = Array.isArray(techStack)
      ? techStack
      : typeof techStack === 'string'
      ? techStack.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const parsedTeamMembers = Array.isArray(teamMembers)
      ? teamMembers
      : typeof teamMembers === 'string'
      ? teamMembers.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    if (isDbConnected()) {
      const project = await Project.create({
        title: title.trim(),
        slug,
        category: category || 'Creative Tech',
        status: status || 'completed',
        summary: summary.trim(),
        description: description.trim(),
        coverImage,
        techStack: parsedTechStack,
        teamMembers: parsedTeamMembers,
        githubUrl: githubUrl?.trim(),
        demoUrl: demoUrl?.trim(),
        completedDate,
        achievements,
        authorId,
        authorName,
        authorUsn,
        isPublished: isPublished !== false,
      });

      res.status(201).json({
        success: true,
        data: project,
        message: project.isPublished ? 'Project published successfully to showcase!' : 'Project saved as draft.',
      });
    } else {
      const projId = `proj_${Date.now()}`;
      const newProject = {
        _id: projId,
        id: projId,
        title: title.trim(),
        slug,
        category: category || 'Creative Tech',
        status: status || 'completed',
        summary: summary.trim(),
        description: description.trim(),
        coverImage,
        techStack: parsedTechStack,
        teamMembers: parsedTeamMembers,
        githubUrl: githubUrl?.trim(),
        demoUrl: demoUrl?.trim(),
        completedDate,
        achievements,
        authorId,
        authorName,
        authorUsn,
        isPublished: isPublished !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      memoryStore.projects.push(newProject);

      res.status(201).json({
        success: true,
        data: newProject,
        message: newProject.isPublished ? 'Project published successfully to showcase!' : 'Project saved as draft.',
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create project.' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const currentUser = req.user;

    if (!currentUser) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const isModerator =
      currentUser.role === 'technical' ||
      currentUser.role === 'admin' ||
      currentUser.permissions?.includes('moderate_projects');

    if (isDbConnected()) {
      const project = await Project.findById(id);
      if (!project) {
        res.status(404).json({ success: false, message: 'Project not found.' });
        return;
      }

      // Check ownership
      if (!isModerator && String(project.authorId) !== String(currentUser.id)) {
        res.status(403).json({ success: false, message: 'Access denied. You can only edit projects you have created.' });
        return;
      }

      if (updateData.techStack && typeof updateData.techStack === 'string') {
        updateData.techStack = updateData.techStack.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      if (updateData.teamMembers && typeof updateData.teamMembers === 'string') {
        updateData.teamMembers = updateData.teamMembers.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      updateData.updatedAt = new Date();

      const updated = await Project.findByIdAndUpdate(id, updateData, { new: true });
      res.json({ success: true, data: updated, message: 'Project updated successfully.' });
    } else {
      const idx = memoryStore.projects.findIndex(p => p._id === id || p.id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Project not found.' });
        return;
      }

      const existingProject = memoryStore.projects[idx];

      // Check ownership
      if (!isModerator && String(existingProject.authorId) !== String(currentUser.id)) {
        res.status(403).json({ success: false, message: 'Access denied. You can only edit projects you have created.' });
        return;
      }

      if (updateData.techStack && typeof updateData.techStack === 'string') {
        updateData.techStack = updateData.techStack.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      if (updateData.teamMembers && typeof updateData.teamMembers === 'string') {
        updateData.teamMembers = updateData.teamMembers.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

      memoryStore.projects[idx] = {
        ...existingProject,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      res.json({ success: true, data: memoryStore.projects[idx], message: 'Project updated successfully.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update project.' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (!currentUser) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const isModerator =
      currentUser.role === 'technical' ||
      currentUser.role === 'admin' ||
      currentUser.permissions?.includes('moderate_projects');

    if (isDbConnected()) {
      const project = await Project.findById(id);
      if (!project) {
        res.status(404).json({ success: false, message: 'Project not found.' });
        return;
      }

      // Check ownership
      if (!isModerator && String(project.authorId) !== String(currentUser.id)) {
        res.status(403).json({ success: false, message: 'Access denied. You can only delete projects you have created.' });
        return;
      }

      await Project.findByIdAndDelete(id);
      res.json({ success: true, message: 'Project deleted successfully.' });
    } else {
      const idx = memoryStore.projects.findIndex(p => p._id === id || p.id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Project not found.' });
        return;
      }

      const existingProject = memoryStore.projects[idx];

      // Check ownership
      if (!isModerator && String(existingProject.authorId) !== String(currentUser.id)) {
        res.status(403).json({ success: false, message: 'Access denied. You can only delete projects you have created.' });
        return;
      }

      memoryStore.projects.splice(idx, 1);
      res.json({ success: true, message: 'Project deleted successfully.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete project.' });
  }
};

export const submitProjectIdea = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, studentName, usn, teamMembers, proposedTech, expectedOutcome, repoUrl, contactInfo } = req.body;

    if (!title || !description || !studentName || !usn || !contactInfo) {
      res.status(400).json({ success: false, message: 'Title, description, student name, USN, and contact info are required.' });
      return;
    }

    if (isDbConnected()) {
      const idea = await ProjectIdea.create({
        title,
        description,
        studentName,
        usn: usn.trim().toUpperCase(),
        teamMembers,
        proposedTech,
        expectedOutcome,
        repoUrl,
        contactInfo,
        status: 'pending',
      });
      res.status(201).json({
        success: true,
        message: 'Your project proposal has been submitted to the committee for review! Thank you for contributing.',
        data: idea,
      });
    } else {
      const newIdea = {
        _id: `idea_${Date.now()}`,
        id: `idea_${Date.now()}`,
        title,
        description,
        studentName,
        usn: usn.trim().toUpperCase(),
        teamMembers,
        proposedTech,
        expectedOutcome,
        repoUrl,
        contactInfo,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      memoryStore.projectIdeas.push(newIdea);
      res.status(201).json({
        success: true,
        message: 'Your project proposal has been submitted to the committee for review! Thank you for contributing.',
        data: newIdea,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to submit project proposal.' });
  }
};

export const getProjectIdeas = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const ideas = await ProjectIdea.find().sort({ createdAt: -1 });
      res.json({ success: true, data: ideas });
    } else {
      res.json({ success: true, data: memoryStore.projectIdeas });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve project proposals.' });
  }
};

export const updateProjectIdeaStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Valid status (pending, approved, rejected) required.' });
      return;
    }

    if (isDbConnected()) {
      const idea = await ProjectIdea.findByIdAndUpdate(id, { status }, { new: true });
      if (!idea) {
        res.status(404).json({ success: false, message: 'Proposal not found.' });
        return;
      }
      res.json({ success: true, data: idea, message: `Proposal status updated to ${status}.` });
    } else {
      const idx = memoryStore.projectIdeas.findIndex(i => i._id === id || i.id === id);
      if (idx === -1) {
        res.status(404).json({ success: false, message: 'Proposal not found.' });
        return;
      }
      memoryStore.projectIdeas[idx].status = status;
      res.json({ success: true, data: memoryStore.projectIdeas[idx], message: `Proposal status updated to ${status}.` });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update proposal status.' });
  }
};
