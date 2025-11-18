import { useState, useEffect } from 'react';
import { getFollowing, unfollowUser } from '../api/followApi';
import { useNavigate } from 'react-router-dom';

export default function FollowingList({ userId, isOwnProfile }) {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
      console.error('Error loading following:', err);
      setError(err.response?.data?.error || 'Error al cargar seguidos');
      setFollowing([]);
    } finally {
      setLoading(false);
    }
  };

  // Dejar de seguir usuario
  const handleUnfollow = async (userId) => {
    if (!confirm('¿Estás seguro de dejar de seguir a este usuario?')) return;
    
    try {
      await unfollowUser(userId);
      await loadFollowing();
    } catch (err) {
      console.error('Error unfollowing:', err);
      alert(err.response?.data?.error || 'Error al dejar de seguir');
    }
  };

  const goToProfile = (username) => {
    navigate(`/u/${username}`);
  };

  if (loading) return <p>Cargando seguidos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h3>Siguiendo ({following.length})</h3>
      {following.length === 0 ? (
        <p>No sigues a nadie</p>
      ) : (
        <ul>
          {following.map((user) => (
            <li key={user._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.username}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                </div>
              )}
              <div onClick={() => goToProfile(user.username)} style={{ flex: 1 }}>
                <strong>{user.name}</strong> (@{user.username})
              </div>
              {isOwnProfile && (
                <button onClick={() => handleUnfollow(user._id)} style={{ padding: '0.25rem 0.75rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
                  Dejar de seguir
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
