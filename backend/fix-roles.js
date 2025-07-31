const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixUserRole() {
  console.log('🔧 Actualizando roles de usuarios...');
  
  try {
    // Actualizar el usuario admin para que tenga el rol correcto
    await prisma.user.updateMany({
      where: { 
        email: 'admin@marvera.com' 
      },
      data: { 
        role: 'SUPER_ADMIN'
      }
    });

    console.log('✅ Rol actualizado a SUPER_ADMIN');

    // Verificar usuarios después de la actualización
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    console.log('\n📋 Usuarios actualizados:');
    users.forEach(user => {
      console.log(`  📧 ${user.email} | ${user.role} | ${user.isActive ? '✅ Activo' : '❌ Inactivo'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserRole();
