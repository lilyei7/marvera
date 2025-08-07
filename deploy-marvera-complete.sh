#!/bin/bash
# 🚀 Script de Deploy Completo - MarVera
# Automatiza el proceso de build y deploy evitando problemas de assets

set -e  # Exit on any error

echo "🔧 MarVera Deploy Script - Inicio"
echo "=================================="

# 1. Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encuentra package.json. Ejecuta desde la raíz del proyecto."
    exit 1
fi

# 2. Build del proyecto
echo "📦 Ejecutando build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en el build. Abortando deploy."
    exit 1
fi

# 3. Verificar archivos generados
echo "🔍 Verificando archivos generados en dist/..."
if [ ! -d "dist" ]; then
    echo "❌ Error: No existe directorio dist/"
    exit 1
fi

# Listar archivos CSS y JS generados
echo "📄 Archivos CSS/JS generados:"
ls -la dist/assets/*.css dist/assets/*.js 2>/dev/null || echo "⚠️  No se encontraron assets"

# Verificar que index.html existe
if [ ! -f "dist/index.html" ]; then
    echo "❌ Error: No se encuentra dist/index.html"
    exit 1
fi

# Mostrar referencias en HTML
echo "🔗 Referencias en index.html:"
grep -E "assets/index-.*\.(js|css)" dist/index.html

# 4. Confirmar deploy
echo ""
read -p "¿Continuar con el deploy a producción? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "🚫 Deploy cancelado por el usuario."
    exit 0
fi

# 5. Deploy al servidor
SERVER="root@148.230.87.198"
DEPLOY_PATH="/var/www/marvera"

echo "🚀 Iniciando deploy al servidor..."

# Crear backup de index.html actual
echo "💾 Creando backup de index.html..."
ssh $SERVER "cp $DEPLOY_PATH/index.html $DEPLOY_PATH/index.html.backup.$(date +%Y%m%d_%H%M%S)"

# Subir archivos
echo "📤 Subiendo archivos al servidor..."

# Subir assets
echo "  📁 Subiendo assets..."
scp -r ./dist/assets/* $SERVER:$DEPLOY_PATH/assets/

# Subir index.html (CRÍTICO)
echo "  📄 Subiendo index.html..."
scp ./dist/index.html $SERVER:$DEPLOY_PATH/

# Subir otros archivos estáticos si existen
if [ -d "dist/images" ]; then
    echo "  🖼️  Subiendo imágenes..."
    scp -r ./dist/images/* $SERVER:$DEPLOY_PATH/images/ 2>/dev/null || echo "  ⚠️  No hay imágenes nuevas"
fi

# 6. Establecer permisos correctos
echo "🔒 Estableciendo permisos..."
ssh $SERVER "chmod -R 755 $DEPLOY_PATH/assets/"
ssh $SERVER "chmod 644 $DEPLOY_PATH/index.html"

# 7. Verificación post-deploy
echo "✅ Verificando deploy..."

# Verificar que HTML y assets coinciden
echo "🔍 Verificando consistencia HTML vs Assets..."
HTML_REFS=$(ssh $SERVER "cat $DEPLOY_PATH/index.html | grep -E 'assets/index-.*\.(js|css)' | sed 's/.*assets\///; s/[\"<>].*//'" | tr '\n' ' ')
ACTUAL_FILES=$(ssh $SERVER "ls $DEPLOY_PATH/assets/ | grep '^index-'" | tr '\n' ' ')

echo "  📄 Referencias en HTML: $HTML_REFS"
echo "  📁 Archivos en assets/: $ACTUAL_FILES"

# 8. Test de conectividad
echo "🌐 Probando conectividad..."

# Obtener nombres de archivos desde HTML
JS_FILE=$(ssh $SERVER "cat $DEPLOY_PATH/index.html | grep -o 'assets/index-[^\"]*\.js' | sed 's/assets\///'")
CSS_FILE=$(ssh $SERVER "cat $DEPLOY_PATH/index.html | grep -o 'assets/index-[^\"]*\.css' | sed 's/assets\///'")

if [ -n "$JS_FILE" ]; then
    echo "  🧪 Probando JS: $JS_FILE"
    if curl -s -I "https://marvera.mx/assets/$JS_FILE" | grep -q "200 OK"; then
        echo "  ✅ JS accesible"
    else
        echo "  ❌ JS no accesible"
    fi
fi

if [ -n "$CSS_FILE" ]; then
    echo "  🧪 Probando CSS: $CSS_FILE"
    if curl -s -I "https://marvera.mx/assets/$CSS_FILE" | grep -q "200 OK"; then
        echo "  ✅ CSS accesible"
    else
        echo "  ❌ CSS no accesible"
    fi
fi

# 9. Test de sitio web
echo "🌍 Probando sitio web..."
if curl -s "https://marvera.mx" | grep -q "MarVera"; then
    echo "  ✅ Sitio web respondiendo correctamente"
else
    echo "  ⚠️  Sitio web puede tener problemas"
fi

echo ""
echo "🎉 Deploy completado!"
echo "=================================="
echo "📍 Sitio: https://marvera.mx"
echo "📄 Logs: ssh $SERVER 'tail -f /var/log/nginx/access.log'"
echo "🔄 Backup: $DEPLOY_PATH/index.html.backup.*"
echo ""
