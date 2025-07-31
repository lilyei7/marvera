const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;
const SERVER_IP = '187.33.155.127';

// Enhanced CORS
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174',
    `http://${SERVER_IP}:5173`,
    `http://${SERVER_IP}:5174`,
    `http://${SERVER_IP}`,
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('⚕️ Health check requested');
  res.json({
    success: true,
    message: 'MarVera Backend Quick Server is running!',
    timestamp: new Date().toISOString(),
    server: `${SERVER_IP}:${PORT}`
  });
});

// Featured products
app.get('/api/products/featured', (req, res) => {
  console.log('🐟 Featured products requested');
  
  const products = [
    {
      id: 1,
      name: 'Salmón Atlántico Premium',
      price: 299.99,
      category: 'Pescados',
      imageUrl: '/products/salmon.jpg',
      description: 'Salmón fresco del Atlántico Norte',
      isFeatured: true,
      stock: 25
    },
    {
      id: 2,
      name: 'Camarones Jumbo',
      price: 450.00,
      category: 'Mariscos',
      imageUrl: '/products/camarones.jpg',
      description: 'Camarones jumbo frescos',
      isFeatured: true,
      stock: 15
    },
    {
      id: 3,
      name: 'Atún Rojo',
      price: 380.50,
      category: 'Pescados',
      imageUrl: '/products/atun.jpg',
      description: 'Atún rojo premium',
      isFeatured: true,
      stock: 12
    }
  ];

  res.json({
    success: true,
    data: products,
    count: products.length,
    timestamp: new Date().toISOString()
  });
});

// All products
app.get('/api/products', (req, res) => {
  console.log('📦 All products requested');
  
  const products = [
    {
      id: 1,
      name: 'Salmón Atlántico Premium',
      price: 299.99,
      category: 'Pescados',
      imageUrl: '/products/salmon.jpg',
      description: 'Salmón fresco del Atlántico Norte',
      stock: 25
    },
    {
      id: 2,
      name: 'Camarones Jumbo',
      price: 450.00,
      category: 'Mariscos',
      imageUrl: '/products/camarones.jpg',
      description: 'Camarones jumbo frescos',
      stock: 15
    },
    {
      id: 3,
      name: 'Atún Rojo',
      price: 380.50,
      category: 'Pescados',
      imageUrl: '/products/atun.jpg',
      description: 'Atún rojo premium',
      stock: 12
    }
  ];

  res.json({
    success: true,
    data: products,
    count: products.length
  });
});

// Auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log('🔐 Login attempt:', email);
  
  if (email === 'admin@marvera.com' && password === 'admin123456') {
    res.json({
      success: true,
      message: 'Login exitoso',
      token: 'demo-token-12345',
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
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 MarVera Quick Server iniciado');
  console.log('🌐 Servidor accesible desde IPs externas');
  console.log(`📍 Health: http://${SERVER_IP}:${PORT}/api/health`);
  console.log(`🐟 Featured: http://${SERVER_IP}:${PORT}/api/products/featured`);
  console.log(`📦 Products: http://${SERVER_IP}:${PORT}/api/products`);
  console.log(`🔐 Login: POST http://${SERVER_IP}:${PORT}/api/auth/login`);
});
