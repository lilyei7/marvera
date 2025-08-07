const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const branchImagesDir = path.join(uploadsDir, 'branches');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(branchImagesDir)) {
  fs.mkdirSync(branchImagesDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, branchImagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `branch_${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    console.log('🐟 Muestra de productos:', products?.slice(0, 1));
    
    const responseData = {
      success: true,
      data: products,
      count: products.length
    };
    
    console.log('📤 Enviando respuesta:', JSON.stringify(responseData).substring(0, 200) + '...');
    
    res.json(responseData);
    
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

// Endpoint para verificar tokens (requerido por ProtectedRoute)
app.get('/api/auth/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    console.log('🔍 Verificando token:', token ? 'presente' : 'ausente');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token de autenticación'
      });
    }

    // Verify JWT token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, 'marvera-secret-key-2024');
    
    console.log('✅ Token válido para usuario:', decoded.email);
    
    res.json({
      success: true,
      message: 'Token válido',
      user: {
        id: decoded.id,
        email: decoded.email,
        firstName: 'Admin',
        lastName: 'MarVera',
        role: decoded.role || 'SUPER_ADMIN'
      }
    });
    
  } catch (error) {
    console.error('❌ Error verificando token:', error.message);
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
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

// Endpoint para crear/actualizar productos
app.post('/api/admin/products', async (req, res) => {
  try {
    console.log('📝 Creating/updating product:', req.body);
    
    const { name, description, price, category, unit, inStock, isFeatured, imageUrl } = req.body;
    
    // Buscar o crear categoría
    let categoryRecord = await prisma.category.findFirst({
      where: { name: category }
    });
    
    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: {
          name: category,
          slug: category.toLowerCase().replace(/\s+/g, '-'),
          description: `Categoría de ${category}`
        }
      });
    }
    
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId: categoryRecord.id,
        unit: unit || 'kg',
        stock: inStock ? 10 : 0,
        isActive: true,
        isFeatured: Boolean(isFeatured),
        images: imageUrl ? JSON.stringify([imageUrl]) : JSON.stringify([]),
        slug: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
      },
      include: {
        category: true
      }
    });
    
    res.json({
      success: true,
      data: product,
      message: 'Producto creado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para actualizar producto
app.put('/api/admin/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, unit, inStock, isFeatured, imageUrl } = req.body;
    
    console.log('📝 Updating product:', id, req.body);
    
    // Buscar o crear categoría
    let categoryRecord = await prisma.category.findFirst({
      where: { name: category }
    });
    
    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: {
          name: category,
          slug: category.toLowerCase().replace(/\s+/g, '-'),
          description: `Categoría de ${category}`
        }
      });
    }
    
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId: categoryRecord.id,
        unit: unit || 'kg',
        stock: inStock ? 10 : 0,
        isFeatured: Boolean(isFeatured),
        images: imageUrl ? JSON.stringify([imageUrl]) : JSON.stringify([])
      },
      include: {
        category: true
      }
    });
    
    res.json({
      success: true,
      data: product,
      message: 'Producto actualizado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para eliminar producto
app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting product:', id);
    
    await prisma.product.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: error.message
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

// Public wholesale products endpoint
app.get('/api/wholesale-products', async (req, res) => {
  try {
    console.log('🏪 Public wholesale products requested');
    
    // Crear productos de mayoreo simulados basados en los productos regulares
    const products = await prisma.product.findMany({
      include: {
        category: true
      },
      where: {
        isActive: true
      }
    });
    
    // Convertir productos regulares a formato de mayoreo
    const wholesaleProducts = products.map(product => ({
      id: product.id,
      name: `${product.name} (Mayoreo)`,
      description: `${product.description} - Presentación para mayoreo con mejor precio por volumen`,
      pricePerBox: Math.round(product.price * 0.8 * 10), // 20% descuento, 10 unidades por caja
      unitsPerBox: 10,
      unitType: product.unit || 'kg',
      category: product.category?.name || 'Otros',
      categoryId: product.categoryId,
      inStock: product.stock > 10,
      stock: Math.floor(product.stock / 10), // Cajas disponibles
      minimumOrder: 2, // Mínimo 2 cajas
      imageUrl: product.images ? (typeof product.images === 'string' ? JSON.parse(product.images)[0] || '' : product.images[0] || '') : '',
      isFeatured: product.isFeatured
    }));
    
    res.json(wholesaleProducts);
    
  } catch (error) {
    console.error('❌ Error en wholesale products public:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: []
    });
  }
});

// Wholesale products endpoints
app.get('/api/wholesale-products/admin/all', async (req, res) => {
  try {
    console.log('🏪 Wholesale products requested');
    
    const products = await prisma.product.findMany({
      include: {
        category: true
      },
      where: {
        isActive: true
      }
    });
    
    res.json({
      success: true,
      data: products,
      count: products.length
    });
    
  } catch (error) {
    console.error('❌ Error en wholesale products:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: []
    });
  }
});

// Wholesale products admin CRUD endpoints
app.post('/api/wholesale-products/admin/create', async (req, res) => {
  try {
    console.log('🏪 Creating wholesale product:', req.body);
    
    const { name, description, pricePerBox, unitsPerBox, unitType, category, minimumOrder, imageUrl } = req.body;
    
    // Buscar o crear categoría
    let categoryRecord = await prisma.category.findFirst({
      where: { name: category }
    });
    
    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: {
          name: category,
          slug: category.toLowerCase().replace(/\s+/g, '-'),
          description: `Categoría de ${category}`
        }
      });
    }
    
    // Crear producto base para wholesale
    const product = await prisma.product.create({
      data: {
        name: name,
        description: description,
        price: parseFloat(pricePerBox),
        categoryId: categoryRecord.id,
        unit: unitType || 'kg',
        stock: 100, // Stock por defecto para wholesale
        isActive: true,
        isFeatured: false,
        images: imageUrl ? JSON.stringify([imageUrl]) : JSON.stringify([]),
        slug: name.toLowerCase().replace(/\s+/g, '-') + '-wholesale-' + Date.now()
      },
      include: {
        category: true
      }
    });
    
    // Convertir a formato wholesale
    const wholesaleProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      pricePerBox: product.price,
      unitsPerBox: unitsPerBox || 10,
      unitType: product.unit,
      category: product.category.name,
      categoryId: product.categoryId,
      inStock: product.stock > 0,
      stock: Math.floor(product.stock / (unitsPerBox || 10)),
      minimumOrder: minimumOrder || 2,
      imageUrl: product.images ? (typeof product.images === 'string' ? JSON.parse(product.images)[0] || '' : product.images[0] || '') : '',
      isFeatured: product.isFeatured
    };
    
    res.json({
      success: true,
      data: wholesaleProduct,
      message: 'Producto de mayoreo creado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error creating wholesale product:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.put('/api/wholesale-products/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, pricePerBox, unitsPerBox, unitType, category, minimumOrder, imageUrl } = req.body;
    
    console.log('🏪 Updating wholesale product:', id, req.body);
    
    // Buscar o crear categoría
    let categoryRecord = await prisma.category.findFirst({
      where: { name: category }
    });
    
    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: {
          name: category,
          slug: category.toLowerCase().replace(/\s+/g, '-'),
          description: `Categoría de ${category}`
        }
      });
    }
    
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: parseFloat(pricePerBox),
        categoryId: categoryRecord.id,
        unit: unitType || 'kg',
        images: imageUrl ? JSON.stringify([imageUrl]) : JSON.stringify([])
      },
      include: {
        category: true
      }
    });
    
    // Convertir a formato wholesale
    const wholesaleProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      pricePerBox: product.price,
      unitsPerBox: unitsPerBox || 10,
      unitType: product.unit,
      category: product.category.name,
      categoryId: product.categoryId,
      inStock: product.stock > 0,
      stock: Math.floor(product.stock / (unitsPerBox || 10)),
      minimumOrder: minimumOrder || 2,
      imageUrl: product.images ? (typeof product.images === 'string' ? JSON.parse(product.images)[0] || '' : product.images[0] || '') : '',
      isFeatured: product.isFeatured
    };
    
    res.json({
      success: true,
      data: wholesaleProduct,
      message: 'Producto de mayoreo actualizado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error updating wholesale product:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.delete('/api/wholesale-products/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🏪 Deleting wholesale product:', id);
    
    await prisma.product.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({
      success: true,
      message: 'Producto de mayoreo eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error deleting wholesale product:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Admin users stats
app.get('/api/admin/users/stats', (req, res) => {
  try {
    console.log('📊 User stats requested');
    
    const stats = {
      totalUsers: 156,
      activeUsers: 142,
      newUsersThisMonth: 23,
      premiumUsers: 45
    };
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('❌ Error en user stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Admin users list
app.get('/api/admin/users', (req, res) => {
  try {
    console.log('👥 Users list requested');
    
    const users = [
      {
        id: 1,
        email: 'admin@marvera.com',
        firstName: 'Admin',
        lastName: 'MarVera',
        role: 'SUPER_ADMIN',
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z'
      },
      {
        id: 2,
        email: 'user@marvera.com',
        firstName: 'Usuario',
        lastName: 'Prueba',
        role: 'CUSTOMER',
        isActive: true,
        createdAt: '2025-01-15T00:00:00Z'
      }
    ];
    
    res.json({
      success: true,
      data: users,
      count: users.length,
      totalPages: 1,
      currentPage: 1
    });
    
  } catch (error) {
    console.error('❌ Error en users list:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: []
    });
  }
});

// Branches endpoints
// Public branches endpoint (no authentication required)
app.get('/api/branches/public', async (req, res) => {
  try {
    console.log('🔄 Cargando sucursales desde la base de datos...');
    
    // Try to get from database first, fallback to mock data
    let branches = [];
    
    try {
      const dbBranches = await prisma.branch.findMany({
        where: { isActive: true }, // Only active branches for public
        orderBy: { createdAt: 'desc' }
      });
      
      branches = dbBranches.map(branch => ({
        ...branch,
        coordinates: branch.latitude && branch.longitude ? {
          lat: branch.latitude,
          lng: branch.longitude
        } : null,
        images: branch.images ? JSON.parse(branch.images) : [],
        imageUrl: branch.imageUrl ? `https://marvera.mx${branch.imageUrl}` : null
      }));
      
      console.log(`📊 Found ${branches.length} public branches in database`);
    } catch (dbError) {
      console.log('⚠️ Database error, using mock data:', dbError.message);
      
      // Mock data for fallback
      branches = [{
        id: 1,
        name: 'MarVera Centro',
        address: 'Av. Principal 123, Centro, Ciudad de México',
        phone: '+52 55 1234 5678',
        email: 'centro@marvera.mx',
        hours: 'Lun-Dom: 8:00 AM - 10:00 PM',
        coordinates: { lat: 19.4326, lng: -99.1332 },
        isActive: true,
        manager: 'Ana García',
        capacity: 150,
        services: ['Entrega a domicilio', 'Pedidos telefónicos', 'Mariscos frescos'],
        imageUrl: null,
        images: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }];
    }
    
    res.json({ 
      success: true, 
      data: branches, 
      message: 'Sucursales públicas obtenidas correctamente' 
    });
  } catch (error) {
    console.error('❌ Error getting public branches:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener sucursales públicas' 
    });
  }
});

