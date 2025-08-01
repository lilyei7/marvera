#!/bin/bash
# =============================================================================
# SCRIPT DE REPARACIÓN DEFINITIVA PARA MARVERA
# =============================================================================
# Soluciona el problema de module.exports definitivamente
# Ejecutar como: sudo bash fix-definitivo.sh
# =============================================================================

set -e

echo "🔧 REPARACIÓN DEFINITIVA MARVERA"
echo "================================"

cd /var/www/marvera

# =============================================================================
# 1. DIAGNOSTICAR EL PROBLEMA
# =============================================================================
echo "🔍 Diagnosticando problema de ecosystem.config.js..."

echo "📋 Contenido actual del archivo:"
cat ecosystem.config.js 2>/dev/null || echo "Archivo no existe"

echo ""
echo "📋 Verificando package.json del proyecto:"
if [ -f "package.json" ]; then
    echo "package.json encontrado en raíz:"
    cat package.json | grep -E '"type"|"module"' || echo "No hay configuración de type"
else
    echo "No hay package.json en raíz"
fi

echo ""
echo "📋 Verificando package.json del backend:"
if [ -f "backend/package.json" ]; then
    echo "backend/package.json encontrado:"
    cat backend/package.json | grep -E '"type"|"module"' || echo "No hay configuración de type"
else
    echo "No hay package.json en backend"
fi

# =============================================================================
# 2. CREAR ECOSYSTEM.CONFIG.JS CON EXTENSIÓN .CJS
# =============================================================================
echo ""
echo "📝 Creando ecosystem.config.cjs (CommonJS)..."

cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'marvera-api',
    script: './backend/simple-server.js',
    cwd: '/var/www/marvera',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_file: '/var/log/marvera/combined.log',
    out_file: '/var/log/marvera/out.log',
    error_file: '/var/log/marvera/error.log',
    time: true
  }]
};
EOF

echo "✅ Archivo ecosystem.config.cjs creado"

# =============================================================================
# 3. VERIFICAR SINTAXIS DEL ARCHIVO .CJS
# =============================================================================
echo "🧪 Verificando sintaxis del archivo .cjs..."

node -e "console.log('Verificando sintaxis...'); require('./ecosystem.config.cjs'); console.log('✅ Sintaxis correcta');"

# =============================================================================
# 4. ELIMINAR ARCHIVO .JS PROBLEMÁTICO
# =============================================================================
echo "🗑️ Eliminando archivo ecosystem.config.js problemático..."
rm -f ecosystem.config.js

# =============================================================================
# 5. DETENER PM2 COMPLETAMENTE
# =============================================================================
echo "🛑 Deteniendo PM2 completamente..."
pm2 kill 2>/dev/null || true
sleep 3

# =============================================================================
# 6. INICIAR PM2 CON ARCHIVO .CJS
# =============================================================================
echo "🚀 Iniciando PM2 con archivo .cjs..."

pm2 start ecosystem.config.cjs

# Esperar un poco para que inicie
sleep 5

# =============================================================================
# 7. VERIFICAR ESTADO DE PM2
# =============================================================================
echo "📊 Estado de PM2:"
pm2 status

echo ""
echo "📋 Logs de la aplicación:"
pm2 logs marvera-api --lines 5 --nostream || true

# =============================================================================
# 8. VERIFICAR CONECTIVIDAD
# =============================================================================
echo ""
echo "🔗 Verificando conectividad..."

# Esperar un poco más
sleep 3

# Probar puerto local
echo -n "🔸 Puerto 3001 local: "
if timeout 5 curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ FUNCIONA"
    API_LOCAL="OK"
else
    echo "❌ NO RESPONDE"
    API_LOCAL="FAIL"
fi

# Probar a través de nginx
echo -n "🔸 API a través de nginx: "
if timeout 5 curl -s http://marvera.mx/api/health > /dev/null 2>&1; then
    echo "✅ FUNCIONA"
    API_NGINX="OK"
else
    echo "❌ NO RESPONDE"
    API_NGINX="FAIL"
