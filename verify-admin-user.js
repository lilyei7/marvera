/**
 * Script para verificar usuario admin en la base de datos
 * Comprueba que admin@marvera.com existe con role ADMIN
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyAdminUser() {
  try {
    console.log('🔍 Verificando usuario admin en la base de datos...');
    
    // Buscar usuario admin
    const adminUser = await prisma.user.findUnique({
      where: {
        email: 'admin@marvera.com'
      }
    });

    if (!adminUser) {
      console.log('❌ Usuario admin@marvera.com NO encontrado en la base de datos');
      return false;
    }

    console.log('✅ Usuario admin encontrado en la base de datos:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Nombre: ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Activo: ${adminUser.isActive}`);
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Creado: ${adminUser.createdAt}`);

    // Verificar que el role sea ADMIN
    if (adminUser.role === 'ADMIN') {
      console.log('✅ Role ADMIN verificado correctamente');
    } else {
      console.log(`❌ Role incorrecto: esperado ADMIN, obtenido ${adminUser.role}`);
      return false;
    }

    // Verificar que esté activo
    if (adminUser.isActive) {
      console.log('✅ Usuario activo verificado');
    } else {
      console.log('❌ Usuario NO está activo');
      return false;
    }

    console.log('\n🎉 Verificación completa: Usuario admin@marvera.com está correctamente configurado en la base de datos');
    return true;

  } catch (error) {
    console.error('❌ Error verificando usuario admin:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar verificación
verifyAdminUser()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
