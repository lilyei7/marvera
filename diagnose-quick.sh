#!/bin/bash

echo "🔍 DIAGNÓSTICO RÁPIDO DE MARVERA"
echo "================================"
echo "🕐 $(date)"
echo ""

# Cambiar al directorio correcto
cd /var/www/marvera || {
    echo "❌ No se puede acceder a /var/www/marvera"
    exit 1
}

echo "📂 Directorio actual: $(pwd)"
echo ""

# =====================================================
# 1. VERIFICACIÓN RÁPIDA DE ARCHIVOS
# =====================================================
echo "📁 1. ARCHIVOS CRÍTICOS..."
echo "-------------------------"

echo "📂 Estructura:"
ls -la | grep -E "(backend|src|dist)" | head -5

echo ""
echo "💾 Base de datos:"
if [ -f "backend/prisma/dev.db" ]; then
    size=$(du -h backend/prisma/dev.db | cut -f1)
    echo "✅ SQLite encontrada: $size"
else
    echo "❌ SQLite NO encontrada"
    echo "🔍 Buscando archivos .db..."
    find . -name "*.db" -type f 2>/dev/null | head -3 || echo "   No hay archivos .db"
fi

echo ""
echo "📦 Package files:"
[ -f "backend/package.json" ] && echo "✅ Backend package.json" || echo "❌ Backend package.json"
[ -f "package.json" ] && echo "✅ Frontend package.json" || echo "❌ Frontend package.json"

echo ""

# =====================================================
# 2. PROCESOS (CON TIMEOUT)
# =====================================================
echo "🔄 2. PROCESOS ACTIVOS..."
echo "------------------------"

echo "📊 PM2:"
timeout 5 pm2 status 2>/dev/null || echo "❌ PM2 no responde o sin procesos"

echo ""
echo "🔌 Puerto 3001:"
netstat -tulpn 2>/dev/null | grep ":3001" || echo "❌ Puerto 3001 libre"

echo ""
echo "🌐 Nginx:"
systemctl is-active nginx 2>/dev/null && echo "✅ Nginx activo" || echo "❌ Nginx inactivo"

echo ""

# =====================================================
# 3. BASE DE DATOS (SIN COLGARSE)
# =====================================================
echo "💾 3. BASE DE DATOS..."
echo "--------------------"

