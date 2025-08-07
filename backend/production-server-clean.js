const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const SERVER_IP = '148.230.87.198';

// Initialize Prisma Client with better error handling
let prisma;
try {
  prisma = new PrismaClient();
  console.log('✅ SQLite database connected via Prisma');
} catch (error) {
  console.error('❌ Error connecting to database:', error);
}

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    'https://marvera.mx',
    'https://www.marvera.mx',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Timeout middleware
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    console.log('⏰ Request timeout');
    res.status(408).json({ success: false, message: 'Request timeout' });
  });
  next();
});

console.log('🚀 MarVera Backend REAL - Iniciando...');

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MarVera API está funcionando correctamente',
    timestamp: new Date().toISOString(),
    database: 'SQLite with Prisma',
    server: `${SERVER_IP}:${PORT}`,
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Featured products endpoint with better error handling
app.get('/api/products/featured', async (req, res) => {
  try {
    console.log('🐟 Featured products requested');
    
    // Simulate a small delay for database query
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const featuredProducts = [
      {
        id: 1,
        name: 'Salmón Atlántico Premium',
        price: 299.99,
        category: 'Pescados',
        imageUrl: '/products/salmon.jpg',
        description: 'Salmón fresco del Atlántico Norte, ideal para sushi y parrilla',
        isFeatured: true,
        stock: 25,
        weight: '1kg'
      },
      {
        id: 2,
        name: 'Camarones Jumbo',
        price: 450.00,
        category: 'Mariscos',
        imageUrl: '/products/camarones.jpg',
        description: 'Camarones jumbo frescos, perfectos para cócteles y platillos gourmet',
        isFeatured: true,
        stock: 15,
        weight: '500g'
      },
      {
        id: 3,
        name: 'Atún Rojo Premium',
        price: 380.50,
        category: 'Pescados',
        imageUrl: '/products/atun.jpg',
        description: 'Atún rojo de calidad premium para sashimi',
        isFeatured: true,
        stock: 12,
        weight: '800g'
      }
    ];

    res.json({
      success: true,
      data: featuredProducts,
      count: featuredProducts.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error al obtener productos destacados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Endpoint para obtener TODOS los productos con Prisma
app.get('/api/products', async (req, res) => {
  try {
    console.log('🐟 Productos solicitados desde Prisma');
    
    const products = await prisma.product.findMany({
      include: {
        category: true
      },
      where: {
        isActive: true
      }
    });
    
    console.log('🐟 Productos encontrados:', products?.length || 0);
    
    res.json({
      success: true,
      data: products,
      count: products.length
    });
    
  } catch (error) {
    console.error('❌ Error en /api/products:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: []
    });
  }
});

// Endpoint para categorías con Prisma
app.get('/api/products/categories', async (req, res) => {
  try {
    console.log('📂 Categorías solicitadas desde Prisma');
    
    const categories = await prisma.category.findMany();
    
    console.log('📂 Categorías encontradas:', categories?.length || 0);
    
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
    
  } catch (error) {
    console.error('❌ Error en /api/products/categories:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: []
    });
  }
});

// Categories endpoint estático (como fallback)
app.get('/api/categories', (req, res) => {
  try {
    console.log('🏷️ Categories requested');
    
    const categories = [
      {
        id: 1,
        name: 'Pescados',
        slug: 'pescados',
        description: 'Pescados frescos del día',
        isActive: true,
        productCount: 15
      },
      {
        id: 2,
        name: 'Mariscos',
        slug: 'mariscos',
        description: 'Mariscos frescos y congelados',
        isActive: true,
        productCount: 18
      },
      {
        id: 3,
        name: 'Crustáceos',
        slug: 'crustaceos',
        description: 'Cangrejos, langostas y camarones',
        isActive: true,
        productCount: 12
      },
      {
        id: 4,
        name: 'Moluscos',
        slug: 'moluscos',
        description: 'Pulpos, calamares y caracoles de mar',
        isActive: true,
        productCount: 8
      }
    ];

    res.json({
      success: true,
      data: categories,
      count: categories.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Login endpoint que espera el frontend
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt for:', email);
    
    // Simple validation for demo
    if (email === 'admin@marvera.com' && password === 'admin123456') {
      
      // Generate a simple JWT token for demo
      const token = require('jsonwebtoken').sign(
        { 
          id: 3,
          email: 'admin@marvera.com',
          role: 'SUPER_ADMIN'
        },
        'marvera-secret-key-2024',
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        message: 'Login exitoso',
        token: token,
        user: {
          id: 3,
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
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Login simple (como backup)
app.post('/api/auth/login-simple', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login simple attempt for:', email);
    
    // Simple validation for demo
    if (email === 'admin@marvera.com' && password === 'admin123456') {
      
      // Generate a simple JWT token for demo
      const token = require('jsonwebtoken').sign(
        { 
          id: 3,
          email: 'admin@marvera.com',
          role: 'SUPER_ADMIN'
        },
        'marvera-secret-key-2024',
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        message: 'Login exitoso',
        token: token,
        user: {
          id: 3,
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
    console.error('❌ Error en login simple:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Admin endpoints básicos
app.get('/api/admin/products', async (req, res) => {
  try {
    console.log('🔧 Admin products requested');
    
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    });
    
    res.json({
      success: true,
      data: products,
      count: products.length
    });
    
  } catch (error) {
    console.error('❌ Error en admin products:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: []
    });
  }
});

app.get('/api/admin/orders', (req, res) => {
  try {
    console.log('📋 Admin orders requested');
    
    // Mock data for now
    const orders = [];
    
    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
    
  } catch (error) {
    console.error('❌ Error en admin orders:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: []
    });
  }
});

// Catch all for unmatched routes
app.use('*', (req, res) => {
  console.log('🤔 Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /api/health',
      'GET /api/products',
      'GET /api/products/featured',
      'GET /api/products/categories',
      'GET /api/categories',
      'POST /api/auth/login',
      'POST /api/auth/login-simple',
      'GET /api/admin/products',
      'GET /api/admin/orders'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌊 MarVera Backend listening at http://${SERVER_IP}:${PORT}`);
  console.log(`📦 Health check: http://${SERVER_IP}:${PORT}/api/health`);
  console.log(`🐟 Featured products: http://${SERVER_IP}:${PORT}/api/products/featured`);
  console.log(`📦 Todos los productos: http://${SERVER_IP}:${PORT}/api/products`);
  console.log(`🏷️ Categorías: http://${SERVER_IP}:${PORT}/api/categories`);
  console.log(`🔐 Login: POST http://${SERVER_IP}:${PORT}/api/auth/login`);
  console.log(`⏰ Timeout configurado: 30 segundos`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Puerto ${PORT} ya está en uso`);
    process.exit(1);
  } else {
    console.error('❌ Error del servidor:', error);
  }
});
