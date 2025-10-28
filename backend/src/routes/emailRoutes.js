const express = require('express');
const { 
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  getEmailStatus
} = require('../controllers/emailController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Verificación de email (público)
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// Recuperación de contraseña (público)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Estado de verificación (requiere autenticación)
router.get('/status', authMiddleware, getEmailStatus);

module.exports = router;