if [ -f "backend/prisma/dev.db" ]; then
    echo "🔍 Verificando SQLite..."
    
    # Verificar si sqlite3 está disponible
    if command -v sqlite3 >/dev/null 2>&1; then
        echo "📊 Contando registros..."
        products=$(timeout 3 sqlite3 backend/prisma/dev.db "SELECT COUNT(*) FROM products;" 2>/dev/null || echo "Error")
        categories=$(timeout 3 sqlite3 backend/prisma/dev.db "SELECT COUNT(*) FROM categories;" 2>/dev/null || echo "Error")
        users=$(timeout 3 sqlite3 backend/prisma/dev.db "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "Error")
        
        echo "   Productos: $products"
        echo "   Categorías: $categories"
        echo "   Usuarios: $users"
    else
        echo "⚠️ sqlite3 no disponible, instalando..."
        apt-get update >/dev/null 2>&1 && apt-get install -y sqlite3 >/dev/null 2>&1
    fi
else
    echo "❌ Base de datos no encontrada"
fi

echo ""

# =====================================================
# 4. PRUEBAS DE API (CON TIMEOUT CORTO)
# =====================================================
echo "🌐 4. PRUEBAS DE API..."
echo "---------------------"

echo "⚕️ Health check local:"
if timeout 3 curl -s http://localhost:3001/api/health >/dev/null 2>&1; then
    response=$(timeout 3 curl -s http://localhost:3001/api/health 2>/dev/null)
    echo "✅ Backend responde localmente"
    echo "$response" | grep -o '"message":"[^"]*"' | head -1 2>/dev/null || echo "   Respuesta recibida"
else
    echo "❌ Backend no responde en localhost:3001"
fi

echo ""
echo "🐟 Productos local:"
if timeout 3 curl -s http://localhost:3001/api/products/featured >/dev/null 2>&1; then
    echo "✅ Endpoint de productos responde"
else
    echo "❌ Endpoint de productos no responde"
fi

echo ""
echo "🌍 Dominio externo:"
if timeout 5 curl -s https://marvera.mx/api/health >/dev/null 2>&1; then
    echo "✅ Dominio marvera.mx responde"
else
    echo "❌ Dominio marvera.mx no responde"
fi

echo ""

# =====================================================
# 5. FRONTEND
# =====================================================
echo "🏗️ 5. FRONTEND..."
echo "----------------"

if [ -d "dist" ]; then
    echo "✅ Directorio dist existe"
    files=$(ls dist/ 2>/dev/null | wc -l)
    echo "   Archivos: $files"
    
    if [ -f "dist/index.html" ]; then
        echo "✅ index.html presente"
        size=$(du -h dist/index.html | cut -f1)
        echo "   Tamaño: $size"
    else
        echo "❌ index.html faltante"
    fi
else
    echo "❌ Directorio dist no existe"
fi

echo ""

# =====================================================
# 6. LOGS BREVES
# =====================================================
echo "📋 6. LOGS RECIENTES..."
echo "----------------------"

echo "🔍 PM2 (últimas 3 líneas):"
timeout 3 pm2 logs --lines 3 2>/dev/null | tail -3 || echo "❌ Sin logs PM2"

echo ""
echo "🔍 Nginx errors (últimas 3 líneas):"
tail -3 /var/log/nginx/error.log 2>/dev/null || echo "❌ Sin logs Nginx"

echo ""

# =====================================================
# 7. DIAGNÓSTICO RÁPIDO
# =====================================================
echo "📊 DIAGNÓSTICO RÁPIDO"
echo "===================="

# Verificaciones simples
db_exists=false
backend_running=false
frontend_built=false
nginx_active=false

[ -f "backend/prisma/dev.db" ] && db_exists=true
timeout 2 curl -s http://localhost:3001/api/health >/dev/null 2>&1 && backend_running=true
[ -f "dist/index.html" ] && frontend_built=true
systemctl is-active nginx >/dev/null 2>&1 && nginx_active=true

echo ""
echo "Estado actual:"
[ "$db_exists" = true ] && echo "✅ Base de datos SQLite" || echo "❌ Base de datos SQLite"
[ "$backend_running" = true ] && echo "✅ Backend API funcionando" || echo "❌ Backend API no responde"
[ "$frontend_built" = true ] && echo "✅ Frontend compilado" || echo "❌ Frontend sin compilar"
[ "$nginx_active" = true ] && echo "✅ Nginx activo" || echo "❌ Nginx inactivo"

echo ""
echo "🔧 ACCIONES INMEDIATAS:"

if [ "$db_exists" = false ]; then
    echo "   1. ❌ Regenerar base de datos"
fi

if [ "$backend_running" = false ]; then
    echo "   2. ❌ Iniciar backend"
fi

if [ "$frontend_built" = false ]; then
    echo "   3. ❌ Compilar frontend"
fi

if [ "$nginx_active" = false ]; then
    echo "   4. ❌ Activar Nginx"
fi

echo ""

# =====================================================
# 8. RECOMENDACIÓN
# =====================================================
echo "🚀 SOLUCIÓN RECOMENDADA:"
echo "========================"

if [ "$backend_running" = false ]; then
    echo "🔧 El backend no está funcionando."
    echo "   Ejecuta: sudo ./fix-complete-system.sh"
else
    echo "✅ Sistema funcionando parcialmente."
    echo "   Revisa el frontend en: https://marvera.mx"
fi

echo ""
echo "📞 URLs para probar:"
echo "   • https://marvera.mx"
echo "   • https://marvera.mx/api/health" 
echo "   • https://marvera.mx/api/products/featured"

echo ""
echo "================================"
echo "🏁 DIAGNÓSTICO COMPLETADO"
echo "🕐 $(date)"
echo "================================"
