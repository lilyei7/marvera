const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCurrentUser() {
  try {
    // El token que está guardado en localStorage del navegador
    // Necesitaremos que el usuario nos proporcione el token o revisemos localStorage
    
    console.log('🔍 Para verificar tu usuario actual, necesitamos el token JWT que tienes guardado.');
    console.log('📋 Opciones disponibles:');
    console.log('');
    console.log('1️⃣  Cerrar sesión e iniciar sesión con credenciales de admin:');
    console.log('   📧 Email: admin@marvera.com');
    console.log('   🔑 Password: admin123');
    console.log('');
    console.log('2️⃣  O email: admin (necesitaríamos verificar la contraseña)');
    console.log('');
    console.log('💡 Recomendación: Usa la opción 1 (admin@marvera.com / admin123)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentUser();
