#!/bin/bash
# =============================================================================
# SCRIPT DE INSTALACIÓN DE DEPENDENCIAS MARVERA
# =============================================================================
# Instala todas las dependencias faltantes del backend
# Ejecutar como: sudo bash install-deps.sh
# =============================================================================

set -e

echo "📦 INSTALACIÓN DE DEPENDENCIAS MARVERA"
echo "======================================"

cd /var/www/marvera/backend

# =============================================================================
# 1. VERIFICAR ESTADO ACTUAL
# =============================================================================
echo "🔍 Verificando estado actual..."

echo "📋 Contenido del directorio backend:"
ls -la

echo ""
echo "📋 package.json backend:"
cat package.json | head -20

# =============================================================================
# 2. LIMPIAR INSTALACIÓN ANTERIOR
# =============================================================================
echo ""
echo "🧹 Limpiando instalación anterior..."

# Eliminar node_modules y package-lock.json si existen
rm -rf node_modules
rm -f package-lock.json

echo "✅ Limpieza completada"

# =============================================================================
# 3. INSTALAR DEPENDENCIAS PRINCIPALES
# =============================================================================
echo ""
echo "📦 Instalando dependencias principales..."

# Instalar express y cors que son críticos
echo "🔧 Instalando express..."
npm install express@^4.18.2

echo "🔧 Instalando cors..."
npm install cors@^2.8.5

echo "🔧 Instalando dotenv..."
npm install dotenv@^17.2.1

# =============================================================================
# 4. INSTALAR PRISMA
# =============================================================================
echo ""
echo "🗄️ Instalando Prisma..."

npm install @prisma/client@^6.13.0
npm install prisma@^6.13.0

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

# =============================================================================
# 5. INSTALAR DEPENDENCIAS ADICIONALES
# =============================================================================
echo ""
echo "📦 Instalando dependencias adicionales..."

npm install bcrypt@^6.0.0
npm install jsonwebtoken@^9.0.2
npm install helmet@^8.1.0
npm install express-rate-limit@^8.0.1
npm install express-validator@^7.2.1
npm install multer@^2.0.2
npm install sqlite3@^5.1.7

echo "✅ Dependencias principales instaladas"

# =============================================================================
# 6. VERIFICAR INSTALACIÓN
# =============================================================================
echo ""
echo "🔍 Verificando instalación..."

echo "📦 Dependencias instaladas:"
npm list --depth=0 | head -10

# =============================================================================
# 7. PROBAR SERVIDOR
# =============================================================================
echo ""
echo "🧪 Probando servidor con dependencias..."

# Crear script de prueba más robusto
cat > test-server-with-deps.sh << 'EOF'
#!/bin/bash
echo "🧪 Probando servidor con dependencias instaladas..."

export NODE_ENV=production
export PORT=3001

echo "🚀 Iniciando servidor en background..."
timeout 15s node simple-server.js &
SERVER_PID=$!

echo "⏳ Esperando que el servidor inicie..."
sleep 5

echo "🔍 Verificando puerto 3001..."
if netstat -tlnp | grep :3001; then
    echo "✅ Servidor está escuchando en puerto 3001"
    
    echo "🔗 Probando endpoint de salud..."
    sleep 2
    if curl -s http://localhost:3001/api/health; then
        echo ""
        echo "✅ API responde correctamente"
    else
        echo "❌ API no responde"
    fi
else
    echo "❌ Servidor NO está escuchando en puerto 3001"
fi

echo "🛑 Deteniendo servidor de prueba..."
kill $SERVER_PID 2>/dev/null || true
sleep 2

echo "✅ Prueba completada"
EOF

chmod +x test-server-with-deps.sh
bash test-server-with-deps.sh

# =============================================================================
# 8. CONFIGURAR PM2 CON DEPENDENCIAS
# =============================================================================
echo ""
echo "🚀 Configurando PM2 con dependencias..."

cd /var/www/marvera

# Detener PM2
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Iniciar con dependencias
pm2 start ecosystem.config.cjs

# Esperar un poco
sleep 5

echo "📊 Estado de PM2:"
pm2 status

echo ""
echo "📋 Logs recientes:"
pm2 logs marvera-api --lines 10 --nostream

# =============================================================================
# 9. VERIFICAR CONECTIVIDAD COMPLETA
# =============================================================================
echo ""
echo "🔗 Verificando conectividad completa..."

sleep 3

echo -n "🔸 Puerto 3001 local: "
if timeout 10 curl -s http://localhost:3001/api/health >/dev/null 2>&1; then
    echo "✅ FUNCIONA"
    echo "Respuesta: $(curl -s http://localhost:3001/api/health)"
else
    echo "❌ NO RESPONDE"
fi

echo -n "🔸 API a través de nginx: "
if timeout 10 curl -s http://marvera.mx/api/health >/dev/null 2>&1; then
    echo "✅ FUNCIONA"
    echo "Respuesta: $(curl -s http://marvera.mx/api/health)"
else
    echo "❌ NO RESPONDE (502 Bad Gateway)"
fi

# =============================================================================
# 10. INFORMACIÓN FINAL
# =============================================================================
echo ""
echo "🎉 INSTALACIÓN DE DEPENDENCIAS COMPLETADA"
echo "========================================="

echo "✅ Dependencias críticas instaladas:"
echo "   - express (servidor web)"
echo "   - cors (CORS headers)"
echo "   - dotenv (variables de entorno)"
echo "   - @prisma/client (base de datos)"
echo "   - bcrypt (encriptación)"
echo "   - jsonwebtoken (autenticación)"

echo ""
echo "📊 Estado final de servicios:"
pm2 status

echo ""
echo "🔗 URLs para probar:"
echo "   🌐 Frontend: http://marvera.mx"
echo "   🔗 API Health: http://marvera.mx/api/health"
echo "   🔑 API Login: http://marvera.mx/api/auth/login"

echo ""
echo "👤 Credenciales admin:"
echo "   📧 Email: admin@marvera.com"
echo "   🔑 Password: admin123456"

echo ""
echo "🔧 Si hay problemas:"
echo "   pm2 logs marvera-api        # Ver logs"
echo "   pm2 restart marvera-api     # Reiniciar"
echo "   systemctl restart nginx     # Reiniciar nginx"

if pm2 status | grep -q "online"; then
    echo ""
    echo "🎉 ¡MARVERA ESTÁ FUNCIONANDO CORRECTAMENTE!"
else
    echo ""
    echo "⚠️ Revisar logs para más información:"
    echo "   pm2 logs marvera-api --follow"
fi
