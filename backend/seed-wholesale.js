const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const wholesaleProducts = [
  {
    name: "Camarones Jumbo (Caja Premium)",
    description: "Camarones gigantes del Pacífico, perfectos para restaurantes de alta gama. Peso promedio 20-25g por pieza.",
    pricePerBox: 850,
    unitsPerBox: 5,
    unitType: "kg",
    categoryId: 2, // Crustáceos
    stock: 50,
    minimumOrder: 2,
    images: JSON.stringify(["/images/camarones-jumbo-box.jpg"]),
    isFeatured: true
  },
  {
    name: "Salmón Atlántico Fresco (Caja Industrial)",
    description: "Filetes de salmón fresco del Atlántico Norte, ideal para distribuidores y restaurantes.",
    pricePerBox: 1200,
    unitsPerBox: 10,
    unitType: "kg",
    categoryId: 1, // Pescados
    stock: 30,
    minimumOrder: 1,
    images: JSON.stringify(["/images/salmon-box.jpg"]),
    isFeatured: true
  },
  {
    name: "Ostras Kumamoto (Caja Gourmet)",
    description: "Ostras premium de Kumamoto, perfectas para marisquerías y eventos especiales.",
    pricePerBox: 450,
    unitsPerBox: 100,
    unitType: "piezas",
    categoryId: 3, // Moluscos
    stock: 25,
    minimumOrder: 1,
    images: JSON.stringify(["/images/ostras-box.jpg"]),
    isFeatured: false
  },
  {
    name: "Pulpo Entero Mediterráneo (Caja Familiar)",
    description: "Pulpos enteros del Mediterráneo, ideales para distribución a restaurantes especializados.",
    pricePerBox: 680,
    unitsPerBox: 8,
    unitType: "kg",
    categoryId: 3, // Moluscos
    stock: 40,
    minimumOrder: 2,
    images: JSON.stringify(["/images/pulpo-box.jpg"]),
    isFeatured: false
  },
  {
    name: "Langosta Viva (Caja Premium)",
    description: "Langostas vivas del Maine, transportadas en tanques especiales para máxima frescura.",
    pricePerBox: 2500,
    unitsPerBox: 12,
    unitType: "piezas",
    categoryId: 2, // Crustáceos
    stock: 15,
    minimumOrder: 1,
    images: JSON.stringify(["/images/langosta-viva-box.jpg"]),
    isFeatured: true
  },
  {
    name: "Atún Yellowfin (Caja Industrial)",
    description: "Lomos de atún yellowfin ultra-frescos, perfect para sushi y sashimi de alta calidad.",
    pricePerBox: 1800,
    unitsPerBox: 15,
    unitType: "kg",
    categoryId: 1, // Pescados
    stock: 20,
    minimumOrder: 1,
    images: JSON.stringify(["/images/atun-box.jpg"]),
    isFeatured: false
  },
  {
    name: "Cangrejo Real (Caja Especial)",
    description: "Cangrejos reales de Alaska, cocidos y congelados para mantener su sabor excepcional.",
    pricePerBox: 1500,
    unitsPerBox: 6,
    unitType: "kg",
    categoryId: 2, // Crustáceos
    stock: 12,
    minimumOrder: 2,
    images: JSON.stringify(["/images/cangrejo-real-box.jpg"]),
    isFeatured: false
  },
  {
    name: "Vieiras Gigantes (Caja Gourmet)",
    description: "Vieiras gigantes frescas del Atlántico, perfectas para platos gourmet y restaurantes de lujo.",
    pricePerBox: 950,
    unitsPerBox: 4,
    unitType: "kg",
    categoryId: 3, // Moluscos
    stock: 35,
    minimumOrder: 1,
    images: JSON.stringify(["/images/vieiras-box.jpg"]),
    isFeatured: true
  }
];

async function seedWholesaleProducts() {
  console.log('🌱 Iniciando seeding de productos de mayoreo...');

  try {
    // Primero verificar que existan las categorías
    const categories = await prisma.category.findMany();
    console.log('📋 Categorías encontradas:', categories.length);

    // Si no hay categorías, crearlas
    if (categories.length === 0) {
      console.log('📝 Creando categorías...');
      await prisma.category.createMany({
        data: [
          { name: 'Pescados', slug: 'pescados', description: 'Pescados frescos del océano' },
          { name: 'Crustáceos', slug: 'crustaceos', description: 'Camarones, langostas y cangrejos' },
          { name: 'Moluscos', slug: 'moluscos', description: 'Ostras, pulpos y calamares' },
          { name: 'Otros', slug: 'otros', description: 'Otros productos del mar' }
        ]
      });
    }

    // Crear productos de mayoreo
    console.log('📦 Creando productos de mayoreo...');
    for (const product of wholesaleProducts) {
      try {
        const created = await prisma.wholesaleProduct.create({
          data: product
        });
        console.log(`✅ Creado: ${created.name}`);
      } catch (error) {
        console.error(`❌ Error creando ${product.name}:`, error.message);
      }
    }

    console.log('🎉 Seeding de productos de mayoreo completado!');

    // Mostrar resumen
    const totalWholesale = await prisma.wholesaleProduct.count();
    console.log(`📊 Total productos de mayoreo: ${totalWholesale}`);

  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  seedWholesaleProducts();
}

module.exports = { seedWholesaleProducts };
