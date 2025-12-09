import axios from "axios";

// Crear función que devuelve la URL dinámicamente
const getAPIURL = () => {
  // Si estamos en Netlify (production)
  if (typeof window !== 'undefined' && window.location.hostname.includes('netlify.app')) {
    console.log('🌐 Detectado Netlify, usando: https://tfg-portafolios-production.up.railway.app');
    return 'https://tfg-portafolios-production.up.railway.app';
  }
  
  // Desarrollo local
  console.log('✅ Usando localhost:5000');
  return 'http://localhost:5000';
};

// Crear la instancia de Axios con la URL dinámica
const API = axios.create({
  baseURL: `${getAPIURL()}/api`,
});

// Middleware: añadir token si existe
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Interceptor de respuesta: manejar errores de autenticación (cuentas bloqueadas)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // Detectar cuentas suspendidas, baneadas o eliminadas
      if (status === 403 && data.type) {
        const messages = {
          'ACCOUNT_DELETED': `Tu cuenta ha sido eliminada. ${data.reason || ''}`,
          'ACCOUNT_BANNED': `Tu cuenta ha sido baneada permanentemente. ${data.reason || ''}`,
          'ACCOUNT_SUSPENDED': `Tu cuenta ha sido suspendida. ${data.reason || ''}`
        };

        const message = messages[data.type] || data.error;
        
        // Cerrar sesión y redirigir
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Mostrar alerta al usuario
        alert(`⚠️ ${message}\n\nSerás redirigido al inicio de sesión.`);
        
        // Redirigir al login
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

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

// ==================== COLABORADORES - INVITACIONES ====================
export const inviteCollaborator = (projectId, data) => API.post(`/projects/${projectId}/collaborators/invite`, data);
// data: { userId o username o email, role: 'editor' o 'viewer' }
export const acceptInvitation = (projectId) => API.post(`/projects/${projectId}/collaborators/accept`);
export const rejectInvitation = (projectId) => API.post(`/projects/${projectId}/collaborators/reject`);
export const getMyInvitations = () => API.get('/projects/invitations/my');

// ==================== COLABORADORES - GESTIÓN ====================
export const getCollaborators = (projectId) => API.get(`/projects/${projectId}/collaborators`);
export const removeCollaborator = (projectId, userId) => API.delete(`/projects/${projectId}/collaborators/${userId}`);
export const updateCollaboratorRole = (projectId, userId, role) => 
  API.put(`/projects/${projectId}/collaborators/${userId}/role`, { role });
export const leaveProject = (projectId) => API.post(`/projects/${projectId}/collaborators/leave`);

// ==================== USUARIOS ====================
export const getRecommendedUsers = () => API.get('/users/recommended/users');
export const getUserByUsername = (username) => API.get(`/users/${username}`);

// ==================== NOTIFICACIONES ====================
export const getNotifications = (unreadOnly = false) => 
  API.get('/notifications', { params: { unreadOnly } });
export const markNotificationAsRead = (notificationId) => 
  API.put(`/notifications/${notificationId}/read`);
export const markAllNotificationsAsRead = () => 
  API.put('/notifications/read/all');
export const deleteNotification = (notificationId) => 
  API.delete(`/notifications/${notificationId}`);
export const getNotificationPreferences = () => 
  API.get('/auth/notifications/preferences');
export const updateNotificationPreferences = (preferences) => 
  API.put('/auth/notifications/preferences', preferences);

// ==================== ADMIN - REPORTES ====================
// Crear reporte (cualquier usuario autenticado)
export const createReport = (data) => API.post('/admin/reports', data);

// Obtener todos los reportes (solo admin)
export const getReports = (params) => API.get('/admin/reports', { params });

// Obtener estadísticas de reportes (solo admin)
export const getReportStats = () => API.get('/admin/reports/stats');

// Obtener reporte específico (solo admin)
export const getReportById = (id) => API.get(`/admin/reports/${id}`);

// Actualizar estado de reporte (solo admin)
export const updateReportStatus = (id, data) => API.put(`/admin/reports/${id}/status`, data);

// Procesar acción sobre reporte (solo admin)
export const processReportAction = (id, data) => API.post(`/admin/reports/${id}/action`, data);

// Rechazar reporte (solo admin)
export const rejectReport = (id, data) => API.post(`/admin/reports/${id}/reject`, data);

// ==================== ADMIN - USUARIOS ====================
// Suspender/banear usuario (solo admin)
export const suspendUser = (data) => API.post('/admin/users/suspend', data);

// Reactivar usuario (solo admin)
export const reactivateUser = (data) => API.post('/admin/users/reactivate', data);

// Obtener usuarios suspendidos/baneados (solo admin)
export const getSuspendedUsers = (type = 'suspended') => API.get(`/admin/users/suspended`, { params: { type } });

export default API;
