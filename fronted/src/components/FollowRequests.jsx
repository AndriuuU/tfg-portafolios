import { useState, useEffect } from 'react';
import { getFollowRequests, acceptFollowRequest, rejectFollowRequest } from '../api/followApi';
import { useNavigate } from 'react-router-dom';

export default function FollowRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFollowRequests();
      setRequests(res.data?.requests || []);
    } catch (err) {
      console.error('Error loading requests:', err);
      setError(err.response?.data?.error || 'Error al cargar solicitudes');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (userId) => {
    try {
      await acceptFollowRequest(userId);
      await loadRequests();
    } catch (err) {
      console.error('Error accepting request:', err);
      alert(err.response?.data?.error || 'Error al aceptar solicitud');
    }
  };

  const handleReject = async (userId) => {
    try {
      await rejectFollowRequest(userId);
      await loadRequests();
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert(err.response?.data?.error || 'Error al rechazar solicitud');
    }
  };

  const goToProfile = (username) => {
    navigate(`/portfolio/${username}`);
  };

  if (loading) return <p>Cargando solicitudes...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Solicitudes de seguimiento ({requests.length})</h2>
      {requests.length === 0 ? (
        <p>No hay solicitudes pendientes</p>
      ) : (
        <ul>
          {requests.map((request) => (
            <li key={request._id}>
              <div onClick={() => goToProfile(request.username)}>
                <strong>{request.name}</strong> (@{request.username})
              </div>
              <div>
                <button onClick={() => handleAccept(request._id)}>
                  Aceptar
                </button>
                <button onClick={() => handleReject(request._id)}>
                  Rechazar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
