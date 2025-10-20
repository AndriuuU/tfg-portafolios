
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
