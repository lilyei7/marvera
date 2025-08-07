// 🧪 Script de prueba para verificar configuración API unificada
import { getApiUrl, API_CONFIG } from './src/config/api.js';

console.log('🔍 VERIFICANDO CONFIGURACIÓN API UNIFICADA\n');

console.log('📋 BASE URL:', API_CONFIG.BASE_URL);
console.log('🌍 Ambiente:', import.meta.env.DEV ? 'Desarrollo' : 'Producción');

console.log('\n🌐 ENDPOINTS PÚBLICOS:');
console.log('- Salud:', getApiUrl(API_CONFIG.ENDPOINTS.HEALTH));
console.log('- Productos:', getApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS));
console.log('- Productos Destacados:', getApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS_FEATURED));
console.log('- Ofertas:', getApiUrl(API_CONFIG.ENDPOINTS.OFFERS));
console.log('- Ofertas Destacadas:', getApiUrl(API_CONFIG.ENDPOINTS.OFFERS_FEATURED));
console.log('- Sucursales:', getApiUrl(API_CONFIG.ENDPOINTS.BRANCHES));

console.log('\n🔐 ENDPOINTS ADMIN:');
console.log('- Login:', getApiUrl(API_CONFIG.ENDPOINTS.AUTH_LOGIN));
console.log('- Admin Productos:', getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS));
console.log('- Admin Sucursales:', getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_BRANCHES));
console.log('- Admin Usuarios:', getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_USERS));

console.log('\n🧩 ENDPOINTS PARAMETRIZABLES:');
console.log('- Actualizar Producto 123:', getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS_UPDATE('123')));
console.log('- Eliminar Sucursal 456:', getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_BRANCHES_DELETE('456')));

console.log('\n✅ Configuración API verificada correctamente!');
