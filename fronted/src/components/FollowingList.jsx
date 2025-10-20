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
    navigate(`/portfolio/${username}`);
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
            <li key={user._id}>
              <div onClick={() => goToProfile(user.username)}>
                <strong>{user.name}</strong> (@{user.username})
              </div>
              {isOwnProfile && (
                <button onClick={() => handleUnfollow(user._id)}>
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
