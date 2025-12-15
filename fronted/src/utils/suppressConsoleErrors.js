// Suprimir mensajes de error y advertencia en la consola del navegador
// (solo en producción o cuando sea necesario)

if (typeof window !== 'undefined') {
  // Guardar las funciones originales
  const originalError = console.error;
  const originalWarn = console.warn;

  // Suprimir errores de React que no sean críticos
  console.error = (...args) => {
    // Permitir errores críticos
    if (args[0]?.includes?.('Error') || args[0]?.includes?.('Critical')) {
      originalError.apply(console, args);
    }
  };

  // Suprimir advertencias de React y dependencias
  console.warn = (...args) => {
    // Permitir solo advertencias importantes
    if (args[0]?.includes?.('Critical') || args[0]?.includes?.('Security')) {
      originalWarn.apply(console, args);
    }
  };

  // Suprimir errores no capturados de promesas rechazadas
  window.addEventListener('unhandledrejection', (event) => {
    // Permitir que se maneje localmente
    if (process.env.NODE_ENV === 'development') {
      console.log('Unhandled Promise Rejection (suppressed):', event.reason);
    }
  });
}

export default null;
