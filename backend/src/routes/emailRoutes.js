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

// Middleware para limpiar y normalizar tokens
const cleanToken = (req, res, next) => {
  if (req.params.token) {
    let token = req.params.token;
    token = token.trim();
    token = token.replace(/\s+/g, '');
    token = decodeURIComponent(token);
    // NO convertir a minúsculas porque los tokens son case-sensitive
    req.params.token = token;
  }
  next();
};

// Verificación de email (público)
router.get('/verify/:token', cleanToken, verifyEmail);

router.post('/resend-verification', resendVerificationEmail);

// Recuperación de contraseña (público)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', cleanToken, resetPassword);

// Estado de verificación (requiere autenticación)
router.get('/status', authMiddleware, getEmailStatus);

module.exports = router;
