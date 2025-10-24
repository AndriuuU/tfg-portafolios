const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/authMiddleware');

// Importar controladores modulares
const {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getFollowingProjects
} = require('../controllers/project/projectCrudController');

const {
  addComment,
  deleteComment,
  likeComment,
  unlikeComment
} = require('../controllers/project/commentController');

const {
  likeProject,
  unlikeProject
} = require('../controllers/project/likeController');

const {
  saveProject,
  unsaveProject,
  getSavedProjects
} = require('../controllers/project/markerController');


// Obtener proyectos de usuarios que sigues (feed)
router.get('/feed/following', authMiddleware, getFollowingProjects);

// Obtener proyectos guardados
router.get('/saved', authMiddleware, getSavedProjects);

// Crear proyecto
router.post('/', authMiddleware, upload.array('images', 10), createProject);

// Obtener todos los proyectos del usuario
router.get('/', authMiddleware, getUserProjects);

// Obtener proyecto por ID
router.get('/:id', authMiddleware, getProjectById);

// Editar proyecto
router.put('/:id', authMiddleware, upload.array('images', 10), updateProject);

// Subir imagen(es) a proyecto existente
router.post('/:id/upload', authMiddleware, upload.array('images', 10), updateProject);

// Eliminar proyecto
router.delete('/:id', authMiddleware, deleteProject);

// Likes en proyectos
router.post('/:id/like', authMiddleware, likeProject);
router.delete('/:id/like', authMiddleware, unlikeProject);

// Guardar en marcadores
router.post('/:id/save', authMiddleware, saveProject);
router.delete('/:id/save', authMiddleware, unsaveProject);

// Añadir comentario
router.post('/:id/comments', authMiddleware, addComment);

// Eliminar comentario
router.delete('/:id/comments/:commentId', authMiddleware, deleteComment);

// Likes en comentarios
router.post('/:id/comments/:commentId/like', authMiddleware, likeComment);
router.delete('/:id/comments/:commentId/like', authMiddleware, unlikeComment);

module.exports = router;