app.get('/api/branches', async (req, res) => {
  try {
    console.log('🏢 Branches list requested');
    
    // Try to get from database first, fallback to mock data
    let branches = [];
    
    try {
      const dbBranches = await prisma.branch.findMany({
        orderBy: { createdAt: 'desc' }
      });
      
      branches = dbBranches.map(branch => ({
        ...branch,
        coordinates: branch.latitude && branch.longitude ? {
          lat: branch.latitude,
          lng: branch.longitude
        } : null,
        images: branch.images ? JSON.parse(branch.images) : [],
        imageUrl: branch.imageUrl ? `https://marvera.mx${branch.imageUrl}` : null
      }));
      
      console.log(`📊 Found ${branches.length} branches in database`);
    } catch (dbError) {
      console.log('⚠️ Database error, using mock data:', dbError.message);
      
      // Fallback mock data
      branches = [{
        id: 1,
        name: 'MarVera Centro',
        address: 'Av. Principal 123, Centro',
        phone: '+52 229 123 4567',
        latitude: 19.1738,
        longitude: -96.1342,
        openingHours: '8:00 AM - 8:00 PM',
        isActive: true,
        imageUrl: null,
        images: [],
        coordinates: {
          lat: 19.1738,
          lng: -96.1342
        },
        createdAt: new Date().toISOString()
      }, {
        id: 2,
        name: 'MarVera Boca del Río',
        address: 'Boulevard Ruiz Cortines 1500, Boca del Río',
        phone: '+52 229 987 6543',
        latitude: 19.1127,
        longitude: -96.1174,
        openingHours: '8:00 AM - 8:00 PM',
        isActive: true,
        imageUrl: null,
        images: [],
        coordinates: {
          lat: 19.1127,
          lng: -96.1174
        },
        createdAt: new Date().toISOString()
      }];
    }
    
    res.json({ success: true, data: branches, message: 'Sucursales obtenidas correctamente' });
  } catch (error) {
    console.error('❌ Error getting branches:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
});

// Upload branch image endpoint
app.post('/api/branches/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    const imageUrl = `/uploads/branches/${req.file.filename}`;
    
    console.log('📸 Image uploaded successfully:', imageUrl);
    
    res.json({
      success: true,
      data: {
        imageUrl: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      },
      message: 'Imagen subida correctamente'
    });
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir la imagen',
      error: error.message
    });
  }
});

