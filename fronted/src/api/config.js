// Detectar la URL del API en tiempo de ejecución
let API_URL = null;

const getAPIURL = () => {
  if (API_URL) return API_URL;
  
  // Variables de entorno (disponibles en tiempo de build)
  const envURL = import.meta.env.VITE_API_URL;
  console.log('🔍 import.meta.env.VITE_API_URL:', envURL);
  
  if (envURL) {
    API_URL = envURL;
    console.log('✅ Usando URL del entorno:', API_URL);
    return API_URL;
  }
  
  // Si no hay variable de entorno, usar localhost por defecto
  API_URL = 'http://localhost:5000';
  console.log('✅ Usando URL de fallback:', API_URL);
  return API_URL;
};

// Llamar la función inmediatamente
const API_URL_VALUE = getAPIURL();
console.log('🔗 API_URL final:', API_URL_VALUE);

export default API_URL_VALUE;
