const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../routes/authRoutes');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Configurar app de Express para tests
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Configurar variables de entorno para tests
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES = '7d';

describe('Auth Controller Tests', () => {
  
  describe('POST /api/auth/register', () => {
    it('debería registrar un nuevo usuario correctamente', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body.user).toHaveProperty('username', 'testuser');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('debería fallar si falta el username', async () => {
      const newUser = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('debería fallar si el email ya existe', async () => {
      const userData = {
        username: 'testuser1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      };

      // Crear primer usuario
      await request(app).post('/api/auth/register').send(userData);

      // Intentar crear segundo usuario con mismo email
      const duplicateUser = { ...userData, username: 'testuser2' };
      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('debería fallar si el username ya existe', async () => {
      const userData = {
        username: 'testuser',
        email: 'test1@example.com',
        name: 'Test User',
        password: 'password123'
      };

      // Crear primer usuario
      await request(app).post('/api/auth/register').send(userData);

      // Intentar crear segundo usuario con mismo username
      const duplicateUser = { ...userData, email: 'test2@example.com' };
      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Crear un usuario de prueba
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword
      });
    });

    it('debería hacer login correctamente con email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('debería hacer login correctamente con username', async () => {
      // Buscar el usuario por username para obtener el email
      const user = await User.findOne({ username: 'testuser' });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', 'testuser');
    });

    it('debería fallar con contraseña incorrecta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('debería fallar con usuario no existente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('debería fallar si faltan credenciales', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/auth/profile', () => {
    let token;
    let userId;

    beforeEach(async () => {
      // Crear usuario y obtener token
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
    });

    it('debería actualizar el perfil correctamente', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          username: 'updateduser',
          email: 'updated@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('name', 'Updated Name');
      expect(response.body.user).toHaveProperty('username', 'updateduser');
      expect(response.body.user).toHaveProperty('email', 'updated@example.com');
    });

    it('debería fallar sin token de autenticación', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send({
          name: 'Updated Name'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/auth/password', () => {
    let token;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword
      });
      token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
      });
    });

    it('debería cambiar la contraseña correctamente', async () => {
      const response = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword456'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('debería fallar con contraseña actual incorrecta', async () => {
      const response = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword456'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('debería fallar sin autenticación', async () => {
      const response = await request(app)
        .put('/api/auth/password')
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword456'
        });

      expect(response.status).toBe(401);
    });
  });
});
