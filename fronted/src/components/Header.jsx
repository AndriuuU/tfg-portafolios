import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getFollowRequests } from "../api/followApi";
import SearchBar from "./SearchBar";
import NotificationBell from "./NotificationBell";
import "../styles/components/_header.scss";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (user) {
      loadPendingRequests();
      const interval = setInterval(loadPendingRequests, 20000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadPendingRequests = async () => {
    try {
      const res = await getFollowRequests();
      setPendingRequests(res.data?.requests?.length || 0);
    } catch (err) {
      setPendingRequests(0);
    }
  };

  const handleLogout = () => {
    logout();
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
          <img src="/logoPH.png" alt="PortafoliosHub Logo" className="logo-img" />
          <span className="logo-text">PortafoliosHub</span>
        </Link>

        {/* Barra de búsqueda */}
        {user && <SearchBar />}

        {/* Navegación */}
        <nav className="header__nav">
          <Link to="/" className="header__link">Inicio</Link>
          {user && (
            <>
              <Link to="/dashboard" className="header__link">Dashboard</Link>
              <Link to={`/u/${user.username}`} className="header__link">Mi Portfolio</Link>
              <Link to="/analytics" className="header__link">Analytics</Link>
            </>
          )}
           <Link to="/ranking" className="header__link">Ranking</Link>
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
                    
                    {user?.isAdmin && (
                      <Link to="/admin" onClick={() => setDropdownOpen(false)} className="user-menu__item user-menu__item--admin">
                        <span>👮</span>
                        <span>Panel Admin</span>
                      </Link>
                    )}
                    
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
