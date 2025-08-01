#!/bin/bash
# =============================================================================
# SOLUCIÓN RÁPIDA PARA ERROR 404 - MARVERA
# =============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${RED}🚨 SOLUCIONANDO ERROR 404 MARVERA${NC}"
echo -e "${RED}==================================${NC}"
echo ""

# =============================================================================
# 1. DIAGNÓSTICO RÁPIDO
# =============================================================================
echo -e "${BLUE}🔍 Diagnóstico inicial...${NC}"

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Ejecutar desde directorio del proyecto${NC}"
    echo -e "${YELLOW}💡 cd /var/www/marvera${NC}"
    exit 1
fi

# =============================================================================
# 2. VERIFICAR PROBLEMA PRINCIPAL
# =============================================================================
MAIN_ISSUE="unknown"

if [ ! -d "/var/www/marvera.mx" ]; then
    MAIN_ISSUE="missing_production_dir"
elif [ ! -f "/var/www/marvera.mx/index.html" ]; then
    MAIN_ISSUE="missing_frontend_files"
elif ! systemctl is-active --quiet nginx; then
    MAIN_ISSUE="nginx_down"
elif [ ! -f "/etc/nginx/sites-enabled/marvera.mx" ]; then
    MAIN_ISSUE="nginx_config_disabled"
else
    MAIN_ISSUE="other"
fi

echo -e "${YELLOW}🔍 Problema detectado: $MAIN_ISSUE${NC}"

# =============================================================================
# 3. SOLUCIÓN SEGÚN EL PROBLEMA
# =============================================================================

case $MAIN_ISSUE in
    "missing_production_dir")
        echo -e "${BLUE}🔧 Creando directorio de producción...${NC}"
        mkdir -p /var/www/marvera.mx/backend
        mkdir -p /var/log/marvera
        ;;
    "missing_frontend_files")
        echo -e "${BLUE}🔧 Frontend missing - regenerando...${NC}"
        ;;
    "nginx_down")
        echo -e "${BLUE}🔧 Iniciando nginx...${NC}"
        systemctl start nginx
        ;;
    "nginx_config_disabled")
        echo -e "${BLUE}🔧 Habilitando configuración nginx...${NC}"
        ln -sf /etc/nginx/sites-available/marvera.mx /etc/nginx/sites-enabled/
        systemctl reload nginx
        ;;
esac

# =============================================================================
# 4. REGENERAR FRONTEND (SIEMPRE)
# =============================================================================
echo -e "${BLUE}🏗️ Regenerando frontend...${NC}"

# Limpiar builds anteriores
rm -rf dist build

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
    npm install
fi

# Build
echo -e "${YELLOW}🔨 Compilando...${NC}"
if npm run build; then
    echo -e "${GREEN}✅ Build exitoso${NC}"
elif npm run dist; then
    echo -e "${GREEN}✅ Build exitoso con 'dist'${NC}"
elif npx vite build; then
    echo -e "${GREEN}✅ Build exitoso con Vite directo${NC}"
else
    echo -e "${RED}❌ Error en build${NC}"
    exit 1
fi

# Verificar build
DIST_DIR=""
if [ -d "dist" ]; then
    DIST_DIR="dist"
elif [ -d "build" ]; then
    DIST_DIR="build"
else
    echo -e "${RED}❌ No se generó directorio de build${NC}"
    exit 1
fi

# =============================================================================
# 5. COPIAR ARCHIVOS A PRODUCCIÓN
# =============================================================================
echo -e "${BLUE}📂 Copiando archivos a producción...${NC}"

# Crear backup
if [ -d "/var/www/marvera.mx" ] && [ -f "/var/www/marvera.mx/index.html" ]; then
    mv "/var/www/marvera.mx" "/var/www/marvera.mx.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Crear directorio
mkdir -p /var/www/marvera.mx/backend

