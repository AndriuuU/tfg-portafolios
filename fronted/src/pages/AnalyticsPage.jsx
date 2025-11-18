import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Analytics from '../components/Analytics';
import '../styles/AnalyticsPage.scss';

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="analytics-page">
      <div className="analytics-header-section">
        <Link to="/" className="back-btn">
            ←
          </Link>
        <h1>Dashboard de Estadísticas</h1>
      </div>
      <Analytics />
    </div>
  );
}
