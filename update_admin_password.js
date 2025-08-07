const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function updateAdminPassword() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@marvera.com' },
      data: { password: hashedPassword }
    });
    
    console.log('Admin password updated successfully:', updatedUser.email);
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword();