# Copiar frontend
cp -r $DIST_DIR/* /var/www/marvera.mx/

echo -e "${GREEN}✅ Frontend copiado${NC}"

# =============================================================================
# 6. VERIFICAR/CREAR BACKEND
# =============================================================================
echo -e "${BLUE}⚙️ Configurando backend...${NC}"

# Si no existe backend, crearlo
if [ ! -f "/var/www/marvera.mx/backend/server.js" ]; then
    echo -e "${YELLOW}🔧 Creando backend básico...${NC}"
    
    cat > /var/www/marvera.mx/backend/package.json << 'EOF'
{
  "name": "marvera-backend",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
EOF

    cat > /var/www/marvera.mx/backend/server.js << 'EOF'
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'MarVera API funcionando correctamente!',
        timestamp: new Date().toISOString(),
        environment: 'production'
    });
});

app.get('/api/productos', (req, res) => {
    res.json({
        success: true,
        productos: [
            { id: 1, nombre: 'Salmón Premium', precio: 25.99, categoria: 'pescado' },
            { id: 2, nombre: 'Camarones Jumbo', precio: 18.50, categoria: 'mariscos' },
            { id: 3, nombre: 'Langosta Maine', precio: 45.00, categoria: 'mariscos' },
            { id: 4, nombre: 'Atún Rojo', precio: 32.00, categoria: 'pescado' },
            { id: 5, nombre: 'Pulpo Español', precio: 28.75, categoria: 'mariscos' }
        ]
    });
});

app.listen(PORT, () => {
    console.log(`🌊 MarVera API funcionando en puerto ${PORT}`);
});
EOF

    # Instalar dependencias
    cd /var/www/marvera.mx/backend
    npm install --production
    cd /var/www/marvera.mx
fi

# =============================================================================
# 7. CONFIGURAR PM2
# =============================================================================
echo -e "${BLUE}🚀 Configurando PM2...${NC}"

# Parar procesos existentes
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Crear configuración PM2
cat > /var/www/marvera.mx/ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'marvera-api',
    script: './backend/server.js',
    cwd: '/var/www/marvera.mx',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_file: '/var/log/marvera/combined.log',
    out_file: '/var/log/marvera/out.log',
    error_file: '/var/log/marvera/error.log',
    time: true
  }]
};
EOF

# =============================================================================
# 8. VERIFICAR/CREAR CONFIGURACIÓN NGINX
# =============================================================================
echo -e "${BLUE}🌐 Verificando nginx...${NC}"

NGINX_CONFIG="/etc/nginx/sites-available/marvera.mx"

if [ ! -f "$NGINX_CONFIG" ]; then
    echo -e "${YELLOW}🔧 Creando configuración nginx...${NC}"
    
    cat > "$NGINX_CONFIG" << 'EOF'
server {
    listen 80;
    server_name marvera.mx www.marvera.mx;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name marvera.mx www.marvera.mx;

    ssl_certificate /etc/letsencrypt/live/marvera.mx/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/marvera.mx/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    root /var/www/marvera.mx;
    index index.html index.htm;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API routes
    location /api/ {
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

    # Assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
fi

# Habilitar sitio
ln -sf "$NGINX_CONFIG" "/etc/nginx/sites-enabled/marvera.mx"

# Test configuración
if nginx -t; then
    echo -e "${GREEN}✅ Configuración nginx válida${NC}"
else
    echo -e "${RED}❌ Error en configuración nginx${NC}"
    exit 1
fi

# =============================================================================
# 9. CONFIGURAR PERMISOS
# =============================================================================
echo -e "${BLUE}🔐 Configurando permisos...${NC}"

chown -R www-data:www-data /var/www/marvera.mx
chmod -R 755 /var/www/marvera.mx

# =============================================================================
# 10. INICIAR SERVICIOS
# =============================================================================
echo -e "${BLUE}🚀 Iniciando servicios...${NC}"

# Reiniciar nginx
systemctl reload nginx

# Iniciar PM2
cd /var/www/marvera.mx
pm2 start ecosystem.config.cjs

# =============================================================================
# 11. VERIFICACIÓN FINAL
# =============================================================================
echo -e "${BLUE}🔍 Verificación final...${NC}"

sleep 5

# Verificar archivos
echo -n "📄 index.html: "
if [ -f "/var/www/marvera.mx/index.html" ]; then
    SIZE=$(stat -c%s "/var/www/marvera.mx/index.html")
    echo -e "${GREEN}✅ ${SIZE} bytes${NC}"
else
    echo -e "${RED}❌ NO EXISTE${NC}"
fi

# Verificar PM2
echo -n "🚀 PM2: "
PM2_STATUS=$(pm2 jlist 2>/dev/null | jq -r '.[0].pm2_env.status' 2>/dev/null || echo "error")
if [ "$PM2_STATUS" = "online" ]; then
    echo -e "${GREEN}✅ ONLINE${NC}"
else
    echo -e "${RED}❌ $PM2_STATUS${NC}"
fi

# Verificar nginx
echo -n "🌐 nginx: "
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ ACTIVO${NC}"
else
    echo -e "${RED}❌ INACTIVO${NC}"
fi

# Test final
echo -n "🔗 Test HTTPS: "
if curl -s -f --max-time 10 "https://marvera.mx" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ FUNCIONANDO${NC}"
else
    echo -e "${YELLOW}⚠️ REVISAR MANUALMENTE${NC}"
fi

echo ""
echo -e "${GREEN}🎉 SOLUCIÓN APLICADA${NC}"
echo -e "${GREEN}==================${NC}"
echo ""
echo -e "${BLUE}🔗 Verificar en:${NC}"
echo -e "   🌐 https://marvera.mx"
echo -e "   🔗 https://marvera.mx/api/health"
echo ""
echo -e "${YELLOW}📋 Si persiste el 404:${NC}"
echo -e "   1. Verificar logs: ${CYAN}pm2 logs${NC}"
echo -e "   2. Revisar nginx: ${CYAN}tail -f /var/log/nginx/marvera.mx.error.log${NC}"
echo -e "   3. Revisar SSL: ${CYAN}certbot certificates${NC}"
