const Project = require('../../models/Project');

/**
 * Eliminar colaborador del proyecto
 * Solo el owner puede eliminar colaboradores
 */
exports.removeCollaborator = async (req, res) => {
  try {
    const { id: projectId, userId } = req.params;
    const currentUserId = req.user.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Solo el owner puede eliminar colaboradores
    if (project.owner.toString() !== currentUserId) {
      return res.status(403).json({ error: 'Solo el propietario puede eliminar colaboradores' });
    }

    // Buscar y eliminar el colaborador
    const collabIndex = project.collaborators.findIndex(
      collab => collab.user.toString() === userId
    );

    if (collabIndex === -1) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }

    project.collaborators.splice(collabIndex, 1);
    await project.save();

    res.json({ message: 'Colaborador eliminado exitosamente' });
  } catch (error) {
    console.error('Error removeCollaborator:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Cambiar rol de un colaborador
 * Solo el owner puede cambiar roles
 */
exports.updateCollaboratorRole = async (req, res) => {
  try {
    const { id: projectId, userId } = req.params;
    const { role } = req.body;
    const currentUserId = req.user.id;

    if (!['editor', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido. Usa "editor" o "viewer"' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Solo el owner puede cambiar roles
    if (project.owner.toString() !== currentUserId) {
      return res.status(403).json({ error: 'Solo el propietario puede cambiar roles' });
    }

    // Buscar el colaborador
    const collaborator = project.collaborators.find(
      collab => collab.user.toString() === userId
    );

    if (!collaborator) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }

    // Actualizar rol
    collaborator.role = role;
    await project.save();

    res.json({
      message: 'Rol actualizado exitosamente',
      collaborator: {
        userId,
        role
      }
    });
  } catch (error) {
    console.error('Error updateCollaboratorRole:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Listar colaboradores de un proyecto
 */
exports.getCollaborators = async (req, res) => {
  try {
    const { id: projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate('owner', 'username name email avatarUrl')
      .populate('collaborators.user', 'username name email avatarUrl')
      .populate('collaborators.addedBy', 'username name');

    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    res.json({
      owner: project.owner,
      collaborators: project.collaborators.map(collab => ({
        user: collab.user,
        role: collab.role,
        addedAt: collab.addedAt,
        addedBy: collab.addedBy
      })),
      total: project.collaborators.length
    });
  } catch (error) {
    console.error('Error getCollaborators:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Salir de un proyecto como colaborador
 * El colaborador puede abandonar el proyecto por sí mismo
 */
exports.leaveProject = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const currentUserId = req.user.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Buscar al usuario en colaboradores
    const collabIndex = project.collaborators.findIndex(
      collab => collab.user.toString() === currentUserId
    );

    if (collabIndex === -1) {
      return res.status(400).json({ error: 'No eres colaborador de este proyecto' });
    }

    // Eliminar al colaborador
    project.collaborators.splice(collabIndex, 1);
    await project.save();

    res.json({ message: 'Has abandonado el proyecto exitosamente' });
  } catch (error) {
    console.error('Error leaveProject:', error);
    res.status(500).json({ error: error.message });
  }
};
