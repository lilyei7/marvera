// Configuración del servidor para desarrollo
export const SERVER_CONFIG = {
  // IP de tu servidor
  SERVER_IP: '187.33.155.127',
  SERVER_PORT: '3001',
  
  // Modo de desarrollo - cambia esto según necesites
  USE_LOCAL_DATA: false, // true = usar datos locales, false = intentar servidor
  
  // URLs de API
  get API_BASE_URL() {
    if (this.USE_LOCAL_DATA) {
      return null; // No usar servidor, solo datos locales
    }
    return `http://${this.SERVER_IP}:${this.SERVER_PORT}`;
  },
  
  // Timeouts
  FETCH_TIMEOUT: 3000, // 3 segundos
  
  // Configuración de reconexión
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 1000, // 1 segundo
};

// Función para verificar si el servidor está disponible
export const checkServerHealth = async (): Promise<boolean> => {
  if (SERVER_CONFIG.USE_LOCAL_DATA) {
    return false; // Usar datos locales por configuración
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`${SERVER_CONFIG.API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log('🔌 Servidor no disponible, usando datos locales');
    return false;
  }
};

// Función helper para hacer requests con fallback automático
export const fetchWithFallback = async <T>(
  endpoint: string,
  fallbackData: T,
  options: RequestInit = {}
): Promise<T> => {
  // Si está configurado para usar datos locales, devolver fallback
  if (SERVER_CONFIG.USE_LOCAL_DATA) {
    console.log('📦 Usando datos locales por configuración');
    return fallbackData;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SERVER_CONFIG.FETCH_TIMEOUT);
    
    const response = await fetch(`${SERVER_CONFIG.API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`⚠️ Servidor error ${response.status}, usando fallback`);
      return fallbackData;
    }
    
    const data = await response.json();
    console.log(`✅ Datos recibidos del servidor para ${endpoint}`);
    return data;
    
  } catch (error) {
    console.log(`🔌 Error de conexión en ${endpoint}, usando datos locales`);
    return fallbackData;
  }
};

export default SERVER_CONFIG;
