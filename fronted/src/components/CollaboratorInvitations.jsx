import { useState, useEffect } from 'react';
import { getMyInvitations, acceptInvitation, rejectInvitation } from '../api/api';
import { Link } from 'react-router-dom';
import '../styles/Collaborators.scss';

function CollaboratorInvitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const response = await getMyInvitations();
      setInvitations(response.data.invitations || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar invitaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (projectId, invitationId) => {
    setActionLoading({ ...actionLoading, [invitationId]: 'accepting' });
    try {
      await acceptInvitation(projectId);
      setInvitations(invitations.filter(inv => inv._id !== invitationId));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al aceptar invitación');
    } finally {
      setActionLoading({ ...actionLoading, [invitationId]: null });
    }
  };

  const handleReject = async (projectId, invitationId) => {
    setActionLoading({ ...actionLoading, [invitationId]: 'rejecting' });
    try {
      await rejectInvitation(projectId);
      setInvitations(invitations.filter(inv => inv._id !== invitationId));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al rechazar invitación');
    } finally {
      setActionLoading({ ...actionLoading, [invitationId]: null });
    }
  };

  if (loading) {
    return <div className="invitations-loading">Cargando invitaciones...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (invitations.length === 0) {
    return (
      <div className="no-invitations">
        <p>No tienes invitaciones pendientes</p>
      </div>
    );
  }

  return (
    <div className="collaborator-invitations">
      <h3>Invitaciones de Colaboración ({invitations.length})</h3>
      
      <div className="invitations-list">
        {invitations.map((invitation) => (
          <div key={invitation._id} className="invitation-card">
            <div className="invitation-info">
              <div className="invitation-project">
                <Link to={`/projects/${invitation.project._id}`}>
                  <h4>{invitation.project.title}</h4>
                </Link>
                <p className="invitation-description">
                  {invitation.project.description?.substring(0, 100)}
                  {invitation.project.description?.length > 100 && '...'}
                </p>
              </div>
              
              <div className="invitation-details">
                <p>
                  <strong>De:</strong>{' '}
                  <Link to={`/u/${invitation.invitedBy.username}`}>
                    {invitation.invitedBy.name || invitation.invitedBy.username}
                  </Link>
                </p>
                <p>
                  <strong>Rol:</strong>{' '}
                  <span className={`role-badge role-${invitation.role}`}>
                    {invitation.role === 'viewer' ? 'Viewer' : 'Editor'}
                  </span>
                </p>
                <p className="invitation-date">
                  {new Date(invitation.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="invitation-actions">
              <button
                onClick={() => handleAccept(invitation.project._id, invitation._id)}
                disabled={actionLoading[invitation._id]}
                className="btn-accept"
              >
                {actionLoading[invitation._id] === 'accepting' ? 'Aceptando...' : '✓ Aceptar'}
              </button>
              <button
                onClick={() => handleReject(invitation.project._id, invitation._id)}
                disabled={actionLoading[invitation._id]}
                className="btn-reject"
              >
                {actionLoading[invitation._id] === 'rejecting' ? 'Rechazando...' : '✕ Rechazar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CollaboratorInvitations;
