#!/bin/bash

echo "🔍 DIAGNÓSTICO COMPLETO DE MARVERA"
echo "==================================="
echo "🕐 $(date)"
echo ""

cd /var/www/marvera

# =====================================================
# 1. VERIFICAR ARCHIVOS CRÍTICOS
# =====================================================
echo "📁 1. VERIFICANDO ARCHIVOS CRÍTICOS..."
echo "---------------------------------------"

# Verificar estructura
echo "📂 Estructura de directorios:"
ls -la | grep -E "(backend|src|dist|prisma)" || echo "❌ Directorios faltantes"

# Verificar base de datos SQLite
if [ -f "backend/prisma/dev.db" ]; then
    echo "✅ Base de datos SQLite encontrada: backend/prisma/dev.db"
    echo "📊 Tamaño: $(du -h backend/prisma/dev.db | cut -f1)"
else
    echo "❌ Base de datos SQLite NO encontrada"
    echo "🔍 Buscando en ubicaciones alternativas..."
    find . -name "*.db" -type f 2>/dev/null || echo "   No se encontraron archivos .db"
fi

# Verificar package.json
if [ -f "backend/package.json" ]; then
    echo "✅ Backend package.json existe"
else
    echo "❌ Backend package.json faltante"
fi

if [ -f "package.json" ]; then
    echo "✅ Frontend package.json existe"
else
    echo "❌ Frontend package.json faltante"
fi

echo ""

# =====================================================
# 2. VERIFICAR PROCESOS ACTIVOS
# =====================================================
echo "🔄 2. VERIFICANDO PROCESOS ACTIVOS..."
echo "-------------------------------------"

# PM2
echo "📊 Procesos PM2:"
pm2 status || echo "❌ PM2 no disponible o sin procesos"

# Puerto 3001
echo ""
echo "🔌 Puerto 3001:"
netstat -tulpn | grep ":3001" || echo "❌ Nada ejecutándose en puerto 3001"

# Nginx
echo ""
echo "🌐 Estado de Nginx:"
systemctl status nginx | head -3 || echo "❌ Nginx no está corriendo"

echo ""

# =====================================================
# 3. VERIFICAR CONECTIVIDAD DE BASE DE DATOS
# =====================================================
echo "💾 3. VERIFICANDO BASE DE DATOS..."
echo "----------------------------------"

if [ -f "backend/prisma/dev.db" ]; then
    echo "🔍 Verificando tablas en SQLite..."
    sqlite3 backend/prisma/dev.db ".tables" 2>/dev/null || echo "❌ Error accediendo a SQLite"
    
    echo ""
    echo "📊 Contando registros:"
    echo "   Productos: $(sqlite3 backend/prisma/dev.db "SELECT COUNT(*) FROM products;" 2>/dev/null || echo "Error")"
    echo "   Categorías: $(sqlite3 backend/prisma/dev.db "SELECT COUNT(*) FROM categories;" 2>/dev/null || echo "Error")"
    echo "   Usuarios: $(sqlite3 backend/prisma/dev.db "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "Error")"
else
    echo "❌ No se puede verificar la base de datos - archivo no encontrado"
fi

echo ""

# =====================================================
# 4. PROBAR APIs LOCALMENTE
# =====================================================
echo "🌐 4. PROBANDO APIs LOCALMENTE..."
echo "--------------------------------"

# Health check local
echo "⚕️ Health check (localhost:3001):"
curl -s -w "\n   Status: %{http_code}\n" http://localhost:3001/api/health || echo "❌ Sin respuesta"

