const Project = require('../models/Project');
const cloudinary = require('../utils/cloudinary');

// Crear proyecto
exports.createProject = async (req, res) => {
  try {
    const { title, slug, description, tags, liveUrl, repoUrl } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ error: 'Título y slug son obligatorios' });
    }

    const newProject = await Project.create({
      owner: req.user.id, // del middleware auth
      title,
      slug,
      description: description || '',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      liveUrl: liveUrl || '',
      repoUrl: repoUrl || '',
      images: [],
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error createProject:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los proyectos de un usuario
exports.getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id });
    res.json(projects);
  } catch (error) {
    console.error('Error getUserProjects:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener proyecto por ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    if (project.owner.toString() !== req.user.id) return res.status(403).json({ error: 'No autorizado' });
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

    // Campos básicos
    ["title", "slug", "description", "liveUrl", "repoUrl"].forEach(f => {
      if (req.body[f] !== undefined) project[f] = req.body[f];
    });

    // Tags
    if (req.body.tags !== undefined) {
      project.tags = req.body.tags.split(',').map(t => t.trim());
    }

    // Eliminar imágenes
    if (req.body.removeImage === 'true') project.images = [];

    // Subir nueva imagen
    if (req.file) {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'tfg-portafolios' },
        async (error, result) => {
          if (error) return res.status(500).json({ error });
          project.images = [result.secure_url];
          await project.save();
          return res.json(project);
        }
      );
      return stream.end(req.file.buffer);
    }

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
