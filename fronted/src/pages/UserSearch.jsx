import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchUsers } from '../api/api';
import { useToast } from '../context/ToastContext';
import '../styles/UserSearch.scss';

function UserSearch() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [users, setUsers] = useState([]);
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
        limit: 20
      };

      const term = termOverride !== null ? termOverride : searchTerm;
      if (term) params.q = term;

      const response = await searchUsers(params);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
      setCurrentPage(page);
    } catch (error) {
      showToast('❌ Error al buscar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      showToast('⚠️ Ingresa un nombre o usuario para buscar', 'warning');
      return;
    }
    handleSearch(1);
    // Actualizar URL
    setSearchParams({ q: searchTerm });
  };

  const handleClear = () => {
    setSearchTerm('');
    setUsers([]);
    setPagination(null);
    setHasSearched(false);
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    handleSearch(newPage);
    window.scrollTo(0, 0);
  };

  const goToProfile = (username) => {
    navigate(`/u/${username}`);
  };

  return (
    <div className="user-search-page">
      <div className="user-search-container">
        {/* Header */}
        <div className="search-header">
          <h1>🔍 Buscar Usuarios</h1>
          <p className="search-subtitle">Encuentra a otros creadores y mira sus portafolios</p>
        </div>

        {/* Formulario de búsqueda */}
        <form className="search-form" onSubmit={handleSubmit}>
          <div className="search-input-group">
            <input
              type="text"
              className="search-input"
              placeholder="Busca por nombre de usuario, nombre completo o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="search-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner">⟳</span>
                  Buscando...
                </>
              ) : (
                <>🔍 Buscar</>
              )}
            </button>
          </div>

          {(searchTerm) && (
            <button type="button" onClick={handleClear} className="btn-clear">
              ✖️ Limpiar búsqueda
            </button>
          )}
        </form>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Buscando usuarios...</p>
          </div>
        )}

        {/* Resultados */}
        {!loading && users.length > 0 && (
          <div className="search-results">
            <div className="results-header">
              <h2>✨ {pagination?.total || 0} {pagination?.total === 1 ? 'Usuario' : 'Usuarios'}</h2>
              {pagination && pagination.totalPages > 1 && (
                <p className="results-info">
                  Página {pagination.page} de {pagination.totalPages}
                </p>
              )}
            </div>

            <div className="users-list">
              {users.map((user) => (
                <div key={user._id} className="user-card">
                  <div className="user-card-content">
                    <div className="user-avatar">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} className="avatar-img" />
                      ) : (
                        <div className="avatar-placeholder">
                          {(user.name?.charAt(0) || user.username?.charAt(0) || '?').toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="user-info">
                      <h3 className="user-name">{user.name || user.username}</h3>
                      <p className="user-username">@{user.username}</p>
                      {user.bio && <p className="user-bio">{user.bio}</p>}
                    </div>

                    <button
                      className="btn-visit-profile"
                      onClick={() => goToProfile(user.username)}
                    >
                      Ver Perfil →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
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

        {/* Sin resultados */}
        {!loading && hasSearched && users.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔎</div>
            <h3>No se encontraron usuarios</h3>
            <p>Intenta con un nombre diferente</p>
          </div>
        )}

        {/* Estado inicial */}
        {!loading && !hasSearched && (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>¡Comienza tu búsqueda!</h3>
            <p>Usa el buscador de arriba para encontrar a otros usuarios increíbles</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserSearch;
