#!/bin/bash
echo "🚀 Instalación completa de MarVera en Ubuntu..."

# Variables
PROJECT_DIR="/var/www/marvera"
DOMAIN="marvera.mx"
SERVER_IP="148.230.87.198"

# Crear directorio del proyecto
echo "📁 Creando estructura de directorios..."
sudo mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Clonar o actualizar el proyecto (ajusta la URL según tu repo)
echo "📥 Descargando código..."
if [ -d ".git" ]; then
    echo "🔄 Actualizando código existente..."
    git pull origin main
else
    echo "📦 Clonando proyecto..."
    # git clone https://github.com/lilyei7/marvera.git .
    echo "⚠️  Sube tu código manualmente o configura git clone"
fi

# Instalar dependencias del sistema
echo "🔧 Instalando dependencias del sistema..."
sudo apt update
sudo apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates

# Instalar Node.js 18+
echo "📦 Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version

# Instalar PM2 globalmente
echo "🔄 Instalando PM2..."
sudo npm install -g pm2

# Configurar permisos
echo "🔒 Configurando permisos..."
sudo chown -R $USER:$USER $PROJECT_DIR
chmod -R 755 $PROJECT_DIR

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd $PROJECT_DIR/backend
npm install

# Compilar TypeScript
echo "🔨 Compilando TypeScript..."
npx tsc || echo "⚠️  Error en compilación, continuando..."

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd $PROJECT_DIR
npm install

# Construir frontend
echo "🏗️  Construyendo frontend..."
npm run build || echo "⚠️  Error en build, continuando..."

# Crear archivos de configuración
echo "⚙️  Creando configuración..."

# Archivo de entorno para backend
cat > $PROJECT_DIR/backend/.env << EOF
# Backend Environment Variables
PORT=3001
NODE_ENV=production
DATABASE_URL="file:./production.db"
JWT_SECRET=marvera-production-secret-2025
ALLOWED_ORIGINS=http://$SERVER_IP,https://$DOMAIN,http://$DOMAIN
EOF

# Configuración PM2
cat > $PROJECT_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'marvera-backend',
    script: 'backend/src/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader ts-node/esm',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
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

# Crear directorio de logs
mkdir -p $PROJECT_DIR/logs

# Configurar Nginx
echo "🌐 Configurando Nginx..."
sudo apt install -y nginx

cat > /tmp/marvera-nginx.conf << EOF
# Redirigir HTTP a HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN $SERVER_IP;
    return 301 https://\$server_name\$request_uri;
}

# Configuración HTTPS principal
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # Certificados SSL (se configurarán con Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Configuración SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    # Logs
    access_log /var/log/nginx/marvera-access.log;
    error_log /var/log/nginx/marvera-error.log;

    # Directorio raíz del frontend
    root $PROJECT_DIR/dist;
    index index.html;

    # Configuración para SPA (Single Page Application)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }

    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Configuración para acceso directo por IP (temporal)
server {
    listen 80;
    listen 443 ssl http2;
    server_name $SERVER_IP;

    # Certificado autofirmado temporal
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;

    root $PROJECT_DIR/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo cp /tmp/marvera-nginx.conf /etc/nginx/sites-available/marvera
sudo ln -sf /etc/nginx/sites-available/marvera /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar configuración de Nginx
sudo nginx -t

echo "✅ Instalación base completada!"
echo ""
echo "🚀 SIGUIENTE: Ejecuta estos comandos para iniciar:"
echo "1. sudo systemctl restart nginx"
echo "2. cd $PROJECT_DIR && pm2 start ecosystem.config.js"
echo "3. pm2 save && pm2 startup"
echo ""
echo "🌐 Tu sitio estará disponible en:"
echo "   - http://$SERVER_IP (acceso directo por IP)"
echo "   - https://$DOMAIN (después de configurar DNS y SSL)"
echo ""
echo "📊 Comandos útiles:"
echo "   - pm2 status (ver estado del backend)"
echo "   - pm2 logs (ver logs en tiempo real)"
echo "   - sudo systemctl status nginx (estado de Nginx)"
