const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const bcrypt = require('bcryptjs');

describe('Model Tests', () => {
  
  describe('User Model', () => {
    it('debería crear un usuario válido', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword123'
      };

      const user = await User.create(userData);

      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user).toHaveProperty('_id');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
    });

    it('debería fallar sin campos requeridos', async () => {
      const invalidUser = new User({
        email: 'test@example.com'
      });

      await expect(invalidUser.save()).rejects.toThrow();
    });

    it('debería fallar con email duplicado', async () => {
      const userData = {
        username: 'user1',
        email: 'test@example.com',
        name: 'User 1',
        password: 'password123'
      };

      await User.create(userData);

      const duplicateUser = {
        username: 'user2',
        email: 'test@example.com',
        name: 'User 2',
        password: 'password456'
      };

      await expect(User.create(duplicateUser)).rejects.toThrow();
    });

    it('debería fallar con username duplicado', async () => {
      const userData = {
        username: 'testuser',
        email: 'test1@example.com',
        name: 'User 1',
        password: 'password123'
      };

      await User.create(userData);

      const duplicateUser = {
        username: 'testuser',
        email: 'test2@example.com',
        name: 'User 2',
        password: 'password456'
      };

      await expect(User.create(duplicateUser)).rejects.toThrow();
    });

    it('debería tener configuración de privacidad por defecto', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      });

      expect(user.privacy).toBeDefined();
      expect(user.privacy.showFollowers).toBe(true);
      expect(user.privacy.showFollowing).toBe(true);
      expect(user.privacy.allowFollowRequests).toBe(true);
      expect(user.privacy.isPrivate).toBe(false);
    });

    it('debería inicializar arrays vacíos', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      });

      expect(user.followers).toEqual([]);
      expect(user.following).toEqual([]);
      expect(user.blockedUsers).toEqual([]);
      expect(user.blockedBy).toEqual([]);
      expect(user.followRequests).toEqual([]);
      expect(user.savedProjects).toEqual([]);
    });
  });

  describe('Project Model', () => {
    let userId;

    beforeEach(async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      });
      userId = user._id;
    });

    it('debería crear un proyecto válido', async () => {
      const projectData = {
        owner: userId,
        title: 'Test Project',
        slug: 'test-project',
        description: 'This is a test project',
        tags: ['javascript', 'react'],
        liveUrl: 'https://example.com',
        repoUrl: 'https://github.com/test/repo'
      };

      const project = await Project.create(projectData);

      expect(project.title).toBe('Test Project');
      expect(project.slug).toBe('test-project');
      expect(project.description).toBe('This is a test project');
      expect(project.tags).toEqual(['javascript', 'react']);
      expect(project.owner.toString()).toBe(userId.toString());
      expect(project).toHaveProperty('createdAt');
      expect(project).toHaveProperty('updatedAt');
    });

    it('debería fallar sin owner', async () => {
      const projectData = {
        title: 'Test Project',
        slug: 'test-project'
      };

      await expect(Project.create(projectData)).rejects.toThrow();
    });

    it('debería fallar sin título', async () => {
      const projectData = {
        owner: userId,
        slug: 'test-project'
      };

      await expect(Project.create(projectData)).rejects.toThrow();
    });

    it('debería fallar sin slug', async () => {
      const projectData = {
        owner: userId,
        title: 'Test Project'
      };

      await expect(Project.create(projectData)).rejects.toThrow();
    });

    it('debería fallar con slug duplicado', async () => {
      const projectData = {
        owner: userId,
        title: 'Project 1',
        slug: 'test-project'
      };

      await Project.create(projectData);

      const duplicateProject = {
        owner: userId,
        title: 'Project 2',
        slug: 'test-project'
      };

      await expect(Project.create(duplicateProject)).rejects.toThrow();
    });

    it('debería inicializar arrays y campos opcionales', async () => {
      const project = await Project.create({
        owner: userId,
        title: 'Test Project',
        slug: 'test-project'
      });

      expect(project.images).toEqual([]);
      expect(project.comments).toEqual([]);
      expect(project.likes).toEqual([]);
      expect(project.tags).toEqual([]);
    });

    it('debería permitir añadir comentarios', async () => {
      const project = await Project.create({
        owner: userId,
        title: 'Test Project',
        slug: 'test-project'
      });

      project.comments.push({
        user: userId,
        text: 'Great project!',
        likes: []
      });

      await project.save();

      const savedProject = await Project.findById(project._id);
      expect(savedProject.comments).toHaveLength(1);
      expect(savedProject.comments[0].text).toBe('Great project!');
      expect(savedProject.comments[0].user.toString()).toBe(userId.toString());
    });

    it('debería permitir añadir likes', async () => {
      const project = await Project.create({
        owner: userId,
        title: 'Test Project',
        slug: 'test-project'
      });

      project.likes.push(userId);
      await project.save();

      const savedProject = await Project.findById(project._id);
      expect(savedProject.likes).toHaveLength(1);
      expect(savedProject.likes[0].toString()).toBe(userId.toString());
    });
  });
});
