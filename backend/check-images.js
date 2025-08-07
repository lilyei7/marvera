/**
 * Script para verificar cómo están almacenadas las imágenes en la base de datos
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProductImages() {
  try {
    console.log('🔍 Verificando formato de imágenes en la base de datos...');
    
    const products = await prisma.product.findMany({
      take: 5
    });

    products.forEach((product, index) => {
      console.log(`\n📦 Producto ${index + 1}: ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Images field type: ${typeof product.images}`);
      console.log(`   Images value: ${product.images}`);
      console.log(`   Images length: ${product.images?.length || 0}`);
      
      // Intentar verificar si es JSON válido
      try {
        if (typeof product.images === 'string') {
          const parsed = JSON.parse(product.images);
          console.log(`   ✅ Es JSON válido: ${Array.isArray(parsed)} (array: ${parsed.length} items)`);
        } else {
          console.log(`   ⚠️ No es string, es: ${typeof product.images}`);
        }
      } catch (error) {
        console.log(`   ❌ NO es JSON válido: ${error.message}`);
      }
    });

  } catch (error) {
    console.error('❌ Error verificando productos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductImages();
