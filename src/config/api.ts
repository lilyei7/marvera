// Simple API configuration
const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development';
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001' 
  : 'https://marvera.mx';
