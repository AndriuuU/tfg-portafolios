import { useState, useEffect } from 'react';
import { getFollowing, unfollowUser } from '../api/followApi';
import { useNavigate } from 'react-router-dom';
import { useConfirmModal, useAlertModal } from '../hooks/useModals';
import ConfirmModal from './ConfirmModal';
import AlertModal from './AlertModal';
import '../styles/components/Modal.scss';

export default function FollowingList({ userId, isOwnProfile, onClose }) {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const confirmModal = useConfirmModal();
  const alertModal = useAlertModal();

  useEffect(() => {
    loadFollowing();
  }, [userId]);

  // Cargar seguidos
  const loadFollowing = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFollowing(userId);
      setFollowing(res.data?.following || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar seguidos');
      setFollowing([]);
    } finally {
      setLoading(false);
    }
  };

  // Dejar de seguir usuario
  const handleUnfollow = async (userId) => {
    const confirmed = await confirmModal.confirm(
      '¿Estás seguro de dejar de seguir a este usuario?',
      { 
        title: 'Dejar de Seguir',
        confirmText: 'Dejar de Seguir',
        cancelText: 'Cancelar'
      }
    );
    
    if (confirmed) {
      try {
        await unfollowUser(userId);
        await loadFollowing();
      } catch (err) {
        await alertModal.alert(
          err.response?.data?.error || 'Error al dejar de seguir',
          { title: 'Error', type: 'error' }
        );
      }
    }
  };

  const goToProfile = (username) => {
    navigate(`/u/${username}`);
    if (onClose) onClose();
  };

  if (loading) return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Siguiendo</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <p className="loading-text">Cargando seguidos...</p>
          </div>
        </div>
      </div>
      <ConfirmModal {...confirmModal} />
      <AlertModal 
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={alertModal.close}
      />
    </>
  );
  
  if (error) return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Siguiendo</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <p className="error-text">{error}</p>
          </div>
        </div>
      </div>
      <ConfirmModal {...confirmModal} />
      <AlertModal 
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={alertModal.close}
      />
    </>
  );

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Siguiendo ({following.length})</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {following.length === 0 ? (
            <div className="empty-state">
              <p>No sigues a nadie</p>
            </div>
          ) : (
            <ul className="users-list">
              {following.map((user) => (
                <li key={user._id} className="user-item">
                  <div className="user-avatar">
                    {user.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user.username}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="user-info" onClick={() => goToProfile(user.username)}>
                    <div className="user-name">{user.name}</div>
                    <div className="user-username">@{user.username}</div>
                  </div>
                  {isOwnProfile && (
                    <button onClick={() => handleUnfollow(user._id)} className="btn-remove">
                      Dejar de seguir
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
    <ConfirmModal {...confirmModal} />
    <AlertModal 
      isOpen={alertModal.isOpen}
      title={alertModal.title}
      message={alertModal.message}
      type={alertModal.type}
      onClose={alertModal.close}
    />
    </>
  );
}
