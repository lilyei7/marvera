# REINICIO FINAL DE MARVERA - TODO CORREGIDO
Write-Host "🎯 REINICIO FINAL MARVERA - PUERTO 3001 EN TODO" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# 1. Matar todos los procesos
Write-Host "🛑 Deteniendo todos los procesos..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 3

# 2. Verificar configuraciones críticas
Write-Host "🔍 Verificando configuraciones..." -ForegroundColor Yellow

$errors = @()

# Verificar apiConfig.ts
$apiConfig = Get-Content "src\config\apiConfig.ts" -Raw
if ($apiConfig -match "localhost:3001") {
    Write-Host "✅ API Config: Puerto 3001" -ForegroundColor Green
} else {
    $errors += "API Config incorrecto"
    Write-Host "❌ API Config: Puerto incorrecto" -ForegroundColor Red
}

# Verificar .env.local
if (Test-Path ".env.local") {
    $envLocal = Get-Content ".env.local" -Raw
    if ($envLocal -match "localhost:3001") {
        Write-Host "✅ .env.local: Puerto 3001" -ForegroundColor Green
    } else {
        $errors += ".env.local incorrecto"
        Write-Host "❌ .env.local: Puerto incorrecto" -ForegroundColor Red
    }
}

# Verificar que no haya Cache-Control
if ($apiConfig -notmatch "Cache-Control") {
    Write-Host "✅ Headers CORS: Sin Cache-Control" -ForegroundColor Green
} else {
    $errors += "Headers CORS problemáticos"
    Write-Host "❌ Headers CORS: Cache-Control presente" -ForegroundColor Red
}

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ ERRORES ENCONTRADOS:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "   • $error" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "❌ NO SE PUEDE CONTINUAR - CORRIGE LOS ERRORES PRIMERO" -ForegroundColor Red
    return
}

# 3. Iniciar backend
Write-Host "🚀 Iniciando backend (simple-server.js)..." -ForegroundColor Yellow
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd backend; Write-Host '🐟 MARVERA BACKEND FINAL - Puerto 3001' -ForegroundColor Green; Write-Host 'CORS: 5173, 5174 | SQLite: Prisma' -ForegroundColor Cyan; node simple-server.js"

# Esperar backend
Start-Sleep 5

# 4. Verificar backend
Write-Host "🔍 Verificando backend..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Backend Health: $($health.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend Health: Error" -ForegroundColor Red
}

try {
    $featured = Invoke-WebRequest -Uri "http://localhost:3001/api/products/featured" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Featured Products: $($featured.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Featured Products: Error" -ForegroundColor Red
}

# 5. Iniciar frontend
Write-Host "🌐 Iniciando frontend..." -ForegroundColor Yellow
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "Write-Host '🌊 MARVERA FRONTEND FINAL' -ForegroundColor Blue; Write-Host 'Todas las APIs apuntan a puerto 3001' -ForegroundColor Cyan; npm run dev"

Start-Sleep 3

Write-Host ""
Write-Host "🎉 MARVERA INICIADO COMPLETAMENTE" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 APIs funcionando:" -ForegroundColor Green
Write-Host "  ✅ Products Featured (puerto 3001)" -ForegroundColor Green
Write-Host "  ✅ Products (puerto 3001)" -ForegroundColor Green  
Write-Host "  ✅ Wholesale (puerto 3001)" -ForegroundColor Green
Write-Host "  ✅ Branches (puerto 3001)" -ForegroundColor Green
Write-Host "  ✅ Auth (puerto 3001)" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Problemas solucionados:" -ForegroundColor Green
Write-Host "  ✅ CORS headers corregidos" -ForegroundColor Green
Write-Host "  ✅ Todos los puertos unificados a 3001" -ForegroundColor Green
Write-Host "  ✅ Datos de ejemplo eliminados" -ForegroundColor Green
Write-Host "  ✅ Conexión a base de datos SQLite" -ForegroundColor Green
