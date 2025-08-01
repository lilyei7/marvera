#!/bin/bash

# 🌊 MARVERA - Script para corregir referencias de localhost
# Este script reemplaza todas las referencias de localhost por marvera.mx

echo "🔧 Iniciando corrección de referencias localhost → marvera.mx"
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar progreso
show_progress() {
    echo -e "${BLUE}➤${NC} $1"
}

show_success() {
    echo -e "${GREEN}✅${NC} $1"
}

show_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

show_error() {
    echo -e "${RED}❌${NC} $1"
}

# 1. Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    show_error "No se encuentra package.json. Ejecuta este script desde el directorio raíz del proyecto."
    exit 1
fi

show_progress "Verificando directorio del proyecto..."
PROJECT_NAME=$(grep -o '"name": "[^"]*' package.json | grep -o '[^"]*$')
echo "📦 Proyecto detectado: $PROJECT_NAME"

# 2. Crear backup de archivos importantes
show_progress "Creando backup de seguridad..."
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup de archivos de configuración importantes
cp -r src/ "$BACKUP_DIR/src-backup" 2>/dev/null || echo "No se encontró directorio src/"
cp -r dist/ "$BACKUP_DIR/dist-backup" 2>/dev/null || echo "No se encontró directorio dist/"
cp vite.config.ts "$BACKUP_DIR/" 2>/dev/null || echo "No se encontró vite.config.ts"

show_success "Backup creado en: $BACKUP_DIR"

# 3. Buscar todas las referencias de localhost
show_progress "Buscando referencias de localhost..."

echo "📍 Referencias encontradas:"
echo "=========================="

# Buscar en archivos fuente
if [ -d "src/" ]; then
    echo "🔍 En archivos fuente (src/):"
    grep -r "localhost" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | head -10
fi

# Buscar en archivos compilados
if [ -d "dist/" ]; then
    echo "🔍 En archivos compilados (dist/):"
    grep -r "localhost" dist/ | head -5
fi

echo "=========================="

# 4. Reemplazar localhost:3001 por https://marvera.mx
show_progress "Reemplazando localhost:3001 → https://marvera.mx..."

# Función para reemplazar en archivos
replace_in_files() {
    local pattern=$1
    local replacement=$2
    local description=$3
    
    echo "🔄 $description"
    
    # Reemplazar en archivos fuente TypeScript/JavaScript
    find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) 2>/dev/null | while read file; do
        if grep -q "$pattern" "$file" 2>/dev/null; then
            sed -i "s|$pattern|$replacement|g" "$file"
            echo "  ✓ Actualizado: $file"
        fi
    done
    
    # Reemplazar en archivos compilados
    find dist/ -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) 2>/dev/null | while read file; do
        if grep -q "$pattern" "$file" 2>/dev/null; then
            sed -i "s|$pattern|$replacement|g" "$file"
            echo "  ✓ Actualizado: $file"
        fi
    done
}

# Diferentes patrones de localhost que pueden existir
replace_in_files "http://localhost:3001" "https://marvera.mx" "http://localhost:3001 → https://marvera.mx"
replace_in_files "https://localhost:3001" "https://marvera.mx" "https://localhost:3001 → https://marvera.mx"
replace_in_files "localhost:3001" "marvera.mx" "localhost:3001 → marvera.mx"
replace_in_files "http://localhost:5173" "https://marvera.mx" "http://localhost:5173 → https://marvera.mx"
replace_in_files "localhost:5173" "marvera.mx" "localhost:5173 → marvera.mx"

# 5. Actualizar archivos de configuración específicos
show_progress "Actualizando archivos de configuración..."

# Actualizar environment.ts si existe
if [ -f "src/config/environment.ts" ]; then
    show_progress "Actualizando src/config/environment.ts..."
    cat > src/config/environment.ts << 'EOF'
const isDevelopment = import.meta.env.DEV;

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001' 
  : 'https://marvera.mx';

export const API_ENDPOINTS = {
  // Auth endpoints
  login: `${API_BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/api/auth/register`,
  logout: `${API_BASE_URL}/api/auth/logout`,
  
  // Product endpoints
  products: `${API_BASE_URL}/api/products`,
  productsFeatured: `${API_BASE_URL}/api/products/featured`,
  
  // User endpoints
  userProfile: `${API_BASE_URL}/api/user/profile`,
  
  // Admin endpoints
  adminProducts: `${API_BASE_URL}/api/admin/products`,
  
  // Wholesale endpoints
  wholesaleProducts: `${API_BASE_URL}/api/wholesale-products`,
};

export const isProduction = !isDevelopment;
export const isDev = isDevelopment;
EOF
    show_success "environment.ts actualizado"
else
    show_warning "No se encontró src/config/environment.ts"
fi

# 6. Verificar el resultado
show_progress "Verificando correcciones..."

echo "🔍 Verificando referencias restantes de localhost:"
REMAINING_LOCALHOST=$(grep -r "localhost" src/ dist/ 2>/dev/null | grep -v "node_modules" | wc -l)

if [ "$REMAINING_LOCALHOST" -eq 0 ]; then
    show_success "¡Todas las referencias de localhost han sido corregidas!"
else
    show_warning "Aún quedan $REMAINING_LOCALHOST referencias de localhost:"
    grep -r "localhost" src/ dist/ 2>/dev/null | grep -v "node_modules" | head -5
fi

# 7. Recompilar el proyecto
show_progress "Recompilando el proyecto..."

echo "🏗️ Limpiando build anterior..."
rm -rf dist/

echo "📦 Instalando dependencias..."
npm install --silent

echo "🔨 Compilando proyecto..."
export NODE_ENV=production
export VITE_API_URL=https://marvera.mx/api
npm run build

if [ $? -eq 0 ]; then
    show_success "Compilación exitosa"
    
    # Verificar que el nuevo build no tiene localhost
    NEW_LOCALHOST=$(grep -r "localhost" dist/ 2>/dev/null | wc -l)
    if [ "$NEW_LOCALHOST" -eq 0 ]; then
        show_success "✨ ¡Build limpio! No hay referencias de localhost en dist/"
    else
        show_warning "⚠️ Aún hay $NEW_LOCALHOST referencias de localhost en el build"
        grep -r "localhost" dist/ | head -3
    fi
else
    show_error "Error en la compilación"
    exit 1
fi

# 8. Mostrar comandos de despliegue
echo ""
echo "🚀 COMANDOS PARA DESPLEGAR:"
echo "=========================="
echo "# En tu servidor, ejecuta:"
echo "sudo cp -r dist/* /var/www/marvera.mx/"
echo "sudo systemctl reload nginx"
echo "pm2 restart marvera-api"
echo ""

# 9. Resumen final
echo "📋 RESUMEN:"
echo "==========="
echo "✅ Backup creado en: $BACKUP_DIR"
echo "✅ Referencias localhost reemplazadas"
echo "✅ Proyecto recompilado"
echo "✅ Build verificado"
echo ""
echo "🎯 Próximos pasos:"
echo "1. Subir los archivos compilados al servidor"
echo "2. Reiniciar nginx"
echo "3. Probar el login en https://marvera.mx/login"
echo ""

show_success "¡Script completado! 🌊"
