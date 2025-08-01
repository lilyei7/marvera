#!/bin/bash

# 🚀 MARVERA - Script rápido para corregir localhost
# Uso: ./quick-fix-localhost.sh

echo "🔧 Corrección rápida localhost → marvera.mx"

# Reemplazar en archivos fuente
echo "📝 Corrigiendo archivos fuente..."
find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i 's|http://localhost:3001|https://marvera.mx|g' {} \; 2>/dev/null
find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i 's|https://localhost:3001|https://marvera.mx|g' {} \; 2>/dev/null
find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i 's|localhost:3001|marvera.mx|g' {} \; 2>/dev/null
find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i 's|http://localhost:5173|https://marvera.mx|g' {} \; 2>/dev/null

# Reemplazar en archivos compilados
echo "📦 Corrigiendo archivos compilados..."
find dist/ -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|http://localhost:3001|https://marvera.mx|g' {} \; 2>/dev/null
find dist/ -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|https://localhost:3001|https://marvera.mx|g' {} \; 2>/dev/null
find dist/ -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec sed -i 's|localhost:3001|marvera.mx|g' {} \; 2>/dev/null

# Recompilar
echo "🔨 Recompilando..."
export NODE_ENV=production
export VITE_API_URL=https://marvera.mx/api
npm run build > /dev/null 2>&1

echo "✅ ¡Listo! Ejecuta en tu servidor:"
echo "sudo cp -r dist/* /var/www/marvera.mx/"
echo "sudo systemctl reload nginx"
