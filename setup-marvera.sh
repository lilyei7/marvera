#!/bin/bash
# =============================================================================
# SCRIPT DE CONFIGURACIÓN COMPLETA PARA MARVERA.MX
# =============================================================================
# Este script configura nginx, PM2 y toda la infraestructura necesaria
# Ejecutar como: sudo bash setup-marvera.sh
# =============================================================================

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables de configuración
DOMAIN="marvera.mx"
PROJECT_PATH="/var/www/marvera.mx"
BACKEND_PATH="$PROJECT_PATH/backend"
FRONTEND_PATH="$PROJECT_PATH/dist"
NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN"
PM2_APP_NAME="marvera-api"

echo -e "${CYAN}🌊 CONFIGURACIÓN COMPLETA DE MARVERA.MX${NC}"
echo -e "${CYAN}====================================${NC}"
echo ""

# =============================================================================
# 1. VERIFICAR PERMISOS DE ROOT
# =============================================================================
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ Este script debe ejecutarse como root (sudo)${NC}"
   exit 1
fi

echo -e "${YELLOW}✅ Permisos de root verificados${NC}"

# =============================================================================
# 2. ACTUALIZAR SISTEMA
# =============================================================================
echo -e "${BLUE}📦 Actualizando sistema...${NC}"
apt update -y
apt upgrade -y

# =============================================================================
# 3. INSTALAR DEPENDENCIAS
# =============================================================================
echo -e "${BLUE}📦 Instalando dependencias...${NC}"

# Instalar Node.js 18.x
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}🔧 Instalando Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    echo -e "${GREEN}✅ Node.js ya está instalado$(NC)"
fi

# Instalar nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}🔧 Instalando nginx...${NC}"
    apt install -y nginx
else
    echo -e "${GREEN}✅ nginx ya está instalado${NC}"
fi

# Instalar PM2 globalmente
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}🔧 Instalando PM2...${NC}"
    npm install -g pm2
else
    echo -e "${GREEN}✅ PM2 ya está instalado${NC}"
fi

# Instalar certbot para SSL
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}🔧 Instalando certbot...${NC}"
    apt install -y certbot python3-certbot-nginx
else
    echo -e "${GREEN}✅ certbot ya está instalado${NC}"
fi

# =============================================================================
# 4. CREAR ESTRUCTURA DE DIRECTORIOS
# =============================================================================
echo -e "${BLUE}📁 Creando estructura de directorios...${NC}"

mkdir -p $PROJECT_PATH
mkdir -p $BACKEND_PATH
mkdir -p $FRONTEND_PATH
mkdir -p /var/log/marvera

echo -e "${GREEN}✅ Directorios creados${NC}"

# =============================================================================
# 5. CONFIGURAR NGINX
# =============================================================================
echo -e "${BLUE}🌐 Configurando nginx...${NC}"

cat > $NGINX_CONFIG << 'EOF'
# Configuración nginx para MarVera.mx
server {
    listen 80;
    server_name marvera.mx www.marvera.mx;
    
    # Redirigir HTTP a HTTPS (se activará después del SSL)
    # return 301 https://$server_name$request_uri;
    
    # Configuración temporal para HTTP (antes del SSL)
    root /var/www/marvera.mx/dist;
    index index.html;
    
    # Logs
    access_log /var/log/nginx/marvera.mx.access.log;
    error_log /var/log/nginx/marvera.mx.error.log;
    
    # Headers de seguridad básicos
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Archivos estáticos con cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # API Routes - Proxy al backend Node.js
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
        
        # CORS Headers para API
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization' always;
        
        # Timeout settings
        proxy_connect_timeout       60s;
        proxy_send_timeout          60s;
        proxy_read_timeout          60s;
    }
    
    # React Router - Todas las rutas van a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Archivos especiales
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }
    
    location = /robots.txt {
        log_not_found off;
        access_log off;
    }
}
EOF

# Activar sitio
ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Verificar configuración
echo -e "${YELLOW}🔧 Verificando configuración de nginx...${NC}"
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Configuración de nginx válida${NC}"
    systemctl restart nginx
    systemctl enable nginx
else
    echo -e "${RED}❌ Error en configuración de nginx${NC}"
    exit 1
fi

# =============================================================================
# 6. CONFIGURAR PERMISOS
# =============================================================================
echo -e "${BLUE}🔐 Configurando permisos...${NC}"

chown -R www-data:www-data $PROJECT_PATH
chmod -R 755 $PROJECT_PATH

echo -e "${GREEN}✅ Permisos configurados${NC}"

# =============================================================================
# 7. CONFIGURAR PM2
# =============================================================================
echo -e "${BLUE}🚀 Configurando PM2...${NC}"

# Crear archivo de configuración PM2
cat > $PROJECT_PATH/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'marvera-api',
    script: './backend/simple-server.js',
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

echo -e "${GREEN}✅ Configuración PM2 creada${NC}"

# =============================================================================
# 8. CREAR SCRIPT DE DEPLOYMENT
# =============================================================================
echo -e "${BLUE}📝 Creando script de deployment...${NC}"

cat > $PROJECT_PATH/deploy.sh << 'EOF'
#!/bin/bash
# Script de deployment para MarVera

echo "🚀 Iniciando deployment de MarVera..."

# Ir al directorio del proyecto
cd /var/www/marvera.mx

# Instalar dependencias del backend (si existen)
if [ -f "backend/package.json" ]; then
    echo "📦 Instalando dependencias del backend..."
    cd backend
    npm install --production
    
    # Crear usuario admin si existe el script
    if [ -f "create-admin.js" ]; then
        echo "👤 Creando usuario administrador..."
        node create-admin.js
    fi
    
    cd ..
