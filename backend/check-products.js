const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('📋 Checking products in database...');
    
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`\n📊 Total products: ${products.length}`);
    console.log(`📊 Featured products: ${products.filter(p => p.isFeatured).length}`);
    
    if (products.length > 0) {
      console.log('\n📋 Products list:');
      products.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} - $${p.price} - ${p.category?.name || 'No category'} - Featured: ${p.isFeatured}`);
      });
    } else {
      console.log('\n❌ No products found. Creating sample products...');
      
      // Create sample category
      const seafoodCategory = await prisma.category.upsert({
        where: { slug: 'mariscos' },
        update: {},
        create: {
          name: 'Mariscos',
          slug: 'mariscos',
          description: 'Mariscos frescos del mar'
        }
      });
      
      // Create sample products
      const sampleProducts = [
        {
          name: 'Camarones Gigantes',
          description: 'Camarones frescos del Pacífico, ideales para parrilla',
          price: 450.00,
          categoryId: seafoodCategory.id,
          unit: 'kg',
          stock: 20,
          isFeatured: true,
          isActive: true,
          images: JSON.stringify(['/images/products/camarones.jpg'])
        },
        {
          name: 'Salmón Fresco',
          description: 'Salmón del Atlántico, perfecto para sushi o plancha',
          price: 580.00,
          categoryId: seafoodCategory.id,
          unit: 'kg',
          stock: 15,
          isFeatured: true,
          isActive: true,
          images: JSON.stringify(['/images/products/salmon.jpg'])
        },
        {
          name: 'Pulpo Mediterráneo',
          description: 'Pulpo fresco para preparaciones gourmet',
          price: 320.00,
          categoryId: seafoodCategory.id,
          unit: 'kg',
          stock: 10,
          isFeatured: false,
          isActive: true,
          images: JSON.stringify(['/images/products/pulpo.jpg'])
        }
      ];
      
      for (const productData of sampleProducts) {
        await prisma.product.create({ data: productData });
      }
      
      console.log('✅ Sample products created successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
