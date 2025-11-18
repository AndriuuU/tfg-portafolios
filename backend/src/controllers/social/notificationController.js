const Notification = require('../../models/Notification');
const User = require('../../models/User');

// Obtener notificaciones del usuario
exports.getNotifications = async (req, res) => {
  try {
    const { unreadOnly } = req.query;
    const query = { recipient: req.user.id };

    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'username avatar avatarUrl name')
      .populate('project', 'title slug')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      read: false
    });

    res.json({ 
      notifications, 
      unreadCount 
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Error al obtener notificaciones' });
  }
};

// Marcar notificación como leída
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    res.json({ message: 'Notificación marcada como leída', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error al marcar notificación como leída' });
  }
};

// Marcar todas las notificaciones como leídas
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );

    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ message: 'Error al marcar notificaciones como leídas' });
  }
};

// Eliminar notificación
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findByIdAndDelete(notificationId);

    res.json({ message: 'Notificación eliminada' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error al eliminar notificación' });
  }
};

// Crear notificación (función auxiliar)
exports.createNotification = async (recipient, sender, type, options = {}) => {
  try {
    if (recipient.toString() === sender.toString()) {
      return; // No enviar notificación al mismo usuario
    }

    const notification = new Notification({
      recipient,
      sender,
      type,
      project: options.project,
      message: options.message
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
