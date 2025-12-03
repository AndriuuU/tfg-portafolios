import { useState, useEffect } from 'react';
import { resetPassword } from '../api/api';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/Dashboard.scss';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Token de recuperación no válido o expirado');
    } else {
      console.log('Token obtenido de la URL:', token);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validaciones
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!token) {
      setError('Token no válido');
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(token, password);
      setMessage(response.data.message || 'Contraseña actualizada correctamente');
      setPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Error al resetear contraseña:', err);
      const errorMessage = err.response?.data?.error || 'Error al restablecer la contraseña';
      
      if (err.response?.status === 400) {
        setError('El enlace de recuperación ha expirado o no es válido. Por favor, solicita uno nuevo.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token && !loading) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <h1>Token Inválido</h1>
          <p className="error-message">
            El enlace de recuperación no es válido o ha expirado
          </p>
          <button onClick={() => navigate('/forgot-password')} className="btn-primary">
            Solicitar Nuevo Enlace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Restablecer Contraseña</h1>
        <p className="auth-subtitle">Ingresa tu nueva contraseña</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">Nueva Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength="6"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength="6"
              placeholder="Repite la contraseña"
            />
          </div>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
          </button>

          <div className="auth-links">
            <button 
              type="button" 
              onClick={() => navigate('/login')} 
              className="link-button"
            >
              Volver al Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
