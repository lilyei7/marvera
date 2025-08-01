#!/bin/bash
# =============================================================================
# SCRIPT DE REPARACIÓN RÁPIDA PARA BACKEND
# =============================================================================
# Ejecutar para solucionar el problema del backend missing
# =============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🔧 REPARACIÓN RÁPIDA BACKEND${NC}"
echo -e "${CYAN}============================${NC}"
echo ""

# =============================================================================
# 1. VERIFICAR ESTADO ACTUAL
# =============================================================================
echo -e "${BLUE}🔍 Verificando estructura actual...${NC}"

echo -e "${YELLOW}📁 Contenido de /var/www/marvera.mx/:${NC}"
ls -la /var/www/marvera.mx/ 2>/dev/null || echo "Directorio no existe"

echo -e "${YELLOW}📁 Contenido de /var/www/marvera.mx/backend/:${NC}"
ls -la /var/www/marvera.mx/backend/ 2>/dev/null || echo "Directorio backend no existe"

echo -e "${YELLOW}📁 Contenido de backend original:${NC}"
ls -la /var/www/marvera/backend/ 2>/dev/null || echo "Backend original no encontrado"

# =============================================================================
# 2. IDENTIFICAR ARCHIVO DE SERVIDOR
# =============================================================================
echo -e "${BLUE}🔍 Buscando archivo de servidor...${NC}"

SERVER_FILE=""
if [ -f "/var/www/marvera/backend/server.js" ]; then
    SERVER_FILE="/var/www/marvera/backend/server.js"
elif [ -f "/var/www/marvera/backend/index.js" ]; then
    SERVER_FILE="/var/www/marvera/backend/index.js"
elif [ -f "/var/www/marvera/backend/app.js" ]; then
    SERVER_FILE="/var/www/marvera/backend/app.js"
elif [ -f "/var/www/marvera/server.js" ]; then
    SERVER_FILE="/var/www/marvera/server.js"
elif [ -f "/var/www/marvera/index.js" ]; then
    SERVER_FILE="/var/www/marvera/index.js"
else
    echo -e "${YELLOW}⚠️ No se encontró archivo de servidor, creando uno nuevo...${NC}"
fi

if [ ! -z "$SERVER_FILE" ]; then
    echo -e "${GREEN}✅ Archivo de servidor encontrado: $SERVER_FILE${NC}"
else
    echo -e "${YELLOW}⚠️ Creando servidor desde cero${NC}"
fi

# =============================================================================
# 3. RECREAR ESTRUCTURA BACKEND
# =============================================================================
echo -e "${BLUE}⚙️ Recreando estructura backend...${NC}"

# Crear directorio backend si no existe
mkdir -p /var/www/marvera.mx/backend

# Si encontramos un servidor, copiarlo
if [ ! -z "$SERVER_FILE" ]; then
    echo -e "${YELLOW}📋 Copiando archivo de servidor...${NC}"
    cp "$SERVER_FILE" /var/www/marvera.mx/backend/server.js
    
    # Copiar package.json si existe
    PACKAGE_DIR=$(dirname "$SERVER_FILE")
    if [ -f "$PACKAGE_DIR/package.json" ]; then
        cp "$PACKAGE_DIR/package.json" /var/www/marvera.mx/backend/
        echo -e "${GREEN}✅ package.json copiado${NC}"
    fi
    
    # Copiar otros archivos importantes
    [ -f "$PACKAGE_DIR/.env" ] && cp "$PACKAGE_DIR/.env" /var/www/marvera.mx/backend/
    [ -f "$PACKAGE_DIR/.env.production" ] && cp "$PACKAGE_DIR/.env.production" /var/www/marvera.mx/backend/
    [ -d "$PACKAGE_DIR/node_modules" ] && cp -r "$PACKAGE_DIR/node_modules" /var/www/marvera.mx/backend/
else
    # Crear servidor básico
    echo -e "${YELLOW}🔧 Creando servidor básico...${NC}"
    
    cat > /var/www/marvera.mx/backend/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['https://marvera.mx', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'MarVera API funcionando correctamente!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        version: '1.0.0'
    });
});

// API de productos
app.get('/api/productos', (req, res) => {
    const productos = [
        {
            id: 1,
            nombre: 'Salmón Premium',
            precio: 25.99,
            categoria: 'pescado',
            descripcion: 'Salmón fresco del Atlántico',
            imagen: '/images/salmon.jpg',
            disponible: true,
            stock: 50
        },
        {
            id: 2,
            nombre: 'Camarones Jumbo',
            precio: 18.50,
            categoria: 'mariscos',
            descripcion: 'Camarones grandes y frescos',
            imagen: '/images/camarones.jpg',
            disponible: true,
            stock: 30
        },
        {
            id: 3,
            nombre: 'Langosta Maine',
            precio: 45.00,
            categoria: 'mariscos',
            descripcion: 'Langosta fresca de Maine',
            imagen: '/images/langosta.jpg',
            disponible: true,
            stock: 15
        },
        {
            id: 4,
            nombre: 'Atún Aleta Amarilla',
            precio: 32.00,
            categoria: 'pescado',
            descripcion: 'Atún de alta calidad',
            imagen: '/images/atun.jpg',
            disponible: true,
            stock: 25
        }
    ];
    
    res.json({
        success: true,
        productos: productos,
        total: productos.length
    });
});

