const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { deleteFromCloudinary } = require('../../utils/cloudinary');

// Eliminar cuenta de usuario
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    // Validar que se proporcione la contraseña
    if (!password) {
      return res.status(400).json({ error: 'La contraseña es requerida para eliminar la cuenta' });
    }

    // Buscar usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Eliminar avatar de Cloudinary si existe
    if (user.avatarUrl) {
      try {
        const urlParts = user.avatarUrl.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        await deleteFromCloudinary(`avatars/${publicId}`);
      } catch (error) {
        console.log('Error eliminando avatar de Cloudinary:', error);
      }
    }

    // Eliminar proyectos del usuario
    const Project = require('../../models/Project');
    const userProjects = await Project.find({ owner: userId });

    // Eliminar imágenes de proyectos de Cloudinary
    for (const project of userProjects) {
      if (project.images && project.images.length > 0) {
        for (const imageUrl of project.images) {
          try {
            const urlParts = imageUrl.split('/');
            const publicIdWithExtension = urlParts[urlParts.length - 1];
            const publicId = publicIdWithExtension.split('.')[0];
            await deleteFromCloudinary(`tfg-portafolios/${publicId}`);
          } catch (error) {
            console.log('Error eliminando imagen de proyecto:', error);
          }
        }
      }
    }

    // Eliminar todos los proyectos del usuario
    await Project.deleteMany({ owner: userId });

    // Eliminar al usuario de las listas de seguidores/siguiendo de otros usuarios
    await User.updateMany(
      { $or: [{ followers: userId }, { following: userId }] },
      { 
        $pull: { 
          followers: userId,
          following: userId 
        } 
      }
    );

    // Eliminar usuario
    await User.findByIdAndDelete(userId);

    res.json({ 
      message: 'Cuenta eliminada exitosamente. Esperamos verte pronto de nuevo.' 
    });
  } catch (error) {
    console.error('Error deleteAccount:', error);
    res.status(500).json({ error: error.message });
  }
};
