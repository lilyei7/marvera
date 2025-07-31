#!/bin/bash

# Script simplificado que SÍ funciona
# Sin caracteres especiales que puedan causar problemas

echo "MARVERA - DIAGNOSTICO SIMPLE"
echo "=============================="

cd /var/www/marvera

echo "1. ARCHIVOS:"
if [ -f "backend/prisma/dev.db" ]; then
  echo "   DB SQLite: SI"
else
  echo "   DB SQLite: NO"
fi

if [ -f "dist/index.html" ]; then
  echo "   Frontend: SI"
else
  echo "   Frontend: NO"
fi

echo ""
echo "2. PROCESOS:"
if netstat -tuln | grep -q ":3001"; then
  echo "   Puerto 3001: OCUPADO"
else
  echo "   Puerto 3001: LIBRE"
fi

if systemctl is-active nginx > /dev/null 2>&1; then
  echo "   Nginx: ACTIVO"
else
  echo "   Nginx: INACTIVO"
fi

echo ""
echo "3. API TEST:"
if curl -s -m 3 http://localhost:3001/api/health > /dev/null 2>&1; then
  echo "   Health local: OK"
else
  echo "   Health local: FAIL"
fi

if curl -s -m 5 https://marvera.mx/api/health > /dev/null 2>&1; then
  echo "   Health dominio: OK"
else
  echo "   Health dominio: FAIL"
fi

echo ""
echo "DIAGNOSTICO COMPLETO"
