import { useEffect, useState } from "react";
import API from "../api/api";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data);
    } catch {
      setProjects([]);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("¿Seguro que quieres eliminar este proyecto?")) {
      await API.delete(`/projects/${id}`);
      fetchProjects();

      try {
        await API.delete(`/projects/${id}`);
        fetchProjects();
      } catch (err) {
        console.error(err.response?.data || err);
        alert("❌ No se pudo eliminar el proyecto");
      }
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Mis proyectos</h2>
      <Link to="/projects/new" className="px-3 py-2 bg-green-600 text-white rounded">
        + Nuevo proyecto
      </Link>
      <ul className="mt-4 space-y-3">
        {projects.map((p) => (
          <li key={p._id} className="p-3 border rounded shadow">
            <h3 className="font-semibold">{p.title}</h3>
            {p.images?.length > 0 && (
              <img src={p.images[0]} alt={p.title} width={150} className="mt-2" />
            )}
            <p>{p.description}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => navigate(`/projects/${p._id}/edit`)}
                className="px-3 py-1 bg-yellow-500 text-white rounded"
              >
                Editar
              </button>

              <button
                onClick={() => handleDelete(p._id)}
                className="px-2 py-1 bg-red-600 text-white rounded"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
