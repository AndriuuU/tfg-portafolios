const Project = require('../../models/Project');
const { createNotification } = require('../notificationController');
const { logActivity } = require('../../utils/analyticsHelper');
const { logProjectLike, logProjectUnlike } = require('../../utils/analyticsHelper');

// Dar like a un proyecto (toggle)
exports.likeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    // Verificar si ya existe like (convertir a string para comparación)
    const userIdString = req.user.id.toString();
    const likeIndex = project.likes.findIndex(id => id.toString() === userIdString);

    if (likeIndex > -1) {
      // Si ya tiene like, lo quitamos (unlike)
      project.likes.splice(likeIndex, 1);
      await project.save();
      
      // Logging
      await logProjectUnlike(project._id, req.user.id);
      await logActivity(req.user.id, 'project_unliked', {
        projectId: project._id,
        projectTitle: project.title
      }, req);
      
      res.json({ message: "Like removido", liked: false, likesCount: project.likes.length });
    } else {
      // Si no tiene like, se lo damos (like)
      project.likes.push(req.user.id);
      await project.save();

      // Logging
      await logProjectLike(project._id, req.user.id, req);
      await logActivity(req.user.id, 'project_liked', {
        projectId: project._id,
        projectTitle: project.title
      }, req);

      // Create notification for project owner
      await createNotification(
        project.owner,
        req.user.id,
        'like',
        { projectId: project._id, message: `Le encantó tu proyecto: ${project.title}` }
      );

      res.json({ message: "Like añadido", liked: true, likesCount: project.likes.length });
    }
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

    // Convertir a string para comparación segura
    const userIdString = req.user.id.toString();
    const hadLike = project.likes.some(id => id.toString() === userIdString);
    
    project.likes = project.likes.filter(id => id.toString() !== userIdString);
    await project.save();

    // Logging si realmente tenía like
    if (hadLike) {
      await logProjectUnlike(project._id, req.user.id);
      await logActivity(req.user.id, 'project_unliked', {
        projectId: project._id,
        projectTitle: project.title
      }, req);
    }

    res.json({ message: "Like eliminado", likesCount: project.likes.length });
  } catch (error) {
    console.error("Error unlikeProject:", error);
    res.status(500).json({ error: error.message });
  }
};
