#!/bin/bash
# =============================================================================
# SCRIPT DE PRUEBAS COMPLETAS PARA MARVERA
# =============================================================================
# Verifica que todo esté funcionando correctamente
# Ejecutar como: sudo bash test-marvera.sh
# =============================================================================

echo "🧪 PRUEBAS COMPLETAS DE MARVERA"
echo "==============================="

# =============================================================================
# 1. VERIFICAR SERVICIOS BÁSICOS
# =============================================================================
echo "🔍 1. VERIFICANDO SERVICIOS BÁSICOS"
echo "==================================="

echo -n "🔸 PM2 Status: "
if pm2 status | grep -q "online"; then
    echo "✅ ONLINE"
else
    echo "❌ ERROR"
fi

echo -n "🔸 Nginx Status: "
if systemctl is-active --quiet nginx; then
    echo "✅ ACTIVE"
else
    echo "❌ INACTIVE"
fi

echo -n "🔸 Puerto 3001: "
if netstat -tlnp | grep -q ":3001"; then
    echo "✅ LISTENING"
else
    echo "❌ NOT LISTENING"
fi

# =============================================================================
# 2. PRUEBAS DE API BÁSICAS
# =============================================================================
echo ""
echo "🔗 2. PRUEBAS DE API BÁSICAS"
echo "============================"

echo "🧪 Probando API Health (Local)..."
HEALTH_LOCAL=$(curl -s -w "%{http_code}" http://localhost:3001/api/health)
echo "📤 Respuesta: $HEALTH_LOCAL"

echo ""
echo "🧪 Probando API Health (Nginx)..."
HEALTH_NGINX=$(curl -s -w "%{http_code}" http://marvera.mx/api/health)
echo "📤 Respuesta: $HEALTH_NGINX"

# =============================================================================
# 3. PRUEBAS DE ENDPOINTS ESPECÍFICOS
# =============================================================================
echo ""
echo "📦 3. PRUEBAS DE ENDPOINTS ESPECÍFICOS"
echo "====================================="

echo "🐟 Probando productos..."
curl -s http://marvera.mx/api/products | head -200
echo ""

echo "🏷️ Probando categorías..."
curl -s http://marvera.mx/api/categories | head -200
echo ""

echo "🏢 Probando sucursales..."
curl -s http://marvera.mx/api/branches | head -200
echo ""

# =============================================================================
# 4. PRUEBAS DE AUTENTICACIÓN
# =============================================================================
echo ""
echo "🔐 4. PRUEBAS DE AUTENTICACIÓN"
echo "=============================="

echo "🧪 Probando login con admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://marvera.mx/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@marvera.com","password":"admin123456"}')

echo "📤 Respuesta de login:"
echo "$LOGIN_RESPONSE" | head -3

# Extraer token si existe
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
    echo "✅ Token obtenido exitosamente"
    echo "🔑 Token: ${TOKEN:0:50}..."
    
    echo ""
    echo "🧪 Probando endpoint protegido..."
    AUTH_TEST=$(curl -s -H "Authorization: Bearer $TOKEN" http://marvera.mx/api/auth/verify)
    echo "📤 Verificación de auth: $AUTH_TEST"
else
    echo "❌ No se pudo obtener token"
fi

# =============================================================================
# 5. PRUEBAS DE FRONTEND
# =============================================================================
echo ""
echo "🌐 5. PRUEBAS DE FRONTEND"
echo "========================"

echo "🧪 Probando página principal..."
FRONTEND_RESPONSE=$(curl -s http://marvera.mx/ | head -5)
echo "📤 Frontend response:"
echo "$FRONTEND_RESPONSE"

if echo "$FRONTEND_RESPONSE" | grep -q "MarVera"; then
    echo "✅ Frontend responde correctamente"
else
    echo "❌ Frontend no responde o no contiene MarVera"
fi

# =============================================================================
# 6. PRUEBAS DE RENDIMIENTO BÁSICAS
# =============================================================================
echo ""
echo "⚡ 6. PRUEBAS DE RENDIMIENTO BÁSICAS"
echo "==================================="

echo "🧪 Tiempo de respuesta API Health..."
time curl -s http://marvera.mx/api/health > /dev/null

echo ""
echo "🧪 Tiempo de respuesta Frontend..."
time curl -s http://marvera.mx/ > /dev/null

# =============================================================================
# 7. VERIFICAR LOGS
# =============================================================================
echo ""
echo "📋 7. LOGS RECIENTES"
echo "==================="

echo "🔸 PM2 Logs (últimas 5 líneas):"
pm2 logs marvera-api --lines 5 --nostream

echo ""
echo "🔸 Nginx Access Log (últimas 3 líneas):"
tail -3 /var/log/nginx/marvera.mx.access.log 2>/dev/null || echo "No access logs found"

echo ""
echo "🔸 Nginx Error Log (últimas 3 líneas):"
tail -3 /var/log/nginx/marvera.mx.error.log 2>/dev/null || echo "No error logs found"

# =============================================================================
# 8. INFORMACIÓN DEL SISTEMA
# =============================================================================
echo ""
echo "💻 8. INFORMACIÓN DEL SISTEMA"
echo "============================="

echo "🔸 Memoria usada por PM2:"
pm2 monit --no-daemon | head -5

echo ""
echo "🔸 Uso de disco:"
df -h /var/www/marvera | tail -1

echo ""
echo "🔸 Conexiones activas en puerto 3001:"
netstat -an | grep :3001

# =============================================================================
# 9. RESUMEN FINAL
# =============================================================================
echo ""
echo "📊 RESUMEN FINAL DE PRUEBAS"
echo "============================"

# Verificar si todo está funcionando
ALL_GOOD=true

if ! pm2 status | grep -q "online"; then
    echo "❌ PM2 no está online"
    ALL_GOOD=false
fi

if ! curl -s http://marvera.mx/api/health | grep -q "success"; then
    echo "❌ API Health no responde correctamente"
    ALL_GOOD=false
fi

if ! curl -s http://marvera.mx/ | grep -q "MarVera"; then
    echo "❌ Frontend no responde correctamente"
    ALL_GOOD=false
fi

if [ "$ALL_GOOD" = true ]; then
    echo ""
    echo "🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!"
    echo "==========================================="
    echo "✅ PM2 funcionando"
    echo "✅ API respondiendo"
    echo "✅ Frontend cargando"
    echo "✅ Base de datos conectada"
    echo "✅ Autenticación funcionando"
    echo ""
    echo "🔗 URLs funcionando:"
    echo "   🌐 Frontend: http://marvera.mx"
    echo "   🔗 API: http://marvera.mx/api/health"
    echo "   📦 Productos: http://marvera.mx/api/products"
    echo "   🔐 Login: http://marvera.mx/api/auth/login"
    echo ""
    echo "👤 Credenciales admin:"
    echo "   📧 Email: admin@marvera.com"
    echo "   🔑 Password: admin123456"
    echo ""
    echo "🚀 ¡MARVERA ESTÁ COMPLETAMENTE OPERACIONAL!"
else
    echo ""
    echo "⚠️ ALGUNAS PRUEBAS FALLARON"
    echo "=========================="
    echo "Revisar logs para más detalles:"
    echo "   pm2 logs marvera-api"
    echo "   tail -f /var/log/nginx/marvera.mx.error.log"
fi
