/**
 * ===========================
 * MARVERA ROUTES CONFIGURATION
 * ===========================
 * 
 * Configuración centralizada de todas las rutas y URLs del sistema MarVera
 * 
 * DOMINIO PRINCIPAL: https://marvera.mx
 * BACKEND PORT: 3001
 * SSL: Habilitado (solo HTTPS)
 * 
 * IMPORTANTE: 
 * - NUNCA usar http:// en producción
 * - SIEMPRE usar https://marvera.mx como base
 * - NO usar localhost en código de producción
 * - Assets deben servirse desde /assets/ con permisos 755
 */

// ===========================
// CONFIGURACIÓN BASE
// ===========================

export const DOMAIN_CONFIG = {
  PRODUCTION_DOMAIN: 'marvera.mx',
  PRODUCTION_URL: 'https://marvera.mx',
  BACKEND_PORT: 3001,
  SSL_ENABLED: true,
} as const;

// ===========================
// API BASE URL
// ===========================

/**
 * URL base para todas las llamadas API
 * DEBE ser siempre https://marvera.mx en producción
 */
export const API_BASE_URL = DOMAIN_CONFIG.PRODUCTION_URL;

// ===========================
// RUTAS DE API BACKEND
// ===========================

export const API_ROUTES = {
  // Sistema de salud
  HEALTH: '/api/health',
  
  // Autenticación
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGIN_SIMPLE: '/api/auth/login-simple',
    REGISTER: '/api/auth/register',
    VERIFY: '/api/auth/verify',
    LOGOUT: '/api/auth/logout',
  },
  
  // Productos
  PRODUCTS: {
    LIST: '/api/products',
    FEATURED: '/api/products/featured',
    CATEGORIES: '/api/products/categories',
    BY_ID: (id: string) => `/api/products/${id}`,
  },
  
  // Productos de mayoreo
  WHOLESALE_PRODUCTS: '/api/wholesale-products',
  
  // Categorías
  CATEGORIES: {
    LIST: '/api/categories',
    BY_ID: (id: string) => `/api/categories/${id}`,
  },
  
  // Sucursales
  BRANCHES: {
    PUBLIC: '/api/branches/public',      // ✅ Para usuarios públicos
    ADMIN_LIST: '/api/branches',         // 🔐 Para administradores
    CREATE: '/api/branches',             // 🔐 POST - Crear sucursal
    UPDATE: (id: string) => `/api/branches/${id}`,    // 🔐 PUT - Actualizar
    DELETE: (id: string) => `/api/branches/${id}`,    // 🔐 DELETE - Eliminar
    UPLOAD_IMAGE: '/api/branches/upload-image',       // 🔐 POST - Subir imagen
  },
  
  // Administración - Productos
  ADMIN_PRODUCTS: {
    LIST: '/api/admin/products',
    CREATE: '/api/admin/products',
    UPDATE: (id: string) => `/api/admin/products/${id}`,
    DELETE: (id: string) => `/api/admin/products/${id}`,
  },
  
  // Administración - Órdenes
  ADMIN_ORDERS: {
    LIST: '/api/admin/orders',
    BY_ID: (id: string) => `/api/admin/orders/${id}`,
  },
  
  // Administración - Usuarios
  ADMIN_USERS: {
    STATS: '/api/admin/users/stats',
    LIST: '/api/admin/users',
    BY_ID: (id: string) => `/api/admin/users/${id}`,
  },
  
  // Productos Mayoreo
  WHOLESALE: {
    LIST: '/api/wholesale-products',
    ADMIN_ALL: '/api/wholesale-products/admin/all',
    ADMIN_CREATE: '/api/wholesale-products/admin/create',
    ADMIN_UPDATE: (id: string) => `/api/wholesale-products/admin/${id}`,
    ADMIN_DELETE: (id: string) => `/api/wholesale-products/admin/${id}`,
  },
  
  // Órdenes
  ORDERS: {
    LIST: '/api/orders',
    CREATE: '/api/orders',
    BY_ID: (id: string) => `/api/orders/${id}`,
  },
  
  // Ofertas Especiales
  OFFERS: {
    LIST: '/api/offers',
    FEATURED: '/api/offers/featured',
    ADMIN_LIST: '/api/offers/admin',
    ADMIN_CREATE: '/api/offers/admin',
    ADMIN_UPDATE: (id: string) => `/api/offers/admin/${id}`,
    ADMIN_DELETE: (id: string) => `/api/offers/admin/${id}`,
  },
  
  // Slideshow
  SLIDESHOW: {
    LIST: '/api/slideshow',
    ALL: '/api/slideshow/all',
    CREATE: '/api/slideshow',
    UPDATE: (id: string) => `/api/slideshow/${id}`,
    DELETE: (id: string) => `/api/slideshow/${id}`,
    TOGGLE: (id: string) => `/api/slideshow/${id}/toggle`,
  },
  
  // Usuario
  USER: {
    PROFILE: '/api/user/profile',
    ORDERS: '/api/user/orders',
    UPDATE: '/api/user/profile',
  },
} as const;

