// 🌐 CONFIGURACIÓN API UNIFICADA MARVERA - FUENTE ÚNICA DE VERDAD
const isDevelopment = import.meta.env.DEV;

export const API_CONFIG = {
  // Base URLs por ambiente - SIEMPRE HTTPS EN PRODUCCIÓN
  BASE_URL: isDevelopment 
    ? 'http://localhost:3001' 
    : 'https://marvera.mx', // ✅ HTTPS FORZADO (SIN www para consistencia con certificado)
    
  // ===========================
  // ENDPOINTS COMPLETOS - TODOS LOS DISPONIBLES
  // ===========================
  ENDPOINTS: {
    // === SISTEMA ===
    HEALTH: '/api/health',
    
    // === AUTENTICACIÓN ===
    AUTH_LOGIN: '/api/auth/login',
    AUTH_LOGIN_SIMPLE: '/api/auth/login-simple',
    AUTH_REGISTER: '/api/auth/register',
    AUTH_VERIFY: '/api/auth/verify',
    AUTH_LOGOUT: '/api/auth/logout',
    
    // === PRODUCTOS PÚBLICOS ===
    PRODUCTS: '/api/products',
    PRODUCTS_FEATURED: '/api/products/featured',
    PRODUCTS_BY_ID: (id: string) => `/api/products/${id}`,
    
    // === CATEGORÍAS ===
    CATEGORIES: '/api/categories',
    CATEGORIES_BY_ID: (id: string) => `/api/categories/${id}`,
    
    // === OFERTAS ESPECIALES ===
    OFFERS: '/api/offers',
    OFFERS_FEATURED: '/api/offers/featured',
    
    // === SLIDESHOW PÚBLICO ===
    SLIDESHOW: '/api/slideshow',
    SLIDESHOW_ALL: '/api/slideshow/all',
    
    // === SUCURSALES PÚBLICAS ===
    BRANCHES: '/api/branches/public',
    
    // === MAYOREO ===
    WHOLESALE_PRODUCTS: '/api/wholesale-products',
    
    // === ÓRDENES ===
    ORDERS: '/api/orders',
    ORDERS_BY_ID: (id: string) => `/api/orders/${id}`,
    
    // === USUARIO ===
    USER_PROFILE: '/api/user/profile',
    USER_ORDERS: '/api/user/orders',
    USER_UPDATE: '/api/user/profile',
    
    // ===========================
    // ADMINISTRACIÓN - REQUIEREN AUTENTICACIÓN
    // ===========================
    
    // === ADMIN PRODUCTOS ===
    ADMIN_PRODUCTS: '/api/admin/products',
    ADMIN_PRODUCTS_CREATE: '/api/admin/products',
    ADMIN_PRODUCTS_UPDATE: (id: string) => `/api/admin/products/${id}`,
    ADMIN_PRODUCTS_DELETE: (id: string) => `/api/admin/products/${id}`,
    
    // === ADMIN SUCURSALES ===
    ADMIN_BRANCHES: '/api/branches',
    ADMIN_BRANCHES_CREATE: '/api/branches',
    ADMIN_BRANCHES_UPDATE: (id: string) => `/api/branches/${id}`,
    ADMIN_BRANCHES_DELETE: (id: string) => `/api/branches/${id}`,
    ADMIN_BRANCHES_UPLOAD: '/api/branches/upload-image',
    
    // === ADMIN USUARIOS ===
    ADMIN_USERS: '/api/admin/users',
    ADMIN_USERS_STATS: '/api/admin/users/stats',
    ADMIN_USERS_BY_ID: (id: string) => `/api/admin/users/${id}`,
    
    // === ADMIN ÓRDENES ===
    ADMIN_ORDERS: '/api/admin/orders',
    ADMIN_ORDERS_BY_ID: (id: string) => `/api/admin/orders/${id}`,
    
    // === ADMIN OFERTAS ===
    ADMIN_OFFERS: '/api/offers/admin',
    ADMIN_OFFERS_CREATE: '/api/offers/admin',
    ADMIN_OFFERS_UPDATE: (id: string) => `/api/offers/admin/${id}`,
    ADMIN_OFFERS_DELETE: (id: string) => `/api/offers/admin/${id}`,
    ADMIN_OFFERS_UPLOAD: '/api/offers/admin/upload-image',
    
    // === ADMIN SLIDESHOW ===
    ADMIN_SLIDESHOW_CREATE: '/api/slideshow',
    ADMIN_SLIDESHOW_UPDATE: (id: string) => `/api/slideshow/${id}`,
    ADMIN_SLIDESHOW_DELETE: (id: string) => `/api/slideshow/${id}`,
    ADMIN_SLIDESHOW_TOGGLE: (id: string) => `/api/slideshow/${id}/toggle`,
    
    // === ADMIN MAYOREO ===
    ADMIN_WHOLESALE: '/api/wholesale-products/admin/all',
    ADMIN_WHOLESALE_CREATE: '/api/wholesale-products/admin/create',
    ADMIN_WHOLESALE_UPDATE: (id: string) => `/api/wholesale-products/admin/${id}`,
    ADMIN_WHOLESALE_DELETE: (id: string) => `/api/wholesale-products/admin/${id}`,
  }
};

// ===========================
// FUNCIONES HELPER
// ===========================

// URL completa para fetch - FUNCIÓN PRINCIPAL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Función específica para construir URLs de endpoints definidos
export const getEndpointUrl = (endpointKey: keyof typeof API_CONFIG.ENDPOINTS): string => {
  const endpoint = API_CONFIG.ENDPOINTS[endpointKey];
  if (typeof endpoint === 'function') {
    throw new Error(`El endpoint ${endpointKey} requiere parámetros. Usa getApiUrl() directamente.`);
  }
  return getApiUrl(endpoint);
};

// Función para URLs de assets/imágenes
export const getAssetUrl = (path: string): string => {
  return `${API_CONFIG.BASE_URL}${path}`;
};

// ===========================
// CONFIGURACIÓN ADICIONAL
// ===========================

export const API_SETTINGS = {
  TIMEOUT: 10000, // 10 segundos
  HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  MULTIPART_HEADERS: {
    'Accept': 'application/json',
    // NO incluir Content-Type para multipart
  },
};

// Export para compatibilidad con código existente
export const API_BASE_URL = API_CONFIG.BASE_URL;

// ===========================
// VALIDACIÓN DE CONFIGURACIÓN
// ===========================

const validateApiConfig = (): boolean => {
  const errors: string[] = [];
  
  if (!API_CONFIG.BASE_URL.startsWith('https://') && !isDevelopment) {
    errors.push('API_BASE_URL debe usar HTTPS en producción');
  }
  
  if (API_CONFIG.BASE_URL.includes('localhost') && !isDevelopment) {
    errors.push('No se debe usar localhost en producción');
  }
  
  if (errors.length > 0) {
    console.error('❌ Errores de configuración API:', errors);
    return false;
  }
  
  console.log('✅ Configuración de API validada correctamente');
  console.log(`🔗 API Base URL: ${API_CONFIG.BASE_URL}`);
  console.log(`🛠️ Modo: ${isDevelopment ? 'Desarrollo' : 'Producción'}`);
  return true;
};

// Validar configuración al importar
validateApiConfig();

