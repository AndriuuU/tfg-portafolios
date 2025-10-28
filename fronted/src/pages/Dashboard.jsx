import { useEffect, useState } from "react";
import { getUserProjects, getSavedProjects, deleteProject } from "../api/api";
import { Link } from "react-router-dom";
import ProjectPost from "../components/ProjectPost";
import CollaboratorInvitations from "../components/CollaboratorInvitations";
import "../styles/Dashboard.scss";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('my-projects'); // 'my-projects', 'saved', 'invitations'
  const [myProjects, setMyProjects] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'my-projects') {
        const res = await getUserProjects();
        setMyProjects(Array.isArray(res.data) ? res.data : res.data.projects || []);
      } else if (activeTab === 'saved') {
        const res = await getSavedProjects();
        setSavedProjects(Array.isArray(res.data) ? res.data : res.data.projects || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("¿Seguro que quieres eliminar este proyecto?")) {
      try {
        await deleteProject(id);
        setMyProjects(myProjects.filter(p => p._id !== id));
      } catch (err) {
        alert(err.response?.data?.error || 'Error al eliminar el proyecto');
      }
    }
  };

  const handleUnsave = () => {
    // Recargar la lista de guardados después de desguardar
    loadData();
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          {(() => {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            return user.username ? (
              <Link
                to={`/u/${user.username}`}
                className="btn-secondary"
              >
                👁️ Ver mi portfolio público
              </Link>
            ) : null;
          })()}
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
            className={`tab ${activeTab === 'invitations' ? 'active' : ''}`}
            onClick={() => setActiveTab('invitations')}
          >
            📨 Invitaciones
          </button>
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

          {activeTab === 'invitations' && (
            <div className="invitations-section">
              <CollaboratorInvitations />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
