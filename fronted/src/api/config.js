// Detectar la URL del API dinámicamente basado en el hostname
const getAPIURL = () => {
  // Si estamos en producción (Netlify)
  if (typeof window !== 'undefined' && window.location.hostname.includes('netlify.app')) {
    return 'https://tfg-portafolios-production.up.railway.app';
  }
  
  // Variable de entorno (se lee en tiempo de build)
  const envURL = import.meta.env.VITE_API_URL;
  if (envURL) {
    console.log('📍 Usando API_URL del .env:', envURL);
    return envURL;
  }
  
  // Desarrollo local fallback
  console.log('📍 Usando API_URL de fallback: http://localhost:5000');
  return 'http://localhost:5000';
};

const API_URL = getAPIURL();
console.log('🔗 API_URL final:', API_URL);
export default API_URL;
