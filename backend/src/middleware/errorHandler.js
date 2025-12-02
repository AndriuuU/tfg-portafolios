/**
 * Custom error class para errores operacionales esperados
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware centralizado para manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log para debugging (solo en desarrollo)
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    console.error('❌ Error capturado:', err);
  }

  // Mongoose duplicate key error (código 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const value = err.keyValue?.[field];
    error.message = field 
      ? `El ${field} '${value}' ya existe`
      : 'Ya existe un registro con esos datos';
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map(e => e.message);
    error.message = messages.join(', ');
    error.statusCode = 400;
  }

  // Mongoose CastError (ID inválido)
  if (err.name === 'CastError') {
    error.message = 'ID no válido';
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Token inválido';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expirado';
    error.statusCode = 401;
  }

  // Respuesta
  const response = {
    error: error.message || 'Error interno del servidor'
  };

  // Incluir stack trace solo en desarrollo
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    response.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
};

module.exports = { AppError, errorHandler };
