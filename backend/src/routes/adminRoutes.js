const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const reportController = require('../controllers/admin/reportController');

// Crear reporte (cualquier usuario autenticado)
router.post('/reports', authMiddleware, reportController.createReport);

// Obtener estadísticas de reportes (solo admin)
router.get('/reports/stats', authMiddleware, adminMiddleware, reportController.getReportStats);

// Obtener todos los reportes (solo admin)
router.get('/reports', authMiddleware, adminMiddleware, reportController.getAllReports);

// Obtener reporte específico (solo admin)
router.get('/reports/:id', authMiddleware, adminMiddleware, reportController.getReportById);

// Actualizar estado de reporte (solo admin)
router.put('/reports/:id/status', authMiddleware, adminMiddleware, reportController.updateReportStatus);

// Procesar acción sobre reporte (solo admin)
router.post('/reports/:id/action', authMiddleware, adminMiddleware, reportController.processReportAction);

// Rechazar reporte (solo admin)
router.post('/reports/:id/reject', authMiddleware, adminMiddleware, reportController.rejectReport);

// RUTAS ESPECÍFICAS PRIMERO (antes de las genéricas)
// Reactivar usuario (solo admin)
router.post('/users/reactivate', authMiddleware, adminMiddleware, reportController.reactivateUser);

// Obtener usuarios suspendidos/baneados (solo admin)
router.get('/users/suspended', authMiddleware, adminMiddleware, reportController.getSuspendedUsers);

// Obtener proyectos de un usuario (solo admin) - ANTES de /users para evitar conflictos
router.get('/users/:id/projects', authMiddleware, adminMiddleware, reportController.getUserProjects);

// Suspender usuario directamente (solo admin)
router.post('/users/:id/suspend', authMiddleware, adminMiddleware, reportController.suspendUser);

// Banear usuario directamente (solo admin)
router.post('/users/:id/ban', authMiddleware, adminMiddleware, reportController.banUser);

// Eliminar usuario directamente (solo admin)
router.post('/users/:id/delete', authMiddleware, adminMiddleware, reportController.deleteUser);

// Otorgar/revocar permisos de admin (solo admin)
router.put('/users/:id/admin', authMiddleware, adminMiddleware, reportController.toggleAdminPermission);

// Obtener todos los usuarios (solo admin) - DESPUÉS de las rutas específicas
router.get('/users', authMiddleware, adminMiddleware, reportController.getAllUsers);

// Eliminar proyecto de un usuario (solo admin)
router.delete('/projects/:projectId', authMiddleware, adminMiddleware, reportController.deleteUserProject);

module.exports = router;
