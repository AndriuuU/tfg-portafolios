const Project = require('../../models/Project');
const User = require('../../models/User');

// Guardar proyecto en marcadores
exports.saveProject = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

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
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

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
    const user = await User.findById(req.user.id)
      .populate({
        path: 'savedProjects',
        populate: {
          path: 'owner',
          select: 'username name email avatarUrl'
        }
      });
    
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ projects: user.savedProjects });
  } catch (error) {
    console.error("Error getSavedProjects:", error);
    res.status(500).json({ error: error.message });
  }
};
