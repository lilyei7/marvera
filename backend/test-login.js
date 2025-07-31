const fetch = require('node-fetch').default;

async function testLogin() {
  console.log('🔑 Probando login...');
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@marvera.com',
        password: 'admin123456'
      })
    });

    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Login exitoso!');
      console.log(`🎫 Token: ${data.token?.substring(0, 50)}...`);
    } else {
      console.log('❌ Error en login');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();
