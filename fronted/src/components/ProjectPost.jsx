import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { likeProject, unlikeProject, saveProject, unsaveProject, addComment, deleteComment } from '../api/api';
import '../styles/ProjectPost.scss';

const ProjectPost = ({ project: initialProject }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [project, setProject] = useState(initialProject);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = currentUser?._id;
  const hasMultipleImages = project.images && project.images.length > 1;

  // Verificar si el usuario actual ya dio like o guardó el proyecto
  useEffect(() => {
    if (currentUserId && project.likes) {
      // Convertir ambos a string para comparación segura
      const userIdString = currentUserId.toString();
      const hasLike = project.likes.some(id => id.toString() === userIdString);
      setIsLiked(hasLike);
    }
    
    // Verificar si el proyecto está guardado
    if (currentUser && currentUser.savedProjects) {
      const projectIdString = project._id.toString();
      const hasSaved = currentUser.savedProjects.some(id => id.toString() === projectIdString);
      setIsSaved(hasSaved);
    }
  }, [currentUserId, currentUser, project.likes, project._id]);

  const goToProfile = (username) => {
    navigate(`/u/${username}`);
  };

  const goToProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const response = await likeProject(project._id);
      const { liked, likesCount } = response.data;
      
      // Actualizar estado basado en respuesta del backend
      setIsLiked(liked);
      setProject(prev => ({
        ...prev,
        likes: Array(likesCount).fill(currentUserId)
      }));
      
      // Mostrar toast específico según la acción
      if (liked) {
        showToast('¡Le has dado like! 👍', 'success');
      } else {
        showToast('Like removido', 'info');
      }
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      const response = await saveProject(project._id);
      const { saved } = response.data;
      setIsSaved(saved);
      
      // Actualizar localStorage
      const updatedUser = JSON.parse(localStorage.getItem('user'));
      if (saved) {
        if (!updatedUser.savedProjects) updatedUser.savedProjects = [];
        if (!updatedUser.savedProjects.includes(project._id)) {
          updatedUser.savedProjects.push(project._id);
        }
      } else {
        updatedUser.savedProjects = updatedUser.savedProjects.filter(
          id => id.toString() !== project._id.toString()
        );
      }
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Mostrar toast específico según la acción
      if (saved) {
        showToast('¡Proyecto guardado! 📌', 'success');
      } else {
        showToast('Proyecto eliminado de guardados', 'info');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoadingComment(true);
    try {
      await addComment(project._id, commentText);
      setProject(prev => ({
        ...prev,
        comments: [
          ...(prev.comments || []),
          {
            _id: Date.now().toString(),
            text: commentText,
            user: { username: JSON.parse(localStorage.getItem('user')).username },
            createdAt: new Date().toISOString()
          }
        ]
      }));
      setCommentText('');
      
      // Mostrar toast
      showToast('¡Comentario publicado! 💬', 'success');
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      showToast('Error al publicar comentario', 'error');
    } finally {
      setLoadingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(project._id, commentId);
      setProject(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c._id !== commentId)
      }));
      
      // Mostrar toast
      showToast('Comentario eliminado', 'info');
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      showToast('Error al eliminar comentario', 'error');
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
    <div className="project-card">
      <div className="project-header" onClick={() => goToProfile(project.owner.username)}>
        <div className="author-avatar">
          {project.owner.avatarUrl ? (
            <img src={project.owner.avatarUrl} alt={project.owner.username} />
          ) : (
            <div className="avatar-placeholder" title={project.owner.name || project.owner.username}>
              {project.owner.name?.charAt(0).toUpperCase() || project.owner.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="author-info">
          <p className="author-name">{project.owner.name || project.owner.username}</p>
          <p className="author-meta">Ha publicado un nuevo portafolio · {formatDate(project.createdAt)}</p>
        </div>
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

      <div className="project-description">
        <p>{project.description || 'Sin descripción disponible'}</p>
      </div>

      <div className="project-info">
        <h3 onClick={() => goToProject(project._id)}>{project.title}</h3>
        <p>Explora el proceso detrás de la creación de una identidad visual fuerte y memorable.</p>
      </div>

      <div className="project-actions">
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
        <div className="project-comments">
          <h4>Comentarios ({project.comments?.length || 0})</h4>
          
          {/* Formulario para agregar comentario */}
          <form onSubmit={handleAddComment} className="comment-form">
            <input
              type="text"
              placeholder="Escribe un comentario..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={loadingComment}
              className="comment-input"
            />
            <button 
              type="submit" 
              disabled={loadingComment || !commentText.trim()}
              className="comment-submit"
            >
              {loadingComment ? '...' : '📤'}
            </button>
          </form>

          {/* Lista de comentarios */}
          {project.comments && project.comments.length > 0 ? (
            project.comments.map((comment) => (
              <div key={comment._id} className="comment">
                <div className="comment-header">
                  <p><strong>{comment.user?.username || 'Usuario'}:</strong> {comment.text}</p>
                  {comment.user?.username === JSON.parse(localStorage.getItem('user'))?.username && (
                    <button 
                      className="comment-delete"
                      onClick={() => handleDeleteComment(comment._id)}
                      title="Eliminar comentario"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <span className="comment-date">{formatDate(comment.createdAt)}</span>
              </div>
            ))
          ) : (
            <p className="no-comments">No hay comentarios aún. ¡Sé el primero!</p>
          )}
        </div>
      )}
    </div>
  );
        
};

export default ProjectPost;
