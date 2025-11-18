const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/social/notificationController');

// Obtener notificaciones
router.get('/', authMiddleware, getNotifications);

// Marcar como leída
router.put('/:notificationId/read', authMiddleware, markAsRead);

// Marcar todas como leídas
router.put('/read/all', authMiddleware, markAllAsRead);

// Eliminar notificación
router.delete('/:notificationId', authMiddleware, deleteNotification);

module.exports = router;
