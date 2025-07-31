const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const app = express();
const PORT = 3001;
const prisma = new PrismaClient();

// CORS completo
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://marvera.mx', 'https://www.marvera.mx'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    console.log('⚕️ Health check solicitado');
    
    // Verificar conexión a base de datos
    const productCount = await prisma.product.count();
    
    res.json({
      success: true,
      message: 'MarVera Backend funcionando perfectamente!',
      timestamp: new Date().toISOString(),
      database: 'Prisma + SQLite',
      stats: {
        products: productCount,
        uptime: process.uptime()
      }
    });
  } catch (error) {
    console.error('❌ Error en health check:', error);
    res.status(500).json({
      success: false,
      message: 'Error conectando a la base de datos',
      error: error.message
    });
  }
});

// Productos Destacados
app.get('/api/products/featured', async (req, res) => {
  try {
    console.log('🐟 Productos destacados solicitados');
    
    const products = await prisma.product.findMany({
      where: { 
        isFeatured: true,
        isActive: true 
      },
      include: {
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ ${products.length} productos destacados encontrados`);
    
    res.json({
      success: true,
      data: products,
      count: products.length,
      source: 'Prisma + SQLite Local'
    });
  } catch (error) {
    console.error('❌ Error obteniendo productos destacados:', error);
    
    // Fallback con datos estáticos si hay error con la DB
    const fallbackProducts = [
      {
        id: 1,
        name: 'Salmón Atlántico Premium',
        price: 299.99,
        category: { name: 'Pescados', slug: 'pescados' },
        description: 'Salmón fresco del Atlántico Norte',
        isFeatured: true,
        stock: 25
      },
      {
        id: 2,
        name: 'Camarones Jumbo',
        price: 450.00,
        category: { name: 'Mariscos', slug: 'mariscos' },
        description: 'Camarones jumbo frescos',
        isFeatured: true,
        stock: 15
      },
      {
        id: 3,
        name: 'Atún Rojo Premium',
        price: 380.50,
        category: { name: 'Pescados', slug: 'pescados' },
        description: 'Atún rojo de calidad superior',
        isFeatured: true,
        stock: 10
      }
    ];
    
    res.json({
      success: true,
      data: fallbackProducts,
      count: fallbackProducts.length,
      source: 'Fallback Data',
      note: 'Usando datos de respaldo - revisar conexión DB'
    });
  }
});

// Todos los Productos
app.get('/api/products', async (req, res) => {
  try {
    console.log('📦 Todos los productos solicitados');
    
    const { category, search } = req.query;
    
    const where = { isActive: true };
    
    if (category) {
      where.category = { slug: category };
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }]
    });
    
    res.json({
      success: true,
      data: products,
      count: products.length,
      source: 'Prisma + SQLite Local'
    });
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
});

// Categorías
app.get('/api/categories', async (req, res) => {
  try {
    console.log('📂 Categorías solicitadas');
    
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } }
        }
      }
    });
    
    res.json({
      success: true,
      data: categories,
      count: categories.length,
      source: 'Prisma + SQLite Local'
    });
  } catch (error) {
    console.error('❌ Error obteniendo categorías:', error);
    
    // Fallback categories
    const fallbackCategories = [
      { id: 1, name: 'Pescados', slug: 'pescados', _count: { products: 5 } },
      { id: 2, name: 'Mariscos', slug: 'mariscos', _count: { products: 3 } },
      { id: 3, name: 'Moluscos', slug: 'moluscos', _count: { products: 2 } }
    ];
    
    res.json({
      success: true,
      data: fallbackCategories,
      count: fallbackCategories.length,
      source: 'Fallback Data'
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Intento de login:', email);
    
    // Por ahora, login básico para testing
    if (email === 'admin@marvera.com' && password === 'admin123456') {
      res.json({
        success: true,
        message: 'Login exitoso',
        token: 'demo-token-local',
        user: {
          id: 1,
          email: 'admin@marvera.com',
          firstName: 'Admin',
          lastName: 'MarVera',
          role: 'SUPER_ADMIN'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en login',
      error: error.message
    });
  }
});

// Sucursales
app.get('/api/branches/public', (req, res) => {
  console.log('🏢 Sucursales solicitadas');
  
  const branches = [
    {
      id: 1,
      name: 'MarVera Centro',
      address: 'Av. Principal 123, Centro',
      phone: '+52 55 1234 5678',
      openingHours: 'Lun-Dom 8:00-20:00'
    },
    {
      id: 2,
      name: 'MarVera Norte',
      address: 'Blvd. Norte 456, Zona Norte', 
      phone: '+52 55 8765 4321',
      openingHours: 'Lun-Dom 9:00-21:00'
    }
  ];

  res.json({
    success: true,
    data: branches,
    count: branches.length,
    source: 'Static Data'
  });
});

// Error 404
app.use('*', (req, res) => {
  console.log('❌ Ruta no encontrada:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.originalUrl,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/products/featured',
      'GET /api/products',
      'GET /api/categories',
      'POST /api/auth/login',
      'GET /api/branches/public'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error global:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: err.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 MarVera Backend Local iniciado');
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`⚕️ Health: http://localhost:${PORT}/api/health`);
  console.log(`🐟 Productos: http://localhost:${PORT}/api/products/featured`);
  console.log(`💾 Base de datos: Prisma + SQLite`);
  console.log('✅ Listo para desarrollo local');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});
