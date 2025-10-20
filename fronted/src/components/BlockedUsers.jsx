import { useState, useEffect } from 'react';
import { getBlockedUsers, unblockUser } from '../api/followApi';
import { useNavigate } from 'react-router-dom';

export default function BlockedUsers() {
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadBlockedUsers();
    }, []);

    // Cargar usuarios bloqueados
    const loadBlockedUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getBlockedUsers();
            setBlockedUsers(res.data?.blockedUsers || []);
        } catch (err) {
            console.error('Error loading blocked users:', err);
            setError(err.response?.data?.error || 'Error al cargar usuarios bloqueados');
            setBlockedUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Desbloquear usuario
    const handleUnblock = async (userId) => {
        if (!confirm('¿Estás seguro de desbloquear a este usuario?')) return;

        try {
            await unblockUser(userId);
            await loadBlockedUsers();
        } catch (err) {
            console.error('Error unblocking user:', err);
            alert(err.response?.data?.error || 'Error al desbloquear usuario');
        }
    };

    const goToProfile = (username) => {
        navigate(`/portfolio/${username}`);
    };

    if (loading) return <p>Cargando usuarios bloqueados...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Usuarios bloqueados ({blockedUsers.length})</h2>
            {blockedUsers.length === 0 ? (
                <p>No has bloqueado a ningún usuario</p>
            ) : (
                <ul>
                    {blockedUsers.map((user) => (
                        <li key={user._id}>
                            <div onClick={() => goToProfile(user.username)}>
                                <strong>{user.name}</strong> (@{user.username})
                            </div>
                            <button onClick={() => handleUnblock(user._id)}>
                                Desbloquear
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
