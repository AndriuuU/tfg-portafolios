import React from 'react';
import '../styles/components/AlertModal.scss';

export default function AlertModal({ 
  isOpen, 
  title, 
  message, 
  onClose,
  type = 'info' // 'info', 'success', 'error', 'warning'
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content alert-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className={`modal-body alert-body alert-${type}`}>
          <div className="alert-icon">
            {type === 'success' && '✓'}
            {type === 'error' && '✕'}
            {type === 'warning' && '⚠'}
            {type === 'info' && 'ℹ'}
          </div>
          <p>{message}</p>
        </div>
        <div className="modal-actions alert-actions">
          <button className="btn-confirm btn-primary" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
