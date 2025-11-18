const express = require('express');
const { register, login } = require('../controllers/user/authController');
const { updateProfile, updatePassword, getNotificationPreferences, updateNotificationPreferences } = require('../controllers/user/profileController');
const { uploadAvatar, deleteAvatar } = require('../controllers/user/avatarController');
const { deleteAccount } = require('../controllers/user/accountController');
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

// Preferencias de notificaciones (requieren autenticación)
router.get('/notifications/preferences', authMiddleware, getNotificationPreferences);
router.put('/notifications/preferences', authMiddleware, updateNotificationPreferences);

// Eliminar cuenta (requiere autenticación)
router.delete('/account', authMiddleware, deleteAccount);

module.exports = router;
