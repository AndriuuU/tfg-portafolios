// No requerir en el top level para evitar circular dependencies
// Se cargarán cuando sea necesario

// Registrar actividad del usuario
exports.logActivity = async (userId, action, details = {}, req = null) => {
  try {
    const ActivityLog = require('../models/ActivityLog');
    
    const logEntry = {
      userId,
      action,
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get('user-agent') || ''
    };

    await ActivityLog.create(logEntry);
    
    if (process.env.NODE_ENV !== 'test') {
      console.log(`📝 Activity logged: ${action} by user ${userId}`);
    }
  } catch (error) {
    console.error('Error logging activity:', error);
    // No lanzar error para no interrumpir operaciones
  }
};

// Registrar vista de proyecto
exports.logProjectView = async (projectId, userId = null, req = null) => {
  try {
    const Analytics = require('../models/Analytics');
    
    let analytics = await Analytics.findOne({ projectId });
    
    if (!analytics) {
      analytics = new Analytics({ projectId });
    }

    // Incrementar total de vistas
    analytics.views.total += 1;

    // Registrar vista única
    if (userId && !analytics.views.unique_viewers.includes(userId)) {
      analytics.views.unique_viewers.push(userId);
    }

    // Registrar vista diaria
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyEntry = analytics.views.daily.find(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    if (dailyEntry) {
      dailyEntry.count += 1;
    } else {
      analytics.views.daily.push({
        date: today,
        count: 1
      });
    }

    analytics.lastUpdated = new Date();
    await analytics.save();

    if (process.env.NODE_ENV !== 'test') {
      console.log(`👀 View recorded for project ${projectId}`);
    }
  } catch (error) {
    console.error('Error logging project view:', error);
  }
};

// Registrar like de proyecto
exports.logProjectLike = async (projectId, userId, req = null) => {
  try {
    const Analytics = require('../models/Analytics');
    let analytics = await Analytics.findOne({ projectId });
    
    if (!analytics) {
      analytics = new Analytics({ projectId });
    }

    analytics.likes.total = (analytics.likes.total || 0) + 1;

    // Agregar usuario a la lista de usuarios que dieron like
    if (!analytics.likes.users.includes(userId)) {
      analytics.likes.users.push(userId);
    }

    // Registrar like diario
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyEntry = analytics.likes.daily.find(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    if (dailyEntry) {
      dailyEntry.count += 1;
    } else {
      analytics.likes.daily.push({
        date: today,
        count: 1
      });
    }

    // Actualizar engagement
    analytics.engagement.interactions = 
      (analytics.views.total || 0) + 
      (analytics.likes.total || 0) + 
      (analytics.comments.total || 0);

    analytics.lastUpdated = new Date();
    await analytics.save();

    if (process.env.NODE_ENV !== 'test') {
      console.log(`❤️ Like recorded for project ${projectId}`);
    }
  } catch (error) {
    console.error('Error logging project like:', error);
  }
};

// Registrar unlike de proyecto
exports.logProjectUnlike = async (projectId, userId) => {
  try {
    const Analytics = require('../models/Analytics');
    const analytics = await Analytics.findOne({ projectId });
    
    if (analytics && analytics.likes.total > 0) {
      analytics.likes.total -= 1;
      
      // Remover usuario de la lista
      analytics.likes.users = analytics.likes.users.filter(
        id => id.toString() !== userId.toString()
      );

      // Actualizar engagement
      analytics.engagement.interactions = 
        (analytics.views.total || 0) + 
        (analytics.likes.total || 0) + 
        (analytics.comments.total || 0);

      analytics.lastUpdated = new Date();
      await analytics.save();

      if (process.env.NODE_ENV !== 'test') {
        console.log(`👎 Unlike recorded for project ${projectId}`);
      }
    }
  } catch (error) {
    console.error('Error logging project unlike:', error);
  }
};

// Registrar comentario
exports.logProjectComment = async (projectId) => {
  try {
    const Analytics = require('../models/Analytics');
    let analytics = await Analytics.findOne({ projectId });
    
    if (!analytics) {
      analytics = new Analytics({ projectId });
    }

    analytics.comments.total = (analytics.comments.total || 0) + 1;

    // Registrar comentario diario
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyEntry = analytics.comments.daily.find(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    if (dailyEntry) {
      dailyEntry.count += 1;
    } else {
      analytics.comments.daily.push({
        date: today,
        count: 1
      });
    }

    // Actualizar engagement
    analytics.engagement.interactions = 
      (analytics.views.total || 0) + 
      (analytics.likes.total || 0) + 
      (analytics.comments.total || 0);

    analytics.lastUpdated = new Date();
    await analytics.save();

    if (process.env.NODE_ENV !== 'test') {
      console.log(`💬 Comment recorded for project ${projectId}`);
    }
  } catch (error) {
    console.error('Error logging project comment:', error);
  }
};

// Registrar eliminación de comentario
exports.logProjectCommentDelete = async (projectId) => {
  try {
    const Analytics = require('../models/Analytics');
    const analytics = await Analytics.findOne({ projectId });
    
    if (analytics && analytics.comments.total > 0) {
      analytics.comments.total -= 1;

      // Actualizar engagement
      analytics.engagement.interactions = 
        (analytics.views.total || 0) + 
        (analytics.likes.total || 0) + 
        (analytics.comments.total || 0);

      analytics.lastUpdated = new Date();
      await analytics.save();

      if (process.env.NODE_ENV !== 'test') {
        console.log(`🗑️ Comment deletion recorded for project ${projectId}`);
      }
    }
  } catch (error) {
    console.error('Error logging comment deletion:', error);
  }
};

// Calcular score de popularidad
exports.calculatePopularityScore = (analytics) => {
  if (!analytics) return 0;
  
  const viewWeight = 1;
  const likeWeight = 10;
  const commentWeight = 15;
  
  const score = 
    (analytics.views?.total || 0) * viewWeight +
    (analytics.likes?.total || 0) * likeWeight +
    (analytics.comments?.total || 0) * commentWeight;
  
  return score;
};

// Obtener estadísticas de un proyecto
exports.getProjectAnalytics = async (projectId) => {
  try {
    const Analytics = require('../models/Analytics');
    const analytics = await Analytics.findOne({ projectId });
    
    if (!analytics) {
      return {
        views: { total: 0, unique: 0 },
        likes: 0,
        comments: 0,
        engagement: 0,
        popularityScore: 0
      };
    }

    return {
      views: {
        total: analytics.views.total,
        unique: analytics.views.unique_viewers.length,
        daily: analytics.views.daily
      },
      likes: {
        total: analytics.likes.total,
        daily: analytics.likes.daily
      },
      comments: {
        total: analytics.comments.total,
        daily: analytics.comments.daily
      },
      engagement: analytics.engagement,
      popularityScore: exports.calculatePopularityScore(analytics),
      lastUpdated: analytics.lastUpdated
    };
  } catch (error) {
    console.error('Error getting project analytics:', error);
    return null;
  }
};

// Obtener actividad del usuario
exports.getUserActivity = async (userId, limit = 50, skip = 0) => {
  try {
    const ActivityLog = require('../models/ActivityLog');
    const activities = await ActivityLog.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
    
    const total = await ActivityLog.countDocuments({ userId });

    return {
      activities,
      total,
      limit,
      skip
    };
  } catch (error) {
    console.error('Error getting user activity:', error);
    return null;
  }
};

// Obtener proyectos más populares de un usuario
exports.getUserTopProjects = async (userId, limit = 5) => {
  try {
    const Analytics = require('../models/Analytics');
    const Project = require('../models/Project');
    const userProjects = await Project.find({ owner: userId })
      .select('_id title')
      .lean();

    const projectIds = userProjects.map(p => p._id);

    const analytics = await Analytics.find({ projectId: { $in: projectIds } })
      .sort({ 'engagement.interactions': -1 })
      .limit(limit)
      .lean();

    return analytics.map(a => ({
      ...a,
      popularityScore: exports.calculatePopularityScore(a)
    }));
  } catch (error) {
    console.error('Error getting user top projects:', error);
    return [];
  }
};
