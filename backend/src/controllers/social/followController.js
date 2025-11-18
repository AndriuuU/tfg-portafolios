const User = require('../../models/User');
const { createNotification } = require('./notificationController');

// Seguir a un usuario
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({ error: 'No puedes seguirte a ti mismo' });
    }

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({ error: 'Tu usuario no fue encontrado' });
    }

    if (!userToFollow) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si está bloqueado
    if (currentUser.blockedUsers.includes(userId) || userToFollow.blockedBy.includes(currentUserId)) {
      return res.status(403).json({ error: 'No puedes seguir a este usuario' });
    }

    // Verificar si ya lo sigue
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ error: 'Ya sigues a este usuario' });
    }

    // Si la cuenta es privada, enviar solicitud
    if (userToFollow.privacy.isPrivate) {
      if (userToFollow.followRequests.includes(currentUserId)) {
        return res.status(400).json({ error: 'Ya enviaste una solicitud a este usuario' });
      }
      
      userToFollow.followRequests.push(currentUserId);
      await userToFollow.save();

      // Create follow_request notification
      await createNotification(userId, currentUserId, 'follow_request', { message: 'Quiere seguirte' });
      
      return res.json({ 
        message: 'Solicitud de seguimiento enviada',
        status: 'pending' 
      });
    }

    // Seguir directamente si la cuenta es pública
    currentUser.following.push(userId);
    userToFollow.followers.push(currentUserId);

    await currentUser.save();
    await userToFollow.save();

    // Create follow notification
    await createNotification(userId, currentUserId, 'follow', { message: 'Empezó a seguirte' });

    res.json({ 
      message: 'Usuario seguido correctamente',
      status: 'following'
    });
  } catch (error) {
    console.error('Error followUser:', error);
    res.status(500).json({ error: error.message });
  }
};

// Dejar de seguir
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({ error: 'No puedes dejar de seguirte a ti mismo' });
    }

    const currentUser = await User.findById(currentUserId);
    const userToUnfollow = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ error: 'Tu usuario no fue encontrado' });
    }

    if (!userToUnfollow) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ message: 'Dejaste de seguir al usuario' });
  } catch (error) {
    console.error('Error unfollowUser:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar seguidor
exports.removeFollower = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const follower = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ error: 'Tu usuario no fue encontrado' });
    }

    if (!follower) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    currentUser.followers = currentUser.followers.filter(id => id.toString() !== userId);
    follower.following = follower.following.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await follower.save();

    res.json({ message: 'Seguidor eliminado' });
  } catch (error) {
    console.error('Error removeFollower:', error);
    res.status(500).json({ error: error.message });
  }
};

// Aceptar solicitud de seguimiento
exports.acceptFollowRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const requester = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ error: 'Tu usuario no fue encontrado' });
    }

    if (!requester) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!currentUser.followRequests.includes(userId)) {
      return res.status(400).json({ error: 'No hay solicitud pendiente de este usuario' });
    }

    // Remover de solicitudes y añadir como seguidor
    currentUser.followRequests = currentUser.followRequests.filter(id => id.toString() !== userId);
    currentUser.followers.push(userId);
    requester.following.push(currentUserId);

    await currentUser.save();
    await requester.save();

    // Create notification that follow request was accepted
    await createNotification(userId, currentUserId, 'follow', { message: 'Aceptó tu solicitud de seguimiento' });

    res.json({ message: 'Solicitud aceptada' });
  } catch (error) {
    console.error('Error acceptFollowRequest:', error);
    res.status(500).json({ error: error.message });
  }
};

// Rechazar solicitud de seguimiento
exports.rejectFollowRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({ error: 'Tu usuario no fue encontrado' });
    }

    if (!currentUser.followRequests.includes(userId)) {
      return res.status(400).json({ error: 'No hay solicitud pendiente de este usuario' });
    }

    currentUser.followRequests = currentUser.followRequests.filter(id => id.toString() !== userId);
    await currentUser.save();

    res.json({ message: 'Solicitud rechazada' });
  } catch (error) {
    console.error('Error rejectFollowRequest:', error);
    res.status(500).json({ error: error.message });
  }
};

