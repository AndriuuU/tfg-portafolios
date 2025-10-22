
const Project = require('../models/Project');
const { cloudinary } = require('../utils/cloudinary');

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
      owner: req.user.id, // del middleware auth
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
    const User = require('../models/User');
    const currentUser = await User.findById(req.user.id);
    
    if (!currentUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener proyectos de usuarios que sigue
    const projects = await Project.find({
      owner: { $in: currentUser.following }
    })
      .populate('owner', 'username name email avatarUrl')
      .populate('comments.user', 'username email avatarUrl')
      .sort({ createdAt: -1 }) // Más recientes primero
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
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
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
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    if (project.owner.toString() !== req.user.id) return res.status(403).json({ error: 'No autorizado' });

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

    // Eliminar imágenes
    if (req.body.removeImage === 'true') {
      project.images = [];
    }

    // Subir nueva imagen
    if (req.file) {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'tfg-portafolios' },
          async (error, result) => {
            if (error) {
              console.error('Error uploading to Cloudinary:', error);
              return res.status(500).json({ error: 'Error al subir imagen' });
            }
            project.images = [result.secure_url];
            await project.save();
            return res.json(project);
          }
        );
        stream.end(req.file.buffer);
      });
    }

    // Si no hay imagen, solo guardar cambios
    await project.save();
    res.json(project);

  } catch (error) {
    console.error('Error updateProject:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar proyecto
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    if (project.owner.toString() !== req.user.id) return res.status(403).json({ error: 'No autorizado' });

    await project.deleteOne();
    res.json({ message: 'Proyecto eliminado correctamente' });
  } catch (error) {
    console.error('Error deleteProject:', error);
    res.status(500).json({ error: error.message });
  }
};

// Añadir comentario
exports.addComment = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Proyecto no encontrado" });

    const comment = {
      user: req.user.id,
      text: req.body.text,
    };

    project.comments.push(comment);
    await project.save();

    await project.populate('comments.user', 'username email');

    res.json(project);
  } catch (error) {
    console.error("Error addComment:", error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar comentario
exports.deleteComment = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Proyecto no encontrado" });

    const comment = project.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comentario no encontrado" });

    if (
      comment.user.toString() !== req.user.id &&
      project.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: "No autorizado" });
    }

    comment.deleteOne();
    await project.save();
    res.json({ message: "Comentario eliminado" });
  } catch (error) {
    console.error("Error deleteComment:", error);
    res.status(500).json({ error: error.message });
  }
};

// Dar like a un proyecto
exports.likeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Proyecto no encontrado" });

    // Verificar si ya dio like
    if (project.likes.includes(req.user.id)) {
      return res.status(400).json({ error: "Ya diste like a este proyecto" });
    }

    project.likes.push(req.user.id);
    await project.save();

    res.json({ message: "Like añadido", likesCount: project.likes.length });
  } catch (error) {
    console.error("Error likeProject:", error);
    res.status(500).json({ error: error.message });
  }
};

// Quitar like a un proyecto
exports.unlikeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Proyecto no encontrado" });

    project.likes = project.likes.filter(id => id.toString() !== req.user.id);
    await project.save();

    res.json({ message: "Like eliminado", likesCount: project.likes.length });
  } catch (error) {
    console.error("Error unlikeProject:", error);
    res.status(500).json({ error: error.message });
  }
};

// Dar like a un comentario
exports.likeComment = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Proyecto no encontrado" });

    const comment = project.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comentario no encontrado" });

    // Inicializar likes si no existe
    if (!comment.likes) {
      comment.likes = [];
    }

    // Verificar si ya dio like
    const hasLiked = comment.likes.some(id => id.toString() === req.user.id);
    if (hasLiked) {
      return res.status(400).json({ error: "Ya diste like a este comentario" });
    }

    comment.likes.push(req.user.id);
    await project.save();

    res.json({ message: "Like añadido al comentario", likesCount: comment.likes.length });
  } catch (error) {
    console.error("Error likeComment:", error);
    res.status(500).json({ error: error.message });
  }
};

// Quitar like a un comentario
exports.unlikeComment = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Proyecto no encontrado" });

    const comment = project.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comentario no encontrado" });

    // Inicializar likes si no existe
    if (!comment.likes) {
      comment.likes = [];
    }

    comment.likes = comment.likes.filter(id => id.toString() !== req.user.id);
    await project.save();

    res.json({ message: "Like eliminado del comentario", likesCount: comment.likes.length });
  } catch (error) {
    console.error("Error unlikeComment:", error);
    res.status(500).json({ error: error.message });
  }
};

// Guardar proyecto en marcadores
exports.saveProject = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Proyecto no encontrado" });

    // Verificar si ya está guardado
    if (user.savedProjects.includes(req.params.id)) {
      return res.status(400).json({ error: "Proyecto ya guardado en marcadores" });
    }

    user.savedProjects.push(req.params.id);
    await user.save();

    res.json({ message: "Proyecto guardado en marcadores" });
  } catch (error) {
    console.error("Error saveProject:", error);
    res.status(500).json({ error: error.message });
  }
};

// Quitar proyecto de marcadores
exports.unsaveProject = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    user.savedProjects = user.savedProjects.filter(id => id.toString() !== req.params.id);
    await user.save();

    res.json({ message: "Proyecto eliminado de marcadores" });
  } catch (error) {
    console.error("Error unsaveProject:", error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener proyectos guardados del usuario
exports.getSavedProjects = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id)
      .populate({
        path: 'savedProjects',
        populate: {
          path: 'owner',
          select: 'username name email avatarUrl'
        }
      });
    
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ projects: user.savedProjects });
  } catch (error) {
    console.error("Error getSavedProjects:", error);
    res.status(500).json({ error: error.message });
  }
};

