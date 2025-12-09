// Detectar la URL del API dinámicamente basado en el hostname
const getAPIURL = () => {
  // Si estamos en producción (Netlify)
  if (window.location.hostname.includes('netlify.app')) {
    return 'https://tfg-portafolios-production.up.railway.app';
  }
  
  // Desarrollo local
  return 'http://localhost:5000';
};

const API_URL = getAPIURL();
export default API_URL;
