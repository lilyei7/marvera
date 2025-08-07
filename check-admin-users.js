// 🔍 VERIFICAR USUARIOS ADMIN EN BD
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAdminUsers() {
  try {
    console.log('🔍 Buscando usuarios admin en la base de datos...');
    
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
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
    
    console.log(`📊 Encontrados ${adminUsers.length} usuarios admin:`);
    adminUsers.forEach(user => {
      console.log(`👤 ID: ${user.id} | Email: ${user.email} | Nombre: ${user.firstName} ${user.lastName} | Activo: ${user.isActive}`);
    });
    
    // También buscar por email específico
    const marveraAdmin = await prisma.user.findFirst({
      where: {
        email: 'admin@marvera.com'
      }
    });
    
    if (marveraAdmin) {
      console.log('✅ Usuario admin@marvera.com encontrado:', marveraAdmin.email, marveraAdmin.role);
    } else {
      console.log('❌ Usuario admin@marvera.com NO encontrado');
    }
    
  } catch (error) {
    console.error('❌ Error consultando usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUsers();
