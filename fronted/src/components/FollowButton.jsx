import { useState, useEffect } from 'react';
import { followUser, unfollowUser, checkRelationship } from '../api/followApi';

export default function FollowButton({ userId, onUpdate }) {
    const [relationship, setRelationship] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadRelationship();
    }, [userId]);

    const loadRelationship = async () => {
        try {
            const res = await checkRelationship(userId);
            setRelationship(res.data);
        } catch (err) {
            console.error('Error loading relationship:', err);
            setError('Error al cargar la relación');
        }
    };

    const handleFollow = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await followUser(userId);
            await loadRelationship();
            if (onUpdate) onUpdate();

            if (res.data.status === 'pending') {
                alert('Solicitud enviada');
            }
        } catch (err) {
            console.error('Error following:', err);
            setError(err.response?.data?.error || 'Error al seguir');
        } finally {
            setLoading(false);
        }
    };

    const handleUnfollow = async () => {
        setLoading(true);
        setError(null);
        try {
            await unfollowUser(userId);
            await loadRelationship();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Error unfollowing:', err);
            setError(err.response?.data?.error || 'Error al dejar de seguir');
        } finally {
            setLoading(false);
        }
    };

    if (!relationship) return <p>Cargando...</p>;
    if (relationship.isOwnProfile) return null;
    if (relationship.isBlockedBy) return <p>No puedes seguir a este usuario</p>;

    return (
        <div>
            {error && <p>{error}</p>}

            {relationship.isBlocked ? (
                <p>Usuario bloqueado</p>
            ) : relationship.hasPendingRequest ? (
                <button disabled>Solicitud enviada</button>
            ) : relationship.isFollowing ? (
                <button onClick={handleUnfollow} disabled={loading}>
                    {loading ? 'Procesando...' : 'Dejar de seguir'}
                </button>
            ) : (
                <button onClick={handleFollow} disabled={loading}>
                    {loading ? 'Procesando...' : 'Seguir'}
                </button>
            )}
        </div>
    );
}
