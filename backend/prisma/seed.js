const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  try {
    // 1. Crear Super Admin
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    
    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@marvera.com' },
      update: {},
      create: {
        email: 'admin@marvera.com',
        firstName: 'Super',
        lastName: 'Admin',
        password: hashedPassword,
        phone: '+525555555555',
        role: 'SUPER_ADMIN',
        isActive: true
      }
    });

    console.log('✅ Super Admin creado:', superAdmin.email);

    // 2. Crear Categorías
    const categories = [
      {
        name: 'Pescados',
        slug: 'pescados',
        description: 'Pescados frescos del día'
      },
      {
        name: 'Mariscos',
        slug: 'mariscos',
        description: 'Mariscos y crustáceos premium'
      },
      {
        name: 'Moluscos',
        slug: 'moluscos',
        description: 'Moluscos frescos y de calidad'
      },
      {
        name: 'Conservas',
        slug: 'conservas',
        description: 'Conservas y productos procesados'
      }
    ];

    for (const categoryData of categories) {
      const category = await prisma.category.upsert({
        where: { slug: categoryData.slug },
        update: {},
        create: categoryData
      });
      console.log('✅ Categoría creada:', category.name);
    }

    // 3. Crear algunos usuarios de ejemplo
    const sampleUsers = [
      {
        email: 'gerente@marvera.com',
        firstName: 'Juan',
        lastName: 'Pérez',
        password: await bcrypt.hash('gerente123', 12),
        phone: '+525555555556',
        role: 'MANAGER',
        isActive: true,
        createdBy: superAdmin.id
      },
      {
        email: 'empleado@marvera.com',
        firstName: 'María',
        lastName: 'González',
        password: await bcrypt.hash('empleado123', 12),
        phone: '+525555555557',
        role: 'EMPLOYEE',
        isActive: true,
        createdBy: superAdmin.id
      },
      {
        email: 'restaurante@ejemplo.com',
        firstName: 'Carlos',
        lastName: 'Ruiz',
        password: await bcrypt.hash('restaurant123', 12),
        phone: '+525555555558',
        role: 'RESTAURANT',
        businessName: 'Restaurante El Marisco',
        businessType: 'restaurant',
        taxId: 'EMR123456789',
        address: 'Av. Reforma 123',
        city: 'Ciudad de México',
        state: 'CDMX',
        postalCode: '11000',
        isActive: true,
        createdBy: superAdmin.id
      },
      {
        email: 'mayorista@ejemplo.com',
        firstName: 'Ana',
        lastName: 'López',
        password: await bcrypt.hash('wholesale123', 12),
        phone: '+525555555559',
        role: 'WHOLESALE',
        businessName: 'Distribuidora Marina',
        businessType: 'wholesale',
        taxId: 'DMA987654321',
        address: 'Calle Comercio 456',
        city: 'Guadalajara',
        state: 'Jalisco',
        postalCode: '44100',
        isActive: true,
        createdBy: superAdmin.id
      },
      {
        email: 'cliente@ejemplo.com',
        firstName: 'Pedro',
        lastName: 'Martínez',
        password: await bcrypt.hash('cliente123', 12),
        phone: '+525555555560',
        role: 'CUSTOMER',
        address: 'Colonia Roma Norte 789',
        city: 'Ciudad de México',
        state: 'CDMX',
        postalCode: '06700',
        isActive: true
      }
    ];

    for (const userData of sampleUsers) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData
      });
      console.log('✅ Usuario creado:', user.email, '-', user.role);
    }

    // 4. Crear algunos productos de ejemplo
    const fishCategory = await prisma.category.findUnique({
      where: { slug: 'pescados' }
    });

    const seafoodCategory = await prisma.category.findUnique({
      where: { slug: 'mariscos' }
    });

    if (fishCategory && seafoodCategory) {
      const sampleProducts = [
        {
          name: 'Salmón Atlántico Fresco',
          slug: 'salmon-atlantico-fresco',
          description: 'Salmón atlántico fresco, ideal para sashimi y preparaciones gourmet',
          price: 320.00,
          comparePrice: 350.00,
          categoryId: fishCategory.id,
          stock: 25,
          unit: 'kg',
          images: JSON.stringify(['/images/salmon.jpg']),
          isActive: true,
          isFeatured: true
        },
        {
          name: 'Camarón Jumbo',
          slug: 'camaron-jumbo',
          description: 'Camarón jumbo del Golfo de México, tamaño extra grande',
          price: 450.00,
          comparePrice: 480.00,
          categoryId: seafoodCategory.id,
          stock: 15,
          unit: 'kg',
          images: JSON.stringify(['/images/camaron.jpg']),
          isActive: true,
          isFeatured: true
        },
        {
          name: 'Atún Aleta Azul',
          slug: 'atun-aleta-azul',
          description: 'Atún de aleta azul, grado sashimi, captura sustentable',
          price: 680.00,
          comparePrice: 720.00,
          categoryId: fishCategory.id,
          stock: 8,
          unit: 'kg',
          images: JSON.stringify(['/images/atun.jpg']),
          isActive: true,
          isFeatured: false
        }
      ];

      for (const productData of sampleProducts) {
        const product = await prisma.product.upsert({
          where: { slug: productData.slug },
          update: {},
          create: productData
        });
        console.log('✅ Producto creado:', product.name);
      }
    }

    // 5. Crear algunos productos de mayoreo
    if (seafoodCategory) {
      const wholesaleProducts = [
        {
          name: 'Camarón Mediano - Caja 5kg',
          description: 'Caja de camarón mediano, ideal para restaurantes',
          pricePerBox: 1800.00,
          unitsPerBox: 5,
          unitType: 'kg',
          categoryId: seafoodCategory.id,
          stock: 50,
          minimumOrder: 2,
          images: JSON.stringify(['/images/camaron-caja.jpg']),
          isActive: true,
          isFeatured: true
        },
        {
          name: 'Pulpo Entero - Caja 3kg',
          description: 'Pulpo entero congelado, caja de 3kg',
          pricePerBox: 1200.00,
          unitsPerBox: 3,
          unitType: 'kg',
          categoryId: seafoodCategory.id,
          stock: 30,
          minimumOrder: 3,
          images: JSON.stringify(['/images/pulpo-caja.jpg']),
          isActive: true,
          isFeatured: false
        }
      ];

      for (const wholesaleData of wholesaleProducts) {
        const existing = await prisma.wholesaleProduct.findFirst({
          where: { name: wholesaleData.name }
        });

        if (!existing) {
          const wholesaleProduct = await prisma.wholesaleProduct.create({
            data: wholesaleData
          });
          console.log('✅ Producto mayoreo creado:', wholesaleProduct.name);
        }
      }
    }

    // 6. Crear Ofertas Especiales
    console.log('� Creando ofertas especiales...');
    
    const specialOffers = [
      {
        title: 'Banquete de Mariscos 🍤',
        description: 'Selección especial para 4 personas - Camarones jumbo, langostinos y pulpo',
        originalPrice: 159.99,
        discountPrice: 119.99,
        discountPercent: 25,
        imageUrl: '/images/offers/banquete-mariscos.jpg',
        backgroundColor: '#40E0D0', // Turquoise
        isActive: true,
        isFeatured: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        productIds: JSON.stringify([2, 3]), // Camarón y otros
        maxRedemptions: 100
      },
      {
        title: 'Combo Sushi Premium 🍣',
        description: 'Salmón, atún y pescados selectos para sushi y sashimi',
        originalPrice: 89.99,
        discountPrice: 69.99,
        discountPercent: 22,
        imageUrl: '/images/offers/combo-sushi.jpg',
        backgroundColor: '#1E3A8A', // Marina Blue
        isActive: true,
        isFeatured: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 días
        productIds: JSON.stringify([1, 3]), // Salmón y Atún
        maxRedemptions: 50
      },
      {
        title: 'Paquete Familia Marina 🐟',
        description: 'Kit completo de pescados frescos para 6 personas',
        originalPrice: 199.99,
        discountPrice: 149.99,
        discountPercent: 25,
        imageUrl: '/images/offers/paquete-familia.jpg',
        backgroundColor: '#87CEEB', // Light Blue
        isActive: true,
        isFeatured: false,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 días
        productIds: JSON.stringify([1, 2, 3]), // Todos los productos
        maxRedemptions: 75
      }
    ];

    for (const offerData of specialOffers) {
      const existing = await prisma.specialOffer.findFirst({
        where: { title: offerData.title }
      });
      
      if (!existing) {
        const offer = await prisma.specialOffer.create({
          data: offerData
        });
        console.log('✅ Oferta especial creada:', offer.title);
      }
    }

    console.log('�🎉 Seed completado exitosamente!');
    console.log('');
    console.log('👤 Usuarios creados:');
    console.log('  📧 admin@marvera.com (password: admin123456) - SUPER_ADMIN');
    console.log('  📧 gerente@marvera.com (password: gerente123) - MANAGER');
    console.log('  📧 empleado@marvera.com (password: empleado123) - EMPLOYEE');
    console.log('  📧 restaurante@ejemplo.com (password: restaurant123) - RESTAURANT');
    console.log('  📧 mayorista@ejemplo.com (password: wholesale123) - WHOLESALE');
    console.log('  📧 cliente@ejemplo.com (password: cliente123) - CUSTOMER');
    console.log('');
    console.log('🏷️ Categorías: Pescados, Mariscos, Moluscos, Conservas');
    console.log('🐟 Productos: Salmón, Camarón Jumbo, Atún Aleta Azul');
    console.log('📦 Mayoreo: Camarón Mediano, Pulpo Entero');
    console.log('🎁 Ofertas Especiales: Banquete de Mariscos, Combo Sushi Premium, Paquete Familia Marina');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
