import { useState } from 'react';
import { inviteCollaborator } from '../api/api';
import '../styles/Collaborators.scss';

function InviteCollaborator({ projectId, onInviteSent }) {
  const [identifier, setIdentifier] = useState(''); // puede ser username o email
  const [role, setRole] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Detectar si es email o username
      const isEmail = identifier.includes('@');
      const payload = isEmail 
        ? { email: identifier, role }
        : { username: identifier, role };

      const response = await inviteCollaborator(projectId, payload);
      setMessage(response.data.message || 'Invitación enviada correctamente');
      setIdentifier('');
      setRole('viewer');
      
      if (onInviteSent) {
        onInviteSent();
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar la invitación');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invite-collaborator">
      <h3>Invitar Colaborador</h3>
      
      <form onSubmit={handleSubmit} className="invite-form">
        <div className="form-group">
          <label htmlFor="identifier">Usuario o Email:</label>
          <input
            type="text"
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="nombre_usuario o email@ejemplo.com"
            required
            disabled={loading}
          />
          <small className="helper-text">
            Ingresa el nombre de usuario o email del colaborador
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="role">Rol:</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="viewer">Viewer (Solo ver)</option>
            <option value="editor">Editor (Ver y editar)</option>
          </select>
        </div>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Enviando...' : 'Enviar Invitación'}
        </button>
      </form>

      <div className="role-info">
        <h4>Tipos de roles:</h4>
        <ul>
          <li><strong>Viewer:</strong> Puede ver el proyecto aunque sea privado</li>
          <li><strong>Editor:</strong> Puede ver y editar el proyecto</li>
        </ul>
      </div>
    </div>
  );
}

export default InviteCollaborator;