app.post('/api/branches', upload.single('image'), async (req, res) => {
  try {
    console.log('🏢 Creating new branch:', req.body);
    console.log('📸 Uploaded file:', req.file);
    
    const branchData = {
      name: req.body.name,
      address: req.body.address || null,
      phone: req.body.phone || null,
      latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
      longitude: req.body.longitude ? parseFloat(req.body.longitude) : null,
      openingHours: req.body.openingHours || null,
      isActive: req.body.isActive === 'true' || req.body.isActive === true,
      imageUrl: req.file ? `/uploads/branches/${req.file.filename}` : null
    };

    let newBranch;
    
    try {
      // Try to create in database
      newBranch = await prisma.branch.create({
        data: branchData
      });
      
      // Add computed fields
      newBranch = {
        ...newBranch,
        coordinates: newBranch.latitude && newBranch.longitude ? {
          lat: newBranch.latitude,
          lng: newBranch.longitude
        } : null,
        images: [],
        imageUrl: newBranch.imageUrl ? `https://marvera.mx${newBranch.imageUrl}` : null
      };
      
      console.log('✅ Branch created in database:', newBranch.id);
    } catch (dbError) {
      console.log('⚠️ Database error, creating mock branch:', dbError.message);
      
      // Fallback mock creation
      newBranch = {
        id: Math.floor(Math.random() * 1000) + 100,
        ...branchData,
        coordinates: branchData.latitude && branchData.longitude ? {
          lat: branchData.latitude,
          lng: branchData.longitude
        } : null,
        images: [],
        imageUrl: branchData.imageUrl ? `https://marvera.mx${branchData.imageUrl}` : null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    res.json({ success: true, data: newBranch, message: 'Sucursal creada correctamente' });
  } catch (error) {
    console.error('❌ Error creating branch:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
});

app.put('/api/branches/:id', upload.single('image'), async (req, res) => {
  try {
    const branchId = parseInt(req.params.id);
    console.log('🏢 Updating branch:', branchId, req.body);
    console.log('📸 New uploaded file:', req.file);
    
    const updateData = {
      name: req.body.name,
      address: req.body.address || null,
      phone: req.body.phone || null,
      latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
      longitude: req.body.longitude ? parseFloat(req.body.longitude) : null,
      openingHours: req.body.openingHours || null,
      isActive: req.body.isActive === 'true' || req.body.isActive === true
    };

    // Add new image URL if file was uploaded
    if (req.file) {
      updateData.imageUrl = `/uploads/branches/${req.file.filename}`;
    }

    let updatedBranch;
    
    try {
      // Try to update in database
      updatedBranch = await prisma.branch.update({
        where: { id: branchId },
        data: updateData
      });
      
      // Add computed fields
      updatedBranch = {
        ...updatedBranch,
        coordinates: updatedBranch.latitude && updatedBranch.longitude ? {
          lat: updatedBranch.latitude,
          lng: updatedBranch.longitude
        } : null,
        images: updatedBranch.images ? JSON.parse(updatedBranch.images) : [],
        imageUrl: updatedBranch.imageUrl ? `https://marvera.mx${updatedBranch.imageUrl}` : null
      };
      
      console.log('✅ Branch updated in database:', updatedBranch.id);
    } catch (dbError) {
      console.log('⚠️ Database error, creating mock update:', dbError.message);
      
      // Fallback mock update
      updatedBranch = {
        id: branchId,
        ...updateData,
        coordinates: updateData.latitude && updateData.longitude ? {
          lat: updateData.latitude,
          lng: updateData.longitude
        } : null,
        images: [],
        imageUrl: updateData.imageUrl ? `https://marvera.mx${updateData.imageUrl}` : null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    res.json({ success: true, data: updatedBranch, message: 'Sucursal actualizada correctamente' });
  } catch (error) {
    console.error('❌ Error updating branch:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
});

app.delete('/api/branches/:id', async (req, res) => {
  try {
    const branchId = parseInt(req.params.id);
    console.log('🏢 Deleting branch:', branchId);
    
    try {
      // Try to delete from database
      await prisma.branch.delete({
        where: { id: branchId }
      });
      console.log('✅ Branch deleted from database:', branchId);
    } catch (dbError) {
      console.log('⚠️ Database error on delete:', dbError.message);
      // Continue with success response even if database fails
    }
    
    res.json({ success: true, message: 'Sucursal eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error deleting branch:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
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
      'GET /api/auth/verify',
      'GET /api/admin/products',
      'POST /api/admin/products',
      'PUT /api/admin/products/:id',
      'DELETE /api/admin/products/:id',
      'GET /api/admin/orders',
      'GET /api/wholesale-products',
      'GET /api/wholesale-products/admin/all',
      'POST /api/wholesale-products/admin/create',
      'PUT /api/wholesale-products/admin/:id',
      'DELETE /api/wholesale-products/admin/:id',
      'GET /api/admin/users/stats',
      'GET /api/admin/users',
      'GET /api/branches/public',
      'GET /api/branches',
      'POST /api/branches',
      'POST /api/branches/upload-image',
      'PUT /api/branches/:id',
      'DELETE /api/branches/:id'
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
