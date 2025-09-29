import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Cargar usuario desde localStorage al montar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          TFG Portafolios
        </Link>

        {/* Navegación */}
        <nav className="flex gap-4">
          <Link to="/" className="hover:text-gray-300">
            Inicio
          </Link>
          <Link to="/projects" className="hover:text-gray-300">
            Proyectos
          </Link>
          <Link to="/dashboard" className="hover:text-gray-300">
            Dashboard
          </Link>
        </nav>

        {/* Usuario */}
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="font-semibold">
                👋 Hola, {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link
                to="/login"
                className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-green-500 px-3 py-1 rounded hover:bg-green-600"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
