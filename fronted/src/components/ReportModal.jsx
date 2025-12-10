import { useState } from 'react';
import { createReport } from '../api/api';
import { useToast } from '../context/ToastContext';
import '../styles/ReportModal.scss';

export default function ReportModal({ type, targetId, targetTitle, onClose, projectId }) {
  const { showToast } = useToast();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reasons = {
    user: [
      { value: 'fake_account', label: 'Cuenta Falsa' },
      { value: 'harassment', label: 'Acoso' },
      { value: 'spam', label: 'Spam' },
      { value: 'impersonation', label: 'Suplantación de Identidad' },
      { value: 'other', label: 'Otro' }
    ],
    project: [
      { value: 'inappropriate_content', label: 'Contenido Inapropiado' },
      { value: 'copyright_violation', label: 'Violación de Derechos de Autor' },
      { value: 'spam', label: 'Spam' },
      { value: 'scam', label: 'Estafa' },
      { value: 'adult_content', label: 'Contenido para Adultos' },
      { value: 'other', label: 'Otro' }
    ],
    comment: [
      { value: 'hate_speech', label: 'Discurso de Odio' },
      { value: 'harassment', label: 'Acoso' },
      { value: 'spam', label: 'Spam' },
      { value: 'inappropriate_content', label: 'Contenido Inapropiado' },
      { value: 'other', label: 'Otro' }
    ]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason || !description.trim()) {
      showToast('Por favor completa todos los campos', 'warning');
      return;
    }

    if (description.length < 10) {
      showToast('La descripción debe tener al menos 10 caracteres', 'warning');
      return;
    }

    setLoading(true);

    try {
      const reportData = {
        type,
        reason,
        description,
        targetUserId: type === 'user' ? targetId : undefined,
        targetProjectId: type === 'project' ? targetId : (projectId || undefined),
        targetCommentId: type === 'comment' ? targetId : undefined
      };

      await createReport(reportData);
      showToast('✅ Reporte enviado correctamente. Gracias por ayudarnos a mantener la comunidad segura.', 'success');
      setSubmitted(true);
      setTimeout(onClose, 2000);
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al enviar el reporte', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="report-header">
          <h2>Reportar {type === 'user' ? 'Usuario' : type === 'project' ? 'Proyecto' : 'Comentario'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {submitted ? (
          <div className="report-success">
            <div className="success-icon">✓</div>
            <h3>¡Reporte Enviado!</h3>
            <p>Nuestro equipo de moderación revisará tu reporte pronto.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="report-form">
            <div className="report-info">
              <p className="target-info">
                {type === 'user' && `Reportando usuario: ${targetTitle}`}
                {type === 'project' && `Reportando proyecto: ${targetTitle}`}
                {type === 'comment' && `Reportando comentario: "${targetTitle}"`}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="reason">Razón del Reporte *</label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
                required
              >
                <option value="">Selecciona una razón...</option>
                {reasons[type]?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Descripción *</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Proporciona detalles sobre por qué reportas esto (mínimo 10 caracteres)..."
                disabled={loading}
                rows="5"
                required
                maxLength={1000}
              />
              <div className="char-count">
                {description.length}/1000
              </div>
            </div>

            <div className="form-info">
              <p>
                ⓘ Tu reporte será revisado por nuestro equipo de moderación. No comparte detalles de otros usuarios.
              </p>
            </div>

            <div className="form-actions">
              <button type="button" onClick={onClose} disabled={loading} className="btn-cancel">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? 'Enviando...' : 'Enviar Reporte'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
