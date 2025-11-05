import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function ProjectForm({ project }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: project?.title || "",
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
      // Generar slug automáticamente desde el título
      const slug = form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        + '-' + Date.now();

      // Crear proyecto (o actualizar si existe)
      let res;
      if (project) {
        res = await API.put(`/projects/${project._id}`, {
          ...form,
          tags: form.tags.split(",").map((t) => t.trim()).filter(t => t),
        });
      } else {
        res = await API.post("/projects", {
          ...form,
          slug,
          tags: form.tags.split(",").map((t) => t.trim()).filter(t => t),
        });
      }

      const projectId = res.data._id;

      // Subir imagen si hay
      if (image) {
        const formData = new FormData();
        formData.append("images", image); // El backend espera 'images' (plural)

        await API.post(`/projects/${projectId}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setMsg("✅ Proyecto guardado con éxito");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      console.error(err);
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
          placeholder="Título del proyecto"
          value={form.title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Descripción del proyecto"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows="4"
        />
        <input
          name="tags"
          placeholder="Etiquetas (React, Node.js, MongoDB...)"
          value={form.tags}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="liveUrl"
          placeholder="URL del proyecto en vivo (opcional)"
          value={form.liveUrl}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          type="url"
        />
        <input
          name="repoUrl"
          placeholder="URL del repositorio (opcional)"
          value={form.repoUrl}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          type="url"
        />
        <div>
          <label className="block mb-2 text-sm font-medium">Imagen del proyecto</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Guardando..." : project ? "Actualizar proyecto" : "Crear proyecto"}
        </button>
      </form>
      {msg && (
        <p className={`mt-3 text-center p-2 rounded ${msg.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {msg}
        </p>
      )}
    </div>
  );
}
