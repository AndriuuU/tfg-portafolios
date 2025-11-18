import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/api";
import FollowButton from "../components/FollowButton";
import FollowersList from "../components/FollowersList";
import FollowingList from "../components/FollowingList";
import BlockUserButton from "../components/BlockUserButton";
import { checkRelationship } from "../api/followApi";
import "../styles/Portfolio.scss";

// Custom hook para cargar portfolio del usuario
const usePortfolio = (username) => {
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
        console.error('Error loading portfolio:', err);
        setError('Usuario no encontrado');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchPortfolio();
    }
  }, [username]);

  return { data, loading, error };
};

// Componente para la cabecera del usuario
const UserHeader = ({ user, currentUserId, onFollowUpdate, relationship, showFollowers, showFollowing, setShowFollowers, setShowFollowing }) => {
  const isOwnProfile = currentUserId === user._id;
  
  return (
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
              <div className="initials">
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
                <span className="stat-value">{user.followers?.length || 0}</span>
                <span className="stat-label">seguidores</span>
              </div>
              <div className="stat" onClick={() => setShowFollowing(!showFollowing)} style={{ cursor: 'pointer' }}>
                <span className="stat-value">{user.following?.length || 0}</span>
                <span className="stat-label">siguiendo</span>
              </div>
            </div>
          </div>
        </div>
        <div className="header-actions">
          {isOwnProfile && (
            <Link to="/settings" className="btn btn-follow">
              ⚙️ Configuración
            </Link>
          )}
          {!isOwnProfile && (
            <>
              <FollowButton userId={user._id} onUpdate={onFollowUpdate} />
              <BlockUserButton 
                userId={user._id} 
                isBlocked={relationship?.isBlocked} 
                onUpdate={onFollowUpdate}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para una tarjeta de proyecto
const ProjectCard = ({ project }) => {
  const handleCardClick = () => {
    window.location.href = `/projects/${project._id}`;
  };

  return (
    <div className="project-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
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
  const { data, loading, error } = usePortfolio(username);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [relationship, setRelationship] = useState(null);

  // Obtener el ID del usuario actual
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser._id || currentUser.id;

  // Cargar relación con el usuario
  useEffect(() => {
    if (data?.user && !data.user.isOwnProfile && data.user._id) {
      checkRelationship(data.user._id)
        .then(res => setRelationship(res.data))
        .catch(err => console.error('Error loading relationship:', err));
    }
  }, [data, refreshKey]);

  const handleFollowUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) return <LoadingSpinner />;
  if (error || !data) return <ErrorMessage message={error || "Usuario no encontrado"} />;

  const { user, projects } = data;
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

        <div className="portfolio-controls">
          <button
            onClick={() => setShowFollowers(!showFollowers)}
            className="btn"
          >
            {showFollowers ? '👥 Ocultar seguidores' : '👥 Ver seguidores'}
          </button>
          <button
            onClick={() => setShowFollowing(!showFollowing)}
            className="btn"
          >
            {showFollowing ? '👤 Ocultar siguiendo' : '👤 Ver siguiendo'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: showFollowers && showFollowing ? '1fr 1fr' : '1fr', gap: '20px', marginBottom: '30px' }}>
          {showFollowers && (
            <div className="list-container">
              <h3 className="section-title">Seguidores</h3>
              <FollowersList 
                key={`followers-${refreshKey}`}
                userId={user._id} 
                isOwnProfile={isOwnProfile} 
              />
            </div>
          )}
          {showFollowing && (
            <div className="list-container">
              <h3 className="section-title">Siguiendo</h3>
              <FollowingList 
                key={`following-${refreshKey}`}
                userId={user._id} 
                isOwnProfile={isOwnProfile} 
              />
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2 className="section-title">
            📂 Proyectos 
            <span style={{ marginLeft: '8px', fontSize: '18px', fontWeight: '400', color: 'var(--text-secondary)' }}>
              ({projects?.length || 0})
            </span>
          </h2>
        </div>

        {projects?.length > 0 ? (
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
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
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>📭</div>
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
