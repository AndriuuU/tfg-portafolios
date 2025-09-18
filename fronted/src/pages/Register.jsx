import { useState } from "react";
import API from "../api/api";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    name: "",
    password: ""
  });
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", form);
      setMsg("Usuario registrado ✅. Ahora inicia sesión.");
    } catch (err) {
      setMsg(err.response?.data?.error || "Error al registrar");
    }
  };

  return (
    <div>
      <h2>Registro</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Usuario" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="name" placeholder="Nombre" onChange={handleChange} />
        <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} />
        <button type="submit">Registrarse</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}
