import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/components/Components.scss';

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        placeholder="Buscar proyectos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar-input"
      />
      <button type="submit" className="search-bar-button">
        🔍
      </button>
    </form>
  );
}

export default SearchBar;