fi

# Configurar permisos
echo "🔐 Configurando permisos..."
chown -R www-data:www-data /var/www/marvera.mx
chmod -R 755 /var/www/marvera.mx

# Reiniciar aplicación con PM2
echo "🔄 Reiniciando aplicación..."
pm2 restart marvera-api 2>/dev/null || pm2 start ecosystem.config.js

# Reiniciar nginx
echo "🌐 Reiniciando nginx..."
systemctl restart nginx

echo "✅ Deployment completado!"
echo "🌐 Sitio: http://marvera.mx"
echo "🔗 API: http://marvera.mx/api/health"
EOF

chmod +x $PROJECT_PATH/deploy.sh

echo -e "${GREEN}✅ Script de deployment creado${NC}"

# =============================================================================
# 9. CONFIGURAR FIREWALL
# =============================================================================
echo -e "${BLUE}🔥 Configurando firewall...${NC}"

if command -v ufw &> /dev/null; then
    ufw allow 22/tcp      # SSH
    ufw allow 80/tcp      # HTTP
    ufw allow 443/tcp     # HTTPS
    ufw --force enable
    echo -e "${GREEN}✅ Firewall configurado${NC}"
else
    echo -e "${YELLOW}⚠️ UFW no está instalado, configurar firewall manualmente${NC}"
fi

# =============================================================================
# 10. CONFIGURAR PM2 STARTUP
# =============================================================================
echo -e "${BLUE}🔧 Configurando PM2 startup...${NC}"

# Configurar PM2 para iniciarse con el sistema
pm2 startup systemd -u root --hp /root
pm2 save

echo -e "${GREEN}✅ PM2 startup configurado${NC}"

# =============================================================================
# 11. CREAR PÁGINA DE PRUEBA TEMPORAL
# =============================================================================
echo -e "${BLUE}📄 Creando página de prueba...${NC}"

cat > $FRONTEND_PATH/index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MarVera - Premium Seafood</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            border: 1px solid rgba(255,255,255,0.18);
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #FFD700, #FFA500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .status {
            margin: 1rem 0;
            padding: 1rem;
            border-radius: 10px;
            background: rgba(255,255,255,0.1);
        }
        .success {
            border-left: 4px solid #4CAF50;
        }
        .info {
            border-left: 4px solid #2196F3;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            margin: 0.5rem;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            transition: transform 0.3s ease;
        }
        .button:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌊 MarVera</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">Premium Seafood Platform</p>
        
        <div class="status success">
            <h3>✅ Servidor Configurado Exitosamente</h3>
            <p>Nginx, PM2 y todas las dependencias están instaladas</p>
        </div>
        
        <div class="status info">
            <h3>📋 Próximos Pasos:</h3>
            <p>1. Subir archivos del frontend (carpeta dist)</p>
            <p>2. Subir backend (carpeta backend)</p>
            <p>3. Ejecutar: <code>bash /var/www/marvera.mx/deploy.sh</code></p>
        </div>
        
        <div style="margin-top: 2rem;">
            <a href="/api/health" class="button">🔗 Probar API</a>
            <a href="https://github.com/lilyei7/marvera" class="button">📱 GitHub</a>
        </div>
        
        <div style="margin-top: 2rem; font-size: 0.9rem; opacity: 0.8;">
            <p>Servidor configurado automáticamente</p>
            <p id="timestamp"></p>
        </div>
    </div>
    
    <script>
        document.getElementById('timestamp').textContent = new Date().toLocaleString('es-ES');
        
        // Probar API automáticamente
        fetch('/api/health')
            .then(response => response.json())
            .then(data => {
                console.log('✅ API funcionando:', data);
            })
            .catch(error => {
                console.log('ℹ️ API no disponible aún:', error.message);
            });
    </script>
</body>
</html>
EOF

echo -e "${GREEN}✅ Página de prueba creada${NC}"

# =============================================================================
# 12. MOSTRAR INFORMACIÓN FINAL
# =============================================================================
echo ""
echo -e "${CYAN}🎉 CONFIGURACIÓN COMPLETADA${NC}"
echo -e "${CYAN}=========================${NC}"
echo ""
echo -e "${GREEN}✅ Servicios instalados y configurados:${NC}"
echo -e "   🌐 nginx"
echo -e "   🚀 PM2"
echo -e "   📦 Node.js $(node --version)"
echo -e "   🔒 certbot (para SSL)"
echo ""
echo -e "${YELLOW}📁 Estructura de directorios:${NC}"
echo -e "   $PROJECT_PATH/"
echo -e "   ├── backend/          (subir tu carpeta backend aquí)"
echo -e "   ├── dist/             (subir tu build de frontend aquí)"
echo -e "   ├── ecosystem.config.js"
echo -e "   └── deploy.sh"
echo ""
echo -e "${BLUE}🔗 URLs disponibles:${NC}"
echo -e "   🌐 Sitio: http://$DOMAIN"
echo -e "   🔗 API:   http://$DOMAIN/api/health"
echo ""
echo -e "${YELLOW}📋 Próximos pasos:${NC}"
echo -e "   1. Subir tu carpeta /backend a $BACKEND_PATH"
echo -e "   2. Subir tu build /dist a $FRONTEND_PATH"
echo -e "   3. Ejecutar: bash $PROJECT_PATH/deploy.sh"
echo -e "   4. Para SSL: certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo -e "${GREEN}✅ MarVera está listo para deployment!${NC}"
