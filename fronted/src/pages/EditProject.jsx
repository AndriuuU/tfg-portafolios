import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [image, setImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Cargar proyecto al entrar
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await API.get(`/projects/${id}`);
        const p = res.data;
        setProject(p);
        setTitle(p.title);
        setSlug(p.slug);
        setDescription(p.description);
        setTags(p.tags?.join(", ") || "");
        setLiveUrl(p.liveUrl || "");
        setRepoUrl(p.repoUrl || "");
      } catch (err) {
        console.error(err);
        setMsg("No se pudo cargar el proyecto");
      }
    };
    fetchProject();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      // Preparar tags como array
      const tagsArray = tags.split(",").map((t) => t.trim()).filter(t => t);
      
      // Si hay imagen, usar FormData
      if (image || removeImage) {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("slug", slug);
        formData.append("description", description);
        formData.append("tags", tagsArray.join(",")); // Enviar como string separado por comas
        formData.append("liveUrl", liveUrl);
        formData.append("repoUrl", repoUrl);
        formData.append("removeImage", removeImage ? "true" : "false");
        if (image) formData.append("images", image); // El backend espera 'images' (plural)

        await API.put(`/projects/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Si no hay imagen, enviar JSON
        await API.put(`/projects/${id}`, {
          title,
          slug,
          description,
          tags: tagsArray,
          liveUrl,
          repoUrl,
        });
      }

      setMsg("✅ Proyecto actualizado con éxito");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.error || "❌ Error al actualizar proyecto");
    } finally {
      setLoading(false);
    }
  };

  if (!project) return <p>Cargando proyecto...</p>;

  return (
    <div className="p-4 max-w-lg mx-auto border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Editar Proyecto</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          className="border p-2 rounded w-full"
          required
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="Slug único"
          className="border p-2 rounded w-full"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción"
          className="border p-2 rounded w-full"
        />
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Etiquetas separadas por coma"
          className="border p-2 rounded w-full"
        />
        <input
          value={liveUrl}
          onChange={(e) => setLiveUrl(e.target.value)}
          placeholder="URL en vivo"
          className="border p-2 rounded w-full"
        />
        <input
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="URL repositorio"
          className="border p-2 rounded w-full"
        />

        <div>
          <label className="block font-semibold mb-1">Imagen</label>
          {project.images?.length > 0 && !removeImage && (
            <div className="mb-2 flex items-center gap-2">
              <img src={project.images[0]} alt={project.title} width={120} className="rounded" />
              <button
                type="button"
                onClick={() => setRemoveImage(true)}
                className="px-2 py-1 bg-red-500 text-white rounded"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
      {msg && <p className="mt-3 text-center">{msg}</p>}
    </div>
  );
}
