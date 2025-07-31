// Test simple de autenticación MarVera
const testAuth = async () => {
  const API_URL = 'http://localhost:3001';
  
  console.log('🔐 TESTING MARVERA AUTH');
  console.log('======================');
  
  try {
    // 1. Test login
    console.log('1️⃣ Testing login...');
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@marvera.com',
        password: 'admin123456'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('   User:', loginData.user?.email);
    console.log('   Role:', loginData.user?.role);
    console.log('   Token:', loginData.token ? '✅ Present' : '❌ Missing');
    
    if (!loginData.token) {
      throw new Error('No token received');
    }
    
    // 2. Test verify GET
    console.log('\n2️⃣ Testing verify GET...');
    const verifyResponse = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('✅ Verify GET successful');
      console.log('   User:', verifyData.user?.email);
      console.log('   Role:', verifyData.user?.role);
    } else {
      console.log('❌ Verify GET failed:', verifyResponse.status);
    }
    
    // 3. Test verify POST
    console.log('\n3️⃣ Testing verify POST...');
    const verifyPostResponse = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    
    if (verifyPostResponse.ok) {
      const verifyPostData = await verifyPostResponse.json();
      console.log('✅ Verify POST successful');
      console.log('   User:', verifyPostData.user?.email);
      console.log('   Role:', verifyPostData.user?.role);
    } else {
      console.log('❌ Verify POST failed:', verifyPostResponse.status);
    }
    
    console.log('\n🎯 AUTH TEST COMPLETE');
    console.log('Token para usar en frontend:', loginData.token);
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
};

testAuth();
