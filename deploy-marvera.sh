#!/bin/bash

# Script de despliegue de MarVera
# Ejecutar después de subir los archivos al servidor

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Variables
DOMAIN="marvera.mx"
PROJECT_DIR="/var/www/marvera"
BACKEND_DIR="/var/www/marvera-backend"
NGINX_CONF="/etc/nginx/sites-available/marvera.mx"
APP_USER="marvera"

echo "🚀 Desplegando MarVera en producción..."
echo "======================================"

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    print_error "Este script debe ejecutarse como root"
    exit 1
fi

# Verificar que existen los directorios
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Directorio del proyecto no encontrado: $PROJECT_DIR"
    exit 1
fi

print_status "Configurando backend..."
cd $BACKEND_DIR

# Instalar dependencias del backend
print_status "Instalando dependencias del backend..."
sudo -u $APP_USER npm install --production

# Crear archivo de configuración PM2
print_status "Creando configuración PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'marvera-backend',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/marvera-error.log',
    out_file: '/var/log/pm2/marvera-out.log',
    log_file: '/var/log/pm2/marvera-combined.log',
    time: true
  }]
};
EOF

# Crear directorio de logs
mkdir -p /var/log/pm2
chown -R $APP_USER:$APP_USER /var/log/pm2

# Configurar frontend
print_status "Configurando frontend..."
cd $PROJECT_DIR

# Instalar dependencias y compilar
print_status "Compilando frontend..."
sudo -u $APP_USER npm install
sudo -u $APP_USER npm run build

# Verificar que se generó el build
if [ ! -d "$PROJECT_DIR/dist" ]; then
    print_error "Error: No se generó el directorio dist del frontend"
    exit 1
fi

print_success "Frontend compilado correctamente"

# Configurar Nginx
print_status "Configurando Nginx..."

# Verificar si existe el archivo de configuración
if [ ! -f "./nginx-marvera-production.conf" ]; then
    print_error "Archivo de configuración de Nginx no encontrado"
    exit 1
fi

# Copiar configuración de Nginx
cp ./nginx-marvera-production.conf $NGINX_CONF

# Crear enlace simbólico
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/

# Eliminar configuración por defecto si existe
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Verificar configuración de Nginx
print_status "Verificando configuración de Nginx..."
nginx -t

if [ $? -ne 0 ]; then
    print_error "Error en la configuración de Nginx"
    exit 1
fi

print_success "Configuración de Nginx verificada"

# Instalar Certbot para SSL
print_status "Instalando Certbot..."
apt install -y certbot python3-certbot-nginx

# Iniciar servicios
print_status "Iniciando servicios..."

# Reiniciar Nginx sin SSL primero
systemctl restart nginx

# Obtener certificado SSL
print_status "Obteniendo certificado SSL..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

if [ $? -eq 0 ]; then
    print_success "Certificado SSL obtenido correctamente"
else
    print_warning "No se pudo obtener el certificado SSL automáticamente"
    print_status "Puedes obtenerlo manualmente después con:"
    echo "certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi

# Configurar renovación automática de SSL
print_status "Configurando renovación automática de SSL..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Iniciar backend con PM2
print_status "Iniciando backend..."
cd $BACKEND_DIR

# Detener procesos existentes
sudo -u $APP_USER pm2 delete marvera-backend 2>/dev/null || true

# Iniciar aplicación
sudo -u $APP_USER pm2 start ecosystem.config.js

# Guardar configuración PM2
sudo -u $APP_USER pm2 save

# Configurar PM2 para inicio automático
sudo -u $APP_USER pm2 startup
pm2 startup systemd -u $APP_USER --hp /home/$APP_USER

# Configurar permisos finales
chown -R $APP_USER:www-data $PROJECT_DIR
chown -R $APP_USER:$APP_USER $BACKEND_DIR
chmod -R 755 $PROJECT_DIR
chmod -R 750 $BACKEND_DIR

# Reiniciar servicios finales
systemctl restart nginx
systemctl enable nginx

print_success "¡Despliegue completado!"

echo ""
echo "🎉 MarVera ha sido desplegado exitosamente!"
echo ""
echo "📊 Estado de los servicios:"
echo "   - Nginx: $(systemctl is-active nginx)"
echo "   - Backend PM2: $(sudo -u $APP_USER pm2 list | grep marvera-backend | awk '{print $10}' || echo 'Verificar manualmente')"
echo ""
echo "🌐 URLs:"
echo "   - Sitio web: https://$DOMAIN"
echo "   - API: https://$DOMAIN/api"
echo ""
echo "📋 Comandos útiles:"
echo "   - Ver logs del backend: sudo -u $APP_USER pm2 logs marvera-backend"
echo "   - Reiniciar backend: sudo -u $APP_USER pm2 restart marvera-backend"
echo "   - Ver logs de Nginx: tail -f /var/log/nginx/marvera_error.log"
echo "   - Verificar SSL: certbot certificates"
echo ""
echo "⚡ Para actualizar la aplicación:"
echo "   1. Subir nuevos archivos"
echo "   2. Ejecutar: sudo -u $APP_USER npm run build (en $PROJECT_DIR)"
echo "   3. Ejecutar: sudo -u $APP_USER pm2 restart marvera-backend"
