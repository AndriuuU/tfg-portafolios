const express = require('express');
const { 
  register, 
  login, 
  updateProfile, 
  updatePassword, 
  uploadAvatar, 
  deleteAvatar
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const router = express.Router();

// Autenticación básica
router.post('/register', register);
router.post('/login', login);

// Perfil (requieren autenticación)
router.put('/profile', authMiddleware, updateProfile);
router.put('/password', authMiddleware, updatePassword);
router.post('/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', authMiddleware, deleteAvatar);

module.exports = router;
