import { useEffect, useState } from "react";
import API from "../api/api";

export default function Comments({ projectId, token }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    // Obtener comentarios del proyecto
    const fetchComments = async () => {
        try {
            const res = await API.get(`/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setComments(res.data.comments || []);
        } catch (err) {
            console.error("Error al cargar comentarios:", err);
        }
    };

    // Añadir comentario
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await API.post(
                `/projects/${projectId}/comments`,
                { text: newComment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewComment("");
            fetchComments(); // refrescar lista
        } catch (err) {
            console.error("Error al añadir comentario:", err);
        }
    };

    // Eliminar comentario
    const handleDelete = async (commentId) => {
        if (!confirm("¿Seguro que quieres eliminar este comentario?")) return;
        try {
            await API.delete(`/projects/${projectId}/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchComments();
        } catch (err) {
            console.error("Error al eliminar comentario:", err);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [projectId]);

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Comentarios</h3>

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
                {comments.length === 0 && (
                    <p className="text-gray-500">No hay comentarios aún.</p>
                )}
                {comments.map((comment) => (
  <div key={comment._id} className="border-b py-2">
    <p className="text-sm text-gray-700">
      <strong>{comment.user?.username || "Usuario eliminado"}</strong>
    </p>
    <p>{comment.text}</p>
    <span className="text-xs text-gray-500">
      {new Date(comment.createdAt).toLocaleString()}
    </span>
  </div>
))}


                {comments.map((c) => (
                    <li
                        key={c._id}
                        className="p-3 border rounded bg-gray-50 flex justify-between items-center"
                    >
                        <div>
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold">
                                    {c.user?.username || "Usuario"}
                                </span>
                                : {c.text}
                            </p>
                            <p className="text-xs text-gray-400">
                                {new Date(c.createdAt).toLocaleString()}
                            </p>
                        </div>
                        {c.user?._id === JSON.parse(localStorage.getItem("user")).id && (
                            <button
                                onClick={() => handleDelete(c._id)}
                                className="text-red-600 text-sm"
                            >
                                Eliminar
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
