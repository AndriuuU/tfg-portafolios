import { useState, useEffect } from 'react';
import { getFollowers, removeFollower } from '../api/followApi';
import { useNavigate } from 'react-router-dom';
import '../styles/components/Modal.scss';

export default function FollowersList({ userId, isOwnProfile, onClose }) {
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadFollowers();
    }, [userId]);

    // Cargar seguidores
    const loadFollowers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getFollowers(userId);
            setFollowers(res.data?.followers || []);
        } catch (err) {
            console.error('Error loading followers:', err);
            setError(err.response?.data?.error || 'Error al cargar seguidores');
            setFollowers([]);
        } finally {
            setLoading(false);
        }
    };

    // Eliminar seguidor
    const handleRemove = async (followerId) => {
        if (!confirm('¿Estás seguro de eliminar este seguidor?')) return;

        try {
            await removeFollower(followerId);
            await loadFollowers();
        } catch (err) {
            console.error('Error removing follower:', err);
            alert(err.response?.data?.error || 'Error al eliminar seguidor');
        }
    };

    const goToProfile = (username) => {
        navigate(`/u/${username}`);
        if (onClose) onClose();
    };

    if (loading) return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Seguidores</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <p className="loading-text">Cargando seguidores...</p>
                </div>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Seguidores</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <p className="error-text">{error}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Seguidores ({followers.length})</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    {followers.length === 0 ? (
                        <div className="empty-state">
                            <p>No hay seguidores</p>
                        </div>
                    ) : (
                        <ul className="users-list">
                            {followers.map((follower) => (
                                <li key={follower._id} className="user-item">
                                    <div className="user-avatar">
                                        {follower.avatarUrl ? (
                                            <img 
                                                src={follower.avatarUrl} 
                                                alt={follower.username}
                                            />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {follower.name?.charAt(0).toUpperCase() || follower.username?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="user-info" onClick={() => goToProfile(follower.username)}>
                                        <div className="user-name">{follower.name}</div>
                                        <div className="user-username">@{follower.username}</div>
                                    </div>
                                    {isOwnProfile && (
                                        <button onClick={() => handleRemove(follower._id)} className="btn-remove">
                                            Eliminar
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
