#!/bin/bash

echo "🚀 VERIFICACIÓN ULTRA RÁPIDA"
echo "============================"

cd /var/www/marvera

echo "1. Directorio actual: $(pwd)"
echo ""

echo "2. Archivos principales:"
[ -f "backend/prisma/dev.db" ] && echo "✅ DB SQLite" || echo "❌ DB SQLite"
[ -f "dist/index.html" ] && echo "✅ Frontend" || echo "❌ Frontend"
echo ""

echo "3. Procesos:"
pm2 list 2>/dev/null | grep -q "online" && echo "✅ PM2 activo" || echo "❌ PM2 sin procesos"
netstat -tulpn 2>/dev/null | grep -q ":3001" && echo "✅ Puerto 3001" || echo "❌ Puerto 3001"
echo ""

echo "4. Prueba API local:"
curl -s -m 2 http://localhost:3001/api/health >/dev/null 2>&1 && echo "✅ API responde" || echo "❌ API no responde"
echo ""

echo "5. Prueba dominio:"
curl -s -m 3 https://marvera.mx/api/health >/dev/null 2>&1 && echo "✅ Dominio OK" || echo "❌ Dominio falla"
echo ""

echo "✅ Verificación completa"
echo ""
echo "Si ves ❌ en API o Dominio, ejecuta:"
echo "sudo ./fix-complete-system.sh"
