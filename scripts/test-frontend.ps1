# Script para probar el frontend React con diferentes escenarios de conexión
# Ejecutar: .\scripts\test-frontend.ps1

Write-Host "🚀 Probando Frontend MarVera..." -ForegroundColor Yellow

# Verificar si el frontend está corriendo
$FRONTEND_URL = "http://localhost:5173"

Write-Host "`n1️⃣ Verificando si el frontend está corriendo..." -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri $FRONTEND_URL -TimeoutSec 3 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend corriendo en $FRONTEND_URL" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend no está corriendo. Ejecuta 'npm run dev' primero" -ForegroundColor Red
    Write-Host "   Para iniciar: cd c:\Users\lilye\OneDrive\Desktop\marvera && npm run dev" -ForegroundColor Gray
    exit 1
}

# Verificar archivo de configuración del servidor
Write-Host "`n2️⃣ Verificando configuración del servidor..." -ForegroundColor White
$serverConfigPath = "c:\Users\lilye\OneDrive\Desktop\marvera\src\utils\serverConfig.ts"
if (Test-Path $serverConfigPath) {
    Write-Host "✅ Archivo serverConfig.ts existe" -ForegroundColor Green
} else {
    Write-Host "❌ Archivo serverConfig.ts no encontrado" -ForegroundColor Red
}

# Verificar slice de productos destacados
Write-Host "`n3️⃣ Verificando slice de productos destacados..." -ForegroundColor White
$slicePath = "c:\Users\lilye\OneDrive\Desktop\marvera\src\store\slices\featuredProductsSlice.ts"
if (Test-Path $slicePath) {
    Write-Host "✅ Archivo featuredProductsSlice.ts existe" -ForegroundColor Green
    
    # Verificar si tiene el nuevo timeout de 3 segundos
    $content = Get-Content $slicePath -Raw
    if ($content -match "signal\.abort\(\).*3000") {
        Write-Host "✅ Timeout de 3 segundos configurado" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Verificar timeout en featuredProductsSlice.ts" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Archivo featuredProductsSlice.ts no encontrado" -ForegroundColor Red
}

Write-Host "`n4️⃣ Instrucciones para probar:" -ForegroundColor White
Write-Host "   1. Abre $FRONTEND_URL en tu navegador" -ForegroundColor Gray
Write-Host "   2. Abre las Developer Tools (F12)" -ForegroundColor Gray
Write-Host "   3. Ve a la pestaña Network" -ForegroundColor Gray
Write-Host "   4. Recarga la página y observa las peticiones a 187.33.155.127:3001" -ForegroundColor Gray
Write-Host "   5. Revisa la consola para ver si aparecen datos fallback" -ForegroundColor Gray

Write-Host "`n🔍 Qué buscar en la consola:" -ForegroundColor Cyan
Write-Host "   ✅ 'Usando datos fallback para productos destacados'" -ForegroundColor Green
Write-Host "   ❌ 'AbortError: signal is aborted without reason'" -ForegroundColor Red
Write-Host "   ❌ 'net::ERR_CONNECTION_RESET'" -ForegroundColor Red

Write-Host "`n📱 Páginas para probar:" -ForegroundColor Cyan
Write-Host "   Home: $FRONTEND_URL/" -ForegroundColor Gray
Write-Host "   Productos: $FRONTEND_URL/products" -ForegroundColor Gray
Write-Host "   Login: $FRONTEND_URL/login" -ForegroundColor Gray

Write-Host "`n🛠️  Comandos útiles:" -ForegroundColor Yellow
Write-Host "   Iniciar frontend: npm run dev" -ForegroundColor Gray
Write-Host "   Ver logs: npm run dev > logs.txt 2>&1" -ForegroundColor Gray
Write-Host "   Probar servidor: .\scripts\test-server.ps1" -ForegroundColor Gray
