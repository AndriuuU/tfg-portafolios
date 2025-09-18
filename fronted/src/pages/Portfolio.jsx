import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";

export default function Portfolio() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/users/${username}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setData(null);
        setLoading(false);
      });
  }, [username]);

  if (loading) return <p>Cargando...</p>;
  if (!data) return <p>Usuario no encontrado ❌</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{data.user.name}</h1>
      <p>@{data.user.username}</p>
      <h2 className="mt-4 text-xl">Proyectos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        {data.projects.map((p) => (
          <div key={p._id} className="border p-3 rounded shadow">
            <h3 className="font-semibold">{p.title}</h3>
            {p.images?.length > 0 && (
              <img src={p.images[0]} alt={p.title} className="mt-2 w-full" />
            )}
            <p className="mt-2">{p.description}</p>
            {p.liveUrl && (
              <a
                href={p.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline block mt-2"
              >
                Ver proyecto
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
