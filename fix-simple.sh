#!/bin/bash

# MARVERA FIX DIRECTO - Sin salidas complejas
cd /var/www/marvera

# Paso 1: Matar procesos antiguos
pkill -f "node.*3001" 2>/dev/null
sleep 2

# Paso 2: Instalar dependencias si no existen
cd backend
if [ ! -d "node_modules" ]; then
  npm install --silent
fi

# Paso 3: Crear archivo de conexion simple
cat > server-simple.js << 'EOF'
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Servir archivos estaticos
app.use(express.static(path.join(__dirname, '../dist')));

// API Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString() });
});

// API Products con fallback
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true }
    });
    
    if (products.length === 0) {
      // Datos de fallback
      return res.json([
        {
          id: 1,
          name: "Camaron Premium",
          price: 299.99,
          description: "Camaron fresco del golfo",
          image: "/images/shrimp.jpg",
          category: { name: "Mariscos" }
        },
        {
          id: 2,
          name: "Salmon Atlantico",
          price: 450.00,
          description: "Salmon fresco importado",
          image: "/images/salmon.jpg",
          category: { name: "Pescados" }
        }
      ]);
    }
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo productos' });
  }
});

// Catch all para React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
EOF

# Paso 4: Iniciar servidor
node server-simple.js &

sleep 3

# Verificar que funcione
if curl -s http://localhost:3001/api/health > /dev/null; then
  echo "SERVIDOR INICIADO CORRECTAMENTE"
else
  echo "ERROR AL INICIAR SERVIDOR"
fi
