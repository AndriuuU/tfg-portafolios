import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/api";
import Comments from "../components/Comments";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const token = localStorage.getItem("token");

  const fetchProject = async () => {
    try {
      const res = await API.get(`/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(res.data);
    } catch (err) {
      console.error("Error al cargar proyecto:", err);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  if (!project) return <p>Cargando...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">{project.title}</h2>
      <p>{project.description}</p>
      {project.images?.length > 0 && (
        <img
          src={project.images[0]}
          alt={project.title}
          className="my-4 max-w-md"
        />
      )}
      <Comments projectId={id} token={token} />
    </div>
  );
}
