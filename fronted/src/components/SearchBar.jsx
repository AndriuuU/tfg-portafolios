import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/components/Components.scss';

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('projects'); // 'projects' o 'users'
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      if (searchType === 'projects') {
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      } else {
        navigate(`/users?q=${encodeURIComponent(searchTerm)}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <select
        value={searchType}
        onChange={(e) => setSearchType(e.target.value)}
        className="search-bar-select"
        aria-label="Tipo de búsqueda"
      >
        <option value="projects">Proyectos</option>
        <option value="users">Usuarios</option>
      </select>
      <input
        type="text"
        placeholder={searchType === 'projects' ? 'Buscar proyectos...' : 'Buscar usuarios...'}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar-input"
      />
      <button type="submit" className="search-bar-button" aria-label="Buscar">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          width="18"
          height="18"
        >
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </button>
    </form>
  );
}

export default SearchBar;
