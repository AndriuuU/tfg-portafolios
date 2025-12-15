import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import "../styles/ProjectForm.scss";

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
  const [fileName, setFileName] = useState("");
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
      setMsg(err.response?.data?.error || "❌ Error al actualizar proyecto");
    } finally {
      setLoading(false);
    }
  };

  if (!project) {
    return (
      <div className="project-form-page">
        <div className="project-form-container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Cargando proyecto...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="project-form-page">
      <div className="project-form-container">
        <div className="form-header">
          <h2>Editar proyecto</h2>
          <p>Actualiza la información de tu proyecto</p>
        </div>

        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-group">
            <label>
              Título del proyecto <span className="required">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Aplicación de gestión de tareas"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Slug único <span className="required">*</span>
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="proyecto-ejemplo-2024"
              required
            />
            <span className="input-hint">URL amigable para tu proyecto</span>
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe tu proyecto, sus características y objetivos..."
              rows="6"
            />
          </div>

          <div className="form-group">
            <label>Tecnologías</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="React, Node.js, MongoDB, Express..."
            />
            <span className="input-hint">Separa las tecnologías con comas</span>
          </div>

          <div className="form-group">
            <label>URL del Demo</label>
            <input
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://mi-proyecto.vercel.app"
              type="url"
            />
          </div>

          <div className="form-group">
            <label>URL del Repositorio</label>
            <input
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/usuario/proyecto"
              type="url"
            />
          </div>

          <div className="form-group">
            <label>Imagen del proyecto</label>
            
            {project.images?.length > 0 && !removeImage && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                marginBottom: '1rem',
                padding: '1rem',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <img 
                  src={project.images[0]} 
                  alt={project.title} 
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '2px solid var(--border-color)'
                  }} 
                />
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    marginBottom: '0.5rem', 
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                  }}>
                    Imagen actual
                  </p>
                  <button
                    type="button"
                    onClick={() => setRemoveImage(true)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#dc2626'}
                    onMouseOut={(e) => e.target.style.background = '#ef4444'}
                  >
                    🗑️ Eliminar imagen
                  </button>
                </div>
              </div>
            )}

            {!removeImage && (
              <div className="file-input-wrapper">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setImage(file);
                    setFileName(file ? file.name : "");
                  }}
                />
                <div className="file-input-label">
                  <span className="file-icon">🖼️</span>
                  <div className="file-text">
                    {fileName ? (
                      <>Archivo seleccionado: <span className="file-name">{fileName}</span></>
                    ) : project.images?.length > 0 ? (
                      "Haz clic para cambiar la imagen"
                    ) : (
                      "Haz clic para seleccionar una imagen"
                    )}
                  </div>
                </div>
              </div>
            )}

            {removeImage && (
              <div style={{
                padding: '1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#dc2626'
              }}>
                ⚠️ La imagen se eliminará al guardar los cambios
                <button
                  type="button"
                  onClick={() => setRemoveImage(false)}
                  style={{
                    display: 'block',
                    margin: '0.5rem auto 0',
                    padding: '0.5rem 1rem',
                    background: 'transparent',
                    color: '#dc2626',
                    border: '2px solid #dc2626',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}
                >
                  Cancelar eliminación
                </button>
              </div>
            )}
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
              {loading ? "⏳ Guardando..." : "💾 Guardar Cambios"}
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
