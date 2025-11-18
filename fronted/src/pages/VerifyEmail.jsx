import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/api';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const res = await API.get(`/email/verify/${token}`);
      setStatus('success');
      setMessage(res.data.message || '¡Email verificado exitosamente!');
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Error al verificar el email. El token puede haber expirado.');
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    setResending(true);
    setResendMessage('');

    if (!resendEmail) {
      setResendMessage('Por favor ingresa tu email');
      setResending(false);
      return;
    }

    try {
      await API.post('/email/resend-verification', { email: resendEmail });
      setResendMessage('✅ Email de verificación enviado. Por favor revisa tu bandeja de entrada.');
      setResendEmail('');
    } catch (err) {
      setResendMessage(err.response?.data?.error || '❌ Error al enviar el email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Verificación de Email</h2>
          
          {status === 'verifying' && (
            <div className="verification-status">
              <div className="loading-spinner"></div>
              <p>Verificando tu email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="verification-success">
              <div className="success-icon">✅</div>
              <h3>¡Verificación Exitosa!</h3>
              <p>{message}</p>
              <p className="redirect-text">Serás redirigido al login en unos segundos...</p>
              <Link to="/login" className="btn-primary">
                Ir al Login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="verification-error">
              <div className="error-icon">❌</div>
              <h3>Error de Verificación</h3>
              <p>{message}</p>
              
              {/* Formulario para reenviar email de verificación */}
              <div className="resend-verification">
                <h4>¿Token expirado?</h4>
                <p>Ingresa tu email para recibir un nuevo enlace de verificación:</p>
                
                <form onSubmit={handleResendVerification} className="resend-form">
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="resend-input"
                    required
                  />
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={resending}
                  >
                    {resending ? 'Enviando...' : '📧 Reenviar Verificación'}
                  </button>
                </form>
                
                {resendMessage && (
                  <p className={`resend-message ${resendMessage.includes('✅') ? 'success' : 'error'}`}>
                    {resendMessage}
                  </p>
                )}
              </div>

              <div className="error-actions">
                <Link to="/login" className="btn-secondary">
                  Ir al Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Registrarse de Nuevo
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
