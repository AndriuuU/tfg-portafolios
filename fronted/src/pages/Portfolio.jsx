import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/api";
import FollowButton from "../components/FollowButton";
import FollowersList from "../components/FollowersList";
import FollowingList from "../components/FollowingList";
import BlockUserButton from "../components/BlockUserButton";
import { checkRelationship } from "../api/followApi";

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
const UserHeader = ({ user, currentUserId, onFollowUpdate, relationship }) => {
  const isOwnProfile = currentUserId === user._id;
  
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg shadow-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.username}
              className="w-20 h-20 rounded-full object-cover border-4 border-white"
            />
          ) : (
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
              {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{user.name || user.username}</h1>
            <p className="text-lg opacity-90">@{user.username}</p>
            {user.email && (
              <p className="text-sm opacity-75 mt-1">📧 {user.email}</p>
            )}
            <div className="flex gap-4 mt-2">
              <span className="text-sm">
                <strong>{user.followers?.length || 0}</strong> seguidores
              </span>
              <span className="text-sm">
                <strong>{user.following?.length || 0}</strong> siguiendo
              </span>
            </div>
          </div>
        </div>
        {!isOwnProfile && (
          <div className="flex gap-2">
            <div className="text-black">
              <FollowButton userId={user._id} onUpdate={onFollowUpdate} />
            </div>
            <BlockUserButton 
              userId={user._id} 
              isBlocked={relationship?.isBlocked} 
              onUpdate={onFollowUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para una tarjeta de proyecto
const ProjectCard = ({ project }) => (
  <div className="border border-gray-200 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden bg-white">
    {project.images?.length > 0 ? (
      <img
        src={project.images[0]}
        alt={project.title}
        className="w-full h-48 object-cover"
      />
    ) : (
      <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
        <span className="text-gray-500 text-4xl">🖼️</span>
      </div>
    )}

    <div className="p-4">
      <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-1">
        {project.title}
      </h3>
      
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {project.description || 'Sin descripción'}
      </p>

      {project.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {project.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex gap-2 mt-4">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition text-center"
          >
            🚀 Ver en vivo
          </a>
        )}
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-3 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-900 transition text-center"
          >
            💻 Código
          </a>
        )}
      </div>

      <Link
        to={`/projects/${project._id}`}
        className="block mt-3 text-center text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
      >
        Ver detalles →
      </Link>
    </div>
  </div>
);

// Componente de loading
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
    <p className="text-gray-600 text-lg">Cargando portfolio...</p>
  </div>
);

// Componente de error
const ErrorMessage = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="text-6xl mb-4">❌</div>
    <p className="text-xl text-red-600 font-semibold">{message}</p>
    <Link
      to="/"
      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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
  const currentUserId = currentUser._id;

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
  const isOwnProfile = currentUserId === user._id;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <UserHeader 
          user={user} 
          currentUserId={currentUserId}
          onFollowUpdate={handleFollowUpdate}
          relationship={relationship}
        />

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowFollowers(!showFollowers)}
            className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            {showFollowers ? '👥 Ocultar seguidores' : '👥 Ver seguidores'}
          </button>
          <button
            onClick={() => setShowFollowing(!showFollowing)}
            className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            {showFollowing ? '👤 Ocultar siguiendo' : '👤 Ver siguiendo'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {showFollowers && (
            <div className="bg-white rounded-lg shadow p-6">
              <FollowersList 
                key={`followers-${refreshKey}`}
                userId={user._id} 
                isOwnProfile={isOwnProfile} 
              />
            </div>
          )}
          {showFollowing && (
            <div className="bg-white rounded-lg shadow p-6">
              <FollowingList 
                key={`following-${refreshKey}`}
                userId={user._id} 
                isOwnProfile={isOwnProfile} 
              />
            </div>
          )}
        </div>

        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            📂 Proyectos
            <span className="ml-2 text-lg font-normal text-gray-600">
              ({projects?.length || 0})
            </span>
          </h2>
        </div>

        {projects?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg">
              Este usuario aún no tiene proyectos publicados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
