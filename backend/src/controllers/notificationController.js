const Notification = require('../models/Notification');

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const { unreadOnly } = req.query;
    const filter = { recipient: req.user.id };
    
    if (unreadOnly === 'true') {
      filter.read = false;
    }

    const notifications = await Notification.find(filter)
      .populate('sender', 'username avatarUrl')
      .populate('project', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user.id, 
      read: false 
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error getNotifications:", error);
    res.status(500).json({ error: error.message });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { read: true },
      { new: true }
    ).populate('sender', 'username avatarUrl')
     .populate('project', 'title');

    if (!notification) {
      return res.status(404).json({ error: "Notificación no encontrada" });
    }

    res.json(notification);
  } catch (error) {
    console.error("Error markAsRead:", error);
    res.status(500).json({ error: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );

    res.json({ message: "Todas las notificaciones marcadas como leídas" });
  } catch (error) {
    console.error("Error markAllAsRead:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({ error: "Notificación no encontrada" });
    }

    res.json({ message: "Notificación eliminada" });
  } catch (error) {
    console.error("Error deleteNotification:", error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to create notifications (prevents self-notifications)
exports.createNotification = async (recipientId, senderId, type, options = {}) => {
  try {
    // Don't send notifications to yourself
    if (recipientId.toString() === senderId.toString()) {
      return null;
    }

    // Check if a similar notification already exists (within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existingNotification = await Notification.findOne({
      recipient: recipientId,
      sender: senderId,
      type: type,
      project: options.projectId,
      createdAt: { $gte: oneHourAgo }
    });

    if (existingNotification) {
      return existingNotification;
    }

    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type: type,
      project: options.projectId,
      message: options.message
    });

    await notification.save();
    
    return await notification.populate('sender', 'username avatarUrl').populate('project', 'title');
  } catch (error) {
    console.error("Error createNotification:", error);
    return null;
  }
};
