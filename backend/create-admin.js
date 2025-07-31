const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔐 Creando usuario administrador...');
    
    // Verificar si ya existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@marvera.com' }
    });
    
    if (existingAdmin) {
      console.log('⚠️ El usuario admin@marvera.com ya existe');
      // Actualizar contraseña
      const hashedPassword = await bcrypt.hash('admin123456', 12);
      await prisma.user.update({
        where: { email: 'admin@marvera.com' },
        data: { 
          password: hashedPassword,
          isActive: true,
          role: 'SUPER_ADMIN'
        }
      });
      console.log('✅ Contraseña actualizada para admin@marvera.com');
    } else {
      // Crear nuevo usuario
      const hashedPassword = await bcrypt.hash('admin123456', 12);
      
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@marvera.com',
          firstName: 'Administrador',
          lastName: 'MarVera',
          password: hashedPassword,
          phone: '+52 999 123 4567',
          role: 'SUPER_ADMIN',
          businessName: 'MarVera Seafood',
          businessType: 'retail',
          address: 'Oficinas MarVera, Mérida, Yucatán',
          city: 'Mérida',
          state: 'Yucatán',
          postalCode: '97000',
          isActive: true
        }
      });
      
      console.log('✅ Usuario administrador creado exitosamente:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   ID: ${adminUser.id}`);
    }
    
    // Verificar todos los usuarios
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
    
    console.log('\n👥 Usuarios en la base de datos:');
    allUsers.forEach(user => {
      console.log(`   ${user.id}: ${user.email} (${user.role}) - Active: ${user.isActive}`);
    });
    
  } catch (error) {
    console.error('❌ Error creando usuario admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
