// Debug del proceso de login de MarVera
const testLogin = async () => {
  console.log('🔍 DEBUGGING LOGIN MARVERA');
  console.log('==========================');
  
  const credentials = {
    email: 'admin@marvera.com',
    password: 'admin123456'
  };
  
  console.log('📧 Credenciales:', credentials);
  console.log('🌐 URL de login:', 'http://localhost:3001/api/auth/login');
  
  try {
    console.log('📡 Enviando request...');
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', [...response.headers.entries()]);
    
    const data = await response.json();
    console.log('📦 Response data:', data);
    
    if (response.ok) {
      console.log('✅ LOGIN EXITOSO!');
      if (data.token) {
        console.log('🔑 Token recibido:', data.token.substring(0, 20) + '...');
      }
      if (data.user) {
        console.log('👤 Usuario:', data.user);
      }
    } else {
      console.log('❌ LOGIN FALLÓ');
      console.log('💬 Mensaje:', data.message);
    }
    
  } catch (error) {
    console.error('💥 Error de conexión:', error);
  }
};

// Ejecutar test
testLogin();
