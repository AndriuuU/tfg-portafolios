const Project = require('../../models/Project');
const { cloudinary } = require('../../utils/cloudinary');

// Crear proyecto
exports.createProject = async (req, res) => {
  try {
    const { title, slug, description, tags, liveUrl, repoUrl } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ error: 'Título y slug son obligatorios' });
    }

    const tagsArray = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
        ? tags.split(',').map(t => t.trim())
        : [];

    const newProject = await Project.create({
      owner: req.user.id,
      title,
      slug,
      description: description || '',
      tags: tagsArray,
      liveUrl: liveUrl || '',
      repoUrl: repoUrl || '',
      images: [],
    });

    res.status(201).json(newProject);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'El proyecto ya existe' });
    }
    console.error('Error createProject:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los proyectos de un usuario
exports.getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id })
      .populate("comments.user", "username email");

    res.json(projects);
  } catch (error) {
    console.error('Error getUserProjects:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener proyectos de usuarios que sigues (feed)
exports.getFollowingProjects = async (req, res) => {
  try {
    const User = require('../../models/User');
    const currentUser = await User.findById(req.user.id);
    
    if (!currentUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const projects = await Project.find({
      owner: { $in: currentUser.following }
    })
      .populate('owner', 'username name email avatarUrl')
      .populate('comments.user', 'username email avatarUrl')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ projects });
  } catch (error) {
    console.error('Error getFollowingProjects:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener proyecto por ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("comments.user", "username email");
    
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error getProjectById:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar proyecto
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    // Verificar permisos: owner o colaborador con rol editor
    const isOwner = project.owner.toString() === req.user.id;
    const isEditor = project.collaborators.some(
      collab => collab.user.toString() === req.user.id && collab.role === 'editor'
    );
    
    if (!isOwner && !isEditor) {
      return res.status(403).json({ error: 'No tienes permisos para editar este proyecto' });
    }

    // Actualizar campos básicos
    ["title", "slug", "description", "liveUrl", "repoUrl"].forEach(f => {
      if (req.body[f] !== undefined) project[f] = req.body[f];
    });

    // Actualizar tags
    if (req.body.tags !== undefined) {
      project.tags = Array.isArray(req.body.tags)
        ? req.body.tags
        : typeof req.body.tags === "string"
          ? req.body.tags.split(',').map(t => t.trim())
          : [];
    }

    // Eliminar imágenes específicas o todas
    if (req.body.removeImage === 'true') {
      project.images = [];
    } else if (req.body.removeImageUrl) {
      // Eliminar una imagen específica por URL
      project.images = project.images.filter(img => img !== req.body.removeImageUrl);
    }

    // Subir nueva imagen
    if (req.files && req.files.length > 0) {
      // Filtrar solo los archivos que sean del campo 'images'
      const imageFiles = req.files.filter(file => file.fieldname === 'images');
      
      if (imageFiles.length > 0) {
        // Múltiples archivos
        const uploadPromises = imageFiles.map(file => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'tfg-portafolios' },
              (error, result) => {
                if (error) {
                  console.error('Error uploading to Cloudinary:', error);
                  reject(error);
                } else {
                  resolve(result.secure_url);
                }
              }
            );
            stream.end(file.buffer);
          });
        });

        try {
          const uploadedUrls = await Promise.all(uploadPromises);
          project.images = [...project.images, ...uploadedUrls];
          await project.save();
          return res.json(project);
        } catch (error) {
          console.error('Error uploading multiple images:', error);
          return res.status(500).json({ error: 'Error al subir imágenes' });
        }
      }
    } else if (req.file) {
      // Un solo archivo
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'tfg-portafolios' },
          async (error, result) => {
            if (error) {
              console.error('Error uploading to Cloudinary:', error);
              return res.status(500).json({ error: 'Error al subir imagen' });
            }
            project.images.push(result.secure_url);
            await project.save();
            return res.json(project);
          }
        );
        stream.end(req.file.buffer);
      });
    }

    await project.save();
    res.json(project);
  } catch (error) {
    console.error('Error updateProject:', error);
    res.status(500).json({ error: error.message });
  }
};

// TODO: Hacer soft delete y el delete definitivo por otro lado
// Eliminar proyecto
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    // Solo el owner puede eliminar el proyecto
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Solo el propietario puede eliminar el proyecto' });
    }

    await project.deleteOne();
    res.json({ message: 'Proyecto eliminado correctamente' });
  } catch (error) {
    console.error('Error deleteProject:', error);
    res.status(500).json({ error: error.message });
  }
};
