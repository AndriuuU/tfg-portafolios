const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/authRoutes');
const projectRoutes = require('../routes/projectRoutes');
const searchRoutes = require('../routes/searchRoutes');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Project = require('../models/Project');

// Configurar app de Express para tests
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/search', searchRoutes);

// Configurar variables de entorno para tests
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES = '7d';

describe('Search Projects API', () => {
  let authToken;
  let userId;
  let project1Id, project2Id, project3Id;

  beforeAll(async () => {
    // Crear usuario de prueba
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'searchuser',
        email: 'search@test.com',
        name: 'Search User',
        password: 'password123'
      });

    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'search@test.com',
        password: 'password123'
      });

    authToken = loginRes.body.token;
    userId = loginRes.body.user.id;

    // Crear proyectos de prueba
    const project1 = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'E-commerce React',
        slug: 'ecommerce-react',
        description: 'Tienda online desarrollada con React y Node.js',
        tags: ['react', 'nodejs', 'mongodb']
      });
    project1Id = project1.body._id;

    const project2 = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Portfolio Personal',
        slug: 'portfolio-personal',
        description: 'Mi portfolio personal con Next.js',
        tags: ['nextjs', 'typescript', 'tailwind']
      });
    project2Id = project2.body._id;

    const project3 = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Blog con Gatsby',
        slug: 'blog-gatsby',
        description: 'Blog estático usando Gatsby y GraphQL',
        tags: ['gatsby', 'graphql', 'react']
      });
    project3Id = project3.body._id;
  });

  // Crear proyectos antes de cada test porque afterEach limpia la DB
  beforeEach(async () => {
    // Verificar si el usuario existe, si no, recrearlo
    let user = await User.findById(userId);
    if (!user) {
      user = await User.create({
        _id: userId,
        username: 'searchuser',
        email: 'search@test.com',
        name: 'Search User',
        password: '$2a$10$CwTycUXWue0Thq9StjUM0uJ8xJFsrDEi4VULPcZfyWgPYr8d8X7ke' // password123 hasheado
      });
    }
    
    // Verificar si los proyectos ya existen, si no, recrearlos
    const existingProjects = await Project.countDocuments({ owner: userId });
    
    if (existingProjects === 0) {
      const project1 = await Project.create({
        owner: userId,
        title: 'E-commerce React',
        slug: 'ecommerce-react',
        description: 'Tienda online desarrollada con React y Node.js',
        tags: ['react', 'nodejs', 'mongodb'],
        images: []
      });
      project1Id = project1._id;

      const project2 = await Project.create({
        owner: userId,
        title: 'Portfolio Personal',
        slug: 'portfolio-personal',
        description: 'Mi portfolio personal con Next.js',
        tags: ['nextjs', 'typescript', 'tailwind'],
        images: []
      });
      project2Id = project2._id;

      const project3 = await Project.create({
        owner: userId,
        title: 'Blog con Gatsby',
        slug: 'blog-gatsby',
        description: 'Blog estático usando Gatsby y GraphQL',
        tags: ['gatsby', 'graphql', 'react'],
        images: []
      });
      project3Id = project3._id;
    }
  });

  describe('GET /api/search/projects', () => {
    it('debería buscar proyectos por texto en título', async () => {
      const res = await request(app)
        .get('/api/search/projects')
        .query({ q: 'portfolio' });

      expect(res.status).toBe(200);
      expect(res.body.projects).toBeDefined();
      expect(res.body.projects.length).toBeGreaterThan(0);
      expect(res.body.projects[0].title).toMatch(/portfolio/i);
    });

    it('debería buscar proyectos por texto en descripción', async () => {
      const res = await request(app)
        .get('/api/search/projects')
        .query({ q: 'Next.js' });

      expect(res.status).toBe(200);
      expect(res.body.projects).toBeDefined();
      expect(res.body.projects.length).toBeGreaterThan(0);
    });

    it('debería filtrar proyectos por tags', async () => {
      const res = await request(app)
        .get('/api/search/projects')
        .query({ tags: 'react' });

      expect(res.status).toBe(200);
      expect(res.body.projects).toBeDefined();
      expect(res.body.projects.length).toBeGreaterThan(0);
      
      // Verificar que todos los proyectos tienen el tag 'react'
      res.body.projects.forEach(project => {
        expect(project.tags).toContain('react');
      });
    });

    it('debería filtrar por múltiples tags', async () => {
      const res = await request(app)
        .get('/api/search/projects')
        .query({ tags: 'react,nodejs' });

      expect(res.status).toBe(200);
      expect(res.body.projects).toBeDefined();
    });

    it('debería paginar correctamente los resultados', async () => {
      const res = await request(app)
        .get('/api/search/projects')
        .query({ page: 1, limit: 2 });

      expect(res.status).toBe(200);
      expect(res.body.projects).toBeDefined();
      expect(res.body.projects.length).toBeLessThanOrEqual(2);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
    });

    it('debería incluir metadatos de paginación', async () => {
      const res = await request(app)
        .get('/api/search/projects')
        .query({ limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination).toHaveProperty('total');
      expect(res.body.pagination).toHaveProperty('page');
      expect(res.body.pagination).toHaveProperty('limit');
      expect(res.body.pagination).toHaveProperty('totalPages');
      expect(res.body.pagination).toHaveProperty('hasNextPage');
      expect(res.body.pagination).toHaveProperty('hasPrevPage');
    });

    it('debería ordenar por fecha de creación (desc por defecto)', async () => {
      const res = await request(app)
        .get('/api/search/projects')
        .query({ sortBy: 'createdAt', order: 'desc' });

      expect(res.status).toBe(200);
      expect(res.body.projects).toBeDefined();
      
      if (res.body.projects.length > 1) {
        const firstDate = new Date(res.body.projects[0].createdAt);
        const secondDate = new Date(res.body.projects[1].createdAt);
        expect(firstDate >= secondDate).toBe(true);
      }
    });

    it('debería ordenar por título ascendente', async () => {
      const res = await request(app)
        .get('/api/search/projects')
        .query({ sortBy: 'title', order: 'asc' });

      expect(res.status).toBe(200);
      expect(res.body.projects).toBeDefined();
      
      if (res.body.projects.length > 1) {
        const titles = res.body.projects.map(p => p.title);
        const sortedTitles = [...titles].sort();
        expect(titles).toEqual(sortedTitles);
      }
    });

    it('debería filtrar por owner (usuario específico)', async () => {
      const res = await request(app)
        .get('/api/search/projects')
        .query({ owner: userId });

      expect(res.status).toBe(200);
      expect(res.body.projects).toBeDefined();
      
      // Verificar que todos los proyectos pertenecen al usuario
      res.body.projects.forEach(project => {
        expect(project.owner._id).toBe(userId);
      });
    });

    it('debería combinar múltiples filtros', async () => {
      const res = await request(app)
        .get('/api/search/projects')
        .query({
          q: 'react',
          tags: 'react',
          sortBy: 'createdAt',
          order: 'desc',
          page: 1,
          limit: 10
        });

      expect(res.status).toBe(200);
      expect(res.body.projects).toBeDefined();
      expect(res.body.pagination).toBeDefined();
    });

    it('debería retornar array vacío cuando no hay resultados', async () => {
      const res = await request(app)
        .get('/api/search/projects')
        .query({ q: 'palabraquenodeberiaexistir123456789' });

      expect(res.status).toBe(200);
      expect(res.body.projects).toBeDefined();
      expect(res.body.projects).toEqual([]);
      expect(res.body.pagination.total).toBe(0);
    });

    it('debería incluir información del owner poblada', async () => {
      const res = await request(app)
        .get('/api/search/projects')
        .query({ limit: 1 });

      expect(res.status).toBe(200);
      
      if (res.body.projects.length > 0) {
        const project = res.body.projects[0];
        expect(project.owner).toBeDefined();
        expect(project.owner).toHaveProperty('username');
        expect(project.owner).toHaveProperty('name');
        expect(project.owner).toHaveProperty('email');
      }
    });
  });

  describe('Edge Cases', () => {
    it('debería manejar parámetros de página inválidos', async () => {
      const res = await request(app)
        .get('/api/search/projects')
        .query({ page: 'invalid' });

      expect(res.status).toBe(200);
      // Debería usar el valor por defecto (1)
      expect(res.body.pagination.page).toBe(1);
    });

    it('debería manejar límites muy grandes', async () => {
      const res = await request(app)
        .get('/api/search/projects')
        .query({ limit: 1000 });

      expect(res.status).toBe(200);
      expect(res.body.projects).toBeDefined();
    });

    it('debería funcionar sin parámetros (devolver todos)', async () => {
      const res = await request(app)
        .get('/api/search/projects');

      expect(res.status).toBe(200);
      expect(res.body.projects).toBeDefined();
      expect(res.body.pagination).toBeDefined();
    });
  });
});
