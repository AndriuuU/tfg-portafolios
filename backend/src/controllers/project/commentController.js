const Project = require('../../models/Project');
const { createNotification } = require('../notificationController');

// Añadir comentario
exports.addComment = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    const comment = {
      user: req.user.id,
      text: req.body.text,
    };

    project.comments.push(comment);
    await project.save();
    await project.populate('comments.user', 'username email');

    // Create notification for project owner if commenter is not the owner
    if (project.owner.toString() !== req.user.id) {
      await createNotification(
        project.owner,
        req.user.id,
        'comment',
        { projectId: project._id, message: `Comentó en tu proyecto: ${project.title}` }
      );
    }

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
    
    if (!project) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    const comment = project.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ error: "Comentario no encontrado" });
    }

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

// Dar like a un comentario
exports.likeComment = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    const comment = project.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ error: "Comentario no encontrado" });
    }

    if (!comment.likes) {
      comment.likes = [];
    }

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
    
    if (!project) {
      return res.status(404).json({ error: "Proyecto no encontrado" });
    }

    const comment = project.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ error: "Comentario no encontrado" });
    }

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
