import { useState, useEffect } from 'react';
import { getFollowers, removeFollower } from '../api/followApi';
import { useNavigate } from 'react-router-dom';

export default function FollowersList({ userId, isOwnProfile }) {
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
        navigate(`/portfolio/${username}`);
    };

    if (loading) return <p>Cargando seguidores...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h3>Seguidores ({followers.length})</h3>
            {followers.length === 0 ? (
                <p>No hay seguidores</p>
            ) : (
                <ul>
                    {followers.map((follower) => (
                        <li key={follower._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
                            {follower.avatarUrl ? (
                                <img 
                                    src={follower.avatarUrl} 
                                    alt={follower.username}
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {follower.name?.charAt(0).toUpperCase() || follower.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div onClick={() => goToProfile(follower.username)} style={{ flex: 1 }}>
                                <strong>{follower.name}</strong> (@{follower.username})
                            </div>
                            {isOwnProfile && (
                                <button onClick={() => handleRemove(follower._id)} style={{ padding: '0.25rem 0.75rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
                                    Eliminar
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
