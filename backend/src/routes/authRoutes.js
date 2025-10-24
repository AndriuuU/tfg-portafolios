const express = require('express');
const { 
  register, 
  login, 
  updateProfile, 
  updatePassword, 
  uploadAvatar, 
  deleteAvatar,
  // TODO: Descomentar cuando implementes funcionalidades de email
  // verifyEmail,
  // resendVerificationEmail,
  // forgotPassword,
  // resetPassword
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const router = express.Router();

// Autenticación básica
router.post('/register', register);
router.post('/login', login);

// TODO: Descomentar cuando implementes verificación de email
// Verificación de email
// router.get('/verify-email/:token', verifyEmail);
// router.post('/resend-verification', resendVerificationEmail);

// TODO: Descomentar cuando implementes recuperación de contraseña
// Recuperación de contraseña
// router.post('/forgot-password', forgotPassword);
// router.post('/reset-password/:token', resetPassword);

// Perfil (requieren autenticación)
router.put('/profile', authMiddleware, updateProfile);
router.put('/password', authMiddleware, updatePassword);
router.post('/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', authMiddleware, deleteAvatar);

module.exports = router;
