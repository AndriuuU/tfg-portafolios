const Report = require('../../models/Report');
const User = require('../../models/User');
const Project = require('../../models/Project');
const { createNotification } = require('../notificationController');

/**
 * Crear un reporte (cualquier usuario autenticado)
 */
exports.createReport = async (req, res) => {
  try {
    const { type, reason, description, targetUserId, targetProjectId, targetCommentId } = req.body;
    const reportedById = req.user.id;

    // Validaciones básicas
    if (!type || !reason || !description) {
      return res.status(400).json({ error: 'Tipo, razón y descripción son requeridos' });
    }

    if (!['user', 'project', 'comment'].includes(type)) {
      return res.status(400).json({ error: 'Tipo de reporte inválido' });
    }

    // Validar que no se reporte a sí mismo (si es user)
    if (type === 'user' && targetUserId === reportedById) {
      return res.status(400).json({ error: 'No puedes reportarte a ti mismo' });
    }

    // Verificar que existen las entidades reportadas
    let reportData = {
      type,
      reason,
      description,
      reportedBy: reportedById,
      status: 'pending'
    };

    if (type === 'user') {
      if (!targetUserId) {
        return res.status(400).json({ error: 'User ID es requerido para reportes de usuario' });
      }
      const user = await User.findById(targetUserId);
      if (!user) {
        return res.status(404).json({ error: 'Usuario a reportar no encontrado' });
      }
      reportData.targetUser = targetUserId;
    } else if (type === 'project') {
      if (!targetProjectId) {
        return res.status(400).json({ error: 'Project ID es requerido para reportes de proyecto' });
      }
      const project = await Project.findById(targetProjectId);
      if (!project) {
        return res.status(404).json({ error: 'Proyecto a reportar no encontrado' });
      }
      reportData.targetProject = targetProjectId;
      reportData.targetUser = project.owner; // Para identificar al propietario
    } else if (type === 'comment') {
      if (!targetCommentId) {
        return res.status(400).json({ error: 'Comment ID es requerido para reportes de comentario' });
      }
      // Buscar el proyecto que contiene el comentario
      const project = await Project.findOne({ 'comments._id': targetCommentId });
      if (!project) {
        return res.status(404).json({ error: 'Comentario a reportar no encontrado' });
      }
      reportData.targetComment = targetCommentId;
      reportData.targetProject = project._id;
      const comment = project.comments.find(c => c._id.toString() === targetCommentId);
      reportData.targetUser = comment.user;
    }

    // Crear el reporte
    const report = await Report.create(reportData);

    // Popul ar datos para la respuesta
    await report.populate('reportedBy', 'username email');
    await report.populate('targetUser', 'username email');
    await report.populate('targetProject', 'title owner');

    res.status(201).json({
      message: 'Reporte creado exitosamente',
      report
    });
  } catch (error) {
    console.error('Error createReport:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener todos los reportes (solo admin)
 */
exports.getAllReports = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    
    let filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;

    const skip = (page - 1) * limit;

    const reports = await Report.find(filters)
      .populate('reportedBy', 'username email')
      .populate('targetUser', 'username email')
      .populate('targetProject', 'title owner')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(filters);

    res.json({
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getAllReports:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener estadísticas de reportes (solo admin)
 */
exports.getReportStats = async (req, res) => {
  try {
    const stats = {
      total: await Report.countDocuments(),
      pending: await Report.countDocuments({ status: 'pending' }),
      reviewing: await Report.countDocuments({ status: 'reviewing' }),
      resolved: await Report.countDocuments({ status: 'resolved' }),
      rejected: await Report.countDocuments({ status: 'rejected' }),
      
      byType: {
        user: await Report.countDocuments({ type: 'user' }),
        project: await Report.countDocuments({ type: 'project' }),
        comment: await Report.countDocuments({ type: 'comment' })
      },
      
      byReason: await Report.aggregate([
        { $group: { _id: '$reason', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      byAction: await Report.aggregate([
        { $group: { _id: '$action', count: { $sum: 1 } } }
      ])
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getReportStats:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener un reporte específico (solo admin)
 */
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reportedBy', 'username email avatarUrl')
      .populate('targetUser', 'username email avatarUrl bio')
      .populate('targetProject', 'title description owner')
      .populate('reviewedBy', 'username email');

    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error getReportById:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Actualizar estado de reporte (solo admin)
 */
exports.updateReportStatus = async (req, res) => {
  try {
    const { status, action, adminNotes } = req.body;

    if (!status || !['pending', 'reviewing', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        action: action || report?.action,
        adminNotes,
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('reportedBy targetUser targetProject');

    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    res.json({
      message: 'Reporte actualizado exitosamente',
      report
    });
  } catch (error) {
    console.error('Error updateReportStatus:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Procesar acción sobre reporte (suspender cuenta, eliminar contenido, etc.)
 */
exports.processReportAction = async (req, res) => {
  try {
    const { action, reason } = req.body;
    const reportId = req.params.id;

    if (!action || !['warning', 'content_removed', 'account_suspended', 'account_banned'].includes(action)) {
      return res.status(400).json({ error: 'Acción inválida' });
    }

    const report = await Report.findById(reportId)
      .populate('targetUser')
      .populate('targetProject');
    
    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    if (!report.targetUser) {
      return res.status(404).json({ error: 'Usuario objetivo no encontrado' });
    }

    const targetUserId = report.targetUser._id;
    const adminNote = reason || 'Acción administrativa';
    let result = { message: 'Acción procesada' };
    let notificationMessage = '';

    if (action === 'warning') {
      // Registrar advertencia en el historial del usuario
      await User.findByIdAndUpdate(targetUserId, {
        $push: {
          warnings: {
            reason: adminNote,
            adminNote: adminNote,
            date: new Date(),
            adminId: req.user.id
          }
        }
      });

      // Notificar al usuario
      notificationMessage = `⚠️ Has recibido una advertencia. Razón: ${adminNote}`;
      await createNotification(
        targetUserId,
        req.user.id,
        'message',
        { message: notificationMessage }
      );

      result.message = 'Advertencia registrada y notificada';
    } else if (action === 'account_suspended') {
      // Suspender la cuenta del usuario reportado
      const updateData = {
        isSuspended: true,
        suspensionReason: adminNote,
        suspensionDate: new Date()
      };
      await User.findByIdAndUpdate(targetUserId, updateData);

      // Notificar al usuario
      notificationMessage = `🔒 Tu cuenta ha sido suspendida temporalmente. Razón: ${adminNote}. Contacta con soporte si tienes dudas.`;
      await createNotification(
        targetUserId,
        req.user.id,
        'message',
        { message: notificationMessage }
      );

      result.message = 'Cuenta suspendida exitosamente y usuario notificado';
    } else if (action === 'account_banned') {
      // Banear la cuenta del usuario reportado
      const updateData = {
        isBanned: true,
        banReason: adminNote,
        banDate: new Date(),
        isSuspended: false,
        suspensionReason: null,
        suspensionDate: null
      };
      await User.findByIdAndUpdate(targetUserId, updateData);

      // Notificar al usuario
      notificationMessage = `🚫 Tu cuenta ha sido baneada permanentemente. Razón: ${adminNote}. Esta acción es irreversible.`;
      await createNotification(
        targetUserId,
        req.user.id,
        'message',
        { message: notificationMessage }
      );

      result.message = 'Cuenta baneada exitosamente y usuario notificado';
    } else if (action === 'content_removed') {
      // Eliminar el contenido específico
      if (report.type === 'project' && report.targetProject) {
        // Verificar que el proyecto existe
        const project = await Project.findById(report.targetProject._id);
        if (project) {
          await Project.findByIdAndDelete(report.targetProject._id);
          
          // Notificar al usuario
          notificationMessage = `🗑️ Tu proyecto "${project.title}" ha sido eliminado. Razón: ${adminNote}`;
          await createNotification(
            targetUserId,
            req.user.id,
            'message',
            { message: notificationMessage }
          );
          
          result.message = 'Proyecto eliminado exitosamente y usuario notificado';
        } else {
          return res.status(404).json({ error: 'Proyecto no encontrado' });
        }
      } else if (report.type === 'comment' && report.targetComment && report.targetProject) {
        // Eliminar el comentario específico
        const updated = await Project.findByIdAndUpdate(
          report.targetProject._id,
          { $pull: { comments: { _id: report.targetComment } } },
          { new: true }
        );
        if (!updated) {
          return res.status(404).json({ error: 'Proyecto con comentario no encontrado' });
        }

        // Notificar al usuario
        notificationMessage = `🗑️ Tu comentario ha sido eliminado. Razón: ${adminNote}`;
        await createNotification(
          targetUserId,
          req.user.id,
          'message',
          { message: notificationMessage }
        );

        result.message = 'Comentario eliminado exitosamente y usuario notificado';
      } else if (report.type === 'user') {
        // SOFT DELETE: Marcar la cuenta como eliminada en lugar de borrarla físicamente
        const updateData = {
          isDeleted: true,
          deletedAt: new Date(),
          deletedReason: adminNote,
          isSuspended: false,
          isBanned: false
        };
        await User.findByIdAndUpdate(targetUserId, updateData);

        // Notificar al usuario (aunque no podrá acceder)
        notificationMessage = `🗑️ Tu cuenta ha sido eliminada. Razón: ${adminNote}. Si crees que esto es un error, contacta con soporte.`;
        await createNotification(
          targetUserId,
          req.user.id,
          'message',
          { message: notificationMessage }
        );

        result.message = 'Usuario eliminado (soft delete) exitosamente y notificado';
      } else {
        return res.status(400).json({ error: 'No se puede determinar qué contenido eliminar' });
      }
    }

    // Actualizar reporte
    await Report.findByIdAndUpdate(reportId, {
      action,
      status: 'resolved',
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      adminNotes: adminNote
    });

    res.json(result);
  } catch (error) {
    console.error('Error processReportAction:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Rechazar reporte (solo admin)
 */
exports.rejectReport = async (req, res) => {
  try {
    const { reason } = req.body;

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        adminNotes: reason
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    res.json({
      message: 'Reporte rechazado',
      report
    });
  } catch (error) {
    console.error('Error rejectReport:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Suspender/banear usuario (solo admin)
 */
exports.suspendUser = async (req, res) => {
  try {
    const { userId, reason, ban = false } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      ban ? {
        isBanned: true,
        banReason: reason,
        banDate: new Date()
      } : {
        isSuspended: true,
        suspensionReason: reason,
        suspensionDate: new Date()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      message: ban ? 'Usuario baneado exitosamente' : 'Usuario suspendido exitosamente',
      user
    });
  } catch (error) {
    console.error('Error suspendUser:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Reactivar usuario suspendido/baneado/eliminado (solo admin)
 */
exports.reactivateUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isSuspended: false,
        suspensionReason: null,
        suspensionDate: null,
        isBanned: false,
        banReason: null,
        banDate: null,
        isDeleted: false,
        deletedAt: null,
        deletedReason: null
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Notificar al usuario que su cuenta ha sido reactivada
    await createNotification(
      userId,
      req.user.id,
      'message',
      { message: '✅ Tu cuenta ha sido reactivada. Puedes volver a acceder con normalidad.' }
    );

    res.json({
      message: 'Usuario reactivado exitosamente y notificado',
      user
    });
  } catch (error) {
    console.error('Error reactivateUser:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener usuarios suspendidos/baneados/eliminados (solo admin)
 */
exports.getSuspendedUsers = async (req, res) => {
  try {
    const { type = 'all' } = req.query;

    let filter = {
      $or: [
        { isSuspended: true },
        { isBanned: true },
        { isDeleted: true }
      ]
    };

    if (type === 'suspended') {
      filter = { isSuspended: true };
    } else if (type === 'banned') {
      filter = { isBanned: true };
    } else if (type === 'deleted') {
      filter = { isDeleted: true };
    }

    const users = await User.find(filter)
      .select('username email name avatarUrl bio isSuspended isBanned isDeleted suspensionReason suspensionDate banReason banDate deletedReason deletedAt warnings createdAt')
      .sort({ suspensionDate: -1, banDate: -1, deletedAt: -1 });

    // Contar proyectos por usuario
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const projectCount = await Project.countDocuments({ owner: user._id });
        return {
          ...user.toObject(),
          projectCount
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    console.error('Error getSuspendedUsers:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener todos los usuarios (solo admin)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('username email name avatarUrl bio isAdmin isSuspended isBanned isDeleted suspensionReason banReason deletedReason createdAt')
      .sort({ createdAt: -1 });

    // Contar proyectos por usuario
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const projectCount = await Project.countDocuments({ owner: user._id });
        return {
          ...user.toObject(),
          projectCount
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    console.error('Error getAllUsers:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Otorgar o revocar permisos de administrador (solo admin)
 */
exports.toggleAdminPermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;

    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({ error: 'isAdmin debe ser un booleano' });
    }

    // No permitir que un admin se remueva a sí mismo
    if (id === req.user.id && !isAdmin) {
      return res.status(400).json({ error: 'No puedes revocar tus propios permisos de admin' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isAdmin },
      { new: true }
    ).select('username email name isAdmin');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Notificar al usuario
    const message = isAdmin 
      ? '🎉 ¡Felicidades! Se te han otorgado permisos de administrador.'
      : '⚠️ Tus permisos de administrador han sido revocados.';
    
    await createNotification(
      id,
      req.user.id,
      'message',
      { message }
    );

    res.json({
      message: isAdmin ? 'Permisos de admin otorgados exitosamente' : 'Permisos de admin revocados exitosamente',
      user
    });
  } catch (error) {
    console.error('Error toggleAdminPermission:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Suspender usuario directamente (solo admin)
 */
exports.suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Debes proporcionar una razón para la suspensión' });
    }

    // No permitir que un admin se suspenda a sí mismo
    if (id === req.user.id) {
      return res.status(400).json({ error: 'No puedes suspenderte a ti mismo' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { 
        isSuspended: true,
        suspensionReason: reason,
        suspensionDate: new Date()
      },
      { new: true }
    ).select('username email isSuspended');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Notificar al usuario
    await createNotification(
      id,
      req.user.id,
      'message',
      { message: `🔒 Tu cuenta ha sido suspendida temporalmente. Razón: ${reason}` }
    );

    res.json({
      message: 'Usuario suspendido exitosamente',
      user
    });
  } catch (error) {
    console.error('Error suspendUser:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Banear usuario directamente (solo admin)
 */
exports.banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Debes proporcionar una razón para el baneo' });
    }

    // No permitir que un admin se banee a sí mismo
    if (id === req.user.id) {
      return res.status(400).json({ error: 'No puedes banearte a ti mismo' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { 
        isBanned: true,
        banReason: reason,
        banDate: new Date(),
        isSuspended: false,
        suspensionReason: null,
        suspensionDate: null
      },
      { new: true }
    ).select('username email isBanned');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Notificar al usuario
    await createNotification(
      id,
      req.user.id,
      'message',
      { message: `🚫 Tu cuenta ha sido baneada permanentemente. Razón: ${reason}` }
    );

    res.json({
      message: 'Usuario baneado exitosamente',
      user
    });
  } catch (error) {
    console.error('Error banUser:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Eliminar usuario directamente (solo admin)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Debes proporcionar una razón para la eliminación' });
    }

    // No permitir que un admin se elimine a sí mismo
    if (id === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { 
        isDeleted: true,
        deletedReason: reason,
        deletedAt: new Date(),
        isSuspended: false,
        isBanned: false
      },
      { new: true }
    ).select('username email isDeleted');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Notificar al usuario
    await createNotification(
      id,
      req.user.id,
      'message',
      { message: `🗑️ Tu cuenta ha sido eliminada. Razón: ${reason}` }
    );

    res.json({
      message: 'Usuario eliminado exitosamente',
      user
    });
  } catch (error) {
    console.error('Error deleteUser:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener proyectos de un usuario específico (solo admin)
 */
exports.getUserProjects = async (req, res) => {
  try {
    const { id } = req.params;

    const projects = await Project.find({ owner: id })
      .select('title slug description images likes comments createdAt')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Error getUserProjects:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Eliminar proyecto de un usuario (solo admin)
 */
exports.deleteUserProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { reason } = req.body;

    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    const ownerId = project.owner;

    await Project.findByIdAndDelete(projectId);

    // Notificar al propietario
    if (reason) {
      await createNotification(
        ownerId,
        req.user.id,
        'message',
        { message: `🗑️ Tu proyecto "${project.title}" ha sido eliminado por un administrador. Razón: ${reason}` }
      );
    }

    res.json({
      message: 'Proyecto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleteUserProject:', error);
    res.status(500).json({ error: error.message });
  }
};
