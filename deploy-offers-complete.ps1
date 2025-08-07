# Script para deployar las mejoras de ofertas especiales
Write-Host "🎁 Desplegando mejoras de ofertas especiales a MarVera..." -ForegroundColor Green

# 1. Build del frontend
Write-Host "📦 Construyendo frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en build del frontend" -ForegroundColor Red
    exit 1
}

# 2. Copiar archivos frontend
Write-Host "🚀 Copiando archivos frontend..." -ForegroundColor Yellow
scp -r .\dist\* root@148.230.87.198:/var/www/marvera/

# 3. Copiar servidor actualizado
Write-Host "📡 Copiando servidor backend actualizado..." -ForegroundColor Yellow
scp .\production-server.js root@148.230.87.198:/var/www/marvera/backend/

# 4. Instalar dependencias en el servidor
Write-Host "📦 Instalando multer en el servidor..." -ForegroundColor Yellow
ssh root@148.230.87.198 "cd /var/www/marvera/backend && npm install multer"

# 5. Crear directorios para uploads
Write-Host "📁 Creando directorios para imágenes..." -ForegroundColor Yellow
ssh root@148.230.87.198 "mkdir -p /var/www/marvera/uploads/offers && chmod 755 /var/www/marvera/uploads/offers"

# 6. Corregir permisos de assets
Write-Host "🔧 Corrigiendo permisos..." -ForegroundColor Yellow
ssh root@148.230.87.198 "chmod 755 /var/www/marvera/assets && chmod 644 /var/www/marvera/assets/*"

# 7. Reiniciar servidor backend
Write-Host "🔄 Reiniciando servidor backend..." -ForegroundColor Yellow
ssh root@148.230.87.198 "pm2 restart marvera-backend || pm2 start /var/www/marvera/backend/production-server.js --name marvera-backend"

Write-Host "✅ Deploy de ofertas especiales completado!" -ForegroundColor Green
Write-Host "🌐 Sitio disponible en: https://marvera.mx/" -ForegroundColor Cyan
Write-Host "🔧 Panel admin: https://marvera.mx/admin/offers" -ForegroundColor Cyan
