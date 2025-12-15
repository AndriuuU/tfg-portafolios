import { useState, useEffect } from 'react';
import { getFollowRequests, acceptFollowRequest, rejectFollowRequest } from '../api/followApi';
import { useNavigate } from 'react-router-dom';
import { useAlertModal } from '../hooks/useModals';
import AlertModal from './AlertModal';

export default function FollowRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const alertModal = useAlertModal();

    useEffect(() => {
        loadRequests();
    }, []);

    // Cargar solicitudes de seguimiento
    const loadRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getFollowRequests();
            setRequests(res.data?.requests || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al cargar solicitudes');
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    // Aceptar solicitud
    const handleAccept = async (userId) => {
        try {
            await acceptFollowRequest(userId);
            await loadRequests();
        } catch (err) {
            await alertModal.alert(
                err.response?.data?.error || 'Error al aceptar solicitud',
                { title: 'Error', type: 'error' }
            );
        }
    };

    // Rechazar solicitud
    const handleReject = async (userId) => {
        try {
            await rejectFollowRequest(userId);
            await loadRequests();
        } catch (err) {
            await alertModal.alert(
                err.response?.data?.error || 'Error al rechazar solicitud',
                { title: 'Error', type: 'error' }
            );
        }
    };

    const goToProfile = (username) => {
        navigate(`/u/${username}`);
    };

    if (loading) return <p>Cargando solicitudes...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <div className="user-list">
                <h3>Solicitudes pendientes ({requests.length})</h3>
            {requests.length === 0 ? (
                <div className="empty-state">
                    <p>No hay solicitudes pendientes</p>
                </div>
            ) : (
                <ul>
                    {requests.map((request) => (
                        <li key={request._id}>
                            <div className="user-avatar">
                                {request.avatarUrl ? (
                                    <img src={request.avatarUrl} alt={request.username} />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {request.name?.charAt(0).toUpperCase() || request.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="user-info">
                                <div className="user-name" onClick={() => goToProfile(request.username)}>
                                    {request.name}
                                </div>
                                <div className="user-username">@{request.username}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    className="action-btn" 
                                    onClick={() => handleAccept(request._id)}
                                    style={{ background: '#22c55e' }}
                                >
                                    ✓ Aceptar
                                </button>
                                <button 
                                    className="action-btn" 
                                    onClick={() => handleReject(request._id)}
                                >
                                    ✕ Rechazar
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            </div>
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
