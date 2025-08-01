# 🌊 MARVERA - Verificación final y despliegue (PowerShell)
# Script para verificar que todas las referencias localhost están corregidas

Write-Host "🔍 VERIFICACIÓN FINAL DE MARVERA" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# 1. Verificar que no hay localhost en el código fuente del frontend
Write-Host "📋 Verificando referencias localhost en frontend..." -ForegroundColor Yellow

$frontendFiles = Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx" | Where-Object { $_.FullName -notmatch "backend" }
$localhostFiles = $frontendFiles | Select-String "localhost" | Select-Object -ExpandProperty Filename | Sort-Object | Get-Unique

if ($localhostFiles.Count -eq 0) {
    Write-Host "✅ Frontend limpio - No hay referencias localhost" -ForegroundColor Green
} else {
    Write-Host "⚠️ Encontradas referencias localhost en frontend:" -ForegroundColor Yellow
    $localhostFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

# 2. Verificar configuración de APIs
Write-Host "`n📋 Verificando configuración de API..." -ForegroundColor Yellow

Write-Host "API_BASE_URL en environment.ts:" -ForegroundColor White
Get-Content "src\config\environment.ts" | Select-String "API_BASE_URL"

Write-Host "`nAPI_BASE_URL en api.ts:" -ForegroundColor White  
Get-Content "src\config\api.ts" | Select-String "API_BASE_URL"

# 3. Verificar archivos .env
Write-Host "`n📋 Verificando archivos .env..." -ForegroundColor Yellow

Write-Host "Frontend .env:" -ForegroundColor White
Get-Content ".env" | Select-String "VITE_API_URL"

Write-Host "`nBackend .env:" -ForegroundColor White
Get-Content "backend\.env" | Select-String "FRONTEND_URL"

# 4. Verificar build
Write-Host "`n📋 Verificando build compilado..." -ForegroundColor Yellow

if (Test-Path "dist") {
    $distFiles = Get-ChildItem -Path "dist" -Recurse -Include "*.js", "*.css", "*.html"
    $distLocalhost = $distFiles | Select-String "localhost" -ErrorAction SilentlyContinue
    
    if ($distLocalhost.Count -eq 0) {
        Write-Host "✅ Build limpio - No hay localhost en dist/" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Encontradas referencias localhost en build:" -ForegroundColor Yellow
        $distLocalhost | Select-Object -First 3 | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    }
} else {
    Write-Host "⚠️ No existe directorio dist/ - necesitas compilar primero" -ForegroundColor Yellow
}

# 5. URLs finales esperadas
Write-Host "`n🌐 CONFIGURACIÓN FINAL:" -ForegroundColor Cyan
Write-Host "Frontend: https://marvera.mx" -ForegroundColor White
Write-Host "Backend:  https://marvera.mx/api" -ForegroundColor White  
Write-Host "Login:    https://marvera.mx/login" -ForegroundColor White
Write-Host "Admin:    https://marvera.mx/admin" -ForegroundColor White

Write-Host "`n🚀 PASOS PARA DESPLEGAR:" -ForegroundColor Cyan
Write-Host "1. scp -r dist/* root@srv936134.hstgr.cloud:/var/www/marvera.mx/" -ForegroundColor White
Write-Host "2. ssh root@srv936134.hstgr.cloud" -ForegroundColor White
Write-Host "3. cd /var/www/marvera-backend && pm2 restart all" -ForegroundColor White
Write-Host "4. Verificar: https://marvera.mx" -ForegroundColor White

Write-Host "`n✅ Verificación completada!" -ForegroundColor Green