echo ""
echo "🐟 Productos destacados (localhost:3001):"
response=$(curl -s http://localhost:3001/api/products/featured)
if [ $? -eq 0 ]; then
    echo "✅ Respuesta recibida"
    echo "$response" | jq '.count' 2>/dev/null || echo "   Respuesta: $response"
else
    echo "❌ Sin respuesta"
fi

echo ""

# =====================================================
# 5. PROBAR APIs DESDE MARVERA.MX
# =====================================================
echo "🌍 5. PROBANDO APIs DESDE DOMINIO..."
echo "-----------------------------------"

echo "⚕️ Health check (marvera.mx):"
curl -s -w "\n   Status: %{http_code}\n" https://marvera.mx/api/health || echo "❌ Sin respuesta"

echo ""
echo "🐟 Productos destacados (marvera.mx):"
response=$(curl -s https://marvera.mx/api/products/featured)
if [ $? -eq 0 ]; then
    echo "✅ Respuesta recibida"
    echo "$response" | jq '.count' 2>/dev/null || echo "   Respuesta: $response"
else
    echo "❌ Sin respuesta"
fi

echo ""

# =====================================================
# 6. VERIFICAR NGINX CONFIGURACIÓN
# =====================================================
echo "⚙️ 6. VERIFICANDO NGINX..."
echo "-------------------------"

echo "📋 Configuración activa:"
nginx -t 2>&1 | head -5

echo ""
echo "🔍 Configuraciones de marvera:"
ls -la /etc/nginx/sites-available/ | grep marvera || echo "❌ No hay configuraciones de marvera"
ls -la /etc/nginx/sites-enabled/ | grep marvera || echo "❌ No hay configuraciones habilitadas"

echo ""

# =====================================================
# 7. VERIFICAR FRONTEND BUILD
# =====================================================
echo "🏗️ 7. VERIFICANDO FRONTEND..."
echo "----------------------------"

if [ -d "dist" ]; then
    echo "✅ Directorio dist existe"
    echo "📁 Contenido:"
    ls -la dist/ | head -10
    
    if [ -f "dist/index.html" ]; then
        echo "✅ index.html existe"
        echo "📄 Primeras líneas:"
        head -5 dist/index.html
    else
        echo "❌ index.html faltante"
    fi
else
    echo "❌ Directorio dist no existe"
fi

echo ""

# =====================================================
# 8. LOGS RECIENTES
# =====================================================
echo "📋 8. LOGS RECIENTES..."
echo "----------------------"

echo "🔍 PM2 logs (últimas 5 líneas):"
pm2 logs --lines 5 2>/dev/null || echo "❌ No hay logs de PM2"

echo ""
echo "🔍 Nginx error log (últimas 5 líneas):"
tail -5 /var/log/nginx/error.log 2>/dev/null || echo "❌ No hay logs de Nginx"

echo ""

# =====================================================
# 9. RESUMEN Y RECOMENDACIONES
# =====================================================
echo "📊 RESUMEN DEL DIAGNÓSTICO"
echo "=========================="

# Verificar estado general
database_ok=false
backend_ok=false
frontend_ok=false
nginx_ok=false

[ -f "backend/prisma/dev.db" ] && database_ok=true
curl -s http://localhost:3001/api/health >/dev/null 2>&1 && backend_ok=true
[ -f "dist/index.html" ] && frontend_ok=true
systemctl is-active nginx >/dev/null 2>&1 && nginx_ok=true

echo ""
echo "Estado de componentes:"
[ "$database_ok" = true ] && echo "✅ Base de datos SQLite" || echo "❌ Base de datos SQLite"
[ "$backend_ok" = true ] && echo "✅ Backend API (puerto 3001)" || echo "❌ Backend API (puerto 3001)"
[ "$frontend_ok" = true ] && echo "✅ Frontend compilado" || echo "❌ Frontend compilado"
[ "$nginx_ok" = true ] && echo "✅ Nginx servidor web" || echo "❌ Nginx servidor web"

echo ""
echo "🔧 ACCIONES RECOMENDADAS:"

if [ "$database_ok" = false ]; then
    echo "   1. Ejecutar: cd backend && npx prisma migrate dev"
fi

if [ "$backend_ok" = false ]; then
    echo "   2. Iniciar backend: pm2 start backend/src/index.js --name marvera-backend"
fi

if [ "$frontend_ok" = false ]; then
    echo "   3. Compilar frontend: npm run build"
fi

if [ "$nginx_ok" = false ]; then
    echo "   4. Iniciar Nginx: sudo systemctl start nginx"
fi

echo ""
echo "🚀 PARA SOLUCIÓN RÁPIDA:"
echo "   chmod +x diagnose-complete.sh && ./diagnose-complete.sh"
echo ""
echo "📞 PARA SOPORTE:"
echo "   Envía este reporte completo"

echo ""
echo "==================================="
echo "🏁 DIAGNÓSTICO COMPLETADO - $(date)"
echo "==================================="