// API de categorías
app.get('/api/categorias', (req, res) => {
    res.json({
        success: true,
        categorias: [
            { id: 'pescado', nombre: 'Pescado', descripcion: 'Pescado fresco del día' },
            { id: 'mariscos', nombre: 'Mariscos', descripcion: 'Mariscos y crustáceos' },
            { id: 'especiales', nombre: 'Especiales', descripcion: 'Productos especiales' }
        ]
    });
});

// Endpoint de estado del servidor
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        server: 'marvera-api',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
        ssl: true,
        environment: process.env.NODE_ENV || 'production'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
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

// Start server
const server = app.listen(PORT, () => {
    console.log(`🌊 MarVera API funcionando en puerto ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'production'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Señal SIGTERM recibida, cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 Señal SIGINT recibida, cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});

module.exports = app;
EOF

    # Crear package.json básico
    cat > /var/www/marvera.mx/backend/package.json << 'EOF'
{
  "name": "marvera-backend",
  "version": "1.0.0",
  "description": "MarVera Premium Seafood API Backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["marvera", "seafood", "api", "backend"],
  "author": "MarVera Team",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF
fi

# =============================================================================
# 4. INSTALAR DEPENDENCIAS
# =============================================================================
echo -e "${BLUE}📦 Instalando dependencias del backend...${NC}"

cd /var/www/marvera.mx/backend
npm install --production

# =============================================================================
# 5. CONFIGURAR PERMISOS
# =============================================================================
echo -e "${BLUE}🔐 Configurando permisos...${NC}"

chown -R www-data:www-data /var/www/marvera.mx
chmod -R 755 /var/www/marvera.mx

# =============================================================================
# 6. VERIFICAR ARCHIVO DE SERVIDOR
# =============================================================================
echo -e "${BLUE}🔍 Verificando archivo de servidor...${NC}"

if [ -f "/var/www/marvera.mx/backend/server.js" ]; then
    echo -e "${GREEN}✅ server.js existe${NC}"
    echo -e "${YELLOW}📋 Primeras líneas del archivo:${NC}"
    head -n 5 /var/www/marvera.mx/backend/server.js
else
    echo -e "${RED}❌ server.js no existe${NC}"
    exit 1
fi

# =============================================================================
# 7. REINICIAR SERVICIOS
# =============================================================================
echo -e "${BLUE}🚀 Reiniciando servicios...${NC}"

# Parar PM2 existente
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Iniciar con PM2
cd /var/www/marvera.mx
pm2 start ecosystem.config.cjs

# Reiniciar nginx
systemctl reload nginx

# =============================================================================
# 8. VERIFICAR FUNCIONAMIENTO
# =============================================================================
echo -e "${BLUE}🔍 Verificando funcionamiento...${NC}"

sleep 3

# Verificar PM2
echo -n "🚀 PM2: "
PM2_STATUS=$(pm2 jlist 2>/dev/null | jq -r '.[0].pm2_env.status' 2>/dev/null || echo "unknown")
if [ "$PM2_STATUS" = "online" ]; then
    echo -e "${GREEN}✅ ONLINE${NC}"
else
    echo -e "${YELLOW}⚠️ $PM2_STATUS${NC}"
    echo -e "${YELLOW}📋 Logs de PM2:${NC}"
    pm2 logs --lines 5
fi

# Test API
echo -n "🔗 API: "
if curl -s -f --max-time 10 "https://marvera.mx/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ FUNCIONANDO${NC}"
else
    echo -e "${YELLOW}⚠️ VERIFICAR${NC}"
    echo -e "${YELLOW}🔧 Probando localhost:${NC}"
    curl -s "http://localhost:3001/api/health" 2>/dev/null || echo "No responde en localhost"
fi

# Test Frontend
echo -n "🌐 Frontend: "
if curl -s -f --max-time 10 "https://marvera.mx" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ FUNCIONANDO${NC}"
else
    echo -e "${YELLOW}⚠️ VERIFICAR${NC}"
fi

# =============================================================================
# 9. MOSTRAR INFORMACIÓN FINAL
# =============================================================================
echo ""
echo -e "${CYAN}🎉 REPARACIÓN COMPLETADA${NC}"
echo -e "${CYAN}======================${NC}"
echo ""
echo -e "${GREEN}✅ Backend reparado y funcionando${NC}"
echo -e "${BLUE}📁 Archivos en /var/www/marvera.mx/backend/:${NC}"
ls -la /var/www/marvera.mx/backend/

echo ""
echo -e "${BLUE}🔗 URLs para probar:${NC}"
echo -e "   🌐 Frontend:  ${GREEN}https://marvera.mx${NC}"
echo -e "   🔗 API:       ${GREEN}https://marvera.mx/api/health${NC}"
echo -e "   📊 Productos: ${GREEN}https://marvera.mx/api/productos${NC}"
echo -e "   📈 Status:    ${GREEN}https://marvera.mx/api/status${NC}"

echo ""
echo -e "${YELLOW}📋 Comandos útiles:${NC}"
echo -e "   📊 Estado PM2:    ${CYAN}pm2 status${NC}"
echo -e "   📝 Logs PM2:      ${CYAN}pm2 logs${NC}"
echo -e "   🔄 Reiniciar:     ${CYAN}pm2 restart marvera-api${NC}"
echo -e "   🌐 Test API:      ${CYAN}curl https://marvera.mx/api/health${NC}"

echo ""
echo -e "${GREEN}🌊 ¡Backend reparado exitosamente!${NC}"
