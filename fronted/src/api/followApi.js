import API from './api';

// Seguimiento
export const followUser = (userId) => API.post(`/follow/${userId}/follow`);
export const unfollowUser = (userId) => API.delete(`/follow/${userId}/unfollow`);
export const removeFollower = (userId) => API.delete(`/follow/${userId}/remove-follower`);

// Solicitudes
export const getFollowRequests = () => API.get('/follow/requests');
export const acceptFollowRequest = (userId) => API.post(`/follow/${userId}/accept-request`);
export const rejectFollowRequest = (userId) => API.post(`/follow/${userId}/reject-request`);

// Bloqueo
export const blockUser = (userId) => API.post(`/follow/${userId}/block`);
export const unblockUser = (userId) => API.delete(`/follow/${userId}/unblock`);
export const getBlockedUsers = () => API.get('/follow/blocked');

// Listas
export const getFollowers = (userId) => API.get(`/follow/${userId}/followers`);
export const getFollowing = (userId) => API.get(`/follow/${userId}/following`);

// Privacidad
export const updatePrivacySettings = (settings) => API.put('/follow/privacy', settings);

// Relación
export const checkRelationship = (userId) => API.get(`/follow/${userId}/relationship`);
