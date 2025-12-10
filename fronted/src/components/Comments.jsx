import { useEffect, useState } from "react";
import API from "../api/api";
import { likeComment, unlikeComment } from "../api/api";

export default function Comments({ projectId, token }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [likedComments, setLikedComments] = useState(new Set());

  // Obtener el ID del usuario actual de forma más robusta
  const getUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?._id || user?.id;
    } catch {
      return null;
    }
  };
  
  const currentUserId = getUserId();

  // Obtener comentarios del proyecto
  const fetchComments = async () => {
    try {
      const res = await API.get(`/projects/${projectId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const comm = res.data.comments;
      if (Array.isArray(comm)) {
        setComments(comm);
        
        // Verificar qué comentarios ya tienen like del usuario actual
        const liked = new Set();
        comm.forEach(comment => {
          if (comment.likes && Array.isArray(comment.likes)) {
            // Comparar el ID del usuario con los IDs en likes
            const hasLike = comment.likes.some(likeId => {
              const likeIdStr = likeId?._id?.toString() || likeId?.toString();
              return likeIdStr === currentUserId;
            });
            if (hasLike) {
              liked.add(comment._id);
            }
          }
        });
        setLikedComments(liked);
      } else {
        setComments([]);
      }
    } catch (err) {
      setErrorMsg("Error al cargar comentarios");
    }
  };

  // Añadir comentario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!newComment.trim()) {
      setErrorMsg("El comentario no puede estar vacío");
      return;
    }

    try {
      await API.post(
        `/projects/${projectId}/comments`,
        { text: newComment },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setNewComment("");
      fetchComments();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Error al añadir comentario");
    }
  };

  // Dar o quitar like a un comentario
  const handleLikeComment = async (commentId) => {
    try {
      const isCurrentlyLiked = likedComments.has(commentId);
      
      if (isCurrentlyLiked) {
        // Quitar like
        await unlikeComment(projectId, commentId);
        setLikedComments(prev => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
        
        // Actualizar el contador de likes localmente
        setComments(prev => prev.map(c => 
          c._id === commentId 
            ? { ...c, likes: (c.likes || []).filter(id => id !== currentUserId) }
            : c
        ));
      } else {
        // Dar like
        await likeComment(projectId, commentId);
        setLikedComments(prev => new Set([...prev, commentId]));
        
        // Actualizar el contador de likes localmente
        setComments(prev => prev.map(c => 
          c._id === commentId 
            ? { ...c, likes: [...(c.likes || []), currentUserId] }
            : c
        ));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Error al dar like";
      
      // Si el error es que ya dio like, actualizar el estado local
      if (errorMessage.includes("Ya diste like")) {
        setLikedComments(prev => new Set([...prev, commentId]));
      }
      
      setErrorMsg(errorMessage);
      
      // Recargar comentarios para sincronizar el estado
      setTimeout(() => {
        fetchComments();
        setErrorMsg("");
      }, 1000);
    }
  };

  // Eliminar comentario
  const handleDelete = async (commentId, commentUserId) => {
    // solo si usuario coincide
    if (!token) {
      setErrorMsg("No tienes permisos");
      return;
    }

    // Obtener id usuario local
    const userData = localStorage.getItem("user");
    let localUserId = null;
    try {
      localUserId = userData ? JSON.parse(userData).id : null;
    } catch (e) {
      localUserId = null;
    }
    if (!localUserId || localUserId !== commentUserId) {
      setErrorMsg("Solo puedes eliminar tus propios comentarios");
      return;
    }

    try {
      await API.delete(`/projects/${projectId}/comments/${commentId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      fetchComments();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Error al eliminar comentario");
    }
  };

  useEffect(() => {
    fetchComments();
  }, [projectId]);

  return (
    <div className="comments-section">
      <h3 className="comments-title">Comentarios ({comments.length})</h3>

      {errorMsg && <p className="error-message">{errorMsg}</p>}

      <form onSubmit={handleSubmit} className="comment-form">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe un comentario..."
          className="comment-input"
        />
        <button type="submit" className="comment-submit">
          💬 Comentar
        </button>
      </form>

      <div className="comments-list">
        {comments.length === 0 && (
          <p className="empty-comments">No hay comentarios aún. ¡Sé el primero en comentar!</p>
        )}
        {comments.map((c) => {
          const commentUser = c.user;
          const commentUserId = commentUser ? commentUser._id || commentUser.id : null;
          const username = commentUser ? commentUser.username || commentUser.name || "Usuario" : "Usuario eliminado";
          const isLiked = likedComments.has(c._id);
          const likesCount = c.likes?.length || 0;

          return (
            <div key={c._id} className="comment">
              <div className="comment-header">
                <div className="comment-user">
                  {commentUser?.avatarUrl ? (
                    <img 
                      src={commentUser.avatarUrl} 
                      alt={username}
                      className="comment-avatar"
                    />
                  ) : (
                    <div className="comment-avatar-placeholder">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="comment-meta">
                    <span className="comment-author">{username}</span>
                    <span className="comment-date">
                      {new Date(c.createdAt).toLocaleString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                {commentUserId && (() => {
                  let localUserId = null;
                  try {
                    localUserId = localStorage.getItem("user")
                      ? JSON.parse(localStorage.getItem("user")).id
                      : null;
                  } catch (e) { localUserId = null; }
                  if (localUserId && localUserId === commentUserId) {
                    return (
                      <button
                        onClick={() => handleDelete(c._id, commentUserId)}
                        className="comment-delete"
                      >
                        🗑️
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
              
              <p className="comment-content">{c.text}</p>
              
              <div className="comment-actions">
                <button
                  onClick={() => handleLikeComment(c._id)}
                  className={`comment-like-btn ${isLiked ? 'liked' : ''}`}
                >
                  <span>{isLiked ? '❤️' : '🤍'}</span>
                  <span>{likesCount}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
