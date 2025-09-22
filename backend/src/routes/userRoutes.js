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
