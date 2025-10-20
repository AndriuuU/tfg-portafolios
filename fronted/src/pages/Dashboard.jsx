import { useEffect, useState } from "react";
import API from "../api/api";
import { Link } from "react-router-dom";
import Comments from "../components/Comments";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [openComments, setOpenComments] = useState(null);
  const token = localStorage.getItem("token");

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch {
      setProjects([]);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("¿Seguro que quieres eliminar este proyecto?")) {
      await API.delete(`/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProjects();
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Mis proyectos</h2>
        {(() => {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          return user.username ? (
            <Link
              to={`/u/${user.username}`}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              👁️ Ver mi portfolio público
            </Link>
          ) : null;
        })()}
      </div>
      
      <Link
        to="/projects/new"
        className="inline-block px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        ➕ Nuevo proyecto
      </Link>

      <ul className="mt-4 space-y-3">
        {projects.map((p) => (
          <li key={p._id} className="p-3 border rounded shadow">
            <h3 className="font-semibold">{p.title}</h3>
            {p.images?.length > 0 && (
              <img
                src={p.images[0]}
                alt={p.title}
                width={150}
                className="mt-2"
              />
            )}
            <p>{p.description}</p>
            
            {/* Info y enlaces */}
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                💬 {p.comments?.length || 0} comentario{p.comments?.length !== 1 ? 's' : ''}
              </p>
              <Link
                to={`/projects/${p._id}`}
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition"
              >
                Ver detalles →
              </Link>
            </div>

            <Comments projectId={p._id} token={localStorage.getItem("token")} />

            <div className="mt-3 flex gap-2">
              <Link
                to={`/projects/${p._id}/edit`}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
              >
                ✏️ Editar
              </Link>
              <button
                onClick={() => handleDelete(p._id)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                🗑️ Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
