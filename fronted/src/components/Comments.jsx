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
      console.error("Error al cargar comentarios:", err);
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
      console.error("Error al dar like al comentario:", err);
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
      console.error("Error al eliminar comentario:", err);
      setErrorMsg(err.response?.data?.error || "Error al eliminar comentario");
    }
  };

  useEffect(() => {
    fetchComments();
  }, [projectId]);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Comentarios</h3>

      {errorMsg && <p className="text-red-500 mb-2">{errorMsg}</p>}

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe un comentario..."
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          className="px-3 py-2 bg-blue-600 text-white rounded"
        >
          Comentar
        </button>
      </form>

      <ul className="space-y-2">
        {comments.length === 0 && <p className="text-gray-500">No hay comentarios aún.</p>}
        {comments.map((c) => {
          const commentUser = c.user;
          const commentUserId = commentUser ? commentUser._id || commentUser.id : null;
          const username = commentUser ? commentUser.username || commentUser.name || "Usuario" : "Usuario eliminado";
          const isLiked = likedComments.has(c._id);
          const likesCount = c.likes?.length || 0;

          return (
            <li key={c._id} className="p-3 border rounded bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{username}</span> : {c.text}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
                {commentUserId && (() => {
                  // comparar con user local guardado
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
                        className="text-red-600 text-sm ml-2"
                      >
                        Eliminar
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
              
              {/* Botón de like para el comentario */}
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => handleLikeComment(c._id)}
                  className={`flex items-center gap-1 text-sm ${
                    isLiked ? 'text-red-500' : 'text-gray-500'
                  } hover:text-red-600`}
                >
                  <span>{isLiked ? '❤️' : '🤍'}</span>
                  <span>{likesCount}</span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
