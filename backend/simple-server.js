const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Initialize Prisma Client
const prisma = new PrismaClient();

// Connect to SQLite database
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ SQLite database connected via Prisma');
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
};

connectDB();

// Basic middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://187.33.155.127:5173',
    'http://187.33.155.127:5174',
    'http://187.33.155.127',
    `http://${process.env.SERVER_IP || '187.33.155.127'}:5173`,
    `http://${process.env.SERVER_IP || '187.33.155.127'}:5174`
  ],
  credentials: true
}));

app.use(express.json());

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(60000); // 60 seconds
  res.setTimeout(60000);
  next();
});

// Request logging
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// Import routes
const authRoutes = require('./src/routes/api/auth');
const userRoutes = require('./src/routes/api/user');
const adminRoutes = require('./src/routes/admin');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Simple health check
app.get('/api/health', (req, res) => {
  console.log('🩺 Health check requested');
  res.json({
    success: true,
    message: 'Backend is running!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Simple products endpoint for testing
app.get('/api/products/featured', (req, res) => {
  console.log('🐟 Featured products requested');
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'Salmón Atlántico',
        price: 299.99,
        category: 'Pescados',
        imageUrl: '🐟',
        description: 'Salmón fresco del Atlántico Norte'
      },
      {
        id: 2,
        name: 'Camarones Jumbo',
        price: 450.00,
        category: 'Mariscos',
        imageUrl: '🦐',
        description: 'Camarones jumbo frescos'
      }
    ]
  });
});

// Simple products endpoint
app.get('/api/products', (req, res) => {
  console.log('📦 All products requested');
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'Salmón Atlántico',
        price: 299.99,
        category: 'Pescados',
        imageUrl: '🐟',
        description: 'Salmón fresco del Atlántico Norte',
        isFeatured: true,
        isAvailable: true
      },
      {
        id: 2,
        name: 'Camarones Jumbo',
        price: 450.00,
        category: 'Mariscos',
        imageUrl: '🦐',
        description: 'Camarones jumbo frescos',
        isFeatured: true,
        isAvailable: true
      },
      {
        id: 3,
        name: 'Atún Rojo',
        price: 380.00,
        category: 'Pescados',
        imageUrl: '🐟',
        description: 'Atún rojo de primera calidad',
        isFeatured: false,
        isAvailable: true
      }
    ]
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('🤔 Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Simple test backend running on port', PORT);
  console.log('🌐 Server accessible from external IPs');
  console.log('📍 Health check: http://187.33.155.127:3001/api/health');
  console.log('🐟 Featured products: http://187.33.155.127:3001/api/products/featured');
  console.log('📦 All products: http://187.33.155.127:3001/api/products');
});
