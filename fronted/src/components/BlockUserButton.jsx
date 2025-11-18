import { useState } from 'react';
import { blockUser, unblockUser } from '../api/followApi';

export default function BlockUserButton({ userId, isBlocked, onUpdate }) {
    const [loading, setLoading] = useState(false);
    // Bloquear usuario
    const handleBlock = async () => {
        if (!confirm('¿Estás seguro de bloquear a este usuario?')) return;

        setLoading(true);
        try {
            await blockUser(userId);
            if (onUpdate) onUpdate();
            alert('Usuario bloqueado');
        } catch (err) {
            console.error('Error blocking user:', err);
            alert(err.response?.data?.error || 'Error al bloquear usuario');
        } finally {
            setLoading(false);
        }
    };

    // Desbloquear usuario
    const handleUnblock = async () => {
        setLoading(true);
        try {
            await unblockUser(userId);
            if (onUpdate) onUpdate();
            alert('Usuario desbloqueado');
        } catch (err) {
            console.error('Error unblocking user:', err);
            alert(err.response?.data?.error || 'Error al desbloquear usuario');
        } finally {
            setLoading(false);
        }
    };

    // Renderizar botón
    return (
        <button
            onClick={isBlocked ? handleUnblock : handleBlock}
            disabled={loading}
            className={`btn ${isBlocked ? 'btn-unblock' : 'btn-block'}`}
        >
            {loading ? 'Procesando...' : isBlocked ? '✓ Desbloquear' : '🚫 Bloquear'}
        </button>
    );
}
