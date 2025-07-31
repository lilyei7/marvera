const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function cleanAndCreateAdmin() {
  console.log('🧹 Limpiando y creando usuario admin correcto...');
  
  try {
    // Eliminar todos los usuarios existentes para empezar limpio
    await prisma.user.deleteMany({});
    console.log('✅ Base de datos limpiada');

    // Crear el usuario admin correcto
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@marvera.com',
        firstName: 'Super',
        lastName: 'Admin',
        password: hashedPassword,
        phone: '+525555555555',
        role: 'SUPER_ADMIN',
        isActive: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    console.log('✅ Usuario admin creado exitosamente:');
    console.log(`   📧 Email: ${adminUser.email}`);
    console.log(`   🔑 Password: admin123456`);
    console.log(`   👤 Rol: ${adminUser.role}`);
    console.log(`   ✅ Activo: ${adminUser.isActive}`);

    // Crear algunos usuarios de prueba adicionales
    const testUsers = [
      {
        email: 'cliente@test.com',
        firstName: 'Cliente',
        lastName: 'Prueba',
        password: await bcrypt.hash('cliente123', 12),
        role: 'CUSTOMER',
        isActive: true
      },
      {
        email: 'restaurante@test.com',
        firstName: 'Restaurante',
        lastName: 'Prueba',
        password: await bcrypt.hash('restaurante123', 12),
        role: 'RESTAURANT',
        businessName: 'Restaurante de Prueba',
        businessType: 'restaurant',
        isActive: true
      }
    ];

    for (const userData of testUsers) {
      const user = await prisma.user.create({
        data: userData,
        select: {
          email: true,
          role: true
        }
      });
      console.log(`✅ Usuario creado: ${user.email} | ${user.role}`);
    }

    console.log('\n🎉 ¡Listo! Ahora puedes hacer login con:');
    console.log('📧 Email: admin@marvera.com');
    console.log('🔑 Password: admin123456');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanAndCreateAdmin();
