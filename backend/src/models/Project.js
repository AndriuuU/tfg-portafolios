const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String }, // texto enriquecido en HTML
  images: [String],
  tags: [String],
  liveUrl: { type: String },
  repoUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
