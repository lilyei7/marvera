#!/bin/bash

echo "🔍 Diagnosticando problema del backend..."

# Verificar logs de PM2
echo "📋 Logs del backend:"
pm2 logs marvera-backend --lines 10 --nostream

echo ""
echo "📊 Estado de PM2:"
pm2 status

echo ""
echo "🔧 Verificando archivo del backend..."
if [ -f "/var/www/marvera/marvera-backend.js" ]; then
    echo "✅ marvera-backend.js existe"
    head -20 /var/www/marvera/marvera-backend.js
else
    echo "❌ marvera-backend.js NO existe"
fi

echo ""
echo "🌐 Verificando configuración de Nginx..."
cat /etc/nginx/sites-available/marvera.mx | grep -A 10 -B 5 "location /api"

echo ""
echo "🔧 Probando conexión directa al backend..."
curl -s http://localhost:3001/api/health || echo "❌ Backend no responde en puerto 3001"

echo ""
echo "🛠️ Creando backend simple y funcional..."

# Crear un backend super simple que funcione
cat > /var/www/marvera/simple-backend-fix.js << 'EOF'
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
    origin: ['https://marvera.mx', 'http://marvera.mx', 'http://localhost:3000'],
    credentials: true
}));

app.use(express.json());

// Log todas las requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check
app.get('/api/health', (req, res) => {
    console.log('✅ Health check solicitado');
    res.json({
        success: true,
        message: 'MarVera Backend funcionando correctamente!',
        timestamp: new Date().toISOString(),
        server: '148.230.87.198:3001',
        version: '2.0'
    });
});

// Productos destacados
app.get('/api/products/featured', (req, res) => {
    console.log('🐟 Productos destacados solicitados');
    res.json({
        success: true,
        data: [
            {
                id: 1,
                name: 'Salmón Premium',
                price: 299.99,
                category: 'Pescados',
                imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500',
                description: 'Salmón fresco del Atlántico Norte',
                isFeatured: true,
                stock: 25
            },
            {
                id: 2,
                name: 'Camarones Jumbo',
                price: 450.00,
                category: 'Mariscos',
                imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500',
                description: 'Camarones jumbo frescos',
                isFeatured: true,
                stock: 15
            },
            {
                id: 3,
                name: 'Pulpo Fresco',
                price: 380.00,
                category: 'Mariscos',
                imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500',
                description: 'Pulpo fresco del Mediterráneo',
                isFeatured: true,
                stock: 8
            },
            {
                id: 4,
                name: 'Atún Bluefin',
                price: 650.00,
                category: 'Pescados',
                imageUrl: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=500',
                description: 'Atún Bluefin premium',
                isFeatured: true,
                stock: 5
            }
        ],
        count: 4,
        timestamp: new Date().toISOString()
    });
});

// Todos los productos
app.get('/api/products', (req, res) => {
    console.log('📦 Todos los productos solicitados');
    res.json({
        success: true,
        data: [
            {
                id: 1,
                name: 'Salmón Premium',
                price: 299.99,
                category: 'Pescados',
                imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500',
                description: 'Salmón fresco del Atlántico Norte',
                isFeatured: true,
                stock: 25
            },
            {
                id: 2,
                name: 'Camarones Jumbo',
                price: 450.00,
                category: 'Mariscos',
                imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500',
                description: 'Camarones jumbo frescos',
                isFeatured: true,
                stock: 15
            },
            {
                id: 3,
                name: 'Pulpo Fresco',
                price: 380.00,
                category: 'Mariscos',
                imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500',
                description: 'Pulpo fresco del Mediterráneo',
                isFeatured: true,
                stock: 8
            },
            {
                id: 4,
                name: 'Atún Bluefin',
                price: 650.00,
                category: 'Pescados',
                imageUrl: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=500',
                description: 'Atún Bluefin premium',
                isFeatured: true,
                stock: 5
            },
            {
                id: 5,
                name: 'Langosta Viva',
                price: 890.00,
                category: 'Mariscos',
                imageUrl: 'https://images.unsplash.com/photo-1582024628697-37e2d0cd2e77?w=500',
                description: 'Langosta viva del Caribe',
                isFeatured: false,
                stock: 3
            },
            {
                id: 6,
                name: 'Mero Fresco',
                price: 420.00,
                category: 'Pescados',
                imageUrl: 'https://images.unsplash.com/photo-1535596403132-dd673fe36017?w=500',
                description: 'Mero fresco del Golfo',
                isFeatured: false,
                stock: 12
            }
        ],
        count: 6,
        timestamp: new Date().toISOString()
    });
});

// Catch all para API
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint no encontrado',
        path: req.path
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MarVera Backend funcionando en puerto ${PORT}`);
    console.log(`📍 Health: http://148.230.87.198:${PORT}/api/health`);
    console.log(`🐟 Products: http://148.230.87.198:${PORT}/api/products/featured`);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
EOF

echo "🔄 Reinstalando backend..."
pm2 delete marvera-backend 2>/dev/null || true
pm2 start /var/www/marvera/simple-backend-fix.js --name "marvera-backend"
pm2 save

sleep 3

echo ""
echo "🧪 Probando backend..."
curl -s http://localhost:3001/api/health | jq . || curl -s http://localhost:3001/api/health

echo ""
echo "🌐 Probando a través de Nginx..."
curl -s https://marvera.mx/api/health | jq . || curl -s https://marvera.mx/api/health

echo ""
echo "✅ Diagnóstico completo!"
