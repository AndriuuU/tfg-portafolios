import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchProjects } from '../api/api';
import { useToast } from '../context/ToastContext';
import ProjectPost from '../components/ProjectPost';
import '../styles/Search.scss';

function Search() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [tags, setTags] = useState('');
  const [owner, setOwner] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  // Buscar automáticamente si hay query params
  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      setSearchTerm(queryParam);
      handleSearch(1, queryParam);
    }
  }, []);

  const handleSearch = async (page = 1, termOverride = null) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const params = {
        page,
        limit: 10
      };

      const term = termOverride !== null ? termOverride : searchTerm;
      if (term) params.q = term;
      if (tags) params.tags = tags;
      if (owner) params.owner = owner;
      if (sortBy) params.sort = sortBy;

      const response = await searchProjects(params);
      setProjects(response.data.projects);
      setPagination(response.data.pagination);
      setCurrentPage(page);
    } catch (error) {
      showToast('❌ Error al buscar proyectos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(1);
    // Actualizar URL
    if (searchTerm) {
      setSearchParams({ q: searchTerm });
    } else {
      setSearchParams({});
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setTags('');
    setOwner('');
    setSortBy('recent');
    setProjects([]);
    setPagination(null);
    setHasSearched(false);
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    handleSearch(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <div className="search-header">
          <h1>🔍 Buscar Proyectos</h1>
          <p className="search-subtitle">Explora y descubre proyectos increíbles de la comunidad</p>
        </div>
        
        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="¿Qué proyecto estás buscando?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? (
                <span className="loading-spinner">⏳</span>
              ) : (
                <span>🔎 Buscar</span>
              )}
            </button>
          </div>

          <div className="search-filters">
            <div className="filter-group">
              <label htmlFor="tags">
                <span className="filter-icon">🏷️</span>
                Tags
              </label>
              <input
                id="tags"
                type="text"
                placeholder="react, nodejs, frontend..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="owner">
                <span className="filter-icon">👤</span>
                Usuario
              </label>
              <input
                id="owner"
                type="text"
                placeholder="Nombre de usuario"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="sort">
                <span className="filter-icon">📊</span>
                Ordenar por
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="recent">Más recientes</option>
                <option value="oldest">Más antiguos</option>
                <option value="title">Título (A-Z)</option>
                <option value="likes">Más gustados</option>
              </select>
            </div>
          </div>

          {(searchTerm || tags || owner || sortBy !== 'recent') && (
            <button type="button" onClick={handleClear} className="btn-clear">
              ✖️ Limpiar filtros
            </button>
          )}
        </form>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Buscando proyectos...</p>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <div className="search-results">
            <div className="results-header">
              <h2>✨ {pagination?.total || 0} {pagination?.total === 1 ? 'Resultado' : 'Resultados'}</h2>
              {pagination && pagination.totalPages > 1 && (
                <p className="results-info">
                  Página {pagination.page} de {pagination.totalPages}
                </p>
              )}
            </div>

            <div className="projects-grid">
              {projects.map((project) => (
                <ProjectPost key={project._id} project={project} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="pagination-button"
                >
                  ← Anterior
                </button>
                
                <span className="pagination-info">
                  Página {pagination.page} de {pagination.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="pagination-button"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        )}

        {!loading && hasSearched && projects.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No se encontraron proyectos</h3>
            <p>Intenta ajustar tus criterios de búsqueda</p>
          </div>
        )}

        {!loading && !hasSearched && (
          <div className="empty-state">
            <div className="empty-state-icon">🚀</div>
            <h3>¡Comienza tu búsqueda!</h3>
            <p>Usa los filtros de arriba para encontrar proyectos increíbles</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
