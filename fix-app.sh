#!/bin/bash
# =============================================================================
# SCRIPT DE REPARACIÓN DE APLICACIÓN MARVERA
# =============================================================================
# Soluciona el problema de "type": "module" y errores de aplicación
# Ejecutar como: sudo bash fix-app.sh
# =============================================================================

set -e

echo "🔧 REPARACIÓN DE APLICACIÓN MARVERA"
echo "==================================="

cd /var/www/marvera

# =============================================================================
# 1. REVISAR LOGS DETALLADOS
# =============================================================================
echo "📋 Revisando logs de errores..."

echo "🔸 Logs de PM2:"
pm2 logs marvera-api --lines 20 --nostream || true

echo ""
echo "🔸 Logs de archivos:"
tail -20 /var/log/marvera/error-0.log 2>/dev/null || echo "No hay logs de error"
tail -20 /var/log/marvera/out-0.log 2>/dev/null || echo "No hay logs de output"

# =============================================================================
# 2. DIAGNOSTICAR PROBLEMA DE MODULES
# =============================================================================
echo ""
echo "🔍 Diagnosticando problema de modules..."

echo "📋 package.json raíz:"
cat package.json 2>/dev/null || echo "No existe package.json raíz"

echo ""
echo "📋 package.json backend:"
cat backend/package.json 2>/dev/null | head -20 || echo "No existe package.json backend"

# =============================================================================
# 3. SOLUCIÓN: ELIMINAR package.json PROBLEMÁTICO DE RAÍZ
# =============================================================================
echo ""
echo "🗑️ Eliminando package.json problemático de la raíz..."

if [ -f "package.json" ]; then
    echo "📦 Respaldando package.json..."
    cp package.json package.json.backup
    rm package.json
    echo "✅ package.json eliminado (respaldo creado)"
else
    echo "ℹ️ No hay package.json en raíz"
fi

# =============================================================================
# 4. VERIFICAR ARCHIVO SIMPLE-SERVER.JS
# =============================================================================
echo ""
echo "🔍 Verificando simple-server.js..."

if [ -f "backend/simple-server.js" ]; then
    echo "📄 Archivo simple-server.js encontrado"
    echo "📋 Primeras líneas:"
    head -10 backend/simple-server.js
    echo ""
    echo "📋 Configuración de puerto:"
    grep -n "PORT\|port\|listen" backend/simple-server.js || echo "No se encontró configuración de puerto"
else
    echo "❌ Archivo simple-server.js NO encontrado"
    echo "📁 Contenido del directorio backend:"
    ls -la backend/
fi

# =============================================================================
# 5. PROBAR SERVIDOR MANUALMENTE
# =============================================================================
echo ""
echo "🧪 Probando servidor manualmente..."

cd backend

echo "📦 Verificando dependencias..."
npm list --depth=0 || echo "Hay problemas con dependencias"

echo ""
echo "🚀 Intentando ejecutar servidor directamente..."

# Crear script de prueba
cat > test-server.sh << 'EOF'
#!/bin/bash
echo "🧪 Iniciando servidor de prueba..."
export NODE_ENV=production
export PORT=3001
timeout 10s node simple-server.js &
SERVER_PID=$!
sleep 3

echo "🔍 Verificando si el servidor está escuchando..."
if netstat -tlnp | grep :3001; then
    echo "✅ Servidor escuchando en puerto 3001"
else
    echo "❌ Servidor NO escuchando en puerto 3001"
fi

# Matar el proceso de prueba
kill $SERVER_PID 2>/dev/null || true
EOF

chmod +x test-server.sh
bash test-server.sh

# =============================================================================
# 6. REINICIAR PM2 CON CONFIGURACIÓN LIMPIA
# =============================================================================
echo ""
echo "🔄 Reiniciando PM2 con configuración limpia..."

cd /var/www/marvera

# Detener aplicación
pm2 stop marvera-api 2>/dev/null || true
pm2 delete marvera-api 2>/dev/null || true

# Iniciar de nuevo
pm2 start ecosystem.config.cjs

# Esperar un poco
sleep 5

echo "📊 Estado de PM2 después del reinicio:"
pm2 status

echo ""
echo "📋 Logs más recientes:"
pm2 logs marvera-api --lines 10 --nostream || true

# =============================================================================
# 7. VERIFICAR CONECTIVIDAD PASO A PASO
# =============================================================================
echo ""
echo "🔗 Verificando conectividad paso a paso..."

sleep 3

echo -n "🔸 Proceso en puerto 3001: "
PORT_PROCESS=$(netstat -tlnp | grep :3001 || echo "NONE")
if [ "$PORT_PROCESS" != "NONE" ]; then
    echo "✅ ENCONTRADO: $PORT_PROCESS"
else
    echo "❌ NO HAY PROCESO"
fi

echo -n "🔸 Conectividad local puerto 3001: "
if timeout 5 curl -s http://localhost:3001/api/health >/dev/null 2>&1; then
    echo "✅ FUNCIONA"
    curl -s http://localhost:3001/api/health
else
    echo "❌ NO RESPONDE"
fi

echo -n "🔸 Conectividad a través de nginx: "
if timeout 5 curl -s http://marvera.mx/api/health >/dev/null 2>&1; then
    echo "✅ FUNCIONA"
    curl -s http://marvera.mx/api/health
else
    echo "❌ NO RESPONDE"
    echo "Respuesta nginx:"
    curl -s http://marvera.mx/api/health || echo "Sin respuesta"
fi

# =============================================================================
# 8. INFORMACIÓN DE DIAGNÓSTICO
# =============================================================================
echo ""
echo "🔍 INFORMACIÓN DE DIAGNÓSTICO"
echo "============================="

echo "📦 Node.js version: $(node --version)"
echo "📦 NPM version: $(npm --version)"
echo "📁 Directorio actual: $(pwd)"
echo "📁 Contenido del directorio:"
ls -la

echo ""
echo "🔸 Variables de entorno relevantes:"
env | grep -E "NODE|PORT" || echo "No hay variables relevantes"

echo ""
echo "🔸 Configuración de PM2:"
cat ecosystem.config.cjs

# =============================================================================
# 9. ALTERNATIVA: CREAR SERVIDOR SIMPLE DE PRUEBA
# =============================================================================
echo ""
echo "🚀 Creando servidor simple de prueba..."

cat > test-simple-server.js << 'EOF'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MarVera API is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌊 MarVera Test Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
EOF

echo "📝 Servidor de prueba creado en test-simple-server.js"

# =============================================================================
# 10. RESUMEN Y PRÓXIMOS PASOS
# =============================================================================
echo ""
echo "📋 RESUMEN DE REPARACIÓN"
echo "========================"
echo "✅ package.json problemático eliminado"
echo "✅ PM2 configurado con .cjs"
echo "✅ Servidor de prueba creado"

echo ""
echo "🔧 PRÓXIMOS PASOS RECOMENDADOS:"
echo "==============================="
echo "1. Si el servidor sigue fallando:"
echo "   pm2 stop marvera-api"
echo "   pm2 start test-simple-server.js --name marvera-test"
echo ""
echo "2. Para ver logs detallados:"
echo "   pm2 logs marvera-api --follow"
echo ""
echo "3. Para verificar el archivo principal:"
echo "   cat backend/simple-server.js"
echo ""
echo "4. Para probar manualmente:"
echo "   cd backend && node simple-server.js"
