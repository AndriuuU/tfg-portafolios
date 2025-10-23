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
