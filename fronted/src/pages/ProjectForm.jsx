import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function ProjectForm({ project }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: project?.title || "",
    slug: project?.slug || "",
    description: project?.description || "",
    tags: project?.tags?.join(", ") || "",
    liveUrl: project?.liveUrl || "",
    repoUrl: project?.repoUrl || "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      // 1️⃣ Crear proyecto (o actualizar si existe)
      let res;
      if (project) {
        res = await API.put(`/projects/${project._id}`, {
          ...form,
          tags: form.tags.split(",").map((t) => t.trim()),
        });
      } else {
        res = await API.post("/projects", {
          ...form,
          tags: form.tags.split(",").map((t) => t.trim()),
        });
      }

      const projectId = res.data._id;

      // 2️⃣ Subir imagen si se seleccionó
      if (image) {
        const formData = new FormData();
        formData.append("image", image);

        await API.post(`/projects/${projectId}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setMsg("✅ Proyecto guardado con éxito");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setMsg(err.response?.data?.error || "❌ Error al guardar proyecto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">
        {project ? "Editar proyecto" : "Nuevo proyecto"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="title"
          placeholder="Título"
          value={form.title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="slug"
          placeholder="Slug único"
          value={form.slug}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Descripción"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="tags"
          placeholder="Etiquetas (separadas por comas)"
          value={form.tags}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="liveUrl"
          placeholder="URL en vivo"
          value={form.liveUrl}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="repoUrl"
          placeholder="URL repositorio"
          value={form.repoUrl}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Guardando..." : "Guardar proyecto"}
        </button>
      </form>
      {msg && <p className="mt-3 text-center">{msg}</p>}
    </div>
  );
}
