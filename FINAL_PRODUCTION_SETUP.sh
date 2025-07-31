#!/bin/bash
# ============================================================================
# SCRIPT DE CONFIGURACIÓN FINAL PARA PRODUCCIÓN
# Ejecutar en el servidor: bash FINAL_PRODUCTION_SETUP.sh
# ============================================================================

echo "🚀 CONFIGURACIÓN FINAL PARA PRODUCCIÓN MARVERA"
echo "=============================================="

# Variables de producción
PRODUCTION_IP="148.230.87.198"
PRODUCTION_DOMAIN="marvera.mx"
PROJECT_PATH="/var/www/marvera"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logs
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 1. LIMPIEZA DE ARCHIVOS INNECESARIOS
log "🧹 Eliminando archivos de desarrollo..."

cd $PROJECT_PATH

# Eliminar archivos de test y desarrollo
find . -name "test-*" -type f -delete 2>/dev/null
find . -name "*local*" -type f -delete 2>/dev/null
find . -name "*test*" -path "*/scripts/*" -delete 2>/dev/null
find . -name "*mock*" -type f -delete 2>/dev/null
find . -name "LOCAL_DEV_GUIDE.md" -delete 2>/dev/null
find . -name "setup-local-mode.bat" -delete 2>/dev/null
find . -name "start-all-local.bat" -delete 2>/dev/null

# Eliminar archivos específicos del backend
rm -f backend/test-*.js 2>/dev/null
rm -f backend/clean-users.js 2>/dev/null
rm -f backend/make-user-admin.js 2>/dev/null
rm -f backend/fix-*.js 2>/dev/null
rm -f backend/check-*.js 2>/dev/null
rm -f backend/seed-*.js 2>/dev/null

log "✅ Archivos innecesarios eliminados"

# 2. CORREGIR REFERENCIAS IP
log "🔧 Corrigiendo referencias de IP..."

# Buscar y reemplazar IP antigua
find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.json" -o -name "*.md" -o -name "*.conf" \) \
    ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./dist/*" \
    -exec sed -i "s/187\.33\.155\.127/$PRODUCTION_IP/g" {} \;

# Reemplazar localhost con dominio de producción
find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.json" \) \
    ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./dist/*" \
    -exec sed -i "s|http://localhost:5173|https://$PRODUCTION_DOMAIN|g" {} \;

find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.json" \) \
    ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./dist/*" \
    -exec sed -i "s|http://localhost:3001|https://$PRODUCTION_DOMAIN/api|g" {} \;

log "✅ Referencias IP corregidas"

# 3. CREAR ARCHIVO .ENV FINAL DE PRODUCCIÓN
log "📝 Creando archivo .env de producción..."

cat > .env << EOF
# PRODUCCIÓN MARVERA - CONFIGURACIÓN FINAL
NODE_ENV=production
HOST=$PRODUCTION_IP
PORT=3001

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=marvera_db
DB_USER=marvera_user
DB_PASSWORD=MarvEr4_S3cur3_P4ss

# JWT y seguridad
JWT_SECRET=marvera_jwt_secret_production_2025_secure_$(date +%s)

# URLs de producción
VITE_API_URL=https://$PRODUCTION_DOMAIN/api
VITE_BACKEND_URL=https://$PRODUCTION_DOMAIN/api
VITE_SOCKET_URL=https://$PRODUCTION_DOMAIN
SERVER_URL=https://$PRODUCTION_DOMAIN

# CORS
CORS_ORIGINS=https://$PRODUCTION_DOMAIN,https://www.$PRODUCTION_DOMAIN

# Configuraciones de producción
VITE_ENABLE_FALLBACK=false
VITE_API_TIMEOUT=8000

# APIs externas (cambiar por valores reales)
VITE_MAPBOX_TOKEN=pk.your_real_mapbox_token_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_real_stripe_key_here
EOF

cp .env backend/.env
log "✅ Archivo .env de producción creado"

# 4. LIMPIAR ARCHIVOS DE SERVIDOR ESPECÍFICOS
log "🔧 Limpiando archivos de servidor..."

# Actualizar production-server.js para usar variables de entorno
if [ -f "backend/production-server.js" ]; then
    sed -i "s/const SERVER_IP = '.*'/const SERVER_IP = process.env.HOST || '$PRODUCTION_IP'/" backend/production-server.js
    sed -i "s/187\.33\.155\.127/$PRODUCTION_IP/g" backend/production-server.js
    log "✅ production-server.js actualizado"
