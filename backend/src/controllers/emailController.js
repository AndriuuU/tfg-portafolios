const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { 
  sendVerificationEmail, 
  sendPasswordResetEmail, 
  sendPasswordChangedEmail 
} = require('../utils/emailService');

/**
 * Verificar email con token
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verificado exitosamente' });
  } catch (error) {
    console.error('Error verifyEmail:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Reenviar email de verificación
 */
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'El email es requerido' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'El email ya está verificado' });
    }

    // Generar nuevo token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Enviar email
    await sendVerificationEmail(email, user.username, verificationToken);

    res.json({ message: 'Email de verificación reenviado' });
  } catch (error) {
    console.error('Error resendVerificationEmail:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Solicitar recuperación de contraseña
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'El email es requerido' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Por seguridad, no revelar si el usuario existe
      return res.json({ 
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña' 
      });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Enviar email
    try {
      await sendPasswordResetEmail(email, user.username, resetToken);
    } catch (emailError) {
      console.error('Error enviando email de recuperación:', emailError);
      // No revelar el error al usuario
    }

    res.json({ 
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña' 
    });
  } catch (error) {
    console.error('Error forgotPassword:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Restablecer contraseña con token
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    // Actualizar contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Enviar confirmación por email
    try {
      await sendPasswordChangedEmail(user.email, user.username);
    } catch (emailError) {
      console.error('Error enviando confirmación:', emailError);
      // No fallar si no se puede enviar el email de confirmación
    }

    res.json({ message: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    console.error('Error resetPassword:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener estado de verificación de email del usuario actual
 */
exports.getEmailStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('email isEmailVerified');
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      email: user.email,
      isVerified: user.isEmailVerified
    });
  } catch (error) {
    console.error('Error getEmailStatus:', error);
    res.status(500).json({ error: error.message });
  }
};
