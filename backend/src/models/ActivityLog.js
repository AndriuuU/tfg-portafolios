const mongoose = require('mongoose');

// Modelo para registrar actividades del usuario
const activityLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Tipo de actividad
  action: { 
    type: String,
    enum: [
      'project_created',
      'project_updated',
      'project_deleted',
      'project_viewed',
      'project_liked',
      'project_unliked',
      'comment_added',
      'comment_deleted',
      'collaborator_added',
      'collaborator_removed',
      'profile_updated',
      'password_changed',
      'user_followed',
      'user_unfollowed',
      'user_blocked',
      'user_unblocked',
      'login',
      'logout',
      'privacy_changed'
    ],
    required: true
  },
  
  // Detalles de la actividad
  details: {
    projectId: mongoose.Schema.Types.ObjectId,
    projectTitle: String,
    targetUserId: mongoose.Schema.Types.ObjectId,
    targetUsername: String,
    description: String,
    metadata: mongoose.Schema.Types.Mixed // Para datos adicionales flexibles
  },
  
  // Información del cliente
  ipAddress: String,
  userAgent: String,
  
  // Timestamp
  timestamp: { type: Date, default: Date.now },
  
}, { timestamps: true });

// Índices para optimizar búsquedas
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ 'details.projectId': 1 });

// Configurar TTL: los logs se borran automáticamente después de 90 días
activityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
