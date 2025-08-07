const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Import routes - comentados temporalmente
// const adminRoutes = require('./src/routes/admin');
// const wholesaleRoutes = require('./routes/wholesaleProducts');
// const authRoutes = require('./src/routes/api/auth');

const app = express();
const PORT = process.env.PORT || 3001;
const SERVER_IP = '148.230.87.198';

// Initialize Prisma Client with better error handling
const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

// Connect to SQLite database
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ SQLite database connected via Prisma');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Enhanced CORS configuration for production
app.use(cors({
  origin: [
    'https://marvera.mx',
    'https://www.marvera.mx',
    'http://marvera.mx',
    'http://www.marvera.mx',
    'http://localhost:5173', 
    'http://localhost:5174',
    `http://${SERVER_IP}:5173`,
    `http://${SERVER_IP}:5174`,
    `http://${SERVER_IP}`,
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 seconds
  res.setTimeout(30000);
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// Register routes - temporalmente comentados
// app.use('/api/admin', adminRoutes);
// app.use('/api/wholesale-products', wholesaleRoutes);
// app.use('/api/auth', authRoutes);

// Health check with detailed info
app.get('/api/health', (req, res) => {
  console.log('⚕️ Health check requested');
  res.json({
    success: true,
    message: 'MarVera Backend is running!',
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
        name: 'Atún Rojo',
        price: 380.50,
        category: 'Pescados',
        imageUrl: '/products/atun.jpg',
        description: 'Atún rojo de la mejor calidad, excelente para sashimi',
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

// All products endpoint
// Endpoint simple para categorías con Prisma
app.get('/api/products/categories', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const categories = await prisma.category.findMany();
    
    console.log('📂 Categorías encontradas:', categories?.length || 0);
    
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error en /api/products/categories:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: []
    });
  }
});

// Categories endpoint (static) - mantener como fallback
app.get('/api/categories', (req, res) => {
  try {
    console.log('🏷️ Categories requested');
    
    const categories = [
      {
        id: 1,
        name: 'Pescados',
        slug: 'pescados',
        description: 'Pescados frescos de la mejor calidad',
        isActive: true,
        productCount: 25
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

// Authentication endpoints - Usando rutas del archivo auth.js
// Ruta temporal de login simple para debugging
app.post('/api/auth/login-simple', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Simple login attempt for:', email);
    
    // Validación simple para admin
    if (email === 'admin@marvera.com' && password === 'admin123456') {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { 
          userId: 3, 
          email: 'admin@marvera.com',
          role: 'SUPER_ADMIN' 
        },
        process.env.JWT_SECRET || 'your-secret-key',
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

// Endpoint simple para obtener TODOS los productos con Prisma
app.get('/api/products', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
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
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error en /api/products:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: []
    });
  }
});

// Login normal que espera el frontend
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
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt for:', email);
    
    // Simple validation for demo
    if (email === 'admin@marvera.com' && password === 'admin123456') {
      res.json({
        success: true,
        message: 'Login exitoso',
        token: 'fake-jwt-token-for-demo',
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
      message: 'Error interno del servidor',
      error: error.message
    });
  }
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

// 404 handler
app.use('*', (req, res) => {
  console.log('🤔 Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.originalUrl,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/products/featured',
      'GET /api/products',
      'GET /api/categories',
      'POST /api/auth/login'
    ]
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 MarVera Production Server iniciado');
  console.log('🌐 Servidor accesible desde IPs externas');
  console.log(`📍 Health check: http://${SERVER_IP}:${PORT}/api/health`);
  console.log(`🐟 Productos destacados: http://${SERVER_IP}:${PORT}/api/products/featured`);
  console.log(`📦 Todos los productos: http://${SERVER_IP}:${PORT}/api/products`);
  console.log(`🏷️ Categorías: http://${SERVER_IP}:${PORT}/api/categories`);
  console.log(`🔐 Login: POST http://${SERVER_IP}:${PORT}/api/auth/login`);
  console.log('⏰ Timeout configurado: 30 segundos');
});
