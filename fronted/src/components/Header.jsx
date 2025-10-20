import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getFollowRequests } from "../api/followApi";

const Header = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);

  // Cargar solicitudes pendientes
  useEffect(() => {
    if (user) {
      loadPendingRequests();
      // Actualizar cada 30 segundos
      const interval = setInterval(loadPendingRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadPendingRequests = async () => {
    try {
      const res = await getFollowRequests();
      setPendingRequests(res.data?.requests?.length || 0);
    } catch (err) {
      console.error('Error loading requests:', err);
      setPendingRequests(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <header>
      <div>
        {/* Logo */}
        <Link to="/">TFG Portafolios</Link>

        {/* Navegación */}
        <nav>
          <Link to="/">Inicio</Link>
          {user && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to={`/u/${user.username}`}>Mi Portfolio</Link>
            </>
          )}
        </nav>

        {/* Usuario */}
        <div>
          {user ? (
            <div>
              {/* Avatar clickeable */}
              <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div>
                  {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                </div>
                <span>{user.username}</span>
                <svg>
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  {/* Backdrop para cerrar al hacer clic fuera */}
                  <div onClick={() => setDropdownOpen(false)} />
                  
                  <div>
                    <div>
                      <p>{user.name || user.username}</p>
                      <p>@{user.username}</p>
                    </div>
                    
                    <Link
                      to={`/u/${user.username}`}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span>👁️</span>
                      <span>Ver mi portfolio</span>
                    </Link>
                    
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span>⚙️</span>
                      <span>Configuración</span>
                      {pendingRequests > 0 && (
                        <span style={{ 
                          background: 'red', 
                          color: 'white', 
                          borderRadius: '10px', 
                          padding: '2px 6px', 
                          fontSize: '12px',
                          marginLeft: '8px'
                        }}>
                          {pendingRequests}
                        </span>
                      )}
                    </Link>
                    
                    <hr />
                    
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                    >
                      <span>🚪</span>
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