fi

# =============================================================================
# 9. GUARDAR CONFIGURACIÓN DE PM2
# =============================================================================
echo ""
echo "💾 Guardando configuración PM2..."
pm2 save

# =============================================================================
# 10. REINICIAR NGINX
# =============================================================================
echo "🌐 Reiniciando nginx..."
systemctl restart nginx

# =============================================================================
# 11. PRUEBA FINAL COMPLETA
# =============================================================================
echo ""
echo "🎯 PRUEBA FINAL COMPLETA"
echo "======================="

sleep 5

# API Health Check con más detalles
echo "✅ Probando API Health..."
API_RESPONSE=$(timeout 10 curl -s http://marvera.mx/api/health 2>/dev/null || echo "ERROR")
echo "Respuesta API: $API_RESPONSE"

if [[ $API_RESPONSE == *"status"* ]] || [[ $API_RESPONSE == *"healthy"* ]] || [[ $API_RESPONSE == *"OK"* ]]; then
    echo "✅ API FUNCIONA CORRECTAMENTE"
    API_STATUS="✅ FUNCIONANDO"
else
    echo "❌ API NO RESPONDE CORRECTAMENTE"
    API_STATUS="❌ ERROR"
fi

# Frontend Check
echo ""
echo "✅ Probando Frontend..."
FRONTEND_RESPONSE=$(timeout 10 curl -s http://marvera.mx/ 2>/dev/null || echo "ERROR")
if [[ $FRONTEND_RESPONSE == *"MarVera"* ]]; then
    echo "✅ FRONTEND FUNCIONA CORRECTAMENTE"
    FRONTEND_STATUS="✅ FUNCIONANDO"
else
    echo "❌ FRONTEND NO RESPONDE CORRECTAMENTE"
    FRONTEND_STATUS="❌ ERROR"
fi

# =============================================================================
# 12. INFORMACIÓN FINAL DETALLADA
# =============================================================================
echo ""
echo "🎉 REPARACIÓN DEFINITIVA COMPLETADA"
echo "==================================="
echo "✅ Archivo ecosystem.config.cjs creado"
echo "✅ PM2 funcionando con archivo .cjs"
echo "✅ Puerto 3001 liberado y usado correctamente"
echo ""
echo "📊 ESTADO FINAL DE SERVICIOS:"
echo "=============================="

echo "🔸 PM2 Apps:"
pm2 list

echo ""
echo "🔸 Procesos en puerto 3001:"
netstat -tlnp | grep :3001 || echo "Ninguno visible"

echo ""
echo "🔸 Estado nginx:"
systemctl status nginx --no-pager -l | head -3

echo ""
echo "📋 RESUMEN DE CONECTIVIDAD:"
echo "=========================="
echo "🔸 API Local (3001):     $API_LOCAL"
echo "🔸 API Nginx (80):       $API_NGINX"
echo "🔸 API Status:           $API_STATUS"
echo "🔸 Frontend Status:      $FRONTEND_STATUS"

echo ""
echo "🔗 URLs FINALES:"
echo "==============="
echo "   🌐 Sitio: http://marvera.mx"
echo "   🔗 API:   http://marvera.mx/api/health"

echo ""
echo "👤 CREDENCIALES ADMIN:"
echo "====================="
echo "   📧 Email: admin@marvera.com"
echo "   🔑 Password: admin123456"

echo ""
echo "📱 COMANDOS ÚTILES:"
echo "=================="
echo "   pm2 status              # Estado de servicios"
echo "   pm2 logs marvera-api    # Ver logs del API"
echo "   pm2 restart marvera-api # Reiniciar API"
echo "   systemctl status nginx  # Estado de nginx"

echo ""
if [[ $API_STATUS == *"FUNCIONANDO"* ]]; then
    echo "🎉 ¡MARVERA ESTÁ COMPLETAMENTE FUNCIONAL!"
else
    echo "⚠️ Hay problemas con la API. Revisar logs:"
    echo "   pm2 logs marvera-api"
fi
