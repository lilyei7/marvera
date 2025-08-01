#!/bin/bash
# 🌊 MARVERA - Verificación final y despliegue
# Script para verificar que todas las referencias localhost están corregidas

echo "🔍 VERIFICACIÓN FINAL DE MARVERA"
echo "================================="

# 1. Verificar que no hay localhost en el código fuente del frontend
echo "📋 Verificando referencias localhost en frontend..."
LOCALHOST_COUNT=$(find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -l "localhost" | grep -v backend | wc -l)

if [ "$LOCALHOST_COUNT" -eq 0 ]; then
    echo "✅ Frontend limpio - No hay referencias localhost"
else
    echo "⚠️ Encontradas $LOCALHOST_COUNT referencias localhost en frontend:"
    find src/ -name "*.ts" -o -name "*.tsx" | xargs grep "localhost" | grep -v backend
fi

# 2. Verificar configuración de APIs
echo ""
echo "📋 Verificando configuración de API..."
echo "API_BASE_URL en environment.ts:"
grep "API_BASE_URL" src/config/environment.ts

echo ""
echo "API_BASE_URL en api.ts:"
grep "API_BASE_URL" src/config/api.ts

# 3. Verificar archivos .env
echo ""
echo "📋 Verificando archivos .env..."
echo "Frontend .env:"
grep "VITE_API_URL" .env

echo ""
echo "Backend .env:"
grep "FRONTEND_URL" backend/.env

# 4. Verificar build
echo ""
echo "📋 Verificando build compilado..."
if [ -d "dist" ]; then
    DIST_LOCALHOST=$(find dist/ -name "*.js" -o -name "*.css" -o -name "*.html" | xargs grep -l "localhost" 2>/dev/null | wc -l)
    if [ "$DIST_LOCALHOST" -eq 0 ]; then
        echo "✅ Build limpio - No hay localhost en dist/"
    else
        echo "⚠️ Encontradas referencias localhost en build:"
        find dist/ -name "*.js" -o -name "*.css" -o -name "*.html" | xargs grep "localhost" | head -3
    fi
else
    echo "⚠️ No existe directorio dist/ - necesitas compilar primero"
fi

# 5. URLs finales esperadas
echo ""
echo "🌐 CONFIGURACIÓN FINAL:"
echo "Frontend: https://marvera.mx"
echo "Backend:  https://marvera.mx/api"
echo "Login:    https://marvera.mx/login"
echo "Admin:    https://marvera.mx/admin"

echo ""
echo "🚀 PASOS PARA DESPLEGAR:"
echo "1. scp -r dist/* root@srv936134.hstgr.cloud:/var/www/marvera.mx/"
echo "2. ssh root@srv936134.hstgr.cloud"
echo "3. cd /var/www/marvera-backend && pm2 restart all"
echo "4. Verificar: https://marvera.mx"

echo ""
echo "✅ Verificación completada!"
