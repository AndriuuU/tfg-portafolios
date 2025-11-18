const mongoose = require('mongoose');

//Modelo de Proyecto
const projectSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  tags: [String],
  liveUrl: String,
  repoUrl: String,
  images: [String],
  
  // Sistema de colaboradores
  collaborators: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { 
      type: String, 
      enum: ['editor', 'viewer'], 
      default: 'viewer' 
    },
    addedAt: { type: Date, default: Date.now },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  // Invitaciones pendientes de colaboradores
  pendingInvitations: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { 
      type: String, 
      enum: ['editor', 'viewer'], 
      default: 'viewer' 
    },
    invitedAt: { type: Date, default: Date.now },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  }],
  
  // Likes del proyecto
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      // Likes del comentario
      likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
    },
  ],
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

module.exports = mongoose.model('Project', projectSchema);
