const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// Actualizar perfil
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, name } = req.body;
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

    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email, name },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Generar nuevo token si el username cambió
    let newToken = null;
    if (username && username !== req.user.username) {
      newToken = jwt.sign(
        { id: updatedUser._id, username: updatedUser.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    }

    res.json({
      message: 'Perfil actualizado correctamente',
      user: {
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
