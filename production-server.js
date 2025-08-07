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

// =================== OFFERS ENDPOINTS ===================
// Middleware de autenticación para admin
const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acceso requerido' 
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, 'marvera-secret-key-2024');
    
    if (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso denegado. Se requieren permisos de administrador.' 
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Error en autenticación:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
};

// GET /api/offers - Obtener todas las ofertas activas (público)
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

// GET /api/offers/featured - Obtener ofertas destacadas (público)
app.get('/api/offers/featured', async (req, res) => {
  try {
    console.log('🌟 Featured offers requested');
    
    const offers = await prisma.specialOffer.findMany({
      where: { 
        isActive: true,
        isFeatured: true 
      },
      orderBy: { createdAt: 'desc' }
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

// GET /api/offers/admin - Obtener todas las ofertas (admin)
app.get('/api/offers/admin', authenticateAdmin, async (req, res) => {
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

// POST /api/offers/admin - Crear nueva oferta (admin)
app.post('/api/offers/admin', authenticateAdmin, async (req, res) => {
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
        success: false,
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
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// PUT /api/offers/admin/:id - Actualizar oferta existente (admin)
app.put('/api/offers/admin/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    console.log('📝 Updating offer:', id, updateData);
    
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
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// DELETE /api/offers/admin/:id - Eliminar oferta (admin)
app.delete('/api/offers/admin/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting offer:', id);

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
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// ============================================================================
// SLIDESHOW ROUTES
// ============================================================================

// GET /api/slideshow - Obtener todos los slides activos ordenados
app.get('/api/slideshow', async (req, res) => {
  try {
    const slides = await prisma.slideshow.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
    res.json(slides);
  } catch (error) {
    console.error('❌ Error fetching slideshow:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener el slideshow',
      error: error.message 
    });
  }
});

// GET /api/slideshow/all - Obtener todos los slides (para admin)
app.get('/api/slideshow/all', async (req, res) => {
  try {
    const slides = await prisma.slideshow.findMany({
      orderBy: { order: 'asc' }
    });
    res.json(slides);
  } catch (error) {
    console.error('❌ Error fetching all slides:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener todos los slides',
      error: error.message 
    });
  }
});

// POST /api/slideshow - Crear nuevo slide
app.post('/api/slideshow', authenticateAdmin, async (req, res) => {
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

    const slide = await prisma.slideshow.create({
      data: {
        title,
        subtitle: subtitle || null,
        description: description || null,
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        imageUrl: null, // Simplificado sin uploads por ahora
        backgroundColor: backgroundColor || '#1E3A8A',
        textColor: textColor || '#FFFFFF',
        isActive: isActive === 'true' || isActive === true,
        order: parseInt(order) || 0
      }
    });

    res.status(201).json({
      success: true,
      data: slide
    });
  } catch (error) {
    console.error('❌ Error creating slide:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al crear el slide',
      error: error.message 
    });
  }
});

// PUT /api/slideshow/:id - Actualizar slide
app.put('/api/slideshow/:id', authenticateAdmin, async (req, res) => {
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
      data: {
        title,
        subtitle: subtitle || null,
        description: description || null,
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        backgroundColor: backgroundColor || '#1E3A8A',
        textColor: textColor || '#FFFFFF',
        isActive: isActive === 'true' || isActive === true,
        order: parseInt(order) || 0
      }
    });

    res.json({
      success: true,
      data: slide
    });
  } catch (error) {
    console.error('❌ Error updating slide:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar el slide',
      error: error.message 
    });
  }
});

// DELETE /api/slideshow/:id - Eliminar slide
app.delete('/api/slideshow/:id', authenticateAdmin, async (req, res) => {
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

    await prisma.slideshow.delete({
      where: { id: parseInt(id) }
    });

    res.json({ 
      success: true,
      message: 'Slide eliminado correctamente' 
    });
  } catch (error) {
    console.error('❌ Error deleting slide:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar el slide',
      error: error.message 
    });
  }
});

// PUT /api/slideshow/:id/toggle - Activar/desactivar slide
app.put('/api/slideshow/:id/toggle', authenticateAdmin, async (req, res) => {
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
      data: {
        isActive: !existingSlide.isActive
      }
    });

    res.json({
      success: true,
      data: slide,
      message: `Slide ${slide.isActive ? 'activado' : 'desactivado'} correctamente`
    });
  } catch (error) {
    console.error('❌ Error toggling slide:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al cambiar estado del slide',
      error: error.message 
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
      'GET /api/offers',
      'GET /api/offers/featured',
      'GET /api/offers/admin',
      'POST /api/offers/admin',
      'PUT /api/offers/admin/:id',
      'DELETE /api/offers/admin/:id',
      'POST /api/auth/login',
      'POST /api/auth/login-simple',
      'GET /api/auth/verify',
      'GET /api/admin/products',
      'GET /api/admin/orders',
      'GET /api/wholesale-products/admin/all',
      'GET /api/admin/users/stats',
      'GET /api/admin/users'
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
