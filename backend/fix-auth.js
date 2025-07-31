const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAndFixUsers() {
  console.log('🔍 Verificando usuarios en la base de datos...');
  
  try {
    // Obtener todos los usuarios
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    console.log('\n📋 Usuarios encontrados:');
    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
    } else {
      users.forEach(user => {
        console.log(`  📧 ${user.email} | ${user.role} | ${user.isActive ? '✅ Activo' : '❌ Inactivo'}`);
      });
    }

    // Verificar si existe el admin
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@marvera.com' }
    });

    if (!adminUser) {
      console.log('\n🔧 Creando usuario admin...');
      const hashedPassword = await bcrypt.hash('admin123456', 12);
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@marvera.com',
          firstName: 'Super',
          lastName: 'Admin',
          password: hashedPassword,
          phone: '+525555555555',
          role: 'SUPER_ADMIN',
          isActive: true
        }
      });
      
      console.log('✅ Usuario admin creado exitosamente');
      console.log(`📧 Email: ${newAdmin.email}`);
      console.log(`🔑 Password: admin123456`);
    } else {
      console.log('\n🔧 Reseteando password del admin...');
      const hashedPassword = await bcrypt.hash('admin123456', 12);
      
      await prisma.user.update({
        where: { email: 'admin@marvera.com' },
        data: { 
          password: hashedPassword,
          isActive: true
        }
      });
      
      console.log('✅ Password del admin reseteado');
      console.log(`📧 Email: admin@marvera.com`);
      console.log(`🔑 Password: admin123456`);
    }

    // Verificar la ruta de auth
    console.log('\n🔗 Para probar el login, usa:');
    console.log('POST http://localhost:3001/api/auth/login');
    console.log('Body: {"email": "admin@marvera.com", "password": "admin123456"}');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixUsers();
