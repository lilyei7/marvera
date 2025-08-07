// 🔒 SISTEMA DE REDIRECCIÓN AUTOMÁTICA HTTPS
export const forceHTTPS = () => {
  // Solo en producción (no en desarrollo local)
  if (import.meta.env.PROD && window.location.protocol === 'http:') {
    console.log('🔒 Redirigiendo a HTTPS para seguridad...');
    window.location.replace(window.location.href.replace('http:', 'https:'));
  }
};

// 🌐 VERIFICAR Y FORZAR HTTPS AL CARGAR LA APLICACIÓN
export const initHTTPS = () => {
  // Aplicar redirección inmediatamente al cargar
  forceHTTPS();
  
  // Configurar cabeceras de seguridad si estamos en HTTPS
  if (window.location.protocol === 'https:') {
    console.log('✅ MarVera ejecutándose con HTTPS seguro');
  }
};

// 🔐 MIDDLEWARE PARA FETCH API REQUESTS
export const secureApiRequest = (url: string, options: RequestInit = {}): Promise<Response> => {
  // En producción, forzar HTTPS para todas las requests API
  if (import.meta.env.PROD && url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
    console.log('🔒 Request API convertida a HTTPS:', url);
  }
  
  return fetch(url, {
    ...options,
    // Agregar headers de seguridad
    headers: {
      ...options.headers,
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
};
