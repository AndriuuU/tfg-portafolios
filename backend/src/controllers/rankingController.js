const Project = require('../models/Project');
const User = require('../models/User');
const Analytics = require('../models/Analytics');

/**
 * Obtener ranking global de usuarios por popularidad
 * Respeta la privacidad de las cuentas
 */
exports.getGlobalRanking = async (req, res) => {
  try {
    const { limit = 20, skip = 0, timeframe = 'all' } = req.query;

    // Obtener todos los usuarios que NO están en privado
    const publicUsers = await User.find({ 'privacy.isPrivate': false })
      .select('_id username name avatarUrl bio followers')
      .lean();

    // Para cada usuario público, calcular su score de popularidad
    const userScores = await Promise.all(
      publicUsers.map(async (user) => {
        const userProjects = await Project.find({ owner: user._id }).select('_id');
        const projectIds = userProjects.map(p => p._id);

        // Obtener analytics de todos sus proyectos
        const analyticsData = await Analytics.find({ projectId: { $in: projectIds } });

        // Calcular score total
        const totalViews = analyticsData.reduce((sum, a) => sum + (a.views?.total || 0), 0);
        const totalLikes = analyticsData.reduce((sum, a) => sum + (a.likes?.total || 0), 0);
        const totalComments = analyticsData.reduce((sum, a) => sum + (a.comments?.total || 0), 0);
        const totalEngagement = analyticsData.reduce((sum, a) => sum + (a.engagement?.interactions || 0), 0);

        // Score de popularidad: views (1pt) + likes (10pt) + comments (15pt)
        const popularityScore = 
          (totalViews * 1) + 
          (totalLikes * 10) + 
          (totalComments * 15);

        return {
          userId: user._id,
          username: user.username,
          name: user.name,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          followers: user.followers.length,
          projectCount: userProjects.length,
          stats: {
            totalViews,
            totalLikes,
            totalComments,
            totalEngagement,
            popularityScore
          }
        };
      })
    );

    // Ordenar por popularity score descendente
    const ranked = userScores
      .sort((a, b) => b.stats.popularityScore - a.stats.popularityScore)
      .slice(parseInt(skip), parseInt(skip) + parseInt(limit));

    // Agregar posición en el ranking
    const withRank = ranked.map((user, index) => ({
      ...user,
      rank: parseInt(skip) + index + 1
    }));

    res.json({
      users: withRank,
      pagination: {
        skip: parseInt(skip),
        limit: parseInt(limit),
        total: userScores.length
      }
    });
  } catch (error) {
    console.error('Error getting global ranking:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener ranking de proyectos más populares
 */
exports.getProjectsRanking = async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;

    // Obtener proyectos de usuarios públicos
    const publicUsers = await User.find({ 'privacy.isPrivate': false }).select('_id').lean();
    const publicUserIds = publicUsers.map(u => u._id);

    const projects = await Project.find({ owner: { $in: publicUserIds } })
      .select('_id title slug description owner images')
      .populate('owner', 'username name avatarUrl')
      .lean();

    // Obtener analytics para cada proyecto
    const projectsWithAnalytics = await Promise.all(
      projects.map(async (project) => {
        const analytics = await Analytics.findOne({ projectId: project._id }).lean();
        
        const popularityScore = 
          ((analytics?.views?.total || 0) * 1) +
          ((analytics?.likes?.total || 0) * 10) +
          ((analytics?.comments?.total || 0) * 15);

        return {
          projectId: project._id,
          title: project.title,
          slug: project.slug,
          description: project.description,
          owner: project.owner,
          images: project.images,
          stats: {
            views: analytics?.views?.total || 0,
            likes: analytics?.likes?.total || 0,
            comments: analytics?.comments?.total || 0,
            engagement: analytics?.engagement?.interactions || 0,
            popularityScore
          }
        };
      })
    ).then(results => results.filter(p => p.owner)); // Filtrar proyectos sin propietario válido

    // Ordenar por popularity score
    const ranked = projectsWithAnalytics
      .sort((a, b) => b.stats.popularityScore - a.stats.popularityScore)
      .slice(parseInt(skip), parseInt(skip) + parseInt(limit));

    // Agregar posición
    const withRank = ranked.map((project, index) => ({
      ...project,
      rank: parseInt(skip) + index + 1
    }));

    res.json({
      projects: withRank,
      pagination: {
        skip: parseInt(skip),
        limit: parseInt(limit),
        total: projectsWithAnalytics.length
      }
    });
  } catch (error) {
    console.error('Error getting projects ranking:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener ranking de categorías/tags
 */
exports.getTagsRanking = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Obtener proyectos de usuarios públicos
    const publicUsers = await User.find({ 'privacy.isPrivate': false }).select('_id').lean();
    const publicUserIds = publicUsers.map(u => u._id);

    const projects = await Project.find({ owner: { $in: publicUserIds } })
      .select('_id tags')
      .lean();

    // Agrupar por tags
    const tagStats = {};
    
    for (const project of projects) {
      const projectAnalytics = await Analytics.findOne({ projectId: project._id }).lean();
      const score = 
        ((projectAnalytics?.views?.total || 0) * 1) +
        ((projectAnalytics?.likes?.total || 0) * 10) +
        ((projectAnalytics?.comments?.total || 0) * 15);

      for (const tag of project.tags || []) {
        if (!tagStats[tag]) {
          tagStats[tag] = {
            tag,
            projectCount: 0,
            totalScore: 0,
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0
          };
        }
        
        tagStats[tag].projectCount += 1;
        tagStats[tag].totalScore += score;
        tagStats[tag].totalViews += projectAnalytics?.views?.total || 0;
        tagStats[tag].totalLikes += projectAnalytics?.likes?.total || 0;
        tagStats[tag].totalComments += projectAnalytics?.comments?.total || 0;
      }
    }

    // Convertir a array y ordenar
    const ranked = Object.values(tagStats)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, parseInt(limit))
      .map((tag, index) => ({
        ...tag,
        rank: index + 1,
        avgScore: Math.round(tag.totalScore / tag.projectCount)
      }));

    res.json({
      tags: ranked,
      total: Object.keys(tagStats).length
    });
  } catch (error) {
    console.error('Error getting tags ranking:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener ranking semanal
 */
exports.getWeeklyRanking = async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;

    // Fecha de hace 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Obtener usuarios públicos
    const publicUsers = await User.find({ 'privacy.isPrivate': false })
      .select('_id username name avatarUrl bio followers')
      .lean();

    const userScores = await Promise.all(
      publicUsers.map(async (user) => {
        const userProjects = await Project.find({ owner: user._id }).select('_id');
        const projectIds = userProjects.map(p => p._id);

        const analyticsData = await Analytics.find({ 
          projectId: { $in: projectIds }
        });

        // Calcular vistas/likes/comentarios de esta semana
        let weeklyViews = 0;
        let weeklyLikes = 0;
        let weeklyComments = 0;

        for (const analytics of analyticsData) {
          // Sumar vistas diarias de esta semana
          if (analytics.views?.daily) {
            weeklyViews += analytics.views.daily
              .filter(d => new Date(d.date) >= sevenDaysAgo)
              .reduce((sum, d) => sum + d.count, 0);
          }

          // Sumar likes diarios de esta semana
          if (analytics.likes?.daily) {
            weeklyLikes += analytics.likes.daily
              .filter(d => new Date(d.date) >= sevenDaysAgo)
              .reduce((sum, d) => sum + d.count, 0);
          }

          // Sumar comentarios diarios de esta semana
          if (analytics.comments?.daily) {
            weeklyComments += analytics.comments.daily
              .filter(d => new Date(d.date) >= sevenDaysAgo)
              .reduce((sum, d) => sum + d.count, 0);
          }
        }

        const weeklyScore = (weeklyViews * 1) + (weeklyLikes * 10) + (weeklyComments * 15);

        return {
          userId: user._id,
          username: user.username,
          name: user.name,
          avatarUrl: user.avatarUrl,
          followers: user.followers.length,
          stats: {
            weeklyViews,
            weeklyLikes,
            weeklyComments,
            weeklyScore
          }
        };
      })
    );

    // Filtrar usuarios sin actividad
    const activeUsers = userScores.filter(u => u.stats.weeklyScore > 0);

    const ranked = activeUsers
      .sort((a, b) => b.stats.weeklyScore - a.stats.weeklyScore)
      .slice(parseInt(skip), parseInt(skip) + parseInt(limit));

    const withRank = ranked.map((user, index) => ({
      ...user,
      rank: parseInt(skip) + index + 1
    }));

    res.json({
      users: withRank,
      pagination: {
        skip: parseInt(skip),
        limit: parseInt(limit),
        total: activeUsers.length
      }
    });
  } catch (error) {
    console.error('Error getting weekly ranking:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener posición del usuario actual en el ranking
 */
exports.getUserRankingPosition = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('privacy');

    if (user.privacy.isPrivate) {
      return res.json({
        position: null,
        message: 'Tu cuenta es privada, no apareces en el ranking público'
      });
    }

    // Obtener todos los usuarios públicos y sus scores
    const publicUsers = await User.find({ 'privacy.isPrivate': false }).select('_id').lean();

    const rankings = await Promise.all(
      publicUsers.map(async (u) => {
        const projects = await Project.find({ owner: u._id }).select('_id');
        const projectIds = projects.map(p => p._id);
        const analytics = await Analytics.find({ projectId: { $in: projectIds } });

        const score = analytics.reduce((sum, a) => 
          sum + ((a.views?.total || 0) * 1) + ((a.likes?.total || 0) * 10) + ((a.comments?.total || 0) * 15),
          0
        );

        return { userId: u._id.toString(), score };
      })
    );

    const sorted = rankings.sort((a, b) => b.score - a.score);
    const position = sorted.findIndex(r => r.userId === userId.toString()) + 1;

    res.json({
      position,
      totalUsers: publicUsers.length
    });
  } catch (error) {
    console.error('Error getting user ranking position:', error);
    res.status(500).json({ error: error.message });
  }
};
