#!/bin/bash

# MARVERA - Servidor persistente con PM2
cd /var/www/marvera/backend

echo "Matando procesos anteriores..."
pkill -f "node.*3001" 2>/dev/null
pm2 delete marvera-backend 2>/dev/null

echo "Creando servidor persistente..."
cat > server-persistent.js << 'EOF'
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS configurado
app.use(cors({
  origin: ['https://marvera.mx', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// Servir archivos estaticos del frontend
app.use(express.static(path.join(__dirname, '../dist')));

// API Health - FUNCIONANDO
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MarVera Backend funcionando',
    time: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Products con datos reales
app.get('/api/products', async (req, res) => {
  try {
    // Intentar con Prisma primero
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const products = await prisma.product.findMany({
      include: { category: true }
    });
    
    if (products.length > 0) {
      return res.json(products);
    }
  } catch (error) {
    console.log('Prisma error, usando fallback:', error.message);
  }
  
  // Datos de respaldo si Prisma falla
  const fallbackProducts = [
    {
      id: 1,
      name: "Camaron Premium del Golfo",
      price: 299.99,
      description: "Camaron fresco capturado en el Golfo de Mexico",
      image: "/images/products/camaron-premium.jpg",
      category: { id: 1, name: "Mariscos" },
      stock: 25,
      weight: "1 kg",
      origin: "Golfo de Mexico"
    },
    {
      id: 2,
      name: "Salmon Atlantico Fresco",
      price: 450.00,
      description: "Salmon fresco importado del Atlantico Norte",
      image: "/images/products/salmon-atlantico.jpg",
      category: { id: 2, name: "Pescados" },
      stock: 15,
      weight: "1.5 kg",
      origin: "Atlantico Norte"
    },
    {
      id: 3,
      name: "Pulpo Fresco",
      price: 380.00,
      description: "Pulpo fresco del Pacifico mexicano",
      image: "/images/products/pulpo-fresco.jpg",
      category: { id: 1, name: "Mariscos" },
      stock: 12,
      weight: "800g",
      origin: "Pacifico Mexicano"
    },
    {
      id: 4,
      name: "Atun Rojo Premium",
      price: 520.00,
      description: "Atun rojo de calidad sashimi",
      image: "/images/products/atun-rojo.jpg",
      category: { id: 2, name: "Pescados" },
      stock: 8,
      weight: "1 kg",
      origin: "Pacifico"
    }
  ];
  
  res.json(fallbackProducts);
});

// API Products destacados
app.get('/api/products/featured', async (req, res) => {
  try {
    const response = await fetch('http://localhost:3001/api/products');
    const allProducts = await response.json();
    const featured = allProducts.slice(0, 3);
    res.json({ products: featured, count: featured.length });
  } catch (error) {
    res.json({ products: [], count: 0 });
  }
});

// API Categorias
app.get('/api/categories', (req, res) => {
  res.json([
    { id: 1, name: "Mariscos", description: "Mariscos frescos del golfo" },
    { id: 2, name: "Pescados", description: "Pescados frescos importados" },
    { id: 3, name: "Moluscos", description: "Moluscos y bivalvos" }
  ]);
});

// Catch-all para React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🐟 MarVera Backend ejecutandose en puerto ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada:', reason);
});
EOF

echo "Instalando dependencias necesarias..."
npm install express cors @prisma/client --save 2>/dev/null

echo "Iniciando con PM2..."
pm2 start server-persistent.js --name "marvera-backend" --watch

echo "Guardando configuracion PM2..."
pm2 save
pm2 startup

sleep 3

echo "Verificando servidor..."
if curl -s http://localhost:3001/api/health > /dev/null; then
  echo "✅ SERVIDOR PERSISTENTE INICIADO"
  echo "🌐 Health: http://localhost:3001/api/health"
  echo "📦 Products: http://localhost:3001/api/products"
  
  # Mostrar status
  pm2 status
else
  echo "❌ ERROR - Servidor no responde"
  pm2 logs marvera-backend --lines 10
fi
