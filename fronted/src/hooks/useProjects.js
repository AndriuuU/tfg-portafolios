import { useApi } from './useApi';
import { 
  getProjects, 
  getProjectById, 
  getFollowingProjects, 
  getSavedProjects,
  getUserProjects
} from '../api/api';

/**
 * Hook para obtener proyectos del usuario autenticado
 */
export const useMyProjects = () => {
  return useApi(() => getUserProjects());
};

/**
 * Hook para obtener un proyecto específico por ID
 */
export const useProject = (id) => {
  return useApi(() => getProjectById(id), [id]);
};

/**
 * Hook para obtener proyectos de usuarios que sigues
 */
export const useFollowingProjects = () => {
  return useApi(() => getFollowingProjects());
};

/**
 * Hook para obtener proyectos guardados
 */
export const useSavedProjects = () => {
  return useApi(() => getSavedProjects());
};
