#!/bin/bash
# Script de deployment para corregir los endpoints de admin

echo "🚀 DEPLOYMENT MarVera - Corrección de endpoints admin"
echo "======================================================"

# Navegar al directorio del proyecto
cd /var/www/marvera

echo "📁 Directorio actual: $(pwd)"

# Hacer backup de los archivos que vamos a modificar
echo "💾 Creando backup de archivos..."
mkdir -p backups/$(date +%Y%m%d_%H%M%S)
cp backend/src/routes/offers.ts backups/$(date +%Y%m%d_%H%M%S)/offers.ts.bak
cp backend/src/routes/adminProducts.ts backups/$(date +%Y%m%d_%H%M%S)/adminProducts.ts.bak
cp backend/src/middleware/auth.ts backups/$(date +%Y%m%d_%H%M%S)/auth.ts.bak
cp backend/src/index.ts backups/$(date +%Y%m%d_%H%M%S)/index.ts.bak
cp src/config/api.ts backups/$(date +%Y%m%d_%H%M%S)/api.ts.bak

echo "✅ Backup completado"

# Parar los servicios
echo "🛑 Deteniendo servicios..."
pm2 stop marvera-backend
pm2 stop marvera-frontend

# Actualizar archivos backend
echo "📝 Actualizando archivos backend..."

# Aquí tendremos que copiar los archivos actualizados
# Por ahora solo mostramos el estado
echo "📋 Archivos a actualizar:"
echo "  - backend/src/routes/offers.ts"
echo "  - backend/src/routes/adminProducts.ts" 
echo "  - backend/src/middleware/auth.ts"
echo "  - backend/src/index.ts"
echo "  - src/config/api.ts"

echo "⏳ Listo para aplicar cambios..."
