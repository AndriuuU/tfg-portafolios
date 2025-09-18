import { useEffect, useState } from "react";
import API from "../api/api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    API.get("/projects")
      .then(res => setProjects(res.data))
      .catch(() => setProjects([]));
  }, []);

  return (
    <div>
      <h2>Mis proyectos</h2>
      <Link to="/projects/new">+ Nuevo proyecto</Link>
      <ul>
        {projects.map(p => (
          <li key={p._id}>
            <h3>{p.title}</h3>
            {p.images && p.images.map((img, i) => (
              <img key={i} src={img} alt={p.title} width={150} />
            ))}
            <p>{p.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
