#!/bin/bash

echo "=== DIAGNOSTICO BASICO MARVERA ==="
echo "Fecha: $(date)"
echo ""

cd /var/www/marvera || exit 1

echo "1. Archivos criticos:"
ls -la | grep -E "backend|dist|package.json" | head -5

echo ""
echo "2. Base de datos SQLite:"
if [ -f "backend/prisma/dev.db" ]; then
  echo "ENCONTRADA: $(du -h backend/prisma/dev.db)"
else
  echo "NO ENCONTRADA"
fi

echo ""
echo "3. Puerto 3001:"
if netstat -tuln | grep -q ":3001"; then
  echo "OCUPADO"
else
  echo "LIBRE"
fi

echo ""
echo "4. Nginx:"
if systemctl is-active nginx > /dev/null; then
  echo "ACTIVO"
else
  echo "INACTIVO"
fi

echo ""
echo "5. PM2:"
pm2_count=$(pm2 list 2>/dev/null | grep -c "online" || echo "0")
echo "Procesos online: $pm2_count"

echo ""
echo "=== FIN DIAGNOSTICO ==="
