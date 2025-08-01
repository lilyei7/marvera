// Environment configuration for MarVera
const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDevelopment 
  ? 'https://marvera.mx' 
  : 'https://marvera.mx';

export const FRONTEND_URL = isDevelopment 
  ? 'http://marvera.mx' 
  : 'https://marvera.mx';

// Export environment info
export const ENVIRONMENT = {
  isDevelopment,
  isProduction: !isDevelopment,
  API_BASE_URL,
  FRONTEND_URL
};