fi

# Limpiar quick-server.js
if [ -f "backend/quick-server.js" ]; then
    sed -i "s/const SERVER_IP = '.*'/const SERVER_IP = process.env.HOST || '$PRODUCTION_IP'/" backend/quick-server.js
    sed -i "s/187\.33\.155\.127/$PRODUCTION_IP/g" backend/quick-server.js
    log "✅ quick-server.js actualizado"
fi

# 5. CONFIGURAR BASE DE DATOS
log "🗄️ Configurando PostgreSQL..."

# Verificar si PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    warn "PostgreSQL no está instalado. Instalando..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# Crear base de datos y usuario
sudo -u postgres psql -c "DROP DATABASE IF EXISTS marvera_db;" 2>/dev/null
sudo -u postgres psql -c "DROP USER IF EXISTS marvera_user;" 2>/dev/null
sudo -u postgres psql -c "CREATE USER marvera_user WITH PASSWORD 'MarvEr4_S3cur3_P4ss';"
sudo -u postgres psql -c "CREATE DATABASE marvera_db OWNER marvera_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE marvera_db TO marvera_user;"

log "✅ Base de datos PostgreSQL configurada"

# 6. CONSTRUIR PROYECTO
log "🏗️ Construyendo proyecto para producción..."

# Frontend
npm install --production
npm run build

# Backend
cd backend
npm install --production
cd ..

log "✅ Proyecto construido"

# 7. CONFIGURAR PM2
log "⚙️ Configurando PM2..."

# Detener procesos existentes
pm2 delete all 2>/dev/null || true

# Iniciar backend
cd backend
pm2 start production-server.js --name marvera-backend
pm2 startup
pm2 save
cd ..

log "✅ PM2 configurado"

# 8. VERIFICACIÓN FINAL
log "🔍 Verificación final..."

echo "Verificando archivos problemáticos restantes:"

# Verificar IP antigua
OLD_IP_COUNT=$(grep -r "187.33.155.127" . --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null | wc -l)
if [ "$OLD_IP_COUNT" -gt 0 ]; then
    warn "Encontradas $OLD_IP_COUNT referencias a IP antigua"
    grep -r "187.33.155.127" . --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null | head -5
else
    log "✅ No se encontraron referencias a IP antigua"
fi

# Verificar localhost
LOCALHOST_COUNT=$(grep -r "localhost:5173\|localhost:3001" . --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null | wc -l)
if [ "$LOCALHOST_COUNT" -gt 0 ]; then
    warn "Encontradas $LOCALHOST_COUNT referencias a localhost"
    grep -r "localhost:5173\|localhost:3001" . --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null | head -5
else
    log "✅ No se encontraron referencias a localhost"
fi

# Verificar servicios
log "Estado de servicios:"
echo "- Nginx: $(systemctl is-active nginx)"
echo "- PostgreSQL: $(systemctl is-active postgresql)"
echo "- PM2: $(pm2 list | grep marvera-backend | awk '{print $10}')"

# Verificar URLs
log "Probando URLs:"
curl -I https://$PRODUCTION_DOMAIN 2>/dev/null | head -1 || warn "Frontend no accesible"
curl -I https://$PRODUCTION_DOMAIN/api/health 2>/dev/null | head -1 || warn "API no accesible"

echo ""
echo "=============================================="
echo -e "${GREEN}✅ CONFIGURACIÓN DE PRODUCCIÓN COMPLETA${NC}"
echo "=============================================="
echo ""
echo -e "${YELLOW}📋 VERIFICACIONES FINALES:${NC}"
echo "1. 🌐 Accede a: https://$PRODUCTION_DOMAIN"
echo "2. 🔌 API Health: https://$PRODUCTION_DOMAIN/api/health" 
echo "3. 👨‍💼 Admin Panel: https://$PRODUCTION_DOMAIN/admin"
echo ""
echo -e "${YELLOW}⚠️ PENDIENTES:${NC}"
echo "1. Configurar DNS para $PRODUCTION_DOMAIN → $PRODUCTION_IP"
echo "2. Actualizar tokens reales de Mapbox y Stripe en .env"
echo "3. Configurar certificados SSL con Certbot"
echo ""
echo -e "${BLUE}🔧 COMANDOS ÚTILES:${NC}"
echo "- Ver logs: pm2 logs marvera-backend"
echo "- Reiniciar: pm2 restart marvera-backend"
echo "- Estado: pm2 status"