// Bloquear usuario
exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({ error: 'No puedes bloquearte a ti mismo' });
    }

    const currentUser = await User.findById(currentUserId);
    const userToBlock = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ error: 'Tu usuario no fue encontrado' });
    }

    if (!userToBlock) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (currentUser.blockedUsers.includes(userId)) {
      return res.status(400).json({ error: 'Este usuario ya está bloqueado' });
    }

    // Añadir a bloqueados
    currentUser.blockedUsers.push(userId);
    userToBlock.blockedBy.push(currentUserId);

    // Eliminar relaciones de seguimiento
    currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
    currentUser.followers = currentUser.followers.filter(id => id.toString() !== userId);
    userToBlock.following = userToBlock.following.filter(id => id.toString() !== currentUserId);
    userToBlock.followers = userToBlock.followers.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await userToBlock.save();

    res.json({ message: 'Usuario bloqueado' });
  } catch (error) {
    console.error('Error blockUser:', error);
    res.status(500).json({ error: error.message });
  }
};

// Desbloquear usuario
exports.unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const userToUnblock = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ error: 'Tu usuario no fue encontrado' });
    }

    if (!userToUnblock) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id.toString() !== userId);
    userToUnblock.blockedBy = userToUnblock.blockedBy.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await userToUnblock.save();

    res.json({ message: 'Usuario desbloqueado' });
  } catch (error) {
    console.error('Error unblockUser:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener seguidores
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    const user = await User.findById(userId)
      .populate('followers', 'username name avatarUrl');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar privacidad
    if (!user.privacy.showFollowers && userId !== currentUserId) {
      return res.status(403).json({ error: 'Este usuario ha ocultado sus seguidores' });
    }

    res.json({ followers: user.followers });
  } catch (error) {
    console.error('Error getFollowers:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener siguiendo
exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    const user = await User.findById(userId)
      .populate('following', 'username name avatarUrl');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar privacidad
    if (!user.privacy.showFollowing && userId !== currentUserId) {
      return res.status(403).json({ error: 'Este usuario ha ocultado a quién sigue' });
    }

    res.json({ following: user.following });
  } catch (error) {
    console.error('Error getFollowing:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener solicitudes de seguimiento pendientes
exports.getFollowRequests = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const user = await User.findById(currentUserId)
      .populate('followRequests', 'username name avatarUrl');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ requests: user.followRequests || [] });
  } catch (error) {
    console.error('Error getFollowRequests:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener usuarios bloqueados
exports.getBlockedUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const user = await User.findById(currentUserId)
      .populate('blockedUsers', 'username name avatarUrl');

    res.json({ blockedUsers: user.blockedUsers || [] });
  } catch (error) {
    console.error('Error getBlockedUsers:', error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar configuración de privacidad
exports.updatePrivacySettings = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { showFollowers, showFollowing, allowFollowRequests, isPrivate } = req.body;

    const user = await User.findById(currentUserId);

    if (showFollowers !== undefined) user.privacy.showFollowers = showFollowers;
    if (showFollowing !== undefined) user.privacy.showFollowing = showFollowing;
    if (allowFollowRequests !== undefined) user.privacy.allowFollowRequests = allowFollowRequests;
    if (isPrivate !== undefined) user.privacy.isPrivate = isPrivate;

    await user.save();

    res.json({ 
      message: 'Configuración de privacidad actualizada',
      privacy: user.privacy 
    });
  } catch (error) {
    console.error('Error updatePrivacySettings:', error);
    res.status(500).json({ error: error.message });
  }
};

// Verificar relación entre usuarios
exports.checkRelationship = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.json({ 
        isOwnProfile: true,
        isFollowing: false,
        isFollower: false,
        isBlocked: false,
        hasPendingRequest: false
      });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      isOwnProfile: false,
      isFollowing: currentUser.following.includes(userId),
      isFollower: currentUser.followers.includes(userId),
      isBlocked: currentUser.blockedUsers.includes(userId),
      isBlockedBy: currentUser.blockedBy.includes(userId),
      hasPendingRequest: targetUser.followRequests.includes(currentUserId)
    });
  } catch (error) {
    console.error('Error checkRelationship:', error);
    res.status(500).json({ error: error.message });
  }
};
