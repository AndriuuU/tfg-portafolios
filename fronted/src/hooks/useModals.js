import { useState } from 'react';

/**
 * Hook para usar modales de confirmación personalizados
 * Reemplaza window.confirm() con un modal elegante
 */
export function useConfirmModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: 'Confirmar',
    message: '¿Estás seguro?',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    isDangerous: false,
    onConfirm: () => {},
    onCancel: () => {}
  });

  const confirm = (message, options = {}) => {
    return new Promise((resolve) => {
      setConfig({
        title: options.title || 'Confirmar',
        message,
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        isDangerous: options.isDangerous || false,
        onConfirm: () => {
          resolve(true);
          setIsOpen(false);
        },
        onCancel: () => {
          resolve(false);
          setIsOpen(false);
        }
      });
      setIsOpen(true);
    });
  };

  return {
    isOpen,
    confirm,
    ...config
  };
}

/**
 * Hook para usar modales de alerta personalizados
 * Reemplaza window.alert() con un modal elegante
 */
export function useAlertModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: 'Aviso',
    message: '',
    type: 'info'
  });

  const alert = (message, options = {}) => {
    return new Promise((resolve) => {
      setConfig({
        title: options.title || 'Aviso',
        message,
        type: options.type || 'info'
      });
      setIsOpen(true);

      // Auto-close después de 5 segundos si no es error
      const timer = setTimeout(() => {
        setIsOpen(false);
        resolve();
      }, options.autoClose !== false ? 4000 : Infinity);

      return () => clearTimeout(timer);
    });
  };

  const close = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    alert,
    close,
    ...config
  };
}
