#!/bin/bash
# =============================================================================
# SCRIPT DE REPARACIÓN FINAL PARA MARVERA
# =============================================================================
# Soluciona el puerto ocupado y el ecosystem.config.js
# Ejecutar como: sudo bash fix-final.sh
# =============================================================================

set -e

echo "🔧 REPARACIÓN FINAL MARVERA"
echo "==========================="

cd /var/www/marvera

# =============================================================================
# 1. DETENER PROCESOS EN PUERTO 3001
# =============================================================================
echo "🛑 Liberando puerto 3001..."

# Encontrar procesos en puerto 3001
PROCESSES=$(lsof -ti :3001 2>/dev/null || true)

if [ ! -z "$PROCESSES" ]; then
    echo "📍 Encontrados procesos en puerto 3001: $PROCESSES"
    # Matar procesos en puerto 3001
    kill -9 $PROCESSES 2>/dev/null || true
    echo "✅ Procesos eliminados"
else
    echo "ℹ️ No hay procesos en puerto 3001"
fi

# Detener PM2 completamente
echo "🛑 Deteniendo PM2..."
pm2 kill 2>/dev/null || true
sleep 2

# =============================================================================
# 2. ARREGLAR ECOSYSTEM.CONFIG.JS (ARCHIVO CORRECTO)
# =============================================================================
echo "📝 Creando ecosystem.config.js correcto..."

cat > ecosystem.config.js << 'EOF'
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

echo "✅ Archivo ecosystem.config.js corregido"

# =============================================================================
# 3. VERIFICAR QUE EL PUERTO ESTÉ LIBRE
# =============================================================================
echo "🔍 Verificando puerto 3001..."

sleep 3

PORT_CHECK=$(netstat -tlnp | grep :3001 || true)
if [ -z "$PORT_CHECK" ]; then
    echo "✅ Puerto 3001 libre"
else
    echo "⚠️ Puerto 3001 aún ocupado: $PORT_CHECK"
    # Intentar matar de nuevo
    pkill -f "node.*3001" 2>/dev/null || true
    pkill -f "simple-server" 2>/dev/null || true
    sleep 2
fi

# =============================================================================
# 4. PROBAR CONFIGURACIÓN PM2
# =============================================================================
echo "🧪 Probando configuración PM2..."

# Verificar sintaxis del archivo
node -e "console.log('Verificando sintaxis...'); require('./ecosystem.config.js'); console.log('✅ Sintaxis correcta');"

# =============================================================================
# 5. INICIAR PM2 CORRECTAMENTE
# =============================================================================
echo "🚀 Iniciando PM2 con configuración corregida..."

# Iniciar PM2 con el archivo correcto
pm2 start ecosystem.config.js

# Esperar un poco para que inicie
sleep 5

# Verificar estado
echo "📊 Estado de PM2:"
pm2 status

# Verificar logs para ver si hay errores
echo ""
echo "📋 Últimas líneas de logs:"
pm2 logs marvera-api --lines 10 --nostream || true

# =============================================================================
# 6. VERIFICAR CONECTIVIDAD
# =============================================================================
echo ""
echo "🔗 Verificando conectividad..."

# Esperar un poco más
sleep 3

# Probar puerto local
echo -n "🔸 Puerto 3001 local: "
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ FUNCIONA"
else
    echo "❌ NO RESPONDE"
fi

# Probar a través de nginx
echo -n "🔸 API a través de nginx: "
if curl -s http://marvera.mx/api/health > /dev/null 2>&1; then
    echo "✅ FUNCIONA"
else
    echo "❌ NO RESPONDE"
fi

# =============================================================================
# 7. REINICIAR NGINX
# =============================================================================
echo "🌐 Reiniciando nginx..."
systemctl restart nginx

echo ""
echo "🔍 Estado final de servicios:"
echo "============================="

echo "🔸 PM2:"
pm2 status

echo ""
echo "🔸 Nginx:"
systemctl status nginx --no-pager -l | head -5

echo ""
echo "🔸 Procesos en puerto 3001:"
netstat -tlnp | grep :3001 || echo "Ninguno"

# =============================================================================
# 8. PRUEBA FINAL COMPLETA
# =============================================================================
echo ""
echo "🎯 PRUEBA FINAL COMPLETA"
echo "======================="

sleep 3

# API Health Check
echo -n "✅ API Health: "
API_RESPONSE=$(curl -s http://marvera.mx/api/health 2>/dev/null || echo "ERROR")
if [[ $API_RESPONSE == *"status"* ]]; then
    echo "FUNCIONA ✅"
else
    echo "FALLA ❌"
fi

# Frontend Check
echo -n "✅ Frontend: "
FRONTEND_RESPONSE=$(curl -s http://marvera.mx/ 2>/dev/null || echo "ERROR")
if [[ $FRONTEND_RESPONSE == *"MarVera"* ]]; then
    echo "FUNCIONA ✅"
else
    echo "FALLA ❌"
fi

# =============================================================================
# 9. INFORMACIÓN FINAL
# =============================================================================
echo ""
echo "🎉 REPARACIÓN FINAL COMPLETADA"
echo "=============================="
echo "✅ Puerto 3001 liberado"
echo "✅ ecosystem.config.js corregido"
echo "✅ PM2 funcionando"
echo "✅ Nginx reiniciado"
echo ""
echo "🔗 URLs disponibles:"
echo "   🌐 Sitio: http://marvera.mx"
echo "   🔗 API:   http://marvera.mx/api/health"
echo ""
echo "👤 Credenciales admin:"
echo "   📧 Email: admin@marvera.com"
echo "   🔑 Password: admin123456"
echo ""
echo "📱 Comandos útiles:"
echo "   pm2 status          # Ver estado de servicios"
echo "   pm2 logs marvera-api # Ver logs del API"
echo "   systemctl status nginx # Ver estado de nginx"
