#!/bin/bash

# Script de instalación de MarVera en producción
# Para servidor Ubuntu/Debian
# Ejecutar como root

set -e

echo "🚀 Iniciando instalación de MarVera en producción..."
echo "=========================================="

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

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    print_error "Este script debe ejecutarse como root"
    exit 1
fi

# Variables
DOMAIN="marvera.mx"
PROJECT_DIR="/var/www/marvera"
BACKEND_DIR="/var/www/marvera-backend"
NGINX_CONF="/etc/nginx/sites-available/marvera.mx"
APP_USER="marvera"
DB_NAME="marvera_db"
DB_USER="marvera_user"
DB_PASSWORD="MarvEr4_S3cur3_P4ss"

print_status "Actualizando sistema..."
apt update && apt upgrade -y

print_status "Instalando dependencias del sistema..."
apt install -y curl wget git nginx postgresql postgresql-contrib ufw fail2ban

# Instalar Node.js 18.x
print_status "Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verificar instalación de Node.js
print_success "Node.js $(node -v) instalado"
print_success "npm $(npm -v) instalado"

# Instalar PM2 para gestión de procesos
print_status "Instalando PM2..."
npm install -g pm2

# Crear usuario para la aplicación
print_status "Creando usuario de aplicación..."
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash $APP_USER
    usermod -aG www-data $APP_USER
    print_success "Usuario $APP_USER creado"
else
    print_warning "Usuario $APP_USER ya existe"
fi

# Configurar PostgreSQL
print_status "Configurando PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Crear base de datos y usuario
sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
\q
EOF

print_success "Base de datos PostgreSQL configurada"

# Crear directorios del proyecto
print_status "Creando directorios del proyecto..."
mkdir -p $PROJECT_DIR
mkdir -p $BACKEND_DIR
chown -R $APP_USER:www-data $PROJECT_DIR
chown -R $APP_USER:$APP_USER $BACKEND_DIR

# Configurar firewall
print_status "Configurando firewall..."
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 80
ufw allow 443
print_success "Firewall configurado"

# Configurar fail2ban
print_status "Configurando fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban
print_success "fail2ban configurado"

print_success "Instalación base completada!"
print_status "Siguiente paso: subir archivos del proyecto y configurar Nginx"

echo ""
echo "📋 Resumen de la instalación:"
echo "   - Node.js: $(node -v)"
echo "   - npm: $(npm -v)"
echo "   - PM2: Instalado"
echo "   - PostgreSQL: Configurado"
echo "   - Usuario de aplicación: $APP_USER"
echo "   - Directorio del proyecto: $PROJECT_DIR"
echo "   - Directorio del backend: $BACKEND_DIR"
echo "   - Base de datos: $DB_NAME"
echo ""
echo "🔑 Credenciales de la base de datos:"
echo "   - Usuario: $DB_USER"
echo "   - Contraseña: $DB_PASSWORD"
echo "   - Base de datos: $DB_NAME"
echo ""
echo "⚠️  Siguiente: ejecutar deploy-marvera.sh después de subir los archivos"
