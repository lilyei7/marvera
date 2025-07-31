import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear categorías
  const categories = [
    { name: 'Pescados Frescos', slug: 'pescados-frescos', description: 'Pescados frescos del día' },
    { name: 'Mariscos', slug: 'mariscos', description: 'Mariscos frescos y de calidad' },
    { name: 'Crustáceos', slug: 'crustaceos', description: 'Langostas, cangrejos y camarones' },
    { name: 'Moluscos', slug: 'moluscos', description: 'Ostras, mejillones y almejas' },
    { name: 'Productos Premium', slug: 'premium', description: 'Selección premium de mariscos' },
    { name: 'Productos Procesados', slug: 'procesados', description: 'Productos preparados y conservas' }
  ];

  console.log('📂 Creando categorías...');
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
  }

  // Crear usuario admin
  console.log('👤 Creando usuario admin...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@marvera.com' },
    update: {},
    create: {
      email: 'admin@marvera.com',
      firstName: 'Admin',
      lastName: 'MarVera',
      password: hashedPassword,
      phone: '+52 999 123 4567',
      role: 'admin'
    }
  });

  // Crear usuario normal de prueba
  console.log('👤 Creando usuario de prueba...');
  const hashedUserPassword = await bcrypt.hash('user123', 10);
  await prisma.user.upsert({
    where: { email: 'user@marvera.com' },
    update: {},
    create: {
      email: 'user@marvera.com',
      firstName: 'Usuario',
      lastName: 'Prueba',
      password: hashedUserPassword,
      phone: '+52 999 987 6543',
      role: 'customer'
    }
  });

  // Crear sucursales (sin campo gerente)
  console.log('🏢 Creando sucursales...');
  const branches = [
    {
      name: 'MarVera Centro',
      address: 'Av. Reforma 123, Centro',
      city: 'Mérida',
      state: 'Yucatán',
      postalCode: '97000',
      phone: '+52 999 123 4567',
      email: 'centro@marvera.com',
      latitude: 20.9754,
      longitude: -89.6173,
      openingHours: '08:00 - 20:00 (Lunes a Sábado)',
      services: 'Venta al menudeo, Empaque especializado, Estacionamiento',
      description: 'Nuestra sucursal principal en el centro histórico de Mérida'
    },
    {
      name: 'MarVera Norte',
      address: 'Calle 60 Norte 456, Montebello',
      city: 'Mérida',
      state: 'Yucatán',
      postalCode: '97115',
      phone: '+52 999 234 5678',
      email: 'norte@marvera.com',
      latitude: 21.0285,
      longitude: -89.5926,
      openingHours: '07:30 - 21:00 (Lunes a Domingo)',
      services: 'Venta al mayoreo, Delivery, Estacionamiento amplio',
      description: 'Sucursal moderna con las mejores instalaciones del norte de la ciudad'
    },
    {
      name: 'MarVera Progreso',
      address: 'Malecón 789, Puerto de Progreso',
      city: 'Progreso',
      state: 'Yucatán',
      postalCode: '97320',
      phone: '+52 969 345 6789',
      email: 'progreso@marvera.com',
      latitude: 21.2837,
      longitude: -89.6650,
      openingHours: '06:00 - 18:00 (Lunes a Domingo)',
      services: 'Producto recién pescado, Limpieza de pescado, Hielo',
      description: 'Directamente en el puerto, el marisco más fresco disponible'
    }
  ];

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { name: branch.name },
      update: {},
      create: branch
    });
  }

  // Crear productos destacados
  console.log('🐟 Creando productos...');
  const products = [
    {
      name: 'Huachinango Rojo',
      slug: 'huachinango-rojo',
      description: 'Huachinango fresco del Golfo de México, ideal para preparaciones al horno o a la plancha',
      price: 180.00,
      comparePrice: 220.00,
      categoryId: 1, // Pescados Frescos
      stock: 25,
      unit: 'kg',
      images: JSON.stringify(['/images/huachinango.jpg']),
      isFeatured: true
    },
    {
      name: 'Camarón Jumbo',
      slug: 'camaron-jumbo',
      description: 'Camarones jumbo frescos, perfectos para cocteles y platillos gourmet',
      price: 320.00,
      comparePrice: 380.00,
      categoryId: 3, // Crustáceos
      stock: 15,
      unit: 'kg',
      images: JSON.stringify(['/images/camaron-jumbo.jpg']),
      isFeatured: true
    },
    {
      name: 'Pulpo Fresco',
      slug: 'pulpo-fresco',
      description: 'Pulpo fresco del Caribe mexicano, tierno y sabroso',
      price: 280.00,
      comparePrice: 320.00,
      categoryId: 4, // Moluscos
      stock: 12,
      unit: 'kg',
      images: JSON.stringify(['/images/pulpo.jpg']),
      isFeatured: true
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product
    });
  }

  console.log('✅ Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
