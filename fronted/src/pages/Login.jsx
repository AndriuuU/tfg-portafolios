import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";
import "../styles/Auth.scss";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (msg.type === "error") {
      setMsg({ text: "", type: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: "", type: "" });

    try {
      const res = await API.post("/auth/login", form);
      login(res.data.user, res.data.token);
      
      setMsg({ text: "✅ Login exitoso. Redirigiendo...", type: "success" });
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      setMsg({ 
        text: err.response?.data?.error || "❌ Error al iniciar sesión", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Iniciar sesión</h1>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        {msg.text && (
          <div className={`auth-message ${msg.type}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
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
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="form-submit">
            <button type="submit" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Entrar"}
            </button>
          </div>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password" className="forgot-password">
            ¿Olvidaste tu contraseña?
          </Link>

          <div className="divider">
            <span>o</span>
          </div>

          <div className="switch-auth">
            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
