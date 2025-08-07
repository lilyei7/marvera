const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' }
    });
    console.log('SUPER_ADMIN users:', JSON.stringify(superAdmins, null, 2));
    
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });
    console.log('ADMIN users:', JSON.stringify(admins, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
