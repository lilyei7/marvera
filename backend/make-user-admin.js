const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCurrentUserAndMakeAdmin() {
  try {
    console.log('🔍 Para verificar tu usuario actual y darle permisos de admin:');
    console.log('');
    console.log('1️⃣ Abre las herramientas de desarrollador en tu navegador (F12)');
    console.log('2️⃣ Ve a la pestaña "Application" o "Aplicación"');
    console.log('3️⃣ En el menú lateral, busca "Local Storage"');
    console.log('4️⃣ Encuentra la clave "authToken"');
    console.log('5️⃣ Copia el valor del token (la cadena larga)');
    console.log('6️⃣ Ejecuta: node make-user-admin.js [TU_TOKEN_AQUI]');
    console.log('');
    console.log('💡 O simplemente haz logout y login con:');
    console.log('   📧 Email: admin@marvera.com');
    console.log('   🔑 Password: admin123');
    console.log('');

    // Si se proporciona un token como argumento
    const token = process.argv[2];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'marvera-super-secret-jwt-key-development-only');
        console.log('🔓 Token decodificado:', decoded);
        
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });

        if (user) {
          console.log('👤 Usuario actual:', {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            role: user.role
          });

          if (user.role !== 'admin') {
            console.log('🔧 Convirtiendo usuario a admin...');
            await prisma.user.update({
              where: { id: user.id },
              data: { role: 'admin' }
            });
            console.log('✅ Usuario convertido a admin exitosamente!');
            console.log('🔄 Recarga la página para que los cambios tomen efecto.');
          } else {
            console.log('✅ El usuario ya es admin');
          }
        }
      } catch (error) {
        console.log('❌ Error verificando token:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentUserAndMakeAdmin();
