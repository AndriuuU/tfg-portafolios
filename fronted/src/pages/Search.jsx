import { useState } from 'react';
import { searchProjects } from '../api/api';
import ProjectPost from '../components/ProjectPost';
import '../styles/Search.scss';

function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tags, setTags] = useState('');
  const [owner, setOwner] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10
      };

      if (searchTerm) params.q = searchTerm;
      if (tags) params.tags = tags;
      if (owner) params.owner = owner;
      if (sortBy) params.sort = sortBy;

      const response = await searchProjects(params);
      setProjects(response.data.projects);
      setPagination(response.data.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error buscando proyectos:', error);
      alert('Error al buscar proyectos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(1);
  };

  const handlePageChange = (newPage) => {
    handleSearch(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <h1>Buscar Proyectos</h1>
        
        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Buscar por título o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          <div className="search-filters">
            <div className="filter-group">
              <label htmlFor="tags">Tags (separados por coma):</label>
              <input
                id="tags"
                type="text"
                placeholder="react, nodejs, frontend"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="owner">Usuario:</label>
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
              <label htmlFor="sort">Ordenar por:</label>
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
        </form>

        {projects.length > 0 && (
          <div className="search-results">
            <div className="results-header">
              <h2>Resultados ({pagination?.total || 0})</h2>
              <p className="results-info">
                Página {pagination?.page} de {pagination?.totalPages}
              </p>
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

        {!loading && projects.length === 0 && pagination && (
          <div className="no-results">
            <p>No se encontraron proyectos con estos criterios</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
