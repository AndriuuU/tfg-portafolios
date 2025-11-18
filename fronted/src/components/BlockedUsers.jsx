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
        navigate(`/u/${username}`);
    };

    if (loading) return <p>Cargando usuarios bloqueados...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="user-list">
            <h3>Usuarios bloqueados ({blockedUsers.length})</h3>
            {blockedUsers.length === 0 ? (
                <div className="empty-state">
                    <p>No has bloqueado a ningún usuario</p>
                </div>
            ) : (
                <ul>
                    {blockedUsers.map((user) => (
                        <li key={user._id}>
                            <div className="user-avatar">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.username} />
                                ) : (
                                    <div style={{
                                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '700',
                                        fontSize: '16px'
                                    }}>
                                        {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="user-info">
                                <div className="user-name" onClick={() => goToProfile(user.username)}>
                                    {user.name}
                                </div>
                                <div className="user-username">@{user.username}</div>
                            </div>
                            <button 
                                className="action-btn"
                                onClick={() => handleUnblock(user._id)}
                                style={{ background: '#22c55e' }}
                            >
                                ✓ Desbloquear
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
