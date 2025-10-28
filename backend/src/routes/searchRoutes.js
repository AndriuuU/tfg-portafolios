const express = require('express');
const router = express.Router();
const { 
  searchProjects, 
  searchUsers, 
  getPopularTags 
} = require('../controllers/social/searchController');

// Búsqueda de proyectos
router.get('/projects', searchProjects);

// Búsqueda de usuarios
router.get('/users', searchUsers);

// Obtener tags populares
router.get('/tags/popular', getPopularTags);

module.exports = router;
