import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getFollowRequests } from "../api/followApi";
import SearchBar from "./SearchBar";
import NotificationBell from "./NotificationBell";
import "../styles/components/_header.scss";

const Header = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    // Cargar preferencia del localStorage
    return localStorage.getItem('darkMode') === 'true';
  });

  // Aplicar clase al body cuando cambia el modo
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Cargar solicitudes pendientes
  useEffect(() => {
    if (user) {
      loadPendingRequests();
      // Actualizar cada 20 segundos
      const interval = setInterval(loadPendingRequests, 20000);
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <header className="header">
      <div className="header__container">
        {/* Logo */}
        <Link to="/" className="header__logo">
          PortafoliosHub
        </Link>

        {/* Barra de búsqueda */}
        {user && <SearchBar />}

        {/* Navegación */}
        <nav className="header__nav">
          <Link to="/" className="header__link">Inicio</Link>
          <Link to="/ranking" className="header__link">🏆 Ranking</Link>
          {user && (
            <>
              <Link to="/dashboard" className="header__link">Dashboard</Link>
              <Link to="/analytics" className="header__link">Analytics</Link>
              <Link to={`/u/${user.username}`} className="header__link">Mi Portfolio</Link>
            </>
          )}
        </nav>

        {/* Usuario */}
        <div className="header__user">
          {user && <NotificationBell />}
          {user ? (
            <div className="user-menu">
              {/* Botón de usuario */}
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="user-menu__button">
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.username}
                    className="user-menu__avatar"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="user-menu__avatar">
                    {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="user-menu__name">{user.username}</span>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <>
                  <div className="user-menu__backdrop" onClick={() => setDropdownOpen(false)} />
                  
                  <div className="user-menu__dropdown">
                    <Link to={`/u/${user.username}`} onClick={() => setDropdownOpen(false)} className="user-menu__item">
                      <span>👁️</span>
                      <span>Ver perfil</span>
                    </Link>
                    
                    <Link to="/settings" onClick={() => setDropdownOpen(false)} className="user-menu__item">
                      <span>⚙️</span>
                      <span>Configuración</span>
                      {pendingRequests > 0 && (
                        <span className="user-menu__badge">{pendingRequests}</span>
                      )}
                    </Link>
                    
                    <button onClick={toggleDarkMode} className="user-menu__item">
                      <span>{darkMode ? '☀️' : '🌙'}</span>
                      <span>{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
                    </button>
                    
                    <hr className="user-menu__divider" />
                    
                    <button onClick={() => { setDropdownOpen(false); handleLogout(); }} className="user-menu__item user-menu__item--danger">
                      <span>🚪</span>
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="header__auth-btn header__auth-btn--login">Login</Link>
              <Link to="/register" className="header__auth-btn header__auth-btn--register">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
