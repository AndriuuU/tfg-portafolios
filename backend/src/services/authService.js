const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/emailService');

class AuthService {
  /**
   * Registra un nuevo usuario
   */
  async registerUser({ username, email, name, password }) {
    // Verificar si el username o email ya existen
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    
    if (existing) {
      if (existing.username === username) {
        throw new Error('USERNAME_EXISTS');
      }
      if (existing.email === email) {
        throw new Error('EMAIL_EXISTS');
      }
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Crear usuario
    const user = await User.create({
      username,
      email,
      name,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Enviar email de verificación (sin bloquear)
    sendVerificationEmail(email, username, verificationToken)
      .then(() => {
        if (process.env.NODE_ENV !== 'test') {
          console.log('✅ Email de verificación enviado a:', email);
        }
      })
      .catch(err => {
        if (process.env.NODE_ENV !== 'test') {
          console.error('❌ Error enviando email de verificación:', err);
        }
      });

    return {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
    };
  }

  /**
   * Autentica un usuario
   */
  async loginUser({ email, username, password }) {
    // Buscar usuario por email o username
    const user = await User.findOne({ 
      $or: [
        { email: email || '' },
        { username: username || '' }
      ]
    });
    
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }
    
    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('INVALID_PASSWORD');
    }

    return user;
  }

  /**
   * Genera un JWT token para un usuario
   */
  generateToken(user) {
    return jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  /**
   * Serializa datos del usuario para la respuesta
   */
  serializeUser(user) {
    return {
      _id: user._id,
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      privacy: user.privacy,
    };
  }
}

module.exports = new AuthService();
