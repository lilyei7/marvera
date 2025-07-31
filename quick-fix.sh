#!/bin/bash
echo "🔧 Arreglando configuración de Nginx y PM2..."

# 1. Crear certificado temporal para IP
echo "🔒 Creando certificado temporal..."
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/temp-selfsigned.key \
    -out /etc/ssl/certs/temp-selfsigned.crt \
    -subj "/C=MX/ST=Mexico/L=Mexico/O=MarVera/CN=148.230.87.198"

# 2. Configuración Nginx simplificada (solo IP por ahora)
cat > /etc/nginx/sites-available/marvera-temp << 'EOF'
# Configuración temporal para MarVera (solo IP)
server {
    listen 80;
    server_name 148.230.87.198;
    
    # Redirigir a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name 148.230.87.198;
    
    # Certificado temporal
    ssl_certificate /etc/ssl/certs/temp-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/temp-selfsigned.key;
    
    # Headers de seguridad
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    
    # Logs
    access_log /var/log/nginx/marvera-access.log;
    error_log /var/log/nginx/marvera-error.log;
    
    # Frontend estático
    root /var/www/marvera/dist;
    index index.html;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 3. Activar nueva configuración
sudo rm -f /etc/nginx/sites-enabled/*
sudo ln -s /etc/nginx/sites-available/marvera-temp /etc/nginx/sites-enabled/

# 4. Probar configuración
echo "🧪 Probando configuración de Nginx..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuración de Nginx OK"
    sudo systemctl restart nginx
    echo "✅ Nginx reiniciado"
else
    echo "❌ Error en configuración de Nginx"
    exit 1
fi

# 5. Arreglar PM2 config (cambiar a .cjs)
echo "🔧 Arreglando configuración PM2..."
mv /var/www/marvera/ecosystem.config.js /var/www/marvera/ecosystem.config.cjs

# 6. Crear servidor simple para probar
cat > /var/www/marvera/simple-backend.js << 'EOF'
console.log('🚀 MarVera Backend Simple - Iniciando...');

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MarVera Backend funcionando correctamente!',
    timestamp: new Date().toISOString(),
    server: '148.230.87.198:3001',
    version: '1.0.0'
  });
});

// Productos destacados
app.get('/api/products/featured', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'Salmón Premium',
        price: 299.99,
        category: 'Pescados',
        imageUrl: '/products/salmon.jpg',
        description: 'Salmón fresco del Atlántico',
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
        name: 'Atún Aleta Azul',
        price: 599.99,
        category: 'Pescados',
        imageUrl: '/products/atun.jpg',
        description: 'Atún aleta azul premium',
        isFeatured: true,
        stock: 8
      }
    ],
    count: 3,
    timestamp: new Date().toISOString()
  });
});

// Todos los productos
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'Salmón Premium',
        price: 299.99,
        category: 'Pescados',
        imageUrl: '/products/salmon.jpg',
        description: 'Salmón fresco del Atlántico',
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
        name: 'Atún Aleta Azul',
        price: 599.99,
        category: 'Pescados',
        imageUrl: '/products/atun.jpg',
        description: 'Atún aleta azul premium',
        isFeatured: true,
        stock: 8
      },
      {
        id: 4,
        name: 'Langosta Maine',
        price: 899.99,
        category: 'Mariscos',
        imageUrl: '/products/langosta.jpg',
        description: 'Langosta fresca de Maine',
        isFeatured: false,
        stock: 5
      }
    ],
    count: 4,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.originalUrl
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ MarVera Backend corriendo en puerto ${PORT}`);
  console.log(`📍 Health check: http://148.230.87.198:${PORT}/api/health`);
  console.log(`🐟 Productos: http://148.230.87.198:${PORT}/api/products/featured`);
  console.log(`🌐 CORS habilitado para todos los orígenes`);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Deteniendo servidor...');
  process.exit(0);
});
EOF

# 7. Crear nueva configuración PM2
cat > /var/www/marvera/ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'marvera-backend',
    script: 'simple-backend.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/backend-error.log',
    out_file: './logs/backend-out.log',
    log_file: './logs/backend-combined.log',
    time: true
  }]
};
EOF

# 8. Instalar dependencias del backend simple
echo "📦 Instalando dependencias básicas..."
cd /var/www/marvera
npm install express cors

# 9. Iniciar backend con PM2
echo "🚀 Iniciando backend..."
pm2 start ecosystem.config.cjs
pm2 save

echo ""
echo "✅ ¡Configuración completada!"
echo ""
echo "🌐 Tu sitio está disponible en:"
echo "   - http://148.230.87.198"
echo "   - https://148.230.87.198 (con certificado temporal)"
echo ""
echo "📊 Comandos útiles:"
echo "   - pm2 status (ver estado)"
echo "   - pm2 logs (ver logs)"
echo "   - sudo systemctl status nginx"
echo ""
echo "🔍 Probar APIs:"
echo "   - curl http://148.230.87.198/api/health"
echo "   - curl http://148.230.87.198/api/products/featured"
EOF
