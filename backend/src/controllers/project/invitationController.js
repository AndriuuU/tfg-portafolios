const Project = require('../../models/Project');
const User = require('../../models/User');

/**
 * Invitar a un colaborador al proyecto
 * Solo el owner o editores pueden invitar
 */
exports.inviteCollaborator = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { userId, username, email, role = 'viewer' } = req.body;
    const currentUserId = req.user.id;

    // Validaciones - aceptar userId, username o email
    if (!userId && !username && !email) {
      return res.status(400).json({ error: 'El ID, nombre de usuario o email es requerido' });
    }

    if (!['editor', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido. Usa "editor" o "viewer"' });
    }

    // Buscar proyecto
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Verificar permisos (solo owner o editores)
    const isOwner = project.owner.toString() === currentUserId;
    const isEditor = project.collaborators.some(
      collab => collab.user.toString() === currentUserId && collab.role === 'editor'
    );

    if (!isOwner && !isEditor) {
      return res.status(403).json({ error: 'No tienes permisos para invitar colaboradores' });
    }

    // Buscar usuario por ID, username o email
    let userToInvite;
    if (userId) {
      userToInvite = await User.findById(userId);
    } else if (username) {
      userToInvite = await User.findOne({ username });
    } else if (email) {
      userToInvite = await User.findOne({ email });
    }

    if (!userToInvite) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const invitedUserId = userToInvite._id.toString();

    // Verificar que no sea el owner
    if (invitedUserId === project.owner.toString()) {
      return res.status(400).json({ error: 'El propietario ya tiene acceso total al proyecto' });
    }

    // Verificar que no esté ya como colaborador
    const isAlreadyCollaborator = project.collaborators.some(
      collab => collab.user.toString() === invitedUserId
    );
    if (isAlreadyCollaborator) {
      return res.status(400).json({ error: 'Este usuario ya es colaborador del proyecto' });
    }

    // Verificar que no tenga una invitación pendiente
    const hasPendingInvitation = project.pendingInvitations.some(
      inv => inv.user.toString() === invitedUserId
    );
    if (hasPendingInvitation) {
      return res.status(400).json({ error: 'Ya existe una invitación pendiente para este usuario' });
    }

    // Agregar invitación pendiente
    project.pendingInvitations.push({
      user: invitedUserId,
      role: role,
      invitedBy: currentUserId,
      invitedAt: new Date()
    });

    await project.save();

    res.status(201).json({
      message: 'Invitación enviada exitosamente',
      invitation: {
        user: {
          id: userToInvite._id,
          username: userToInvite.username,
          name: userToInvite.name,
          avatarUrl: userToInvite.avatarUrl
        },
        role,
        invitedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error inviteCollaborator:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Aceptar invitación de colaborador
 * Solo el usuario invitado puede aceptar
 */
exports.acceptInvitation = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const currentUserId = req.user.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Buscar la invitación
    const invitationIndex = project.pendingInvitations.findIndex(
      inv => inv.user.toString() === currentUserId
    );

    if (invitationIndex === -1) {
      return res.status(404).json({ error: 'No tienes ninguna invitación para este proyecto' });
    }

    const invitation = project.pendingInvitations[invitationIndex];

    // Agregar como colaborador
    project.collaborators.push({
      user: currentUserId,
      role: invitation.role,
      addedBy: invitation.invitedBy,
      addedAt: new Date()
    });

    // Eliminar la invitación pendiente
    project.pendingInvitations.splice(invitationIndex, 1);

    await project.save();

    res.json({
      message: 'Invitación aceptada exitosamente',
      project: {
        id: project._id,
        title: project.title,
        role: invitation.role
      }
    });
  } catch (error) {
    console.error('Error acceptInvitation:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Rechazar invitación de colaborador
 */
exports.rejectInvitation = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const currentUserId = req.user.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Buscar la invitación
    const invitationIndex = project.pendingInvitations.findIndex(
      inv => inv.user.toString() === currentUserId
    );

    if (invitationIndex === -1) {
      return res.status(404).json({ error: 'No tienes ninguna invitación para este proyecto' });
    }

    // Eliminar la invitación
    project.pendingInvitations.splice(invitationIndex, 1);
    await project.save();

    res.json({ message: 'Invitación rechazada' });
  } catch (error) {
    console.error('Error rejectInvitation:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener invitaciones pendientes del usuario autenticado
 */
exports.getMyInvitations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Buscar proyectos con invitaciones pendientes para este usuario
    const projects = await Project.find({
      'pendingInvitations.user': currentUserId
    })
      .populate('owner', 'username name avatarUrl')
      .populate('pendingInvitations.invitedBy', 'username name');

    const invitations = projects.map(project => {
      const invitation = project.pendingInvitations.find(
        inv => inv.user.toString() === currentUserId
      );
      
      return {
        _id: invitation._id,
        project: {
          _id: project._id,
          title: project.title,
          slug: project.slug,
          description: project.description
        },
        role: invitation.role,
        invitedAt: invitation.invitedAt,
        invitedBy: invitation.invitedBy,
        createdAt: invitation.invitedAt
      };
    });

    res.json({
      invitations,
      total: invitations.length
    });
  } catch (error) {
    console.error('Error getMyInvitations:', error);
    res.status(500).json({ error: error.message });
  }
};
