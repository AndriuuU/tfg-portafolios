import { Link } from "react-router-dom";
import "../styles/NotFound.scss";

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="error-content">
          <h1 className="error-code">404</h1>
          <h2 className="error-title">ERROR</h2>
          
          <p className="error-description">
            La página que buscas no existe o ha sido movida.
          </p>

          <div className="error-actions">
            <Link to="/" className="btn btn-primary">
              🏠 Volver al inicio
            </Link>
            <Link to="/search" className="btn btn-secondary">
              🔍 Explorar
            </Link>
          </div>

          <div className="error-suggestions">
            <h3>Otras opciones:</h3>
            <ul>
              <li>
                <Link to="/">Página de inicio</Link>
              </li>
              <li>
                <Link to="/search">Buscar proyectos</Link>
              </li>
              <li>
                <Link to="/analytics">Estadísticas</Link>
              </li>
              <li>
                <Link to="/ranking">Ranking</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
