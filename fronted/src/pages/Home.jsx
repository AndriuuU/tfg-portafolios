import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendedUsers, getFollowingProjects } from '../api/api';
import ProjectPost from '../components/ProjectPost';

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('following');
  const [projects, setProjects] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      loadData();
    } else {
      setLoading(false);
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar proyectos de usuarios que sigo
      const projectsRes = await getFollowingProjects();
      setProjects(projectsRes.data?.projects || []);

      // Cargar usuarios recomendados
      const recommendedRes = await getRecommendedUsers();
      setRecommended(recommendedRes.data?.users || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToProfile = (username) => {
    navigate(`/u/${username}`);
  };

  if (loading) {
    return <div><p>Cargando...</p></div>;
  }

  if (!user) {
    return (
      <div>
        <div>
          <h1>¡Bienvenido a TFG Portafolios!</h1>
          <p>Descubre portfolios increíbles y comparte tus proyectos</p>
          <button onClick={() => navigate('/register')}>Crear cuenta</button>
          <button onClick={() => navigate('/login')}>Iniciar sesión</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1>Hola, {user.name || user.username}</h1>
        <p>Descubre nuevos proyectos y conecta con otros desarrolladores</p>
      </div>

      <div>
        <div>
          <button onClick={() => setActiveTab('following')}>
            Proyectos ({projects.length})
          </button>
          <button onClick={() => setActiveTab('recommended')}>
            Descubrir usuarios ({recommended.length})
          </button>
        </div>

        <div>
          {activeTab === 'following' ? (
            <div>
              {projects.length === 0 ? (
                <div>
                  <p>No hay proyectos para mostrar</p>
                  <p>Los usuarios que sigues aún no han publicado proyectos</p>
                  <button onClick={() => setActiveTab('recommended')}>
                    Descubrir usuarios
                  </button>
                </div>
              ) : (
                <div>
                  {projects.map((project) => (
                    <ProjectPost key={project._id} project={project} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {recommended.length === 0 ? (
                <div>
                  <p>Ya sigues a todos los usuarios disponibles</p>
                </div>
              ) : (
                <div>
                  {recommended.map((user) => (
                    <div key={user._id} onClick={() => goToProfile(user.username)}>
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} />
                      ) : (
                        <div>
                          {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p>{user.name || user.username}</p>
                        <p>@{user.username}</p>
                        {user.email && <p>{user.email}</p>}
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
