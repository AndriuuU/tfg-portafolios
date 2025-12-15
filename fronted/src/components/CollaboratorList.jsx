import { useState, useEffect } from 'react';
import { getCollaborators, removeCollaborator, updateCollaboratorRole, leaveProject } from '../api/api';
import { Link } from 'react-router-dom';
import '../styles/Collaborators.scss';

function CollaboratorList({ projectId, isOwner, onUpdate }) {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadCollaborators();
  }, [projectId]);

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const response = await getCollaborators(projectId);
      setCollaborators(response.data.collaborators || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar colaboradores');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este colaborador?')) {
      return;
    }

    setActionLoading({ ...actionLoading, [`remove-${userId}`]: true });
    try {
      await removeCollaborator(projectId, userId);
      setCollaborators(collaborators.filter(c => c.user._id !== userId));
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar colaborador');
    } finally {
      setActionLoading({ ...actionLoading, [`remove-${userId}`]: false });
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading({ ...actionLoading, [`role-${userId}`]: true });
    try {
      await updateCollaboratorRole(projectId, userId, newRole);
      setCollaborators(collaborators.map(c => 
        c.user._id === userId ? { ...c, role: newRole } : c
      ));
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cambiar el rol');
    } finally {
      setActionLoading({ ...actionLoading, [`role-${userId}`]: false });
    }
  };

  const handleLeave = async () => {
    if (!confirm('¿Estás seguro de que quieres dejar de colaborar en este proyecto?')) {
      return;
    }

    setActionLoading({ leave: true });
    try {
      await leaveProject(projectId);
      window.location.href = '/dashboard'; // Redirigir al dashboard
    } catch (err) {
      alert(err.response?.data?.error || 'Error al abandonar el proyecto');
      setActionLoading({ leave: false });
    }
  };

  if (loading) {
    return <div className="collaborators-loading">Cargando colaboradores...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="collaborator-list">
      <h3>({collaborators.length})</h3>
      
      {collaborators.length === 0 ? (
        <p className="no-collaborators">Este proyecto no tiene colaboradores</p>
      ) : (
        <div className="collaborators-grid">
          {collaborators.map((collab) => (
            <div key={collab.user._id} className="collaborator-card">
              <div className="collaborator-info">
                <Link to={`/u/${collab.user.username}`} className="collaborator-avatar">
                  {collab.user.avatarUrl ? (
                    <img src={collab.user.avatarUrl} alt={collab.user.username} />
                  ) : (
                    <div className="avatar-placeholder">
                      {collab.user.name?.charAt(0).toUpperCase() || 
                       collab.user.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
                
                <div className="collaborator-details">
                  <Link to={`/u/${collab.user.username}`}>
                    <h4>{collab.user.name || collab.user.username}</h4>
                  </Link>
                  <p className="collaborator-username">@{collab.user.username}</p>
                  
                  {isOwner ? (
                    <select
                      value={collab.role}
                      onChange={(e) => handleRoleChange(collab.user._id, e.target.value)}
                      disabled={actionLoading[`role-${collab.user._id}`]}
                      className="role-selector"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                  ) : (
                    <span className={`role-badge role-${collab.role}`}>
                      {collab.role === 'viewer' ? 'Viewer' : 'Editor'}
                    </span>
                  )}
                  
                  <p className="collaborator-since">
                    Desde {new Date(collab.addedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short'
                    })}
                  </p>
                </div>
              </div>

              {isOwner && (
                <button
                  onClick={() => handleRemove(collab.user._id)}
                  disabled={actionLoading[`remove-${collab.user._id}`]}
                  className="btn-remove"
                  title="Eliminar colaborador"
                >
                  {actionLoading[`remove-${collab.user._id}`] ? '...' : '✕'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Si no es el dueño pero es colaborador, puede abandonar */}
      {!isOwner && collaborators.length > 0 && (
        <button
          onClick={handleLeave}
          disabled={actionLoading.leave}
          className="btn-leave"
        >
          {actionLoading.leave ? 'Abandonando...' : 'Abandonar Proyecto'}
        </button>
      )}
    </div>
  );
}

export default CollaboratorList;
