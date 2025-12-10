// Obtener analytics de un proyecto específico
exports.getProjectAnalytics = async (req, res) => {
  try {
    const {
      getProjectAnalytics: getAnalyticsHelper,
    } = require('../utils/analyticsHelper');
    const Project = require('../models/Project');
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Solo el dueño puede ver las analytics detalladas
    if (project.owner.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'No tienes permiso para ver estas analytics' });
    }

    const analytics = await getAnalyticsHelper(projectId);
    
    res.json({
      projectId,
      projectTitle: project.title,
      ...analytics
    });
  } catch (error) {
    console.error('Error getting project analytics:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener múltiples proyectos analytics
exports.getUserProjectsAnalytics = async (req, res) => {
  try {
    const {
      getProjectAnalytics: getAnalyticsHelper,
    } = require('../utils/analyticsHelper');
    const Project = require('../models/Project');
    const userId = req.user.id;
    const { limit = 10, skip = 0 } = req.query;

    const projects = await Project.find({ owner: userId })
      .select('_id title createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const analyticsData = await Promise.all(
      projects.map(async (project) => {
        const analytics = await getAnalyticsHelper(project._id);
        return {
          project,
          analytics
        };
      })
    );

    res.json({
      projects: analyticsData,
      total: await Project.countDocuments({ owner: userId })
    });
  } catch (error) {
    console.error('Error getting user projects analytics:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener proyectos más populares del usuario
exports.getTopProjects = async (req, res) => {
  try {
    const {
      getUserTopProjects: getTopProjectsHelper,
    } = require('../utils/analyticsHelper');
    const Project = require('../models/Project');
    const userId = req.user.id;
    const { limit = 5 } = req.query;

    const topProjects = await getTopProjectsHelper(userId, parseInt(limit));
    
    const enrichedProjects = await Promise.all(
      topProjects.map(async (analytics) => {
        const project = await Project.findById(analytics.projectId)
          .select('title description images')
          .lean();
        
        return {
          project,
          analytics: {
            views: analytics.views,
            likes: analytics.likes.total,
            comments: analytics.comments.total,
            popularityScore: analytics.popularityScore
          }
        };
      })
    );

    res.json({ topProjects: enrichedProjects });
  } catch (error) {
    console.error('Error getting top projects:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener dashboard de estadísticas
exports.getDashboard = async (req, res) => {
  try {
    const {
      calculatePopularityScore
    } = require('../utils/analyticsHelper');
    const Analytics = require('../models/Analytics');
    const ActivityLog = require('../models/ActivityLog');
    const Project = require('../models/Project');
    const userId = req.user.id;

    // Proyectos totales
    const totalProjects = await Project.countDocuments({ owner: userId });

    // Analytics de todos los proyectos
    const userProjects = await Project.find({ owner: userId })
      .select('_id')
      .lean();

    const projectIds = userProjects.map(p => p._id);

    const allAnalytics = await Analytics.find({ projectId: { $in: projectIds } })
      .lean();

    // Calcular totales
    const totalStats = {
      totalViews: allAnalytics.reduce((sum, a) => sum + (a.views?.total || 0), 0),
      totalLikes: allAnalytics.reduce((sum, a) => sum + (a.likes?.total || 0), 0),
      totalComments: allAnalytics.reduce((sum, a) => sum + (a.comments?.total || 0), 0),
      uniqueViewers: new Set(
        allAnalytics.flatMap(a => a.views?.unique_viewers || []).map(v => v.toString())
      ).size,
    };

    // Top 5 proyectos
    const topProjects = allAnalytics
      .sort((a, b) => calculatePopularityScore(b) - calculatePopularityScore(a))
      .slice(0, 5)
      .map(a => ({
        projectId: a.projectId,
        views: a.views.total,
        likes: a.likes.total,
        comments: a.comments.total,
        score: calculatePopularityScore(a)
      }));

    // Actividad reciente
    const recentActivity = await ActivityLog.find({ userId })
      .sort({ timestamp: -1 })
      .limit(10)
      .select('action details timestamp')
      .lean();

    // Gráfico de vistas diarias (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyViews = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const viewsForDay = allAnalytics
        .flatMap(a => a.views?.daily || [])
        .filter(d => {
          const dDate = new Date(d.date);
          dDate.setHours(0, 0, 0, 0);
          return dDate.getTime() === date.getTime();
        })
        .reduce((sum, d) => sum + d.count, 0);

      dailyViews.push({
        date: date.toISOString().split('T')[0],
        views: viewsForDay
      });
    }

    res.json({
      totalStats,
      topProjects,
      recentActivity: recentActivity.map(a => ({
        action: a.action,
        projectTitle: a.details?.projectTitle,
        timestamp: a.timestamp
      })),
      dailyViews: dailyViews.reverse()
    });
  } catch (error) {
    console.error('Error getting dashboard:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener actividad del usuario
exports.getUserActivityEndpoint = async (req, res) => {
  try {
    const {
      getUserActivity: getUserActivityHelper,
    } = require('../utils/analyticsHelper');
    const userId = req.user.id;
    const { limit = 50, skip = 0, action = null } = req.query;

    const result = await getUserActivityHelper(userId, parseInt(limit), parseInt(skip));

    res.json({
      activities: result.activities,
      total: result.total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Error getting user activity:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener estadísticas de público
exports.getAudienceStats = async (req, res) => {
  try {
    const Analytics = require('../models/Analytics');
    const Project = require('../models/Project');
    const userId = req.user.id;

    const userProjects = await Project.find({ owner: userId })
      .select('_id')
      .lean();

    const projectIds = userProjects.map(p => p._id);

    const allAnalytics = await Analytics.find({ projectId: { $in: projectIds } })
      .lean();

    // Datos de público
    const audienceData = {
      totalUniqueViewers: new Set(
        allAnalytics.flatMap(a => a.views?.unique_viewers || []).map(v => v.toString())
      ).size,
      totalLikes: allAnalytics.reduce((sum, a) => sum + (a.likes?.total || 0), 0),
      totalComments: allAnalytics.reduce((sum, a) => sum + (a.comments?.total || 0), 0),
      avgEngagementRate: 0
    };

    // Calcular engagement rate
    const totalViews = allAnalytics.reduce((sum, a) => sum + (a.views?.total || 0), 0);
    if (totalViews > 0) {
      const totalEngagement = audienceData.totalLikes + audienceData.totalComments;
      audienceData.avgEngagementRate = ((totalEngagement / totalViews) * 100).toFixed(2);
    }

    // Gráfico de engagement por proyecto (últimos 30 días)
    const projectEngagement = await Promise.all(
      userProjects.map(async (project) => {
        const projectAnalytics = await Analytics.findOne({ projectId: project._id });
        return {
          projectId: project._id,
          engagement: (projectAnalytics?.engagement?.interactions || 0)
        };
      })
    );

    res.json({
      audienceData,
      projectEngagement
    });
  } catch (error) {
    console.error('Error getting audience stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener exportar datos de analytics (CSV)
exports.exportAnalytics = async (req, res) => {
  try {
    const {
      getProjectAnalytics: getAnalyticsHelper,
    } = require('../utils/analyticsHelper');
    const Project = require('../models/Project');
    const userId = req.user.id;
    const { format = 'json' } = req.query;

    const userProjects = await Project.find({ owner: userId })
      .select('_id title')
      .lean();

    const analyticsData = await Promise.all(
      userProjects.map(async (project) => {
        const analytics = await getAnalyticsHelper(project._id);
        return {
          title: project.title,
          ...analytics
        };
      })
    );

    if (format === 'csv') {
      // Generar CSV
      const csv = generateCSV(analyticsData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics.csv"');
      res.send(csv);
    } else {
      res.json(analyticsData);
    }
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({ error: error.message });
  }
};

// Función auxiliar para generar CSV
function generateCSV(data) {
  const headers = ['Proyecto', 'Vistas', 'Vistas Únicas', 'Likes', 'Comentarios', 'Score Popularidad'];
  const rows = data.map(project => [
    project.title,
    project.views.total,
    project.views.unique,
    project.likes.total,
    project.comments.total,
    project.popularityScore
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csv;
}
