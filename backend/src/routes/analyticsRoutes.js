const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getProjectAnalytics,
  getUserProjectsAnalytics,
  getTopProjects,
  getDashboard,
  getUserActivityEndpoint,
  getAudienceStats,
  exportAnalytics
} = require('../controllers/analyticsController');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Dashboard principal de estadísticas
router.get('/dashboard', getDashboard);

// Analytics de un proyecto específico
router.get('/project/:projectId', getProjectAnalytics);

// Analytics de todos los proyectos del usuario
router.get('/projects', getUserProjectsAnalytics);

// Top 5 proyectos más populares
router.get('/top-projects', getTopProjects);

// Actividad del usuario
router.get('/activity', getUserActivityEndpoint);

// Estadísticas de público/audiencia
router.get('/audience', getAudienceStats);

// Exportar analytics
router.get('/export', exportAnalytics);

module.exports = router;
