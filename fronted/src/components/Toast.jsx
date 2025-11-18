import React, { useEffect } from 'react';
import '../styles/Toast.scss';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`toast toast-${type}`}>
      {type === 'success' && <span className="toast-icon">✓</span>}
      {type === 'error' && <span className="toast-icon">✕</span>}
      {type === 'info' && <span className="toast-icon">ℹ</span>}
      <span className="toast-message">{message}</span>
    </div>
  );
};

export default Toast;
