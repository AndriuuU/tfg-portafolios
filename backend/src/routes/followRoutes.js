const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  followUser,
  unfollowUser,
  removeFollower,
  acceptFollowRequest,
  rejectFollowRequest,
  blockUser,
  unblockUser,
  getFollowers,
  getFollowing,
  getFollowRequests,
  getBlockedUsers,
  updatePrivacySettings,
  checkRelationship
} = require('../controllers/social/followController');

// Rutas de seguimiento
router.post('/:userId/follow', authMiddleware, followUser);
router.delete('/:userId/unfollow', authMiddleware, unfollowUser);
router.delete('/:userId/remove-follower', authMiddleware, removeFollower);

// Solicitudes de seguimiento
router.post('/:userId/accept-request', authMiddleware, acceptFollowRequest);
router.post('/:userId/reject-request', authMiddleware, rejectFollowRequest);
router.get('/requests', authMiddleware, getFollowRequests);

// Bloqueo
router.post('/:userId/block', authMiddleware, blockUser);
router.delete('/:userId/unblock', authMiddleware, unblockUser);
router.get('/blocked', authMiddleware, getBlockedUsers);

// Obtener listas
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);

// Configuración de privacidad
router.put('/privacy', authMiddleware, updatePrivacySettings);

// Verificar relación
router.get('/:userId/relationship', authMiddleware, checkRelationship);

module.exports = router;
