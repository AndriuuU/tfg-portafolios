const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const projectRoutes = require('../routes/projectRoutes');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Project = require('../models/Project');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Configurar app de Express para tests
const app = express();
app.use(express.json());
app.use('/api/projects', projectRoutes);

process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES = '7d';

describe('Project Controller Tests', () => {
  let token;
  let userId;
  let otherUserId;

  beforeEach(async () => {
    // Crear usuario principal
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword
    });
    userId = user._id;
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES
    });

    // Crear otro usuario
    const otherUser = await User.create({
      username: 'otheruser',
      email: 'other@example.com',
      name: 'Other User',
      password: hashedPassword
    });
    otherUserId = otherUser._id;
  });

  describe('POST /api/projects', () => {
    it('debería crear un proyecto correctamente', async () => {
      const projectData = {
        title: 'Test Project',
        slug: 'test-project',
        description: 'This is a test project',
        tags: ['javascript', 'react'],
        liveUrl: 'https://example.com',
        repoUrl: 'https://github.com/test/repo'
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(projectData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('title', 'Test Project');
      expect(response.body).toHaveProperty('slug', 'test-project');
      expect(response.body).toHaveProperty('owner', userId.toString());
      expect(response.body.tags).toEqual(['javascript', 'react']);
    });

    it('debería fallar sin autenticación', async () => {
      const projectData = {
        title: 'Test Project',
        slug: 'test-project'
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData);

      expect(response.status).toBe(401);
    });

    it('debería fallar sin título', async () => {
      const projectData = {
        slug: 'test-project'
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(projectData);

      expect(response.status).toBe(400);
    });

    it('debería fallar con slug duplicado', async () => {
      const projectData = {
        title: 'Test Project',
        slug: 'test-project'
      };

      // Crear primer proyecto
      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(projectData);

      // Intentar crear segundo con mismo slug
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...projectData, title: 'Another Project' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/projects', () => {
    beforeEach(async () => {
      // Crear algunos proyectos
      await Project.create([
        {
          owner: userId,
          title: 'Project 1',
          slug: 'project-1',
          description: 'First project'
        },
        {
          owner: userId,
          title: 'Project 2',
          slug: 'project-2',
          description: 'Second project'
        }
      ]);
    });

    it('debería obtener todos los proyectos del usuario', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('slug');
    });

    it('debería fallar sin autenticación', async () => {
      const response = await request(app)
        .get('/api/projects');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/projects/:id', () => {
    let projectId;

    beforeEach(async () => {
      const project = await Project.create({
        owner: userId,
        title: 'Test Project',
        slug: 'test-project',
        description: 'Test description'
      });
      projectId = project._id;
    });

    it('debería obtener un proyecto por ID', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', 'Test Project');
      expect(response.body).toHaveProperty('_id', projectId.toString());
    });

    it('debería fallar con ID inválido', async () => {
      const response = await request(app)
        .get('/api/projects/invalid-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
    });

    it('debería fallar con ID no existente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/projects/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/projects/:id', () => {
    let projectId;

    beforeEach(async () => {
      const project = await Project.create({
        owner: userId,
        title: 'Test Project',
        slug: 'test-project',
        description: 'Original description'
      });
      projectId = project._id;
    });

    it('debería actualizar un proyecto correctamente', async () => {
      const updateData = {
        title: 'Updated Project',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', 'Updated Project');
      expect(response.body).toHaveProperty('description', 'Updated description');
    });

    it('debería fallar al actualizar proyecto de otro usuario', async () => {
      // Crear token de otro usuario
      const otherToken = jwt.sign({ id: otherUserId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
      });

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hacked' });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    let projectId;

    beforeEach(async () => {
      const project = await Project.create({
        owner: userId,
        title: 'Test Project',
        slug: 'test-project'
      });
      projectId = project._id;
    });

    it('debería eliminar un proyecto correctamente', async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verificar que fue eliminado
      const project = await Project.findById(projectId);
      expect(project).toBeNull();
    });

    it('debería fallar al eliminar proyecto de otro usuario', async () => {
      const otherToken = jwt.sign({ id: otherUserId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
      });

      const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/projects/:id/comments', () => {
    let projectId;

    beforeEach(async () => {
      const project = await Project.create({
        owner: userId,
        title: 'Test Project',
        slug: 'test-project'
      });
      projectId = project._id;
    });

    it('debería añadir un comentario correctamente', async () => {
      const response = await request(app)
        .post(`/api/projects/${projectId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'Great project!' });

      expect(response.status).toBe(200);
      expect(response.body.comments).toHaveLength(1);
      expect(response.body.comments[0]).toHaveProperty('text', 'Great project!');
      expect(response.body.comments[0]).toHaveProperty('user');
    });

    it('debería fallar sin texto', async () => {
      const response = await request(app)
        .post(`/api/projects/${projectId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/projects/:id/like', () => {
    let projectId;

    beforeEach(async () => {
      const project = await Project.create({
        owner: userId,
        title: 'Test Project',
        slug: 'test-project',
        likes: []
      });
      projectId = project._id;
    });

    it('debería dar like a un proyecto', async () => {
      const response = await request(app)
        .post(`/api/projects/${projectId}/like`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('likesCount', 1);
    });

    it('debería fallar al dar like dos veces', async () => {
      // Primer like
      await request(app)
        .post(`/api/projects/${projectId}/like`)
        .set('Authorization', `Bearer ${token}`);

      // Segundo like
      const response = await request(app)
        .post(`/api/projects/${projectId}/like`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/projects/:id/like', () => {
    let projectId;

    beforeEach(async () => {
      const project = await Project.create({
        owner: userId,
        title: 'Test Project',
        slug: 'test-project',
        likes: [userId]
      });
      projectId = project._id;
    });

    it('debería quitar like de un proyecto', async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}/like`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('likesCount', 0);
    });
  });

  describe('POST /api/projects/:id/save', () => {
    let projectId;

    beforeEach(async () => {
      const project = await Project.create({
        owner: otherUserId,
        title: 'Test Project',
        slug: 'test-project'
      });
      projectId = project._id;
    });

    it('debería guardar un proyecto en marcadores', async () => {
      const response = await request(app)
        .post(`/api/projects/${projectId}/save`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verificar que se guardó
      const user = await User.findById(userId);
      expect(user.savedProjects).toContainEqual(projectId);
    });

    it('debería fallar al guardar dos veces', async () => {
      // Primer save
      await request(app)
        .post(`/api/projects/${projectId}/save`)
        .set('Authorization', `Bearer ${token}`);

      // Segundo save
      const response = await request(app)
        .post(`/api/projects/${projectId}/save`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });
  });
});
