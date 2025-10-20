import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    name: "",
    password: ""
  });
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    
    if (msg.type === "error") {
      setMsg({ text: "", type: "" });
    }
    
    if (e.target.name === "username") {
      setUsernameError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", type: "" });

    if (form.password.length < 6) {
      setMsg({ text: "La contraseña debe tener al menos 6 caracteres", type: "error" });
      setLoading(false);
      return;
    }

    if (!form.username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
      setMsg({ text: "El username debe tener entre 3-20 caracteres (solo letras, números y _)", type: "error" });
      setLoading(false);
      return;
    }

    try {
      const response = await API.post("/auth/register", form);
      console.log("Registro exitoso:", response.data);
      setMsg({ text: "Usuario registrado exitosamente. Redirigiendo al login...", type: "success" });
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Error en registro:", err.response?.data);
      
      let errorMsg = "Error al registrar usuario";
      
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
        
        if (err.response.data.error.toLowerCase().includes("usuario")) {
          setUsernameError(err.response.data.error);
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setMsg({ text: errorMsg, type: "error" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <h2>Crear cuenta</h2>
        <p>Completa el formulario para registrarte</p>
      </div>

      {msg.text && (
        <div data-type={msg.type}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre de usuario</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="johndoe"
            required
            minLength={3}
            maxLength={20}
          />
          {usernameError && (
            <p>{usernameError}</p>
          )}
          <p>3-20 caracteres, solo letras, números y guión bajo</p>
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            required
          />
        </div>

        <div>
          <label>Nombre completo</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />
          <p>Mínimo 6 caracteres</p>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Crear cuenta"}
        </button>
      </form>

      <div>
        <p>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}
