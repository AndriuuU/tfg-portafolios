import { useState, useEffect } from 'react';
import { followUser, unfollowUser, checkRelationship } from '../api/followApi';
import { useAlertModal } from '../hooks/useModals';
import AlertModal from './AlertModal';

export default function FollowButton({ userId, onUpdate }) {
    const [relationship, setRelationship] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const alertModal = useAlertModal();

    useEffect(() => {
        loadRelationship();
    }, [userId]);

    const loadRelationship = async () => {
        try {
            const res = await checkRelationship(userId);
            setRelationship(res.data);
        } catch (err) {
            setError('Error al cargar la relación');
        }
    };

    // Seguir usuario
    const handleFollow = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await followUser(userId);
            await loadRelationship();
            if (onUpdate) onUpdate();

            if (res.data.status === 'pending') {
                await alertModal.alert('Solicitud enviada', { title: 'Solicitud de Seguimiento', type: 'info' });
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Error al seguir');
        } finally {
            setLoading(false);
        }
    };
    
    // Dejar de seguir usuario
    const handleUnfollow = async () => {
        setLoading(true);
        setError(null);
        try {
            await unfollowUser(userId);
            await loadRelationship();
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al dejar de seguir');
        } finally {
            setLoading(false);
        }
    };

    if (!relationship) return <p>Cargando...</p>;
    if (relationship.isOwnProfile) return null;
    if (relationship.isBlockedBy) return <p>No puedes seguir a este usuario</p>;

    return (
        <>
            <div>
                {error && <p>{error}</p>}

                {relationship.isBlocked ? (
                    <p>Usuario bloqueado</p>
                ) : relationship.hasPendingRequest ? (
                    <button className="btn btn-follow" disabled>Solicitud enviada</button>
                ) : relationship.isFollowing ? (
                    <button className="btn btn-follow following" onClick={handleUnfollow} disabled={loading}>
                        {loading ? 'Procesando...' : 'Dejar de seguir'}
                    </button>
                ) : (
                    <button className="btn btn-follow" onClick={handleFollow} disabled={loading}>
                        {loading ? 'Procesando...' : 'Seguir'}
                    </button>
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
