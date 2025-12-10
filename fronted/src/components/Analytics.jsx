import { useState, useEffect } from 'react';
import API from '../api/api';
import '../styles/Analytics.scss';

export default function Analytics() {
  const [dashboardData, setDashboardData] = useState(null);
  const [topProjects, setTopProjects] = useState([]);
  const [globalRanking, setGlobalRanking] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
    fetchTopProjects();
    fetchGlobalRanking();
    fetchUserPosition();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get('/analytics/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      setError('Error al cargar el dashboard');
      setLoading(false);
    }
  };

  const fetchTopProjects = async () => {
    try {
      const res = await API.get('/analytics/top-projects');
      setTopProjects(res.data.topProjects || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const fetchGlobalRanking = async () => {
    try {
      const res = await API.get('/ranking/global?limit=10&skip=0');
      setGlobalRanking(res.data.users || []);
    } catch (err) {
    }
  };

  const fetchUserPosition = async () => {
    try {
      const res = await API.get('/ranking/my-position');
      setUserPosition(res.data);
    } catch (err) {
    }
  };

  if (loading) return <div className="analytics-loading">Cargando...</div>;
  if (error) return <div className="analytics-error">{error}</div>;
  if (!dashboardData) return <div className="analytics-empty">Sin datos disponibles</div>;

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>📊 Estadísticas y Analytics</h1>
        <p>Analiza el rendimiento de tus proyectos</p>
      </div>

      {/* Tabs */}
      <div className="analytics-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📈 Resumen
        </button>
        <button
          className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          🎯 Proyectos Top
        </button>
        <button
          className={`tab ${activeTab === 'engagement' ? 'active' : ''}`}
          onClick={() => setActiveTab('engagement')}
        >
          💬 Engagement
        </button>
        <button
          className={`tab ${activeTab === 'ranking' ? 'active' : ''}`}
          onClick={() => setActiveTab('ranking')}
        >
          🏆 Ranking Global
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="analytics-section overview">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👀</div>
              <div className="stat-content">
                <h3>Vistas Totales</h3>
                <p className="stat-value">{dashboardData.totalStats.totalViews}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">❤️</div>
              <div className="stat-content">
                <h3>Likes Totales</h3>
                <p className="stat-value">{dashboardData.totalStats.totalLikes}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-content">
                <h3>Comentarios Totales</h3>
                <p className="stat-value">{dashboardData.totalStats.totalComments}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Visitantes Únicos</h3>
                <p className="stat-value">{dashboardData.totalStats.uniqueViewers}</p>
              </div>
            </div>
          </div>

          {/* Daily Views Chart */}
          <div className="chart-section">
            <h2>Vistas en los últimos 30 días</h2>
            <div className="chart-container">
              <div className="simple-chart">
                {dashboardData.dailyViews && dashboardData.dailyViews.map((day, idx) => (
                  <div key={idx} className="chart-bar" title={day.date}>
                    <div 
                      className="bar" 
                      style={{ height: `${Math.max((day.views / 10) * 100, 5)}%` }}
                    >
                      {day.views > 0 && <span className="bar-label">{day.views}</span>}
                    </div>
                    <small>{new Date(day.date).getDate()}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-section">
            <h2>Actividad Reciente</h2>
            <div className="activity-list">
              {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity, idx) => (
                  <div key={idx} className="activity-item">
                    <div className="activity-icon">
                      {activity.action === 'project_created' && '✨'}
                      {activity.action === 'project_updated' && '✏️'}
                      {activity.action === 'comment_added' && '💬'}
                      {activity.action === 'project_liked' && '❤️'}
                    </div>
                    <div className="activity-content">
                      <p className="activity-action">{activity.action.replace(/_/g, ' ')}</p>
                      {activity.projectTitle && (
                        <p className="activity-project">{activity.projectTitle}</p>
                      )}
                    </div>
                    <time>
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </time>
                  </div>
                ))
              ) : (
                <p className="no-activity">Sin actividad reciente</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Projects Tab */}
      {activeTab === 'projects' && (
        <div className="analytics-section top-projects">
          <h2>🏆 Tus Proyectos Más Populares</h2>
          <div className="projects-ranking">
            {topProjects && topProjects.length > 0 ? (
              topProjects.map((item, idx) => (
                <div key={idx} className="ranking-item">
                  <div className="ranking-badge">{idx + 1}</div>
                  <div className="ranking-content">
                    <h3>{item.project.title}</h3>
                    <div className="ranking-stats">
                      <span>👀 {item.analytics.views.total} vistas</span>
                      <span>❤️ {item.analytics.likes} likes</span>
                      <span>💬 {item.analytics.comments} comentarios</span>
                    </div>
                  </div>
                  <div className="ranking-score">
                    <div className="score-label">Score</div>
                    <div className="score-value">{Math.round(item.analytics.popularityScore)}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-projects">Sin proyectos disponibles</p>
            )}
          </div>
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && (
        <div className="analytics-section engagement">
          <h2>💭 Análisis de Engagement</h2>
          <div className="engagement-grid">
            <div className="engagement-card">
              <h3>Tasa de Engagement</h3>
              <div className="engagement-metric">
                <div className="metric-value">
                  {(
                    ((dashboardData.totalStats.totalLikes + dashboardData.totalStats.totalComments) /
                      (dashboardData.totalStats.totalViews || 1)) *
                    100
                  ).toFixed(2)}
                  %
                </div>
                <p className="metric-description">
                  Interacciones / Total de vistas
                </p>
              </div>
            </div>

            <div className="engagement-card">
              <h3>Promedio por Proyecto</h3>
              <div className="engagement-metric">
                <div className="metric-value">
                  {dashboardData.totalStats.totalViews > 0 
                    ? (dashboardData.totalStats.totalViews / (topProjects.length || 1)).toFixed(0)
                    : 0
                  }
                </div>
                <p className="metric-description">Vistas promedio</p>
              </div>
            </div>

            <div className="engagement-card">
              <h3>Preferencia</h3>
              <div className="engagement-metric">
                <div className="metric-value">
                  {dashboardData.totalStats.totalLikes > dashboardData.totalStats.totalComments 
                    ? '❤️ Likes'
                    : '💬 Comentarios'
                  }
                </div>
                <p className="metric-description">
                  Tipo de interacción más común
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ranking Tab */}
      {activeTab === 'ranking' && (
        <div className="analytics-section ranking">
          <h2>🏆 Ranking Global de Usuarios</h2>
          
          {userPosition && userPosition.position && (
            <div className="user-position-card">
              <div className="position-content">
                <h3>Tu Posición</h3>
                <div className="position-badge">#{userPosition.position}</div>
                <p>de {userPosition.totalUsers} usuarios</p>
              </div>
            </div>
          )}
          {userPosition && !userPosition.position && (
            <div className="user-position-card private">
              <p>⚠️ {userPosition.message}</p>
            </div>
          )}

          <div className="ranking-table">
            <table>
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Usuario</th>
                  <th>Vistas</th>
                  <th>Likes</th>
                  <th>Comentarios</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {globalRanking && globalRanking.length > 0 ? (
                  globalRanking.map((user) => (
                    <tr 
                      key={user.userId} 
                      className={userPosition?.position === user.rank ? 'current-user' : ''}
                    >
                      <td className="rank">#{user.rank}</td>
                      <td className="user">
                        {user.avatarUrl && (
                          <img src={user.avatarUrl} alt={user.username} className="avatar" />
                        )}
                        <div className="user-info">
                          <p className="username">{user.username}</p>
                          <p className="name">{user.name}</p>
                        </div>
                      </td>
                      <td>{user.stats.totalViews}</td>
                      <td>{user.stats.totalLikes}</td>
                      <td>{user.stats.totalComments}</td>
                      <td className="score">{user.stats.popularityScore}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">Sin datos de ranking</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
