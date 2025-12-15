import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFollowingProjects, useRecommendedUsers } from '../hooks';
import ProjectPost from '../components/ProjectPost';
import '../styles/Home.scss';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('following');
  
  const { data: projectsData, loading: projectsLoading } = useFollowingProjects();
  const { data: recommendedData, loading: recommendedLoading } = useRecommendedUsers();
  
  const projects = projectsData?.projects || [];
  const recommended = recommendedData?.users || [];
  const loading = projectsLoading || recommendedLoading;

  const goToProfile = (username) => {
    navigate(`/u/${username}`);
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="home-page home-unauthenticated">
        <div className="home-container">
          {/* Hero Section */}
          <div className="home-hero">
            <h1>Muestra tu talento al mundo</h1>
            <p>La plataforma de portafolios para creativos y desarrolladores</p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => navigate('/register')}>
                Crear cuenta gratis
              </button>
              <button className="btn-secondary" onClick={() => navigate('/login')}>
                Iniciar sesión
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className="features-section">
            <h2>¿Por qué PortafoliosHub?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📂</div>
                <h3>Portafolio profesional</h3>
                <p>Crea un portafolio personalizado para mostrar tus mejores proyectos</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Analytics en tiempo real</h3>
                <p>Observa el impacto de tus proyectos con métricas detalladas</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🏆</div>
                <h3>Ranking global</h3>
                <p>Compite y destaca en los rankings de tu categoría</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h3>Conecta con talento</h3>
                <p>Sigue a otros creativos y crea una comunidad alrededor de tu trabajo</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💬</div>
                <h3>Interacción social</h3>
                <p>Recibe comentarios y feedback de otros miembros de la comunidad</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📥</div>
                <h3>Exporta a PDF</h3>
                <p>Descarga tu portafolio como PDF para compartir con reclutadores</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="cta-section">
            <div className="cta-content">
              <h2>Comienza tu viaje profesional hoy</h2>
              <p>Únete a cientos de creativos y desarrolladores que ya confían en PortafoliosHub</p>
              <button className="btn-primary btn-large" onClick={() => navigate('/register')}>
                Crear cuenta
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-header">
          <h1>Hola, {user.name || user.username}</h1>
          <p>Descubre nuevos proyectos y conecta con otros desarrolladores</p>
        </div>

        <div className="home-tabs">
          <div className="tabs-container">
            <button 
              className={activeTab === 'following' ? 'active' : ''} 
              onClick={() => setActiveTab('following')}
            >
              Proyectos ({projects.length})
            </button>
            <button 
              className={activeTab === 'recommended' ? 'active' : ''} 
              onClick={() => setActiveTab('recommended')}
            >
              Descubrir usuarios ({recommended.length})
            </button>
          </div>
        </div>

        <div className="home-content">
          {activeTab === 'following' ? (
            <div>
              {projects.length === 0 ? (
                <div className="content-empty">
                  <p>📭 No hay proyectos para mostrar</p>
                  <p>Los usuarios que sigues aún no han publicado proyectos</p>
                  <button onClick={() => setActiveTab('recommended')}>
                    Descubrir usuarios
                  </button>
                </div>
              ) : (
                <div className="projects-grid">
                  {projects.map((project) => (
                    <ProjectPost key={project._id} project={project} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {recommended.length === 0 ? (
                <div className="content-empty">
                  <p>✅ Ya sigues a todos los usuarios disponibles</p>
                </div>
              ) : (
                <div className="users-grid">
                  {recommended.map((userItem) => (
                    <div 
                      key={userItem._id} 
                      className="user-card"
                      onClick={() => goToProfile(userItem.username)}
                    >
                      <div className="user-avatar">
                        {userItem.avatarUrl ? (
                          <img 
                            src={userItem.avatarUrl} 
                            alt={userItem.username}
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {userItem.name?.charAt(0).toUpperCase() || userItem.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="user-info">
                        <h3>{userItem.name || userItem.username}</h3>
                        <p className="username">@{userItem.username}</p>
                        {userItem.email && <p className="email">{userItem.email}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
