import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import "../styles/ProjectForm.scss";

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
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setFileName(file ? file.name : "");
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
    <div className="project-form-page">
      <div className="project-form-container">
        <div className="form-header">
          <h2>{project ? "✏️ Editar Proyecto" : " Crear Nuevo Proyecto"}</h2>
          <p>{project ? "Actualiza la información de tu proyecto" : "Comparte tu trabajo con la comunidad"}</p>
        </div>

        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-group">
            <label>
              Título del proyecto <span className="required">*</span>
            </label>
            <input
              name="title"
              placeholder="Ej: Aplicación de gestión de tareas"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="description"
              placeholder="Describe tu proyecto, sus características y objetivos..."
              value={form.description}
              onChange={handleChange}
              rows="6"
            />
          </div>

          <div className="form-group">
            <label>Tecnologías</label>
            <input
              name="tags"
              placeholder="React, Node.js, MongoDB, Express..."
              value={form.tags}
              onChange={handleChange}
            />
            <span className="input-hint">Separa las tecnologías con comas</span>
          </div>

          <div className="form-group">
            <label>URL del Demo</label>
            <input
              name="liveUrl"
              placeholder="https://mi-proyecto.vercel.app"
              value={form.liveUrl}
              onChange={handleChange}
              type="url"
            />
          </div>

          <div className="form-group">
            <label>URL del Repositorio</label>
            <input
              name="repoUrl"
              placeholder="https://github.com/usuario/proyecto"
              value={form.repoUrl}
              onChange={handleChange}
              type="url"
            />
          </div>

          <div className="form-group">
            <label>Imagen del proyecto</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <div className="file-input-label">
                <span className="file-icon">🖼️</span>
                <div className="file-text">
                  {fileName ? (
                    <>Archivo seleccionado: <span className="file-name">{fileName}</span></>
                  ) : (
                    "Haz clic para seleccionar una imagen"
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-cancel"
            >
              ❌ Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? "⏳ Guardando..." : project ? "💾 Actualizar Proyecto" : "✨ Crear Proyecto"}
            </button>
          </div>

          {msg && (
            <div className={`message ${msg.includes('❌') ? 'error' : 'success'}`}>
              {msg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
