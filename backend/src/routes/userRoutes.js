const express = require('express');
const User = require('../models/User');
const router = express.Router();

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

module.exports = router;
