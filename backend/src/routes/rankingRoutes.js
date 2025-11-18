const express = require('express');
const {
  getGlobalRanking,
  getProjectsRanking,
  getTagsRanking,
  getWeeklyRanking,
  getUserRankingPosition
} = require('../controllers/rankingController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Rankings públicos (sin autenticación requerida)
router.get('/global', getGlobalRanking);
router.get('/projects', getProjectsRanking);
router.get('/tags', getTagsRanking);
router.get('/weekly', getWeeklyRanking);

// Rankings autenticados
router.get('/my-position', authMiddleware, getUserRankingPosition);

module.exports = router;
