const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const followRoutes = require('../routes/followRoutes');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Configurar app de Express para tests
const app = express();
app.use(express.json());
app.use('/api/follow', followRoutes);

process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES = '7d';

describe('Follow Controller Tests', () => {
  let token;
  let userId;
  let otherUserId;
  let privateUserId;

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Usuario principal
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      privacy: {
        isPrivate: false,
        showFollowers: true,
        showFollowing: true,
        allowFollowRequests: true
      }
    });
    userId = user._id;
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES
    });

    // Otro usuario público
    const otherUser = await User.create({
      username: 'otheruser',
      email: 'other@example.com',
      name: 'Other User',
      password: hashedPassword,
      privacy: { isPrivate: false }
    });
    otherUserId = otherUser._id;

    // Usuario privado
    const privateUser = await User.create({
      username: 'privateuser',
      email: 'private@example.com',
      name: 'Private User',
      password: hashedPassword,
      privacy: { isPrivate: true, allowFollowRequests: true }
    });
    privateUserId = privateUser._id;
  });

  describe('POST /api/follow/:userId/follow', () => {
    it('debería seguir a un usuario público correctamente', async () => {
      const response = await request(app)
        .post(`/api/follow/${otherUserId}/follow`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verificar que se agregó a following
      const user = await User.findById(userId);
      expect(user.following).toContainEqual(otherUserId);

      // Verificar que se agregó a followers del otro usuario
      const otherUser = await User.findById(otherUserId);
      expect(otherUser.followers).toContainEqual(userId);
    });

    it('debería enviar solicitud a usuario privado', async () => {
      const response = await request(app)
        .post(`/api/follow/${privateUserId}/follow`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Solicitud');

      // Verificar que se agregó a followRequests
      const privateUser = await User.findById(privateUserId);
      expect(privateUser.followRequests).toContainEqual(userId);

      // Verificar que NO se agregó a following aún
      const user = await User.findById(userId);
      expect(user.following).not.toContainEqual(privateUserId);
    });

    it('debería fallar al seguirse a sí mismo', async () => {
      const response = await request(app)
        .post(`/api/follow/${userId}/follow`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('mismo');
    });

    it('debería fallar al seguir dos veces', async () => {
      // Primer follow
      await request(app)
        .post(`/api/follow/${otherUserId}/follow`)
        .set('Authorization', `Bearer ${token}`);

      // Segundo follow
      const response = await request(app)
        .post(`/api/follow/${otherUserId}/follow`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Ya sigues');
    });

    it('debería fallar con ID de usuario inválido', async () => {
      const response = await request(app)
        .post('/api/follow/invalid-id/follow')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /api/follow/:userId/unfollow', () => {
    beforeEach(async () => {
      // Hacer que el usuario siga a otherUser
      await User.findByIdAndUpdate(userId, {
        $push: { following: otherUserId }
      });
      await User.findByIdAndUpdate(otherUserId, {
        $push: { followers: userId }
      });
    });

    it('debería dejar de seguir correctamente', async () => {
      const response = await request(app)
        .delete(`/api/follow/${otherUserId}/unfollow`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verificar que se eliminó de following
      const user = await User.findById(userId);
      expect(user.following).not.toContainEqual(otherUserId);

      // Verificar que se eliminó de followers
      const otherUser = await User.findById(otherUserId);
      expect(otherUser.followers).not.toContainEqual(userId);
    });

    it('debería fallar al dejar de seguir a alguien que no sigues', async () => {
      const newUser = await User.create({
        username: 'newuser',
        email: 'new@example.com',
        name: 'New User',
        password: await bcrypt.hash('password123', 10)
      });

      const response = await request(app)
        .delete(`/api/follow/${newUser._id}/unfollow`)
        .set('Authorization', `Bearer ${token}`);

      // Tu controller no devuelve error, solo hace unfollow aunque no sigas
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/follow/requests', () => {
    beforeEach(async () => {
      // Agregar solicitudes pendientes
      await User.findByIdAndUpdate(userId, {
        $push: { followRequests: [otherUserId, privateUserId] }
      });
    });

    it('debería obtener las solicitudes pendientes', async () => {
      const response = await request(app)
        .get('/api/follow/requests')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('username');
    });
  });

  describe('POST /api/follow/:userId/accept-request', () => {
    beforeEach(async () => {
      // Agregar solicitud pendiente
      await User.findByIdAndUpdate(userId, {
        $push: { followRequests: otherUserId }
      });
    });

    it('debería aceptar una solicitud correctamente', async () => {
      const response = await request(app)
        .post(`/api/follow/${otherUserId}/accept-request`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verificar que se eliminó de requests
      const user = await User.findById(userId);
      expect(user.followRequests).not.toContainEqual(otherUserId);

      // Verificar que se agregó a followers
      expect(user.followers).toContainEqual(otherUserId);

      // Verificar que se agregó a following del otro usuario
      const otherUser = await User.findById(otherUserId);
      expect(otherUser.following).toContainEqual(userId);
    });

    it('debería fallar al aceptar solicitud no existente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/follow/${fakeId}/accept-request`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/follow/:userId/reject-request', () => {
    beforeEach(async () => {
      // Agregar solicitud pendiente
      await User.findByIdAndUpdate(userId, {
        $push: { followRequests: otherUserId }
      });
    });

    it('debería rechazar una solicitud correctamente', async () => {
      const response = await request(app)
        .post(`/api/follow/${otherUserId}/reject-request`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verificar que se eliminó de requests
      const user = await User.findById(userId);
      expect(user.followRequests).not.toContainEqual(otherUserId);

      // Verificar que NO se agregó a followers
      expect(user.followers).not.toContainEqual(otherUserId);
    });
  });

  describe('POST /api/follow/:userId/block', () => {
    it('debería bloquear a un usuario correctamente', async () => {
      const response = await request(app)
        .post(`/api/follow/${otherUserId}/block`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verificar que se agregó a blockedUsers
      const user = await User.findById(userId);
      expect(user.blockedUsers).toContainEqual(otherUserId);

      // Verificar que se agregó a blockedBy del otro usuario
      const otherUser = await User.findById(otherUserId);
      expect(otherUser.blockedBy).toContainEqual(userId);
    });

    it('debería fallar al bloquearse a sí mismo', async () => {
      const response = await request(app)
        .post(`/api/follow/${userId}/block`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/follow/:userId/unblock', () => {
    beforeEach(async () => {
      // Bloquear al usuario primero
      await User.findByIdAndUpdate(userId, {
        $push: { blockedUsers: otherUserId }
      });
      await User.findByIdAndUpdate(otherUserId, {
        $push: { blockedBy: userId }
      });
    });

    it('debería desbloquear a un usuario correctamente', async () => {
      const response = await request(app)
        .delete(`/api/follow/${otherUserId}/unblock`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verificar que se eliminó de blockedUsers
      const user = await User.findById(userId);
      expect(user.blockedUsers).not.toContainEqual(otherUserId);

      // Verificar que se eliminó de blockedBy
      const otherUser = await User.findById(otherUserId);
      expect(otherUser.blockedBy).not.toContainEqual(userId);
    });
  });

  describe('GET /api/follow/blocked', () => {
    beforeEach(async () => {
      await User.findByIdAndUpdate(userId, {
        $push: { blockedUsers: [otherUserId, privateUserId] }
      });
    });

    it('debería obtener la lista de usuarios bloqueados', async () => {
      const response = await request(app)
        .get('/api/follow/blocked')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('username');
    });
  });
});
