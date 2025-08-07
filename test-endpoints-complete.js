// 🧪 PRUEBAS ROBUSTAS DE ENDPOINTS MARVERA
// Fecha: 2025-08-06
// Objetivo: Validar todos los endpoints críticos del sistema

const BASE_URL = 'http://localhost:3001/api';

// 🎨 Colores para logs entendibles
const colors = {
  success: '\x1b[32m', // Verde
  error: '\x1b[31m',   // Rojo
  info: '\x1b[36m',    // Cyan
  warning: '\x1b[33m', // Amarillo
  reset: '\x1b[0m'     // Reset
};

// 📊 Contador de pruebas
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// 🔧 Función de utilidad para logs
function log(level, message, data = null) {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const color = colors[level] || colors.info;
  
  console.log(`${color}[${timestamp}] ${level.toUpperCase()}: ${message}${colors.reset}`);
  if (data) {
    console.log(`${color}${JSON.stringify(data, null, 2)}${colors.reset}`);
  }
}

// 🧪 Función para ejecutar prueba
async function runTest(testName, endpoint, expectedStatus = 200, method = 'GET', body = null) {
  totalTests++;
  
  try {
    log('info', `🧪 Ejecutando prueba: ${testName}`);
    log('info', `🔗 Endpoint: ${method} ${endpoint}`);
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (response.status === expectedStatus) {
      passedTests++;
      log('success', `✅ ${testName} - PASÓ`);
      log('success', `📊 Status: ${response.status} | Data items: ${Array.isArray(data.data) ? data.data.length : 'N/A'}`);
      
      // Log datos importantes
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        log('info', `📦 Primer elemento:`, data.data[0]);
      } else if (data.data && !Array.isArray(data.data)) {
        log('info', `📦 Data:`, data.data);
      }
      
      return { passed: true, data };
    } else {
      failedTests++;
      log('error', `❌ ${testName} - FALLÓ`);
      log('error', `📊 Expected: ${expectedStatus} | Got: ${response.status}`);
      log('error', `📦 Response:`, data);
      return { passed: false, data };
    }
    
  } catch (error) {
    failedTests++;
    log('error', `❌ ${testName} - ERROR DE RED`);
    log('error', `🚨 Error:`, error.message);
    return { passed: false, error: error.message };
  }
}

// 🚀 Función principal de pruebas
async function runAllTests() {
  log('info', '🚀 INICIANDO PRUEBAS ROBUSTAS DE MARVERA');
  log('info', `🎯 Base URL: ${BASE_URL}`);
  
  // ❤️ PRUEBA 1: Health Check
  await runTest(
    'Health Check',
    '/health',
    200
  );
  
  // 🛍️ PRUEBA 2: Productos públicos
  await runTest(
    'Productos Públicos',
    '/products',
    200
  );
  
  // ⭐ PRUEBA 3: Productos destacados
  await runTest(
    'Productos Destacados',
    '/products/featured',
    200
  );
  
  // 📂 PRUEBA 4: Categorías (corregido - está en /products/categories)
  await runTest(
    'Categorías de Productos',
    '/products/categories',
    200
  );
  
  // 🏢 PRUEBA 5: Sucursales públicas
  await runTest(
    'Sucursales Públicas',
    '/branches/public',
    200
  );
  
  // 🎪 PRUEBA 6: Slideshow (CRÍTICO)
  await runTest(
    'Slideshow Activo',
    '/slideshow',
    200
  );
  
  // 🏪 PRUEBA 7: Productos mayoreo
  await runTest(
    'Productos Mayoreo',
    '/wholesale-products',
    200
  );
  
  // 🔐 PRUEBA 8: Login admin (credenciales correctas del sistema)
  const loginResult = await runTest(
    'Login Administrativo',
    '/auth/login',
    200,
    'POST',
    {
      email: 'admin',
      password: 'admin'
    }
  );
  
  // 🔑 Usar token para pruebas autenticadas si login exitoso
  let token = null;
  if (loginResult.passed && loginResult.data.token) {
    token = loginResult.data.token;
    log('success', '🔑 Token obtenido para pruebas autenticadas');
    
    // 🛍️ PRUEBA 9: Productos admin (requiere token)
    await runTestWithAuth(
      'Productos Admin',
      '/admin/products',
      token,
      200
    );
    
    // 🏢 PRUEBA 10: Sucursales admin (requiere token)
    await runTestWithAuth(
      'Sucursales Admin',
      '/branches',
      token,
      200
    );
  }
  
  // 📊 RESUMEN FINAL
  log('info', '📊 RESUMEN DE PRUEBAS');
  log('info', `🧪 Total de pruebas: ${totalTests}`);
  log('success', `✅ Pruebas exitosas: ${passedTests}`);
  log('error', `❌ Pruebas fallidas: ${failedTests}`);
  
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  if (successRate >= 90) {
    log('success', `🎉 SISTEMA ROBUSTO: ${successRate}% de éxito`);
  } else if (successRate >= 70) {
    log('warning', `⚠️ SISTEMA ESTABLE: ${successRate}% de éxito`);
  } else {
    log('error', `🚨 SISTEMA CRÍTICO: ${successRate}% de éxito`);
  }
}

// 🔐 Función para pruebas autenticadas
async function runTestWithAuth(testName, endpoint, token, expectedStatus = 200, method = 'GET', body = null) {
  totalTests++;
  
  try {
    log('info', `🧪 Ejecutando prueba autenticada: ${testName}`);
    log('info', `🔗 Endpoint: ${method} ${endpoint}`);
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (response.status === expectedStatus) {
      passedTests++;
      log('success', `✅ ${testName} - PASÓ (Autenticado)`);
      log('success', `📊 Status: ${response.status} | Data items: ${Array.isArray(data.data) ? data.data.length : 'N/A'}`);
      return { passed: true, data };
    } else {
      failedTests++;
      log('error', `❌ ${testName} - FALLÓ (Autenticado)`);
      log('error', `📊 Expected: ${expectedStatus} | Got: ${response.status}`);
      log('error', `📦 Response:`, data);
      return { passed: false, data };
    }
    
  } catch (error) {
    failedTests++;
    log('error', `❌ ${testName} - ERROR DE RED (Autenticado)`);
    log('error', `🚨 Error:`, error.message);
    return { passed: false, error: error.message };
  }
}

// 🚀 Ejecutar todas las pruebas
runAllTests().catch(error => {
  log('error', '🚨 ERROR CRÍTICO EN PRUEBAS', error);
});
