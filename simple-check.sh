#!/bin/bash

echo "🔍 DIAGNÓSTICO SIMPLE - NO PUEDE COLGARSE"
echo "========================================"

# Solo comandos básicos que no se pueden colgar
echo "1. 📂 Archivos principales:"
[ -f "/var/www/marvera/backend/prisma/dev.db" ] && echo "✅ DB" || echo "❌ DB"
[ -f "/var/www/marvera/dist/index.html" ] && echo "✅ Frontend" || echo "❌ Frontend"

echo ""
echo "2. 🔌 Puertos ocupados:"
netstat -tuln | grep ":3001" | head -1 || echo "❌ Puerto 3001 libre"
netstat -tuln | grep ":80" | head -1 || echo "❌ Puerto 80 libre"

echo ""
echo "3. 📊 Procesos:"
ps aux | grep -E "(node|nginx)" | grep -v grep | wc -l | xargs echo "Procesos activos:"

echo ""
echo "4. 🌐 Nginx:"
systemctl is-active nginx && echo "✅ Nginx ON" || echo "❌ Nginx OFF"

echo ""
echo "5. 📋 PM2:"
pm2 list 2>/dev/null | grep -c "online" | xargs echo "PM2 procesos online:"

echo ""
echo "DIAGNÓSTICO COMPLETADO - Sin timeouts ni cuelgues"
