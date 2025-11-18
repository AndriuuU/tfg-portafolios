const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { 
  sendPasswordChangedEmail, 
  sendEmailChangedNotification, 
  sendUsernameChangedEmail,
  sendProfileUpdateEmail 
} = require('../../utils/emailService');

// Actualizar perfil
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, name, currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    // Validar que el username/email no estén en uso por otro usuario
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
      }
    }

    if (email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
      if (existingEmail) {
        return res.status(400).json({ error: 'El email ya está en uso' });
      }
    }

    // Obtener usuario para validar contraseña si es necesario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Rastrear cambios para enviar emails
    const changes = {};
    let passwordChanged = false;
    const oldEmail = user.email;
    const oldUsername = user.username;

    // Si se quiere cambiar la contraseña
    if (newPassword || currentPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Debes proporcionar tu contraseña actual para cambiarla' });
      }

      if (!newPassword) {
        return res.status(400).json({ error: 'Debes proporcionar una nueva contraseña' });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
      }

      // Verificar contraseña actual
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
      }

      // Actualizar contraseña
      user.password = await bcrypt.hash(newPassword, 10);
      passwordChanged = true;
      changes.password = 'Actualizada';
    }

    // Actualizar campos del perfil
    if (username && username !== oldUsername) {
      user.username = username;
      changes.username = `${oldUsername} → ${username}`;
    }
    if (email && email !== oldEmail) {
      user.email = email;
      changes.email = `${oldEmail} → ${email}`;
    }
    if (name !== undefined && name !== user.name) {
      changes.name = `${user.name || '(vacío)'} → ${name}`;
      user.name = name;
    }

    await user.save();

    // Obtener usuario actualizado sin contraseña
    const updatedUser = await User.findById(userId).select('-password');

    // Generar nuevo token si el username cambió
    let newToken = null;
    if (username && username !== req.user.username) {
      newToken = jwt.sign(
        { id: updatedUser._id, username: updatedUser.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    }

    // Enviar emails de notificación según los cambios realizados
    try {
      if (passwordChanged) {
        // Email cuando cambia la contraseña
        await sendPasswordChangedEmail(updatedUser.email, updatedUser.username);
      }
      
      if (changes.email) {
        // Email cuando cambia el correo (envía a ambos emails)
        await sendEmailChangedNotification(oldEmail, updatedUser.email, updatedUser.username);
      }
      
      if (changes.username) {
        // Email cuando cambia el username
        await sendUsernameChangedEmail(updatedUser.email, oldUsername, updatedUser.username);
      }
      
      // Si hubo cambios que no son críticos (nombre), enviar resumen
      if (changes.name && !passwordChanged && !changes.email && !changes.username) {
        await sendProfileUpdateEmail(updatedUser.email, updatedUser.username, changes);
      }
    } catch (emailError) {
      // No fallar la actualización si falla el email
      console.error('Error enviando emails de notificación:', emailError);
    }

    res.json({
      message: 'Perfil actualizado correctamente',
      user: {
        _id: updatedUser._id,
        id: updatedUser._id,
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
        privacy: updatedUser.privacy,
      },
      ...(newToken && { token: newToken })
    });
  } catch (error) {
    console.error('Error updateProfile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener preferencias de notificaciones
exports.getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('notificationPreferences');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ 
      notificationPreferences: user.notificationPreferences || {
        likesEnabled: true,
        commentsEnabled: true,
        followsEnabled: true,
        followRequestsEnabled: true,
        messagesEnabled: true,
        desktopNotificationsEnabled: true,
      }
    });
  } catch (error) {
    console.error('Error getNotificationPreferences:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar preferencias de notificaciones
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { notificationPreferences: preferences },
      { new: true }
    ).select('notificationPreferences');

    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ 
      message: 'Preferencias de notificación actualizadas',
      notificationPreferences: updatedUser.notificationPreferences
    });
  } catch (error) {
    console.error('Error updateNotificationPreferences:', error);
    res.status(500).json({ error: error.message });
  }
};
// Cambiar contraseña
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Ambas contraseñas son obligatorias' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    // Buscar usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error updatePassword:', error);
    res.status(500).json({ error: error.message });
  }
};
