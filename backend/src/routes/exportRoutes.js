const express = require('express');
const { exportPortfolioPDF, exportProjectPDF } = require('../controllers/exportController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Exportar portfolio completo a PDF
router.get('/portfolio/pdf', exportPortfolioPDF);

// Exportar proyecto específico a PDF
router.get('/project/:projectId/pdf', exportProjectPDF);

module.exports = router;
