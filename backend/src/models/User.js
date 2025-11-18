const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  avatarUrl: { type: String },
  bio: { type: String },
  links: [{ name: String, url: String }],
  
  // Verificación de email
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  
  // Recuperación de contraseña
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  
  // Sistema de seguidores
  followers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  following: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
  // Usuarios bloqueados
  blockedUsers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
  // Usuarios que han bloqueado a este usuario
  blockedBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
  // Configuración de privacidad
  privacy: {
    showFollowers: { type: Boolean, default: true },
    showFollowing: { type: Boolean, default: true },
    allowFollowRequests: { type: Boolean, default: true },
    isPrivate: { type: Boolean, default: false },
  },
  
  // Preferencias de notificaciones
  notificationPreferences: {
    likesEnabled: { type: Boolean, default: true },
    commentsEnabled: { type: Boolean, default: true },
    followsEnabled: { type: Boolean, default: true },
    followRequestsEnabled: { type: Boolean, default: true },
    messagesEnabled: { type: Boolean, default: true },
    desktopNotificationsEnabled: { type: Boolean, default: true },
  },
  
  // Solicitudes de seguimiento pendientes
  followRequests: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
  // Proyectos guardados en marcadores
  savedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
