const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Información del reporte
  type: {
    type: String,
    enum: ['user', 'project', 'comment'],
    required: true
  },

  // Quién lo reporta
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Qué se reporta
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // Obligatorio si type es 'user', opcional si es 'project' o 'comment'
  },

  targetProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
    // Obligatorio si type es 'project', opcional si es 'comment'
  },

  targetComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
    // Obligatorio si type es 'comment'
  },

  // Razón del reporte
  reason: {
    type: String,
    enum: [
      'spam',
      'harassment',
      'hate_speech',
      'inappropriate_content',
      'copyright_violation',
      'fake_account',
      'scam',
      'adult_content',
      'other'
    ],
    required: true
  },

  // Descripción detallada del problema
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000
  },

  // Estado del reporte
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'resolved', 'rejected'],
    default: 'pending'
  },

  // Acción tomada por admin
  action: {
    type: String,
    enum: ['none', 'warning', 'content_removed', 'account_suspended', 'account_banned'],
    default: 'none'
  },

  // Admin que revisa el reporte
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Notas del admin
  adminNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },

  // Fecha de revisión
  reviewedAt: Date,

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }

}, { timestamps: true });

// Índices para búsquedas rápidas
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ type: 1 });
reportSchema.index({ reportedBy: 1 });
reportSchema.index({ targetUser: 1 });
reportSchema.index({ targetProject: 1 });

module.exports = mongoose.model('Report', reportSchema);
