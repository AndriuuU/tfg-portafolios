const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/authMiddleware');
const {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

// Crear proyecto
router.post('/', authMiddleware, createProject);

// Obtener todos los proyectos del usuario
router.get('/', authMiddleware, getUserProjects);

// Obtener proyecto por ID
router.get('/:id', authMiddleware, getProjectById);

// Editar proyecto
router.put('/:id', authMiddleware, upload.single('image'), updateProject);

// Eliminar proyecto
router.delete('/:id', authMiddleware, deleteProject);

module.exports = router;
