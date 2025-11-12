const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'follow', 'follow_request', 'message'],
      required: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

// Índice compuesto para búsquedas frecuentes
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
