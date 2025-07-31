#!/bin/bash
echo "🔧 Solución rápida para puerto 3001..."

# Matar proceso que usa puerto 3001
echo "🔴 Liberando puerto 3001..."
sudo lsof -ti:3001 | xargs -r sudo kill -9

# Verificar que está libre
if sudo lsof -i:3001; then
    echo "❌ Puerto 3001 aún ocupado"
    exit 1
else
    echo "✅ Puerto 3001 libre"
fi

# Cambiar puerto temporalmente si es necesario
echo "🔄 Usando puerto alternativo 3002..."
export PORT=3002

echo "✅ Listo! Ahora ejecuta:"
echo "cd /var/www/marvera/backend"
echo "PORT=3002 npm run dev"
