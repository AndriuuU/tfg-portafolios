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

// Funciones de API para usuarios
export const getRecommendedUsers = () => API.get('/users/recommended/users');

// Funciones de API para proyectos
export const getFollowingProjects = () => API.get('/projects/feed/following');
export const getSavedProjects = () => API.get('/projects/saved');

// Likes en proyectos
export const likeProject = (projectId) => API.post(`/projects/${projectId}/like`);
export const unlikeProject = (projectId) => API.delete(`/projects/${projectId}/like`);

// Guardar en marcadores
export const saveProject = (projectId) => API.post(`/projects/${projectId}/save`);
export const unsaveProject = (projectId) => API.delete(`/projects/${projectId}/save`);

// Comentarios
export const addComment = (projectId, text) => API.post(`/projects/${projectId}/comments`, { text });
export const deleteComment = (projectId, commentId) => API.delete(`/projects/${projectId}/comments/${commentId}`);

// Likes en comentarios
export const likeComment = (projectId, commentId) => API.post(`/projects/${projectId}/comments/${commentId}/like`);
export const unlikeComment = (projectId, commentId) => API.delete(`/projects/${projectId}/comments/${commentId}/like`);

export default API;
