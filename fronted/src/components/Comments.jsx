import { useEffect, useState } from "react";
import API from "../api/api";

export default function Comments({ projectId, token }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Obtener comentarios del proyecto
  const fetchComments = async () => {
    try {
      const res = await API.get(`/projects/${projectId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      // Puede que res.data.comments sea undefined → asegurarse
      const comm = res.data.comments;
      if (Array.isArray(comm)) {
        setComments(comm);
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
      console.error("Error al añadir comentario:", err);
      // Mostrar mensaje específico
      setErrorMsg(err.response?.data?.error || "Error al añadir comentario");
    }
  };

  // Eliminar comentario
  const handleDelete = async (commentId, commentUserId) => {
    // solo si usuario coincide
    if (!token) {
      setErrorMsg("No tienes permisos");
      return;
    }
    // Aquí, para saber si puedes eliminar, necesitas comparar tu user id local con commentUserId
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
          const commentUser = c.user; // puede ser null
          const commentUserId = commentUser ? commentUser._id || commentUser.id : null;
          const username = commentUser ? commentUser.username || commentUser.name || "Usuario" : "Usuario eliminado";

          return (
            <li key={c._id} className="p-3 border rounded bg-gray-50 flex justify-between items-start">
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}
