const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  avatarUrl: { type: String },
  bio: { type: String },
  links: [{ name: String, url: String }],
  
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
  
  // Solicitudes de seguimiento pendientes
  followRequests: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
