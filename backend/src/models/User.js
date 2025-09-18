const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatarUrl: { type: String },
  bio: { type: String },
  links: [{ name: String, url: String }],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
