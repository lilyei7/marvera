#!/bin/bash

# Script para arreglar definitivamente el problema de JSON.parse

ssh root@148.230.87.198 "
cd /var/www/marvera

# Hacer backup completo
cp production-server.js production-server-pre-json-fix.js

# Reemplazar TODAS las líneas que intentan hacer JSON.parse en images
# Buscar y reemplazar cualquier lógica compleja de JSON.parse con images
sed -i '/product\.images.*JSON\.parse/c\
      imageUrl: product.images || \`/images/products/default-\${product.category?.slug || \"product\"}.jpg\`,' production-server.js

# También arreglar cualquier otra lógica similar
sed -i 's/Array\.isArray.*JSON\.parse.*product\.images.*product\.images/product.images/g' production-server.js

# Simplificar cualquier lógica de images que sea compleja
sed -i '/imageUrl:.*product\.images.*?.*(/,/)/c\
      imageUrl: product.images || \`/images/products/default-\${product.category?.slug || \"product\"}.jpg\`,' production-server.js

echo '✅ Todas las instancias de JSON.parse problemáticas arregladas'

# Reiniciar servidor
pm2 restart marvera-backend

sleep 3
echo 'Servidor reiniciado, probando API...'

# Probar internamente
curl -s 'http://localhost:3001/api/products/featured' | head -200
"
