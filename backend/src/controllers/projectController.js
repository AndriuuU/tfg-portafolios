const Project = require('../models/Project');

// Crear proyecto
exports.createProject = async (req, res) => {
  try {
    const { title, slug, description, tags, liveUrl, repoUrl } = req.body;

    const newProject = await Project.create({
      owner: req.user.id, // viene del middleware auth
      title,
      slug,
      description,
      tags,
      liveUrl,
      repoUrl,
      images: [], // se llenará luego con uploads
    });

    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los proyectos de un usuario
exports.getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar proyecto
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      req.body,
      { new: true }
    );
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar proyecto
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json({ message: 'Proyecto eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
