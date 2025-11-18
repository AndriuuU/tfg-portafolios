import { useState, useEffect } from 'react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../api/api';
import '../styles/NotificationBell.scss';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Recargar cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      const wasUnread = notifications.find(n => n._id === notificationId && !n.read);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'like': '❤️',
      'comment': '💬',
      'follow': '👤',
      'follow_request': '🔔',
      'message': '💌',
      'invitation': '👥',
      'invitation_accepted': '✅',
      'invitation_rejected': '❌'
    };
    return icons[type] || '🔔';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `Hace ${diffInMinutes} min`;
    }
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInDays < 7) return `Hace ${diffInDays}d`;

    return date.toLocaleDateString('es-ES');
  };

  const getNotificationMessage = (notification) => {
    const messages = {
      'like': `${notification.sender.username} le dio like a tu proyecto`,
      'comment': `${notification.sender.username} comentó en tu proyecto`,
      'follow': `${notification.sender.username} te empezó a seguir`,
      'follow_request': `${notification.sender.username} te envió una solicitud de seguimiento`,
      'message': notification.message || `${notification.sender.username} te envió un mensaje`,
      'invitation': `${notification.sender.username} te invitó a colaborar en un proyecto`,
      'invitation_accepted': `${notification.sender.username} aceptó tu invitación de colaboración`,
      'invitation_rejected': `${notification.sender.username} rechazó tu invitación de colaboración`
    };
    return messages[notification.type] || 'Nueva notificación';
  };

  return (
    <div className="notification-bell">
      <button
        className="bell-button"
        onClick={() => setShowPanel(!showPanel)}
        aria-label="Notificaciones"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {showPanel && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read"
                onClick={handleMarkAllAsRead}
                title="Marcar todas como leídas"
              >
                ✓ Marcar todo
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-content">
                    <span className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="notification-text">
                      <p>{getNotificationMessage(notification)}</p>
                      <span className="notification-time">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                  <button
                    className="notification-close"
                    onClick={() => handleDeleteNotification(notification._id)}
                    title="Eliminar"
                  >
                    ✕
                  </button>
                  {!notification.read && (
                    <button
                      className="notification-read"
                      onClick={() => handleMarkAsRead(notification._id)}
                      title="Marcar como leído"
                    >
                      ●
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
