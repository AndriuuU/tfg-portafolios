import { useState } from "react";
import { deleteProject } from "../api/api";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useConfirmModal } from "../hooks/useModals";
import { useMyProjects, useSavedProjects } from "../hooks";
import ProjectPost from "../components/ProjectPost";
import ConfirmModal from "../components/ConfirmModal";
import CollaborativeProjects from "../components/CollaborativeProjects";
import "../styles/Dashboard.scss";

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const confirmModal = useConfirmModal();
  const [activeTab, setActiveTab] = useState('my-projects');
  const [deleteId, setDeleteId] = useState(null);
  
  const { data: myProjectsData, loading: myProjectsLoading, refetch: refetchMyProjects } = useMyProjects();
  const { data: savedProjectsData, loading: savedProjectsLoading, refetch: refetchSavedProjects } = useSavedProjects();
  
  const myProjects = Array.isArray(myProjectsData) ? myProjectsData : myProjectsData?.projects || [];
  const savedProjects = Array.isArray(savedProjectsData) ? savedProjectsData : savedProjectsData?.projects || [];
  
  const loading = (activeTab === 'my-projects' && myProjectsLoading) || 
                  (activeTab === 'saved' && savedProjectsLoading);

  const handleDelete = async (id) => {
    setDeleteId(id);
    const confirmed = await confirmModal.confirm(
      '¿Estás seguro de que quieres eliminar este proyecto?',
      { 
        title: 'Eliminar Proyecto',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        isDangerous: true
      }
    );
    
    if (confirmed) {
      try {
        await deleteProject(id);
        showToast('✅ Proyecto eliminado correctamente', 'success');
        refetchMyProjects();
      } catch (err) {
        showToast(err.response?.data?.error || '❌ Error al eliminar el proyecto', 'error');
      }
    }
    setDeleteId(null);
  };

  const handleUnsave = () => {
    refetchSavedProjects();
  };

  return (
    <>
      <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          {user?.username && (
            <Link to={`/u/${user.username}`} className="btn-secondary">
              👁️ Ver mi portfolio público
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`tab ${activeTab === 'my-projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-projects')}
          >
            📁 Mis Proyectos ({myProjects.length})
          </button>
          <button
            className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            💾 Guardados ({savedProjects.length})
          </button>
          <button
            className={`tab ${activeTab === 'collaborative' ? 'active' : ''}`}
            onClick={() => setActiveTab('collaborative')}
          >
            👥 Colaboraciones
          </button>
          {/* <button
            className={`tab ${activeTab === 'invitations' ? 'active' : ''}`}
            onClick={() => setActiveTab('invitations')}
          >
            📨 Invitaciones
          </button> */}
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {activeTab === 'my-projects' && (
            <div className="my-projects-section">
              <div className="section-header">
                <h2>Mis Proyectos ({myProjects.length})</h2>
                <Link to="/projects/new" className="btn-primary">
                  ➕ Nuevo Proyecto
                </Link>
              </div>

              {loading ? (
                <p>Cargando proyectos...</p>
              ) : myProjects.length === 0 ? (
                <div className="empty-state">
                  <p>No tienes proyectos aún</p>
                  <Link to="/projects/new" className="btn-primary">
                    Crear tu primer proyecto
                  </Link>
                </div>
              ) : (
                <div className="projects-grid">
                  {myProjects.map((project) => (
                    <div key={project._id} className="project-card-wrapper">
                      <ProjectPost project={project} />
                      <div className="project-actions">
                        <Link
                          to={`/projects/${project._id}/edit`}
                          className="btn-edit"
                        >
                          ✏️ Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(project._id)}
                          className="btn-delete"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="saved-projects-section">
              <h2>Proyectos Guardados ({savedProjects.length})</h2>

              {loading ? (
                <p>Cargando proyectos guardados...</p>
              ) : savedProjects.length === 0 ? (
                <div className="empty-state">
                  <p>No tienes proyectos guardados</p>
                  <Link to="/search" className="btn-primary">
                    Explorar proyectos
                  </Link>
                </div>
              ) : (
                <div className="projects-grid">
                  {savedProjects.map((project) => (
                    <ProjectPost 
                      key={project._id} 
                      project={project} 
                      onUnsave={handleUnsave}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'collaborative' && (
            <div className="collaborative-section">
              <CollaborativeProjects />
            </div>
          )}

          {/* {activeTab === 'invitations' && (
            <div className="invitations-section">
              <CollaboratorInvitations />
            </div>
          )} */}
        </div>
      </div>
    </div>
    <ConfirmModal 
      isOpen={confirmModal.isOpen}
      title={confirmModal.title}
      message={confirmModal.message}
      confirmText={confirmModal.confirmText}
      cancelText={confirmModal.cancelText}
      isDangerous={confirmModal.isDangerous}
      onConfirm={confirmModal.onConfirm}
      onCancel={confirmModal.onCancel}
    />
    </>
  );
}
