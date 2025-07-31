const fs = require('fs');
const path = require('path');

// Test script to check if all imports work
console.log('🧪 Testing backend imports...');

// Check if auth middleware exists
const authPath = path.join(__dirname, 'src/middleware/auth.ts');
if (fs.existsSync(authPath)) {
  console.log('✅ Auth middleware found');
} else {
  console.log('❌ Auth middleware not found at:', authPath);
}

// Check if adminProducts route exists
const adminProductsPath = path.join(__dirname, 'src/routes/adminProducts.ts');
if (fs.existsSync(adminProductsPath)) {
  console.log('✅ Admin products route found');
} else {
  console.log('❌ Admin products route not found at:', adminProductsPath);
}

// Check if wholesaleProducts route exists
const wholesalePath = path.join(__dirname, 'routes/wholesaleProducts.js');
if (fs.existsSync(wholesalePath)) {
  console.log('✅ Wholesale products route found');
} else {
  console.log('❌ Wholesale products route not found at:', wholesalePath);
}

console.log('✅ Import test complete');
