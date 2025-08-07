#!/bin/bash

# Script para crear rutas de slideshow que funcionen
# Enfoque: archivo separado simple que se agregue sin conflictos

ssh root@148.230.87.198 "
cd /var/www/marvera

# Crear un servidor simple solo para slideshow en puerto diferente
cat > slideshow-server.js << 'SLIDESHOW_EOF'
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = 3002; // Puerto diferente para evitar conflictos

// Middleware
app.use(cors());
app.use(express.json());

// Solo rutas de slideshow
app.get('/api/slideshow', async (req, res) => {
  try {
    console.log('🎬 Slideshow público - servidor dedicado');
    const slides = await prisma.slideshow.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
    console.log(\`✅ \${slides.length} slides encontrados\`);
    res.json({ success: true, data: slides, count: slides.length });
  } catch (error) {
    console.error('❌ Error:', error);
    const fallback = [{
      id: 1,
      title: 'Del mar directo a tu restaurante',
      subtitle: 'Productos frescos del mar',
      imageUrl: '/fondorectangulo3.png',
      backgroundColor: '#1E3A8A',
      textColor: '#FFFFFF',
      isActive: true,
      order: 0
    }];
    res.json({ success: true, data: fallback, count: 1 });
  }
});

app.get('/api/slideshow/all', async (req, res) => {
  try {
    console.log('🔧 Admin slideshow - servidor dedicado');
    const slides = await prisma.slideshow.findMany({
      orderBy: { order: 'asc' }
    });
    res.json({ success: true, data: slides, count: slides.length });
  } catch (error) {
    console.error('❌ Error admin:', error);
    res.status(500).json({ success: false, message: 'Error interno' });
  }
});

app.listen(PORT, () => {
  console.log(\`🎬 Slideshow Server running on port \${PORT}\`);
});
SLIDESHOW_EOF

# Iniciar el servidor de slideshow
pm2 start slideshow-server.js --name slideshow-server

# Configurar nginx para proxy a este servidor
cat > /etc/nginx/conf.d/slideshow-proxy.conf << 'NGINX_EOF'
location /api/slideshow {
    proxy_pass http://localhost:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
}
NGINX_EOF

# Recargar nginx
nginx -t && systemctl reload nginx

echo '✅ Servidor de slideshow configurado'
pm2 status
"
