#!/bin/bash

echo "=== ANALIZANDO ERROR 'Unexpected token <' ==="
echo ""

cd /var/www/marvera

echo "1. Verificando respuesta de /api/health:"
response=$(curl -s https://marvera.mx/api/health)
echo "Respuesta completa:"
echo "$response"
echo ""

echo "2. Verificando Content-Type:"
curl -s -I https://marvera.mx/api/health | grep -i content-type

echo ""
echo "3. Verificando si regresa HTML en lugar de JSON:"
if echo "$response" | grep -q "<html>"; then
  echo "PROBLEMA: El servidor está regresando HTML en lugar de JSON"
  echo "Esto causa el error 'Unexpected token <'"
else
  echo "OK: No se detecta HTML en la respuesta"
fi

echo ""
echo "4. Verificando estado HTTP:"
status=$(curl -s -w "%{http_code}" https://marvera.mx/api/health -o /dev/null)
echo "Status code: $status"

if [ "$status" = "502" ]; then
  echo "CONFIRMADO: Error 502 Bad Gateway"
  echo "El backend no está funcionando correctamente"
elif [ "$status" = "200" ]; then
  echo "Backend responde OK"
else
  echo "Estado inusual: $status"
fi

echo ""
echo "5. Verificando logs de Nginx:"
echo "Últimos errores de Nginx:"
tail -3 /var/log/nginx/error.log 2>/dev/null || echo "No hay logs de error"

echo ""
echo "=== DIAGNOSTICO DE ERROR COMPLETADO ==="
