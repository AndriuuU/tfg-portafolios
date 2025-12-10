const User = require('../models/User');

/**
 * Middleware para verificar si el usuario es admin
 * Debe usarse después del authMiddleware
 */
const adminMiddleware = async (req, res, next) => {
  try {
    // El user debe estar autenticado (authMiddleware debe ejecutarse primero)
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Buscar el usuario y verificar si es admin
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si es admin (asumiendo que User tiene un campo isAdmin)
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'No tienes permisos de administrador' });
    }

    // Pasar al siguiente middleware/controlador
    next();
  } catch (error) {
    console.error('Error en adminMiddleware:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = adminMiddleware;
