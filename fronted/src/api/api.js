import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Middleware: añadir token si existe
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ==================== AUTENTICACIÓN ====================
export const login = (credentials) => API.post('/auth/login', credentials);
export const register = (userData) => API.post('/auth/register', userData);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const changePassword = (passwords) => API.put('/auth/password', passwords);
export const updateAvatar = (formData) => API.put('/auth/avatar', formData);
export const deleteAccount = (password) => API.delete('/auth/account', { data: { password } });

// ==================== EMAIL ====================
export const verifyEmail = (token) => API.get(`/email/verify/${token}`);
export const resendVerificationEmail = (email) => API.post('/email/resend-verification', { email });
export const forgotPassword = (email) => API.post('/email/forgot-password', { email });
export const resetPassword = (token, newPassword) => API.post(`/email/reset-password/${token}`, { newPassword });
export const getEmailStatus = () => API.get('/email/status');

// ==================== PROYECTOS ====================
export const getProjects = () => API.get('/projects'); // Obtener proyectos del usuario autenticado
export const getProjectById = (id) => API.get(`/projects/${id}`);
export const createProject = (formData) => API.post('/projects', formData);
export const updateProject = (id, formData) => API.put(`/projects/${id}`, formData);
export const deleteProject = (id) => API.delete(`/projects/${id}`);
export const getFollowingProjects = () => API.get('/projects/feed/following');
export const getSavedProjects = () => API.get('/projects/saved');
export const getUserProjects = () => API.get('/projects'); // Obtener proyectos del usuario autenticado

// ==================== BÚSQUEDA ====================
export const searchProjects = (params) => API.get('/search/projects', { params });
// Ejemplo de params: { q: 'react', tags: 'frontend,react', owner: 'username', sort: 'recent', page: 1, limit: 10 }

// ==================== LIKES ====================
export const likeProject = (projectId) => API.post(`/projects/${projectId}/like`);
export const unlikeProject = (projectId) => API.delete(`/projects/${projectId}/like`);

// ==================== GUARDAR EN MARCADORES ====================
export const saveProject = (projectId) => API.post(`/projects/${projectId}/save`);
export const unsaveProject = (projectId) => API.delete(`/projects/${projectId}/save`);

// ==================== COMENTARIOS ====================
export const addComment = (projectId, text) => API.post(`/projects/${projectId}/comments`, { text });
export const deleteComment = (projectId, commentId) => API.delete(`/projects/${projectId}/comments/${commentId}`);
export const likeComment = (projectId, commentId) => API.post(`/projects/${projectId}/comments/${commentId}/like`);
export const unlikeComment = (projectId, commentId) => API.delete(`/projects/${projectId}/comments/${commentId}/like`);

export default API;
