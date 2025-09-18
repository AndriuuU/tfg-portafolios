import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function ProjectForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    tags: "",
    liveUrl: "",
    repoUrl: "",
  });
  const [image, setImage] = useState(null);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1️⃣ Crear proyecto
      const res = await API.post("/projects", {
        ...form,
        tags: form.tags.split(",").map(t => t.trim())
      });

      const projectId = res.data._id;

      // 2️⃣ Subir imagen si hay
      if (image) {
        const formData = new FormData();
        formData.append("image", image);

        await API.post(`/projects/${projectId}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setMsg("Proyecto creado ✅");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.error || "Error al crear proyecto");
    }
  };

  return (
    <div>
      <h2>Nuevo proyecto</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Título" onChange={handleChange} required />
        <input name="slug" placeholder="Slug único" onChange={handleChange} required />
        <input name="description" placeholder="Descripción" onChange={handleChange} />
        <input name="tags" placeholder="Etiquetas separadas por coma" onChange={handleChange} />
        <input name="liveUrl" placeholder="URL en vivo" onChange={handleChange} />
        <input name="repoUrl" placeholder="URL repositorio" onChange={handleChange} />
        <input type="file" onChange={handleImageChange} />
        <button type="submit">Crear proyecto</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}
