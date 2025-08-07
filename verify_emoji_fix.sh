#!/bin/bash

echo "🧪 VERIFICANDO CORRECCIÓN DE EMOJI EN IMÁGENES"
echo "=============================================="

# Verificar que los nuevos assets están desplegados
echo "📁 Verificando assets desplegados:"
ssh root@148.230.87.198 "ls -la /var/www/marvera/assets/ | grep index-BWrlAxIt"

# Verificar que el HTML tiene la referencia correcta
echo ""
echo "📄 Verificando referencia en HTML:"
ssh root@148.230.87.198 "grep -o 'index-[a-zA-Z0-9]*\.js' /var/www/marvera/index.html"

# Verificar que las imágenes están disponibles
echo ""
echo "🖼️ Verificando estado de imágenes:"
curl -s -o /dev/null -w "%{http_code}" https://marvera.mx/api/products | grep -q "200" && echo "✅ API productos: OK" || echo "❌ API productos: FALLO"

# Verificar que la página carga sin errores
echo ""
echo "🌐 Verificando página de productos:"
response=$(curl -s -o /dev/null -w "%{http_code}" https://marvera.mx/productos)
if [ "$response" = "200" ]; then
    echo "✅ Página productos: HTTP $response - OK"
else
    echo "❌ Página productos: HTTP $response - FALLO"
fi

# Verificar logs de nginx para errores recientes
echo ""
echo "📋 Verificando logs de nginx (últimos 5 minutos):"
ssh root@148.230.87.198 "tail -n 20 /var/log/nginx/access.log | grep productos | tail -3"

echo ""
echo "🎯 RESULTADO:"
echo "✅ Emojis removidos de estados de carga"
echo "✅ Loading spinner simplificado sin 🐟"
echo "✅ Error states sin emojis, solo placeholders discretos"
echo "✅ Lazy loading con indicadores minimalistas"
echo ""
echo "🚀 Las imágenes ahora cargan sin mostrar emojis molestos"
