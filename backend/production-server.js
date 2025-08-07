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

// Featured products endpoint using real database
app.get('/api/products/featured', async (req, res) => {
  try {
    console.log('🐟 Featured products requested');
    
    // Get featured products from database
    const featuredProducts = await prisma.product.findMany({
      where: { 
        isFeatured: true,
        isActive: true 
      },
      include: {
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform for frontend
    const transformedProducts = featuredProducts.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category?.name || 'Sin categoría',
      imageUrl: product.images ? (
        Array.isArray(JSON.parse(product.images)) ? JSON.parse(product.images)[0] : product.images
      ) : `/images/products/default-${product.category?.slug || 'product'}.jpg`,
      description: product.description,
      isFeatured: product.isFeatured,
      stock: product.stock,
      unit: product.unit,
      inStock: product.stock > 0
    }));

    console.log(`✅ ${transformedProducts.length} productos destacados encontrados`);
    res.json({
      success: true,
      data: transformedProducts,
      count: transformedProducts.length,
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

// Special Offers endpoints
app.get('/api/offers', async (req, res) => {
  try {
    console.log('🎁 Special offers requested');
    
    const offers = await prisma.specialOffer.findMany({
      where: { 
        isActive: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ ${offers.length} ofertas encontradas`);
    res.json({
      success: true,
      data: offers,
      count: offers.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error al obtener ofertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

app.get('/api/offers/featured', async (req, res) => {
  try {
    console.log('🌟 Featured offers requested');
    
    const offers = await prisma.specialOffer.findMany({
      where: { 
        isActive: true,
        isFeatured: true 
      },
      orderBy: { createdAt: 'desc' }
      // Mostrar todas las ofertas destacadas activas
    });

    console.log(`✅ ${offers.length} ofertas destacadas encontradas`);
    res.json({
      success: true,
      data: offers,
      count: offers.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error al obtener ofertas destacadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Admin endpoints for special offers
app.get('/api/admin/offers', async (req, res) => {
  try {
    console.log('🔧 Admin offers requested');
    
    const offers = await prisma.specialOffer.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ ${offers.length} ofertas encontradas en admin`);
    res.json({
      success: true,
      data: offers,
      count: offers.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error en admin offers:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
      data: []
    });
  }
});

// Endpoint para subir imagen de oferta
app.post('/api/admin/offers/upload-image', (req, res) => {
  const multer = require('multer');
  const path = require('path');
  
  // Configuración de multer para ofertas
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = '/var/www/marvera/uploads/offers';
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
      cb(null, 'offer_' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB límite
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
      }
    }
  }).single('image');

  upload(req, res, (err) => {
    if (err) {
      console.error('❌ Error uploading offer image:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Error al subir la imagen'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se recibió ningún archivo'
      });
    }

    const imageUrl = `/uploads/offers/${req.file.filename}`;
    console.log('✅ Offer image uploaded:', imageUrl);

    res.json({
      success: true,
      imageUrl: imageUrl,
      message: 'Imagen subida exitosamente'
    });
  });
});

app.post('/api/admin/offers', async (req, res) => {
  try {
    console.log('📝 Creating offer:', req.body);
    
    const {
      title,
      description,
      originalPrice,
      discountPrice,
      discountPercent,
      imageUrl,
      backgroundColor,
      isActive,
      isFeatured,
      validUntil,
      productIds,
      maxRedemptions
    } = req.body;

    // Validar campos requeridos
    if (!title || !description || !originalPrice || !discountPrice) {
      return res.status(400).json({ 
        message: 'Los campos título, descripción, precio original y precio con descuento son requeridos' 
      });
    }

    const offerData = {
      title,
      description,
      originalPrice: parseFloat(originalPrice),
      discountPrice: parseFloat(discountPrice),
      discountPercent: discountPercent ? parseFloat(discountPercent) : null,
      imageUrl: imageUrl || null,
      backgroundColor: backgroundColor || '#1E3A8A',
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      validUntil: validUntil ? new Date(validUntil) : null,
      productIds: productIds ? JSON.stringify(productIds) : null,
      maxRedemptions: maxRedemptions ? parseInt(maxRedemptions) : null
    };

    const offer = await prisma.specialOffer.create({
      data: offerData
    });

    console.log('✅ Oferta creada:', offer.title);
    res.status(201).json({
      success: true,
      data: offer,
      message: 'Oferta creada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al crear oferta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.put('/api/admin/offers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Convertir tipos si es necesario
    if (updateData.originalPrice) updateData.originalPrice = parseFloat(updateData.originalPrice);
    if (updateData.discountPrice) updateData.discountPrice = parseFloat(updateData.discountPrice);
    if (updateData.discountPercent) updateData.discountPercent = parseFloat(updateData.discountPercent);
    if (updateData.maxRedemptions) updateData.maxRedemptions = parseInt(updateData.maxRedemptions);
    if (updateData.validUntil) updateData.validUntil = new Date(updateData.validUntil);
    if (updateData.productIds) updateData.productIds = JSON.stringify(updateData.productIds);

    const offer = await prisma.specialOffer.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    console.log('✅ Oferta actualizada:', offer.title);
    res.json({
      success: true,
      data: offer,
      message: 'Oferta actualizada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al actualizar oferta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.delete('/api/admin/offers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.specialOffer.delete({
      where: { id: parseInt(id) }
    });

    console.log('✅ Oferta eliminada:', id);
    res.json({
      success: true,
      message: 'Oferta eliminada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al eliminar oferta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// ==========================================
// SLIDESHOW ROUTES
// ==========================================

// GET /api/slideshow - Obtener slides activos ordenados
app.get('/api/slideshow', async (req, res) => {
  try {
    console.log('🎬 Slideshow público solicitado');
    
    const slides = await prisma.slideshow.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    console.log(`✅ ${slides.length} slides activos encontrados`);
    res.json({
      success: true,
      data: slides,
      count: slides.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error al obtener slideshow:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/slideshow/all - Obtener todos los slides (admin)
app.get('/api/slideshow/all', async (req, res) => {
  try {
    console.log('🔧 Todos los slides solicitados (admin)');
    
    const slides = await prisma.slideshow.findMany({
      orderBy: { order: 'asc' }
    });
    
    console.log(`✅ ${slides.length} slides encontrados en total`);
    res.json({
      success: true,
      data: slides,
      count: slides.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error en admin slideshow:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
      data: []
    });
  }
});

// POST /api/slideshow - Crear nuevo slide
app.post('/api/slideshow', (req, res) => {
  const multer = require('multer');
  const path = require('path');
  
  // Configuración de multer para slideshow
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = '/var/www/marvera/uploads/slideshow';
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
      cb(null, 'slide_' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB límite
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
      }
    }
  }).single('image');

  upload(req, res, async (err) => {
    if (err) {
      console.error('❌ Error en upload de slide:', err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      const {
        title,
        subtitle,
        description,
        buttonText,
        buttonLink,
        backgroundColor,
        textColor,
        isActive,
        order
      } = req.body;

      let imageUrl = null;
      if (req.file) {
        imageUrl = `/uploads/slideshow/${req.file.filename}`;
      }

      const slide = await prisma.slideshow.create({
        data: {
          title,
          subtitle: subtitle || null,
          description: description || null,
          buttonText: buttonText || null,
          buttonLink: buttonLink || null,
          imageUrl,
          backgroundColor: backgroundColor || '#1E3A8A',
          textColor: textColor || '#FFFFFF',
          isActive: isActive === 'true' || isActive === true,
          order: parseInt(order) || 0
        }
      });

      console.log('✅ Slide creado:', slide.title);
      res.status(201).json({
        success: true,
        data: slide,
        message: 'Slide creado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error al crear slide:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  });
});

// PUT /api/slideshow/:id - Actualizar slide
app.put('/api/slideshow/:id', (req, res) => {
  const multer = require('multer');
  const path = require('path');
  const fs = require('fs');
  
  // Configuración de multer para slideshow
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = '/var/www/marvera/uploads/slideshow';
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
      cb(null, 'slide_' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB límite
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
      }
    }
  }).single('image');

  upload(req, res, async (err) => {
    if (err) {
      console.error('❌ Error en upload de slide:', err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      const { id } = req.params;
      const {
        title,
        subtitle,
        description,
        buttonText,
        buttonLink,
        backgroundColor,
        textColor,
        isActive,
        order
      } = req.body;

      // Buscar slide existente
      const existingSlide = await prisma.slideshow.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingSlide) {
        return res.status(404).json({
          success: false,
          message: 'Slide no encontrado'
        });
      }

      let imageUrl = existingSlide.imageUrl;
      if (req.file) {
        // Eliminar imagen anterior si existe
        if (existingSlide.imageUrl) {
          const oldImagePath = `/var/www/marvera${existingSlide.imageUrl}`;
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        imageUrl = `/uploads/slideshow/${req.file.filename}`;
      }

      const slide = await prisma.slideshow.update({
        where: { id: parseInt(id) },
        data: {
          title,
          subtitle: subtitle || null,
          description: description || null,
          buttonText: buttonText || null,
          buttonLink: buttonLink || null,
          imageUrl,
          backgroundColor: backgroundColor || '#1E3A8A',
          textColor: textColor || '#FFFFFF',
          isActive: isActive === 'true' || isActive === true,
          order: parseInt(order) || 0
        }
      });

      console.log('✅ Slide actualizado:', slide.title);
      res.json({
        success: true,
        data: slide,
        message: 'Slide actualizado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error al actualizar slide:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  });
});

// DELETE /api/slideshow/:id - Eliminar slide
app.delete('/api/slideshow/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fs = require('fs');

    const existingSlide = await prisma.slideshow.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSlide) {
      return res.status(404).json({
        success: false,
        message: 'Slide no encontrado'
      });
    }

    // Eliminar imagen si existe
    if (existingSlide.imageUrl) {
      const imagePath = `/var/www/marvera${existingSlide.imageUrl}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await prisma.slideshow.delete({
      where: { id: parseInt(id) }
    });

    console.log('✅ Slide eliminado:', id);
    res.json({
      success: true,
      message: 'Slide eliminado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al eliminar slide:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/slideshow/:id/toggle - Activar/desactivar slide
app.put('/api/slideshow/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;

    const existingSlide = await prisma.slideshow.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSlide) {
      return res.status(404).json({
        success: false,
        message: 'Slide no encontrado'
      });
    }

    const slide = await prisma.slideshow.update({
      where: { id: parseInt(id) },
      data: { isActive: !existingSlide.isActive }
    });

    console.log('✅ Estado de slide cambiado:', slide.title, '- Activo:', slide.isActive);
    res.json({
      success: true,
      data: slide,
      message: `Slide ${slide.isActive ? 'activado' : 'desactivado'} exitosamente`
    });

  } catch (error) {
    console.error('❌ Error al cambiar estado del slide:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
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
      'GET /api/auth/verify',
      'GET /api/admin/products',
      'GET /api/admin/orders',
      'GET /api/wholesale-products/admin/all',
      'GET /api/admin/users/stats',
      'GET /api/admin/users',
      'GET /api/offers',
      'GET /api/offers/featured',
      'GET /api/admin/offers',
      'POST /api/admin/offers',
      'PUT /api/admin/offers/:id',
      'DELETE /api/admin/offers/:id',
      'POST /api/admin/offers/upload-image',
      'GET /api/slideshow',
      'GET /api/slideshow/all',
      'POST /api/slideshow',
      'PUT /api/slideshow/:id',
      'DELETE /api/slideshow/:id',
      'PUT /api/slideshow/:id/toggle'
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
