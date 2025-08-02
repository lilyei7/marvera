// 🔍 SCRIPT DE DIAGNÓSTICO DE AUTENTICACIÓN MARVERA
// Copia y pega esto en la consola del navegador para diagnosticar problemas de auth

console.log('🌊 === DIAGNÓSTICO DE AUTENTICACIÓN MARVERA ===');

// 1. Verificar localStorage
const token = localStorage.getItem('token');
console.log('📦 Token en localStorage:', token ? 'SÍ (' + token.substring(0, 20) + '...)' : 'NO');

// 2. Verificar estado Redux
const reduxState = window.__REDUX_DEVTOOLS_EXTENSION__ ? 
  store.getState() : 
  'Redux DevTools no disponible';

if (reduxState && reduxState.auth) {
  console.log('🔧 Estado Redux Auth:', {
    isAuthenticated: reduxState.auth.isAuthenticated,
    hasUser: !!reduxState.auth.user,
    userEmail: reduxState.auth.user?.email,
    userRole: reduxState.auth.user?.role,
    hasToken: !!reduxState.auth.token,
    isLoading: reduxState.auth.isLoading,
    error: reduxState.auth.error
  });
} else {
  console.log('❌ No se puede acceder al estado Redux');
}

// 3. Función para probar login manual
window.debugLogin = async function() {
  console.log('🚀 Probando login manual...');
  try {
    const response = await fetch('https://marvera.mx/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@marvera.com',
        password: 'admin123'
      }),
    });
    
    const data = await response.json();
    console.log('📡 Respuesta del login:', data);
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      console.log('💾 Token guardado en localStorage');
      console.log('🔄 Recarga la página para ver los cambios');
    }
  } catch (error) {
    console.error('❌ Error en login:', error);
  }
};

// 4. Función para verificar token manual
window.debugVerify = async function() {
  console.log('🔍 Probando verificación manual...');
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('❌ No hay token para verificar');
    return;
  }
  
  try {
    const response = await fetch('https://marvera.mx/api/auth/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    console.log('📡 Respuesta de verificación:', data);
    
    if (data.success && data.user) {
      console.log('✅ Token válido, usuario:', data.user);
    } else {
      console.log('❌ Token inválido');
    }
  } catch (error) {
    console.error('❌ Error en verificación:', error);
  }
};

// 5. Función para limpiar auth
window.debugClearAuth = function() {
  localStorage.removeItem('token');
  console.log('🧹 Token eliminado de localStorage');
  console.log('🔄 Recarga la página para ver los cambios');
};

console.log('📋 COMANDOS DISPONIBLES:');
console.log('   debugLogin() - Hacer login manual');
console.log('   debugVerify() - Verificar token actual'); 
console.log('   debugClearAuth() - Limpiar autenticación');
console.log('');
console.log('🔍 Si hay problemas, ejecuta debugVerify() para ver si el token es válido');
console.log('🚀 Si no hay token, ejecuta debugLogin() para obtener uno nuevo');
