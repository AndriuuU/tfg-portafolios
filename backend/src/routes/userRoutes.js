const express = require('express');
const User = require('../models/User');
const Project = require("../models/Project");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");


// Crear usuario (temporal, sin auth)
router.post('/', async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar todos los usuarios
router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Obtener usuarios recomendados (usuarios que no sigues)
router.get('/recommended/users', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // IDs de usuarios que ya sigue o bloqueó
    const excludeIds = [
      req.user.id,
      ...currentUser.following,
      ...currentUser.blockedUsers,
    ];

    // Buscar usuarios excluyendo los que ya sigue
    const recommendedUsers = await User.find({
      _id: { $nin: excludeIds }
    })
      .select('username name email avatarUrl')
      .limit(20)
      .sort({ createdAt: -1 }); // Usuarios más recientes primero

    res.json({ users: recommendedUsers });
  } catch (error) {
    console.error('Error getting recommended users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Middleware de autenticación
router.get("/me/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const projects = await Project.find({ owner: user._id });

    res.json({ user, projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener perfil público por username
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password");
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const projects = await Project.find({ owner: user._id });
    res.json({ user, projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
