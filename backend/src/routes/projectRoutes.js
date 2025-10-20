const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/authMiddleware');
const {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addComment,
  deleteComment
} = require('../controllers/projectController');

// Crear proyecto
router.post('/', authMiddleware, upload.single('image'), createProject);

// Obtener todos los proyectos del usuario
router.get('/', authMiddleware, getUserProjects);

// Obtener proyecto por ID
router.get('/:id', authMiddleware, getProjectById);

// Editar proyecto
router.put('/:id', authMiddleware, upload.single('image'), updateProject);

// Subir imagen a proyecto existente
router.post('/:id/upload', authMiddleware, upload.single('image'), updateProject);

// Eliminar proyecto
router.delete('/:id', authMiddleware, deleteProject);

// Añadir comentario
router.post('/:id/comments', authMiddleware, addComment);

// Eliminar comentario
router.delete('/:id/comments/:commentId', authMiddleware, deleteComment);

module.exports = router;
