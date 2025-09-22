import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  // Cargar datos al entrar
  useEffect(() => {
    const fetchProject = async () => {
      const res = await API.get(`/projects/${id}`);
      setProject(res.data);
      setTitle(res.data.title);
      setDescription(res.data.description);
    };
    fetchProject();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("removeImage", removeImage);

    if (image) {
      formData.append("image", image);
    }

    await API.put(`/projects/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    navigate("/dashboard");
  };

  if (!project) return <p>Cargando...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Proyecto</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-semibold">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-semibold">Imagen</label>
          {project.images?.length > 0 && !removeImage && (
            <div className="mb-2">
              <img src={project.images[0]} alt={project.title} width={200} />
              <button
                type="button"
                onClick={() => setRemoveImage(true)}
                className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
              >
                Eliminar imagen
              </button>
            </div>
          )}

          {!removeImage && (
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="border p-2 rounded w-full"
            />
          )}
        </div>

        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
