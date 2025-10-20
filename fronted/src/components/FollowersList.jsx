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
            <li key={follower._id}>
              <div onClick={() => goToProfile(follower.username)}>
                <strong>{follower.name}</strong> (@{follower.username})
              </div>
              {isOwnProfile && (
                <button onClick={() => handleRemove(follower._id)}>
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
