import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { likeProject, unlikeProject, saveProject, unsaveProject } from '../api/api';

const ProjectPost = ({ project: initialProject }) => {
  const navigate = useNavigate();
  const [project, setProject] = useState(initialProject);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentUserId = JSON.parse(localStorage.getItem('user'))?._id;
  const hasMultipleImages = project.images && project.images.length > 1;

  // Verificar si el usuario actual ya dio like o guardó el proyecto
  useEffect(() => {
    if (currentUserId && project.likes) {
      setIsLiked(project.likes.includes(currentUserId));
    }
  }, [currentUserId, project.likes]);

  const goToProfile = (username) => {
    navigate(`/portfolio/${username}`);
  };

  const goToProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      if (isLiked) {
        await unlikeProject(project._id);
        setProject(prev => ({
          ...prev,
          likes: prev.likes.filter(id => id !== currentUserId)
        }));
        setIsLiked(false);
      } else {
        await likeProject(project._id);
        setProject(prev => ({
          ...prev,
          likes: [...(prev.likes || []), currentUserId]
        }));
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      if (isSaved) {
        await unsaveProject(project._id);
        setIsSaved(false);
      } else {
        await saveProject(project._id);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === project.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? project.images.length - 1 : prev - 1
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    // Si es menos de 24 horas
    if (diffInHours < 24) {
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        if (diffInMinutes === 0) return 'Hace un momento';
        return `Hace ${diffInMinutes} min`;
      }
      return `Hace ${diffInHours}h`;
    }
    
    // Si es más de 24 horas, mostrar fecha y hora
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div onClick={() => goToProfile(project.owner.username)}>
        {project.owner.avatarUrl ? (
          <img src={project.owner.avatarUrl} alt={project.owner.username} />
        ) : (
          <div>
            {project.owner.name?.charAt(0).toUpperCase() || project.owner.username?.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p>{project.owner.name || project.owner.username}</p>
          <p>Ha publicado un nuevo portafolio · {formatDate(project.createdAt)}</p>
        </div>
      </div>

      <div className="project-description">
        <p>{project.description || 'Sin descripción disponible'}</p>
      </div>

      <div className="project-image-container" onClick={() => goToProject(project._id)}>
        {project.images && project.images.length > 0 ? (
          <div className="image-carousel">
            <img 
              src={project.images[currentImageIndex]} 
              alt={`${project.title} - Imagen ${currentImageIndex + 1}`}
              className="project-image"
            />
            
            {hasMultipleImages && (
              <>
                <button 
                  className="carousel-btn carousel-btn-prev"
                  onClick={prevImage}
                  aria-label="Imagen anterior"
                >
                  ‹
                </button>
                <button 
                  className="carousel-btn carousel-btn-next"
                  onClick={nextImage}
                  aria-label="Siguiente imagen"
                >
                  ›
                </button>
                <div className="carousel-indicators">
                  {project.images.map((_, index) => (
                    <span 
                      key={index}
                      className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="no-image-placeholder">
            <span>📁</span>
          </div>
        )}
      </div>

      <div>
        <h3 onClick={() => goToProject(project._id)}>{project.title}</h3>
        <p>Explora el proceso detrás de la creación de una identidad visual fuerte y memorable.</p>
      </div>

      <div>
        <button onClick={handleLike}>
          <span>{isLiked ? '❤️' : '🤍'}</span>
          <span>{project.likes?.length || 0}</span>
        </button>
        
        <button onClick={() => setShowComments(!showComments)}>
          <span>💬</span>
          <span>{project.comments?.length || 0}</span>
        </button>

        <button onClick={handleSave}>
          <span>{isSaved ? '🔖' : '📑'}</span>
        </button>
      </div>

      {/* Sección de comentarios */}
      {showComments && (
        <div>
          <h4>Comentarios</h4>
          {project.comments && project.comments.length > 0 ? (
            project.comments.map((comment) => (
              <div key={comment._id}>
                <p><strong>{comment.user?.username || 'Usuario'}:</strong> {comment.text}</p>
                <span>{formatDate(comment.createdAt)}</span>
              </div>
            ))
          ) : (
            <p>No hay comentarios aún</p>
          )}
        </div>
      )}
    </div>
  );
        
};

export default ProjectPost;
