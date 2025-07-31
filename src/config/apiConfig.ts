/**
 * Configuración centralizada de API para MarVera
 * 
 * Este archivo contiene toda la configuración relacionada con el servidor
 * y define constantes para timeouts y URLs.
 */

// URL Base del servidor API
// En producción será el dominio real
// En desarrollo, se lee de las variables de entorno o se usa la IP de desarrollo
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://187.33.155.127:3001';

// Versión de la API
export const API_VERSION = 'v1';

// Endpoints de la API
export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/api/health`,
  FEATURED_PRODUCTS: `${API_BASE_URL}/api/products/featured`,
  PRODUCTS: `${API_BASE_URL}/api/products`,
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    VERIFY: `${API_BASE_URL}/api/auth/verify`,
  },
  ORDERS: `${API_BASE_URL}/api/orders`,
  USER: `${API_BASE_URL}/api/user`,
};

// Configuración de la API
export const API_CONFIG = {
  // Tiempo máximo de espera para peticiones (en ms)
  TIMEOUT: 3000,
  
  // Headers comunes para todas las peticiones
  COMMON_HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'User-Agent': 'MarVera Frontend'
  },
  
  // Configuración de caché
  CACHE: {
    // Tiempo de vida de la caché (en ms)
    TTL: 5 * 60 * 1000, // 5 minutos
    // Tamaño máximo de la caché (en bytes)
    MAX_SIZE: 5 * 1024 * 1024, // 5 MB
  },
};

// Opciones para el servidor en desarrollo
export const DEV_SERVER_OPTIONS = {
  PORT: 3001,
  HOST: '0.0.0.0',
  CORS_ORIGIN: ['http://localhost:5173', 'https://marvera.com'],
};

// Opciones para el servidor en producción
export const PROD_SERVER_OPTIONS = {
  PORT: 3001,
  HOST: '0.0.0.0',
  CORS_ORIGIN: ['https://marvera.com'],
};

// URLs de imágenes
export const IMAGE_PATHS = {
  PRODUCTS: './assets/products',
  CATEGORIES: './assets/categories',
  BANNERS: './assets/banners',
  LOGOS: './assets/logos',
  // Imagen por defecto para productos sin imagen
  DEFAULT_PRODUCT: './assets/products/default.webp',
};

// Rutas para assets estáticos
export const STATIC_PATHS = {
  PRODUCTS: '/assets/products',
  CATEGORIES: '/assets/categories',
  BANNERS: '/assets/banners',
  LOGOS: '/assets/logos',
};

// Función para verificar si el servidor está disponible
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    const response = await fetch(API_ENDPOINTS.HEALTH, {
      method: 'GET',
      headers: API_CONFIG.COMMON_HEADERS,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('🔴 Error al verificar estado del servidor:', error);
    return false;
  }
};

/**
 * Función genérica para hacer peticiones a la API con manejo de errores
 * y timeout automático.
 */
export const apiRequest = async <T>(
  url: string,
  options: RequestInit = {},
  fallbackData?: T
): Promise<T> => {
  // Mezclar los headers por defecto con los proporcionados
  const headers = {
    ...API_CONFIG.COMMON_HEADERS,
    ...options.headers
  };
  
  // Configurar timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log(`⏰ Timeout alcanzado para ${url}, abortando petición`);
    controller.abort();
  }, API_CONFIG.TIMEOUT);
  
  try {
    console.log(`🔍 Intentando conectar a: ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`⚠️ API respondió con error: ${response.status} para ${url}`);
      if (fallbackData !== undefined) {
        console.log('📦 Usando datos fallback');
        return fallbackData;
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Datos recibidos de: ${url}`);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`❌ Error en petición a ${url}:`, error);
    
    if (fallbackData !== undefined) {
      console.log('📦 Usando datos fallback debido a error');
      return fallbackData;
    }
    throw error;
  }
};

export default {
  API_BASE_URL,
  API_VERSION,
  API_ENDPOINTS,
  API_CONFIG,
  IMAGE_PATHS,
  STATIC_PATHS,
  checkServerHealth,
  apiRequest
};
