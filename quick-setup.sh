#!/bin/bash
# =============================================================================
# SCRIPT DE CONFIGURACIÓN RÁPIDA PARA MARVERA (ESTRUCTURA EXISTENTE)
# =============================================================================
# Ejecutar desde /var/www/marvera como: sudo bash quick-setup.sh
# =============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Variables adaptadas a tu estructura actual
DOMAIN="marvera.mx"
PROJECT_PATH="/var/www/marvera"
BACKEND_PATH="$PROJECT_PATH/backend"
FRONTEND_PATH="$PROJECT_PATH/dist"
NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN"

echo -e "${CYAN}🌊 CONFIGURACIÓN RÁPIDA MARVERA${NC}"
echo -e "${CYAN}===============================${NC}"
echo -e "${YELLOW}Usando estructura existente: $PROJECT_PATH${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -d "$BACKEND_PATH" ]; then
    echo -e "${RED}❌ No se encuentra el directorio backend en $BACKEND_PATH${NC}"
    echo -e "${YELLOW}Asegúrate de estar en /var/www/marvera${NC}"
    exit 1
fi

# =============================================================================
# 1. INSTALAR DEPENDENCIAS FALTANTES
# =============================================================================
echo -e "${BLUE}📦 Verificando e instalando dependencias...${NC}"

# Actualizar repositorios
apt update -y

# Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}🔧 Instalando Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    echo -e "${GREEN}✅ Node.js $(node --version) instalado${NC}"
fi

# nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}🔧 Instalando nginx...${NC}"
    apt install -y nginx
else
    echo -e "${GREEN}✅ nginx instalado${NC}"
fi

# PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}🔧 Instalando PM2...${NC}"
    npm install -g pm2
else
    echo -e "${GREEN}✅ PM2 instalado${NC}"
fi

# =============================================================================
# 2. CREAR DIRECTORIO FRONTEND Y PÁGINA TEMPORAL
# =============================================================================
echo -e "${BLUE}📁 Creando estructura frontend...${NC}"

mkdir -p $FRONTEND_PATH

# Crear página temporal si no existe index.html
if [ ! -f "$FRONTEND_PATH/index.html" ]; then
    echo -e "${YELLOW}📄 Creando página temporal...${NC}"
    cat > $FRONTEND_PATH/index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MarVera - Configurando...</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        h1 { font-size: 3rem; margin-bottom: 1rem; }
        .status { margin: 1rem 0; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 10px; }
        .button { display: inline-block; padding: 12px 24px; margin: 0.5rem; background: #1e3a8a; color: white; text-decoration: none; border-radius: 25px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌊 MarVera</h1>
        <div class="status">
            <h3>⚙️ Configurando Servidor...</h3>
            <p>El servidor se está configurando correctamente</p>
        </div>
        <a href="/api/health" class="button">🔗 Probar API</a>
        <p id="timestamp"></p>
    </div>
    <script>
        document.getElementById('timestamp').textContent = new Date().toLocaleString('es-ES');
    </script>
</body>
</html>
EOF
else
    echo -e "${GREEN}✅ Frontend ya existe${NC}"
fi

# =============================================================================
# 3. CONFIGURAR NGINX
# =============================================================================
echo -e "${BLUE}🌐 Configurando nginx...${NC}"

cat > $NGINX_CONFIG << EOF
server {
    listen 80;
    server_name marvera.mx www.marvera.mx;
    
    root $FRONTEND_PATH;
    index index.html;
    
    access_log /var/log/nginx/marvera.mx.access.log;
    error_log /var/log/nginx/marvera.mx.error.log;
    
    # API Proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # CORS
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization' always;
    }
    
    # Frontend
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }
}
EOF

# Activar sitio
ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Verificar configuración
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Configuración nginx válida${NC}"
    systemctl restart nginx
    systemctl enable nginx
else
    echo -e "${RED}❌ Error en configuración nginx${NC}"
    exit 1
fi

# =============================================================================
# 4. CONFIGURAR PM2
# =============================================================================
echo -e "${BLUE}🚀 Configurando PM2...${NC}"

# Crear configuración PM2
cat > $PROJECT_PATH/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'marvera-api',
    script: './backend/simple-server.js',
    cwd: '$PROJECT_PATH',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
EOF

# =============================================================================
# 5. INSTALAR DEPENDENCIAS DEL BACKEND
# =============================================================================
echo -e "${BLUE}📦 Instalando dependencias backend...${NC}"

cd $BACKEND_PATH

if [ -f "package.json" ]; then
    npm install --production
    echo -e "${GREEN}✅ Dependencias backend instaladas${NC}"
    
    # Crear admin si existe el script
    if [ -f "create-admin.js" ]; then
        echo -e "${YELLOW}👤 Creando usuario admin...${NC}"
        node create-admin.js
        echo -e "${GREEN}✅ Usuario admin creado${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ No se encontró package.json${NC}"
fi

cd $PROJECT_PATH

# =============================================================================
# 6. CONFIGURAR PERMISOS
# =============================================================================
echo -e "${BLUE}🔐 Configurando permisos...${NC}"

chown -R www-data:www-data $PROJECT_PATH
chmod -R 755 $PROJECT_PATH

echo -e "${GREEN}✅ Permisos configurados${NC}"

# =============================================================================
# 7. INICIAR SERVICIOS
# =============================================================================
echo -e "${BLUE}🔄 Iniciando servicios...${NC}"

# Detener PM2 si existe
pm2 stop marvera-api 2>/dev/null || true
pm2 delete marvera-api 2>/dev/null || true

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

echo -e "${GREEN}✅ PM2 configurado y iniciado${NC}"

# =============================================================================
# 8. VERIFICAR SERVICIOS
# =============================================================================
echo -e "${BLUE}🔍 Verificando servicios...${NC}"

sleep 3

# Verificar PM2
if pm2 show marvera-api > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PM2: marvera-api corriendo${NC}"
else
    echo -e "${RED}❌ PM2: Error con marvera-api${NC}"
fi

# Verificar nginx
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ nginx activo${NC}"
else
    echo -e "${RED}❌ nginx inactivo${NC}"
fi

# Probar endpoints
if curl -f -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${GREEN}✅ API Health funcionando${NC}"
else
    echo -e "${YELLOW}⚠️ API Health: verificar logs${NC}"
fi

if curl -f -s http://localhost/ > /dev/null; then
    echo -e "${GREEN}✅ Frontend funcionando${NC}"
else
    echo -e "${YELLOW}⚠️ Frontend: verificar configuración${NC}"
fi

# =============================================================================
# 9. INFORMACIÓN FINAL
# =============================================================================
echo ""
echo -e "${CYAN}🎉 CONFIGURACIÓN COMPLETADA${NC}"
echo -e "${CYAN}=========================${NC}"
echo ""
echo -e "${GREEN}✅ MarVera configurado en:${NC}"
echo -e "   📁 Proyecto: $PROJECT_PATH"
echo -e "   🌐 Frontend: $FRONTEND_PATH"
echo -e "   ⚙️ Backend: $BACKEND_PATH"
echo ""
echo -e "${BLUE}🔗 URLs:${NC}"
echo -e "   🌐 Sitio: http://marvera.mx"
echo -e "   🔗 API: http://marvera.mx/api/health"
echo ""
echo -e "${YELLOW}📋 Comandos útiles:${NC}"
echo -e "   pm2 status"
echo -e "   pm2 logs marvera-api"
echo -e "   systemctl status nginx"
echo -e "   tail -f /var/log/nginx/marvera.mx.error.log"
echo ""
echo -e "${GREEN}🚀 ¡MarVera está funcionando!${NC}"
