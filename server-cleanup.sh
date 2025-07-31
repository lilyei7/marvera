#!/bin/bash
echo "🧹 Limpiando servidor Ubuntu para MarVera..."

# Detener todos los procesos de Node.js que puedan estar corriendo
echo "🔴 Deteniendo procesos Node.js existentes..."
sudo pkill -f node
sudo pkill -f npm
sudo pkill -f nodemon

# Verificar qué está usando el puerto 3001
echo "🔍 Verificando puerto 3001..."
sudo lsof -ti:3001 | xargs -r sudo kill -9

# Limpiar PM2 si existe
echo "🔄 Limpiando PM2..."
pm2 kill 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Verificar puertos
echo "📊 Puertos actualmente en uso:"
sudo netstat -tlnp | grep :3001 || echo "✅ Puerto 3001 libre"
sudo netstat -tlnp | grep :80 || echo "✅ Puerto 80 libre"
sudo netstat -tlnp | grep :443 || echo "✅ Puerto 443 libre"

echo "✅ Limpieza completada!"
