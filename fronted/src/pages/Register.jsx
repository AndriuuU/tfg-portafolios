import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import "../styles/Auth.scss";

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
  const [passwordStrength, setPasswordStrength] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    
    if (msg.type === "error") {
      setMsg({ text: "", type: "" });
    }
    
    if (e.target.name === "username") {
      setUsernameError("");
    }

    if (e.target.name === "password") {
      calculatePasswordStrength(e.target.value);
    }
  };

  const calculatePasswordStrength = (password) => {
    if (password.length === 0) {
      setPasswordStrength("");
      return;
    }
    if (password.length < 6) {
      setPasswordStrength("weak");
    } else if (password.length < 10) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("strong");
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
      setMsg({ 
        text: "✅ Usuario registrado exitosamente. Por favor revisa tu email para verificar tu cuenta.", 
        type: "success" 
      });
      
      setTimeout(() => {
        navigate("/login");
      }, 4000);
    } catch (err) {
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
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Crear cuenta</h1>
          <p>Completa el formulario para unirte a nuestra comunidad</p>
        </div>

        {msg.text && (
          <div className={`auth-message ${msg.type}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Nombre de usuario</label>
            <input
              id="username"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="johndoe"
              required
              minLength={3}
              maxLength={20}
              autoComplete="username"
              className={usernameError ? "error" : ""}
            />
            {usernameError ? (
              <span className="input-error">{usernameError}</span>
            ) : (
              <span className="input-hint">3-20 caracteres, solo letras, números y guión bajo</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Nombre completo</label>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
            />
            {passwordStrength && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div className={`strength-fill ${passwordStrength}`}></div>
                </div>
                <span className={`strength-text ${passwordStrength}`}>
                  {passwordStrength === "weak" && "Contraseña débil"}
                  {passwordStrength === "medium" && "Contraseña media"}
                  {passwordStrength === "strong" && "Contraseña fuerte"}
                </span>
              </div>
            )}
            {!passwordStrength && (
              <span className="input-hint">Mínimo 6 caracteres</span>
            )}
          </div>

          <div className="form-submit">
            <button type="submit" disabled={loading}>
              {loading ? "Registrando..." : "Crear cuenta"}
            </button>
          </div>
        </form>

        <div className="auth-links">
          <div className="divider">
            <span>o</span>
          </div>

          <div className="switch-auth">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
