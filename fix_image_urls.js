const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixImageUrls() {
  console.log('🔧 Fixing image URLs in database...');
  
  const products = await prisma.product.findMany({
    where: {
      images: {
        contains: '/uploads/products/'
      }
    }
  });
  
  console.log('📦 Found', products.length, 'products with incorrect URLs');
  
  for (const product of products) {
    const oldImages = product.images;
    // Replace /uploads/products/ with /uploads/branches/
    const newImages = oldImages.replace(/\/uploads\/products\//g, '/uploads/branches/');
    
    if (oldImages !== newImages) {
      await prisma.product.update({
        where: { id: product.id },
        data: { images: newImages }
      });
      console.log('✅ Fixed', product.name, ':', oldImages, '->', newImages);
    }
  }
  
  await prisma.$disconnect();
  console.log('🎉 URLs fixed!');
}

fixImageUrls().catch(console.error);
