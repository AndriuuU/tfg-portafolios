import { useEffect, useState } from 'react';
import { getMyInvitations, acceptInvitation, rejectInvitation } from '../api/api';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import '../styles/CollaborativeProjects.scss';

const CollaborativeProjects = () => {
  const { showToast } = useToast();
  const [invitations, setInvitations] = useState([]);
  const [acceptedProjects, setAcceptedProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'accepted'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    setLoading(true);
    try {
      const res = await getMyInvitations();
      const data = res.data.invitations || [];
      
      // Separar invitaciones pendientes de aceptadas
      const pending = data.filter(inv => inv.status === 'pending');
      const accepted = data.filter(inv => inv.status === 'accepted');
      
      setInvitations(pending);
      setAcceptedProjects(accepted);
    } catch (err) {
      showToast('Error al cargar invitaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (projectId) => {
    try {
      await acceptInvitation(projectId);
      
      // Mover de pending a accepted
      const invitation = invitations.find(inv => inv.project._id === projectId);
      if (invitation) {
        setInvitations(prev => prev.filter(inv => inv.project._id !== projectId));
        setAcceptedProjects(prev => [...prev, { ...invitation, status: 'accepted' }]);
      }
      
      showToast('¡Invitación aceptada! 👍', 'success');
    } catch (err) {
      showToast('Error al aceptar invitación', 'error');
    }
  };

  const handleReject = async (projectId) => {
    try {
      await rejectInvitation(projectId);
      setInvitations(prev => prev.filter(inv => inv.project._id !== projectId));
      showToast('Invitación rechazada', 'info');
    } catch (err) {
      showToast('Error al rechazar invitación', 'error');
    }
  };

  const renderInvitationCard = (invitation) => {
    const project = invitation.project;
    const owner = project.owner;
    
    return (
      <div key={project._id} className="invitation-card">
        <div className="invitation-header">
          <h3>{project.title}</h3>
          <span className={`role-badge ${invitation.role}`}>
            {invitation.role === 'editor' ? '✏️ Editor' : '👁️ Visor'}
          </span>
        </div>
        
        <p className="invitation-description">{project.description || 'Sin descripción'}</p>
        
        <div className="invitation-owner">
          <span className="owner-label">Invitado por:</span>
          <span className="owner-name">{owner.username}</span>
        </div>
        
        <div className="invitation-actions">
          <button
            className="btn btn-accept"
            onClick={() => handleAccept(project._id)}
          >
            ✓ Aceptar
          </button>
          <button
            className="btn btn-reject"
            onClick={() => handleReject(project._id)}
          >
            ✕ Rechazar
          </button>
        </div>
      </div>
    );
  };

  const renderAcceptedProject = (invitation) => {
    const project = invitation.project;
    const owner = project.owner;
    
    return (
      <div key={project._id} className="accepted-project-card">
        <div className="project-header">
          <h3>{project.title}</h3>
          <span className={`role-badge ${invitation.role}`}>
            {invitation.role === 'editor' ? '✏️ Editor' : '👁️ Visor'}
          </span>
        </div>
        
        <p className="project-description">{project.description || 'Sin descripción'}</p>
        
        <div className="project-owner">
          <span className="owner-label">Propietario:</span>
          <span className="owner-name">{owner.username}</span>
        </div>
        
        {project.images && project.images.length > 0 && (
          <div className="project-image">
            <img src={project.images[0]} alt={project.title} />
          </div>
        )}
        
        <div className="project-actions">
          {invitation.role === 'editor' ? (
            <>
              <Link
                to={`/projects/${project._id}/edit`}
                className="btn btn-edit"
              >
                ✏️ Editar
              </Link>
              <Link
                to={`/projects/${project._id}`}
                className="btn btn-view"
              >
                👁️ Ver
              </Link>
            </>
          ) : (
            <Link
              to={`/projects/${project._id}`}
              className="btn btn-view"
            >
              👁️ Ver
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="collaborative-projects">
      <div className="collab-tabs">
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          📨 Pendientes ({invitations.length})
        </button>
        <button
          className={`tab ${activeTab === 'accepted' ? 'active' : ''}`}
          onClick={() => setActiveTab('accepted')}
        >
          ✓ Aceptados ({acceptedProjects.length})
        </button>
      </div>

      <div className="collab-content">
        {loading ? (
          <p className="loading">Cargando...</p>
        ) : activeTab === 'pending' ? (
          invitations.length === 0 ? (
            <div className="empty-state">
              <p>No tienes invitaciones pendientes</p>
            </div>
          ) : (
            <div className="invitations-grid">
              {invitations.map(renderInvitationCard)}
            </div>
          )
        ) : (
          acceptedProjects.length === 0 ? (
            <div className="empty-state">
              <p>No tienes proyectos compartidos aceptados</p>
            </div>
          ) : (
            <div className="projects-grid">
              {acceptedProjects.map(renderAcceptedProject)}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CollaborativeProjects;
