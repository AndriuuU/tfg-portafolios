import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { downloadPortfolioPDF } from "../api/exportApi";
import PortfolioPDFGenerator from "../components/PortfolioPDFGenerator";
import FollowButton from "../components/FollowButton";
import FollowersList from "../components/FollowersList";
import FollowingList from "../components/FollowingList";
import BlockUserButton from "../components/BlockUserButton";
import ReportModal from "../components/ReportModal";
import { checkRelationship, getFollowers, getFollowing } from "../api/followApi";
import { useToast } from "../context/ToastContext";
import "../styles/Portfolio.scss";

// Custom hook para cargar portfolio del usuario
const usePortfolio = (username, showToast) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/users/${username}`);
        setData(res.data);
        setError(null);
      } catch (err) {
        // Mensajes específicos para cuentas bloqueadas
        const errorData = err.response?.data;
        let errorMessage;
        
        if (errorData?.type === 'ACCOUNT_DELETED') {
          errorMessage = '🗑️ Esta cuenta ha sido eliminada';
        } else if (errorData?.type === 'ACCOUNT_BANNED') {
          errorMessage = '🚫 Esta cuenta ha sido baneada';
        } else if (errorData?.type === 'ACCOUNT_SUSPENDED') {
          errorMessage = '⏸️ Esta cuenta ha sido suspendida temporalmente';
        } else if (err.response?.status === 404) {
          errorMessage = '❌ Usuario no encontrado';
        } else {
          errorMessage = '❌ Error al cargar el perfil';
        }
        
        setError(errorMessage);
        if (showToast) {
          showToast(errorMessage, 'error');
        }
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchPortfolio();
    }
  }, [username, showToast]);

  return { data, loading, error };
};

// Componente para la cabecera del usuario
const UserHeader = ({ user, currentUserId, onFollowUpdate, relationship, showFollowers, showFollowing, setShowFollowers, setShowFollowing, projects, followersCount, followingCount }) => {
  const isOwnProfile = currentUserId === user._id;
  const [exporting, setExporting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleExportPortfolio = async () => {
    setExporting(true);
    try {
      // Generar HTML del portfolio
      const pdfGenerator = PortfolioPDFGenerator({ user, projects });
      const portfolioHTML = pdfGenerator.generateHTML();

      // Descargar como PDF
      const result = await downloadPortfolioPDF(portfolioHTML);
      if (!result.success) {
        showToast(`❌ ${result.message}`, 'error');
      }
    } catch (error) {
      showToast('❌ Error al exportar el portafolio', 'error');
    } finally {
      setExporting(false);
    }
  };
  
  return (
    <>
      <div className="user-header">
        <div className="header-content">
          <div className="header-left">
            <div className="user-avatar">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.username}
                />
              ) : (
                <div className="avatar-placeholder">
                  {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="user-info">
              <h1>{user.name || user.username}</h1>
              <p className="username">@{user.username}</p>
              {user.email && (
                <p className="email">📧 {user.email}</p>
              )}
              <div className="stats">
                <div className="stat" onClick={() => setShowFollowers(!showFollowers)} style={{ cursor: 'pointer' }}>
                  <span className="stat-value">{followersCount !== null ? followersCount : (user.followers?.length || 0)}</span>
                  <span className="stat-label">seguidores</span>
                </div>
                <div className="stat" onClick={() => setShowFollowing(!showFollowing)} style={{ cursor: 'pointer' }}>
                  <span className="stat-value">{followingCount !== null ? followingCount : (user.following?.length || 0)}</span>
                  <span className="stat-label">siguiendo</span>
                </div>
              </div>
            </div>
          </div>
          <div className="header-actions">
            {isOwnProfile && (
              <>
                <button 
                  onClick={handleExportPortfolio}
                  disabled={exporting}
                  className="btn btn-export"
                  title="Descargar portafolio como PDF"
                >
                  {exporting ? '⏳ Generando PDF...' : '📄 Exportar portfolio'}
                </button>
                <Link to="/settings" className="btn btn-follow">
                  ⚙️ Configuración
                </Link>
              </>
            )}
            {!isOwnProfile && (
              <>
                <FollowButton userId={user._id} onUpdate={onFollowUpdate} />
                <BlockUserButton 
                  userId={user._id} 
                  isBlocked={relationship?.isBlocked} 
                  onUpdate={onFollowUpdate}
                />
                <button 
                  onClick={() => setShowReportModal(true)}
                  className="btn btn-report"
                  title="Reportar este usuario"
                >
                  🚩 Reportar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {showReportModal && (
        <ReportModal 
          type="user"
          targetId={user._id}
          targetTitle={user.username}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </>
  );
};

// Componente para una tarjeta de proyecto
const ProjectCard = ({ project, isOwnProfile, onDelete }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    window.location.href = `/projects/${project._id}`;
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/projects/edit/${project._id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`¿Estás seguro de que quieres eliminar el proyecto "${project.title}"? Esta acción no se puede deshacer.`)) {
      await onDelete(project._id);
    }
  };

  return (
    <div className="project-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      {isOwnProfile && (
        <div className="project-card-actions">
          <button 
            onClick={handleEdit}
            className="btn-edit"
            title="Editar proyecto"
          >
            ✏️
          </button>
          <button 
            onClick={handleDelete}
            className="btn-delete"
            title="Eliminar proyecto"
          >
            🗑️
          </button>
        </div>
      )}

      <div className="project-image">
        {project.images?.length > 0 ? (
          <img
            src={project.images[0]}
            alt={project.title}
          />
        ) : (
          <span className="placeholder">🖼️</span>
        )}
      </div>

      <div className="project-content">
        <h3 className="project-title">
          {project.title}
        </h3>
        
        <p className="project-description">
          {project.description || 'Sin descripción'}
        </p>

        {project.tags?.length > 0 && (
          <div className="project-tags">
            {project.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="tag"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="tag">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="project-actions">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              🚀 Ver en vivo
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="secondary"
              onClick={(e) => e.stopPropagation()}
            >
              💻 Código
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de loading
const LoadingSpinner = () => (
  <div className="loading">
    <div className="spinner"></div>
    <p>Cargando portfolio...</p>
  </div>
);

// Componente de error
const ErrorMessage = ({ message }) => (
  <div className="error">
    <div className="error-icon">❌</div>
    <p>{message}</p>
    <Link
      to="/"
    >
      Volver al inicio
    </Link>
  </div>
);

// Componente principal
export default function Portfolio() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data, loading, error } = usePortfolio(username, showToast);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [relationship, setRelationship] = useState(null);
  const [followersCount, setFollowersCount] = useState(null);
  const [followingCount, setFollowingCount] = useState(null);
  const [projects, setProjects] = useState([]);

  // Obtener el ID del usuario actual
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser._id || currentUser.id;

  // Sincronizar proyectos del portfolio
  useEffect(() => {
    if (data?.projects) {
      setProjects(data.projects);
    }
  }, [data]);

  // Cargar conteos reales de seguidores y seguidos
  useEffect(() => {
    if (data?.user?._id) {
      getFollowers(data.user._id)
        .then(res => setFollowersCount(res.data?.followers?.length || 0))
        .catch(err => {
          setFollowersCount(data.user.followers?.length || 0);
        });

      getFollowing(data.user._id)
        .then(res => setFollowingCount(res.data?.following?.length || 0))
        .catch(err => {
          setFollowingCount(data.user.following?.length || 0);
        });
    }
  }, [data, refreshKey]);

  // Cargar relación con el usuario
  useEffect(() => {
    if (data?.user && !data.user.isOwnProfile && data.user._id) {
      checkRelationship(data.user._id)
        .then(res => setRelationship(res.data))
        .catch(err => {});
    }
  }, [data, refreshKey]);

  const handleFollowUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await API.delete(`/projects/${projectId}`);
      setProjects(prevProjects => prevProjects.filter(p => p._id !== projectId));
      showToast('✅ Proyecto eliminado correctamente', 'success');
    } catch (error) {
      showToast('❌ Error al eliminar el proyecto', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error || !data) return <ErrorMessage message={error || "Usuario no encontrado"} />;

  const { user } = data;
  const isOwnProfile = currentUserId && user._id && currentUserId.toString() === user._id.toString();

  return (
    <div className="portfolio-page">
      <div className="portfolio-container">
        <UserHeader 
          user={user} 
          currentUserId={currentUserId}
          onFollowUpdate={handleFollowUpdate}
          relationship={relationship}
          showFollowers={showFollowers}
          showFollowing={showFollowing}
          setShowFollowers={setShowFollowers}
          setShowFollowing={setShowFollowing}
          projects={projects}
          followersCount={followersCount}
          followingCount={followingCount}
        />

        {isOwnProfile && user.privacy?.isPrivate && (
          <div style={{
            background: 'rgba(79, 70, 229, 0.1)',
            border: '1px solid rgba(79, 70, 229, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '30px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            color: 'var(--text-primary)'
          }}>
            <span style={{ fontSize: '20px' }}>🔒</span>
            <div>
              <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>Cuenta privada</p>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Tu cuenta es privada. Los usuarios deben solicitar seguimiento para ver tu contenido.
              </p>
              <Link to="/settings?section=follow-requests" style={{
                color: 'var(--primary-color)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Ver solicitudes pendientes →
              </Link>
            </div>
          </div>
        )}

        {showFollowers && (
          <FollowersList 
            key={`followers-${refreshKey}`}
            userId={user._id} 
            isOwnProfile={isOwnProfile}
            onClose={() => setShowFollowers(false)}
          />
        )}

        {showFollowing && (
          <FollowingList 
            key={`following-${refreshKey}`}
            userId={user._id} 
            isOwnProfile={isOwnProfile}
            onClose={() => setShowFollowing(false)}
          />
        )}

        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h2 className="section-title">
            📂 Proyectos 
            <span style={{ marginLeft: '8px', fontSize: '18px', fontWeight: '400', color: 'var(--text-secondary)' }}>
              ({projects?.length || 0})
            </span>
          </h2>
          {isOwnProfile && (
            <button 
              onClick={() => navigate('/projects/new')}
              className="btn btn-create"
            >
              ➕ Crear Proyecto
            </button>
          )}
        </div>

        {projects?.length > 0 ? (
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard 
                key={project._id} 
                project={project} 
                isOwnProfile={isOwnProfile}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        ) : (
          <div className="list-container empty-state">
            {user.isPrivate ? (
              <>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔒</div>
                <p>
                  Esta es una cuenta privada. Sigue a este usuario para ver su contenido.
                </p>
              </>
            ) : (
              <>
                <p>
                  Este usuario aún no tiene proyectos publicados
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
