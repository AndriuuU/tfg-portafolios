import React, { useEffect, useState } from 'react';
import {
  getGlobalRanking,
  getProjectsRanking,
  getTagsRanking,
  getWeeklyRanking,
  getUserRankingPosition
} from '../api/rankingApi';
import '../styles/Ranking.scss';

const Ranking = () => {
  const [activeTab, setActiveTab] = useState('users'); // users, projects, tags, weekly
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ skip: 0, limit: 20 });
  const [userPosition, setUserPosition] = useState(null);

  const token = localStorage.getItem('token');

  // Fetch data según la pestaña activa
  useEffect(() => {
    fetchRankingData();
  }, [activeTab, pagination.skip]);

  const fetchRankingData = async () => {
    try {
      setLoading(true);
      setError(null);

      let result = null;

      switch (activeTab) {
        case 'users':
          result = await getGlobalRanking(pagination.skip, pagination.limit);
          setData(result.data.users);
          break;
        case 'projects':
          result = await getProjectsRanking(pagination.skip, pagination.limit);
          setData(result.data.projects);
          break;
        case 'tags':
          result = await getTagsRanking(pagination.limit);
          setData(result.data.tags);
          break;
        case 'weekly':
          result = await getWeeklyRanking(pagination.skip, pagination.limit);
          setData(result.data.users);
          break;
        default:
          return;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtener posición del usuario actual
  useEffect(() => {
    if (token) {
      fetchUserPosition();
    }
  }, [token]);

  const fetchUserPosition = async () => {
    try {
      const response = await getUserRankingPosition();
      setUserPosition(response.data);
    } catch (err) {
    }
  };

  const handleNextPage = () => {
    setPagination(prev => ({
      ...prev,
      skip: prev.skip + prev.limit
    }));
  };

  const handlePrevPage = () => {
    setPagination(prev => ({
      ...prev,
      skip: Math.max(0, prev.skip - prev.limit)
    }));
  };

  const renderUsersRanking = () => (
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
            <th>Seguidores</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user, index) => (
            <tr key={user.userId || `user-${index}`} className={userPosition?.position === user.rank ? 'current-user' : ''}>
              <td className="rank">#{user.rank}</td>
              <td className="user-info">
                <div className="user-avatar">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.username} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-details">
                  <p className="username">{user.username}</p>
                  <p className="name">{user.name}</p>
                  {user.bio && <p className="bio">{user.bio}</p>}
                </div>
              </td>
              <td>{user.stats?.totalViews || 0}</td>
              <td>{user.stats?.totalLikes || 0}</td>
              <td>{user.stats?.totalComments || 0}</td>
              <td className="score">{user.stats?.popularityScore || 0}</td>
              <td>{user.followers || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderProjectsRanking = () => (
    <div className="ranking-projects">
      {data.map((project, index) => (
        <div key={project.projectId || `project-${index}`} className="project-card">
          <div className="project-rank">#{project.rank}</div>
          {project.images && project.images[0] && (
            <img src={project.images[0]} alt={project.title} className="project-image" />
          )}
          <div className="project-info">
            <h3>{project.title}</h3>
            {project.owner ? (
              <p className="owner">
                <strong>Por:</strong> {project.owner.name} (@{project.owner.username})
              </p>
            ) : (
              <p className="owner">
                <strong>Por:</strong> Usuario eliminado
              </p>
            )}
            <p className="description">{project.description}</p>
            <div className="project-stats">
              <span>👀 {project.stats?.views || 0}</span>
              <span>❤️ {project.stats?.likes || 0}</span>
              <span>💬 {project.stats?.comments || 0}</span>
            </div>
            <div className="project-score">Score: {project.stats?.popularityScore || 0}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTagsRanking = () => (
    <div className="ranking-tags">
      {data.map((tag, index) => (
        <div key={`${tag.tag}-${index}`} className="tag-card">
          <div className="tag-rank">#{tag.rank}</div>
          <div className="tag-info">
            <h3>#{tag.tag}</h3>
            <div className="tag-stats">
              <span>{tag.projectCount || 0} proyectos</span>
              <span>Score: {tag.totalScore || 0}</span>
              <span>Promedio: {tag.avgScore || 0}</span>
            </div>
            <div className="tag-details">
              <p>👀 {tag.totalViews || 0} vistas</p>
              <p>❤️ {tag.totalLikes || 0} likes</p>
              <p>💬 {tag.totalComments || 0} comentarios</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="ranking-container">
      <div className="ranking-header">
        <h1>🏆 Ranking Global</h1>
        <p>Descubre a los usuarios y proyectos más populares</p>
        
        {userPosition && userPosition.position && (
          <div className="user-position">
            <p>Tu posición: <strong>#{userPosition.position}</strong> de {userPosition.totalUsers}</p>
          </div>
        )}
        {userPosition && !userPosition.position && (
          <div className="user-position warning">
            <p>{userPosition.message}</p>
          </div>
        )}
      </div>

      <div className="ranking-tabs">
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Usuarios
        </button>
        <button 
          className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          🎨 Proyectos
        </button>
        <button 
          className={`tab ${activeTab === 'tags' ? 'active' : ''}`}
          onClick={() => setActiveTab('tags')}
        >
          🏷️ Categorías
        </button>
        <button 
          className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          📈 Esta Semana
        </button>
      </div>

      {loading && <div className="loading">Cargando ranking...</div>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && (
        <>
          {activeTab === 'users' && renderUsersRanking()}
          {activeTab === 'projects' && renderProjectsRanking()}
          {activeTab === 'tags' && renderTagsRanking()}
          {activeTab === 'weekly' && renderUsersRanking()}

          {(activeTab === 'users' || activeTab === 'projects' || activeTab === 'weekly') && (
            <div className="pagination">
              <button 
                onClick={handlePrevPage} 
                disabled={pagination.skip === 0}
              >
                ← Anterior
              </button>
              <span>Página {Math.floor(pagination.skip / pagination.limit) + 1}</span>
              <button 
                onClick={handleNextPage}
                disabled={data.length < pagination.limit}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Ranking;
