const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) return res.status(401).json({ error: 'Token requerido' });

    const token = authHeader.split(' ')[1]; // formato: "Bearer token"

    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedUser) => {
      if (err) return res.status(403).json({ error: 'Token inválido' });
      
      // Verificar estado del usuario en la base de datos
      const user = await User.findById(decodedUser.id).select('+isSuspended +isBanned +isDeleted +suspensionReason +banReason +deletedReason');
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Bloquear usuarios eliminados (soft delete)
      if (user.isDeleted) {
        return res.status(403).json({ 
          error: 'Tu cuenta ha sido eliminada',
          reason: user.deletedReason || 'Violación de las políticas de la comunidad',
          type: 'ACCOUNT_DELETED'
        });
      }

      // Bloquear usuarios baneados
      if (user.isBanned) {
        return res.status(403).json({ 
          error: 'Tu cuenta ha sido baneada permanentemente',
          reason: user.banReason || 'Violación grave de las políticas',
          type: 'ACCOUNT_BANNED'
        });
      }

      // Bloquear usuarios suspendidos
      if (user.isSuspended) {
        return res.status(403).json({ 
          error: 'Tu cuenta ha sido suspendida temporalmente',
          reason: user.suspensionReason || 'Actividad sospechosa o violación de políticas',
          type: 'ACCOUNT_SUSPENDED'
        });
      }
      
      req.user = decodedUser;
      next();
    });
  } catch (error) {
    console.error('Error in authMiddleware:', error);
    return res.status(500).json({ error: 'Error al verificar autenticación' });
  }
};

module.exports = authMiddleware;
