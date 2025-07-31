#!/bin/bash

# Script para levantar el backend de MarVera en el servidor
echo "🚀 Iniciando servidor MarVera Backend..."

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Instalando..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Ir al directorio del backend
cd /root/marvera/backend

# Verificar si existe package.json
if [ ! -f "package.json" ]; then
    echo "📦 Inicializando proyecto Node.js..."
    npm init -y
    npm install express cors
fi

# Crear servidor básico si no existe
if [ ! -f "server.js" ]; then
    echo "🔧 Creando servidor básico..."
    cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// CORS configuration
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  console.log('⚕️ Health check requested');
  res.json({
    success: true,
    message: 'MarVera Backend funcionando!',
    timestamp: new Date().toISOString(),
    server: '187.33.155.127:3001'
  });
});

// Featured products
app.get('/api/products/featured', (req, res) => {
  console.log('🐟 Productos destacados solicitados');
  
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
    count: products.length
  });
});

// All products
app.get('/api/products', (req, res) => {
  console.log('📦 Todos los productos solicitados');
  
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
  console.log('🔐 Intento de login:', email);
  
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

// Branches endpoint
app.get('/api/branches/public', (req, res) => {
  console.log('🏢 Sucursales solicitadas');
  
  const branches = [
    {
      id: 1,
      name: 'MarVera Centro',
      address: 'Av. Principal 123, Centro',
      phone: '+52 55 1234 5678',
      hours: 'Lun-Dom 8:00-20:00'
    },
    {
      id: 2,
      name: 'MarVera Norte',
      address: 'Blvd. Norte 456, Zona Norte',
      phone: '+52 55 8765 4321',
      hours: 'Lun-Dom 9:00-21:00'
    }
  ];

  res.json({
    success: true,
    data: branches,
    count: branches.length
  });
});

// Wholesale products
app.get('/api/wholesale-products', (req, res) => {
  console.log('📦 Productos de mayoreo solicitados');
  
  const wholesaleProducts = [
    {
      id: 1,
      name: 'Salmón Atlántico - Caja 10kg',
      price: 2500.00,
      minOrder: 5,
      unit: 'caja',
      description: 'Salmón fresco para restaurantes'
    },
    {
      id: 2,
      name: 'Camarones Jumbo - Caja 5kg',
      price: 1800.00,
      minOrder: 3,
      unit: 'caja',
      description: 'Camarones jumbo para hoteles'
    }
  ];

  res.json({
    success: true,
    data: wholesaleProducts,
    count: wholesaleProducts.length
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ Ruta no encontrada:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 MarVera Backend iniciado exitosamente');
  console.log(`📍 Servidor: http://187.33.155.127:${PORT}`);
  console.log(`⚕️ Health: http://187.33.155.127:${PORT}/api/health`);
  console.log(`🐟 Productos: http://187.33.155.127:${PORT}/api/products/featured`);
  console.log('✅ Listo para recibir conexiones');
});

EOF
fi

# Matar procesos existentes en puerto 3001
echo "🔄 Limpiando puerto 3001..."
sudo pkill -f "node.*3001" 2>/dev/null || true
sudo fuser -k 3001/tcp 2>/dev/null || true

# Iniciar servidor
echo "🚀 Iniciando servidor en puerto 3001..."
nohup node server.js > server.log 2>&1 &

# Esperar un momento
sleep 2

# Verificar que esté funcionando
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Servidor iniciado correctamente!"
    echo "📍 Accesible en: http://187.33.155.127:3001"
    echo "📋 Ver logs: tail -f /root/marvera/backend/server.log"
else
    echo "❌ Error al iniciar el servidor"
    echo "📋 Ver logs: cat /root/marvera/backend/server.log"
fi
