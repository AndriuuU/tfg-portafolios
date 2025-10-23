const Project = require('../../models/Project');

// Dar like a un proyecto
exports.likeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

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
    
    if (!project) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    project.likes = project.likes.filter(id => id.toString() !== req.user.id);
    await project.save();

    res.json({ message: "Like eliminado", likesCount: project.likes.length });
  } catch (error) {
    console.error("Error unlikeProject:", error);
    res.status(500).json({ error: error.message });
  }
};
