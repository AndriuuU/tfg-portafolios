const User = require('../../models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../../utils/cloudinary');

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
