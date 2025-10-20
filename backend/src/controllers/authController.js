const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

exports.register = async (req, res) => {
  try {
    const { username, email, name, password } = req.body;

    // Validar campos obligatorios
    if (!username || !email || !name || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el username ya existe
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    // Verificar si el email ya existe
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = await User.create({
      username,
      email,
      name,
      password: hashedPassword,
    });

    const userResponse = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      name: newUser.name,
    };

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente', 
      user: userResponse 
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: error.message });
  }
};

//Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    // Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Credenciales inválidas' });

    // Crear token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        privacy: user.privacy,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

// Subir/actualizar avatar
exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No se ha enviado ninguna imagen' });
    }

    // Buscar usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si ya tiene un avatar, eliminarlo de Cloudinary
    if (user.avatarUrl) {
      try {
        // Extraer public_id de la URL de Cloudinary
        const urlParts = user.avatarUrl.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        await deleteFromCloudinary(`avatars/${publicId}`);
      } catch (error) {
        console.log('Error eliminando avatar anterior:', error);
      }
    }

    // Subir nueva imagen a Cloudinary
    const avatarUrl = await uploadToCloudinary(req.file.buffer, 'avatars');

    // Actualizar usuario
    user.avatarUrl = avatarUrl;
    await user.save();

    res.json({
      message: 'Avatar actualizado correctamente',
      avatarUrl: user.avatarUrl,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        privacy: user.privacy,
      }
    });
  } catch (error) {
    console.error('Error uploadAvatar:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar avatar
exports.deleteAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!user.avatarUrl) {
      return res.status(400).json({ error: 'No hay avatar para eliminar' });
    }

    // Eliminar de Cloudinary
    try {
      const urlParts = user.avatarUrl.split('/');
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      const publicId = publicIdWithExtension.split('.')[0];
      await deleteFromCloudinary(`avatars/${publicId}`);
    } catch (error) {
      console.log('Error eliminando de Cloudinary:', error);
    }

    // Actualizar usuario
    user.avatarUrl = null;
    await user.save();

    res.json({
      message: 'Avatar eliminado correctamente',
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatarUrl: null,
        privacy: user.privacy,
      }
    });
  } catch (error) {
    console.error('Error deleteAvatar:', error);
    res.status(500).json({ error: error.message });
  }
};
