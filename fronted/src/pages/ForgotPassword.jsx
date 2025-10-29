import { useState } from 'react';
import { forgotPassword } from '../api/api';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.scss';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await forgotPassword(email);
      setMessage(response.data.message || 'Email enviado. Revisa tu bandeja de entrada.');
      setEmail('');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar el email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Recuperar Contraseña</h1>
        <p className="auth-subtitle">
          Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="tu@email.com"
            />
          </div>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Enviando...' : 'Enviar Instrucciones'}
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

export default ForgotPassword;
