import axios from 'axios';

// Crear función que devuelve la URL dinámicamente
const getAPIURL = () => {
  // Si estamos en Netlify (production)
  if (typeof window !== 'undefined' && window.location.hostname.includes('netlify.app')) {
    return 'https://tfg-portafolios-production.up.railway.app';
  }
  // Desarrollo local
  return 'http://localhost:5000';
};

const API = axios.create({
  baseURL: `${getAPIURL()}/api`
});

// Agregar token a todas las requests autenticadas
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Obtener ranking global de usuarios
export const getGlobalRanking = (skip = 0, limit = 20) => {
  return API.get(`/ranking/global?skip=${skip}&limit=${limit}`);
};

// Obtener ranking de proyectos
export const getProjectsRanking = (skip = 0, limit = 20) => {
  return API.get(`/ranking/projects?skip=${skip}&limit=${limit}`);
};

// Obtener ranking de categorías/tags
export const getTagsRanking = (limit = 20) => {
  return API.get(`/ranking/tags?limit=${limit}`);
};

// Obtener ranking semanal
export const getWeeklyRanking = (skip = 0, limit = 20) => {
  return API.get(`/ranking/weekly?skip=${skip}&limit=${limit}`);
};

// Obtener posición del usuario actual
export const getUserRankingPosition = () => {
  return API.get('/ranking/my-position');
};
