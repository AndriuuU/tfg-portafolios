import { useApi } from './useApi';
import API from '../api/api';

/**
 * Hook para obtener portfolio de un usuario por username
 */
export const usePortfolio = (username) => {
  return useApi(() => API.get(`/users/${username}`), [username]);
};

/**
 * Hook para obtener usuarios recomendados
 */
export const useRecommendedUsers = () => {
  return useApi(() => API.get('/users/recommended/users'));
};
