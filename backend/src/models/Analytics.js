const mongoose = require('mongoose');

// Modelo de Analytics por proyecto
const analyticsSchema = new mongoose.Schema({
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true,
    unique: true 
  },
  
  // Vistas
  views: {
    total: { type: Number, default: 0 },
    daily: [{
      date: { type: Date, default: Date.now },
      count: { type: Number, default: 0 }
    }],
    unique_viewers: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }]
  },
  
  // Likes
  likes: {
    total: { type: Number, default: 0 },
    daily: [{
      date: { type: Date, default: Date.now },
      count: { type: Number, default: 0 }
    }],
    users: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }]
  },
  
  // Comentarios
  comments: {
    total: { type: Number, default: 0 },
    daily: [{
      date: { type: Date, default: Date.now },
      count: { type: Number, default: 0 }
    }]
  },
  
  // Engagement
  engagement: {
    avgTimeSpent: { type: Number, default: 0 }, // en segundos
    bounceRate: { type: Number, default: 0 }, // porcentaje
    interactions: { type: Number, default: 0 } // views + likes + comments
  },
  
  // Período de análisis
  startDate: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  
}, { timestamps: true });

// Índices para optimizar búsquedas
analyticsSchema.index({ projectId: 1 });
analyticsSchema.index({ 'views.daily.date': 1 });
analyticsSchema.index({ 'likes.daily.date': 1 });
analyticsSchema.index({ 'comments.daily.date': 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