// ===========================
// RUTAS FRONTEND (REACT ROUTER)
// ===========================

export const FRONTEND_ROUTES = {
  HOME: '/',
  PRODUCTS: '/productos',
  BRANCHES: '/sucursales',
  WHOLESALE: '/mayoreo',
  ABOUT: '/nosotros',
  CONTACT: '/contacto',
  
  // Autenticación
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/registro',
    PROFILE: '/profile',
  },
  
  // Administración
  ADMIN: {
    DASHBOARD: '/admin',
    PRODUCTS: '/admin/products',
    BRANCHES: '/admin/branches',
    ORDERS: '/admin/orders',
    USERS: '/admin/users',
    WHOLESALE: '/admin/wholesale',
    CATEGORIES: '/admin/categories',
    OFFERS: '/admin/offers',
    SLIDESHOW: '/admin/slideshow',
    REPORTS: '/admin/reports',
    SETTINGS: '/admin/settings',
    ANALYTICS: '/admin/analytics',
  },
} as const;

// ===========================
// ASSETS Y ARCHIVOS ESTÁTICOS
// ===========================

export const ASSETS_CONFIG = {
  BASE_PATH: '/assets',
  IMAGES_PATH: '/images',
  UPLOADS_PATH: '/uploads',
  
  // Configuración de archivos
  PERMISSIONS: '755',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
} as const;

// ===========================
// FUNCIONES HELPER
// ===========================

/**
 * Construye URL completa para llamadas API
 */
export const buildApiUrl = (route: string): string => {
  return `${API_BASE_URL}${route}`;
};

/**
 * Construye URL para assets
 */
export const buildAssetUrl = (path: string): string => {
  return `${API_BASE_URL}${ASSETS_CONFIG.BASE_PATH}${path}`;
};

/**
 * Construye URL para imágenes
 */
export const buildImageUrl = (path: string): string => {
  return `${API_BASE_URL}${ASSETS_CONFIG.IMAGES_PATH}${path}`;
};

/**
 * Construye URL para uploads
 */
export const buildUploadUrl = (path: string): string => {
  return `${API_BASE_URL}${ASSETS_CONFIG.UPLOADS_PATH}${path}`;
};

/**
 * Construye URL del frontend con parámetros opcionales
 */
export const buildFrontendUrl = (route: string, params?: Record<string, string>): string => {
  let url = route;
  
  // Si hay parámetros, agregarlos como query string
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

// ===========================
// CONFIGURACIÓN DE FETCH
// ===========================

export const FETCH_CONFIG = {
  TIMEOUT: 10000, // 10 segundos
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Headers para multipart (subida de archivos)
  MULTIPART_HEADERS: {
    'Accept': 'application/json',
    // NO incluir Content-Type para multipart, el browser lo maneja
  },
} as const;

// ===========================
// VALIDACIÓN DE CONFIGURACIÓN
// ===========================

/**
 * Valida que la configuración sea correcta
 */
export const validateConfig = (): boolean => {
  const errors: string[] = [];
  
  if (!API_BASE_URL.startsWith('https://')) {
    errors.push('API_BASE_URL debe usar HTTPS en producción');
  }
  
  if (API_BASE_URL.includes('localhost')) {
    errors.push('No se debe usar localhost en producción');
  }
  
  if (!DOMAIN_CONFIG.PRODUCTION_DOMAIN.includes('marvera.mx')) {
    errors.push('El dominio debe ser marvera.mx');
  }
  
  if (errors.length > 0) {
    console.error('❌ Errores de configuración:', errors);
    return false;
  }
  
  console.log('✅ Configuración de rutas validada correctamente');
  return true;
};

// Validar configuración al importar
validateConfig();

export default {
  API_BASE_URL,
  API_ROUTES,
  FRONTEND_ROUTES,
  ASSETS_CONFIG,
  FETCH_CONFIG,
  buildApiUrl,
  buildAssetUrl,
  buildImageUrl,
  buildUploadUrl,
  buildFrontendUrl,
};
