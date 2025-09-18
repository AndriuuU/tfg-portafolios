import { useEffect, useState } from "react";
import API from "../api/api";

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
      <ul>
        {projects.map(p => (
          <li key={p._id}>{p.title}</li>
        ))}
      </ul>
    </div>
  );
}