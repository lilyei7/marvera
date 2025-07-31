const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAndCreateAdmin() {
  try {
    // Buscar usuarios admin existentes
    const adminUsers = await prisma.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    console.log('👥 Usuarios admin encontrados:', adminUsers);

    if (adminUsers.length === 0) {
      console.log('🔧 No hay usuarios admin. Creando usuario admin por defecto...');
      
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@marvera.com',
          firstName: 'Admin',
          lastName: 'MarVera',
          password: hashedPassword,
          phone: '+1234567890',
          role: 'admin',
          isActive: true
        }
      });

      console.log('✅ Usuario admin creado:', {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role
      });
    } else {
      console.log('✅ Ya existen usuarios admin');
    }

    // Mostrar todos los usuarios para debug
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    console.log('\n📋 Todos los usuarios en la base de datos:');
    console.table(allUsers);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateAdmin();
