const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findBadImages() {
  const products = await prisma.product.findMany();
  
  products.forEach(p => {
    try {
      if (typeof p.images === 'string') {
        JSON.parse(p.images);
      }
    } catch(e) {
      console.log('ERROR en producto:', p.id, p.name, 'images:', p.images);
    }
  });
  
  await prisma.$disconnect();
}

findBadImages();
