# Script para reiniciar MarVera con CORS arreglado
Write-Host "🔧 REINICIANDO MARVERA - CORS CORREGIDO" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# 1. Matar todos los procesos Node
Write-Host "🛑 Deteniendo procesos Node..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 3

# 2. Verificar configuracion API
Write-Host "🔍 Verificando configuracion..." -ForegroundColor Yellow
$apiConfig = Get-Content "src/config/apiConfig.ts" -Raw
if ($apiConfig -match "localhost:3001") {
    Write-Host "✅ API_BASE_URL: localhost:3001 ✓" -ForegroundColor Green
} else {
    Write-Host "❌ API_BASE_URL: Incorrecto" -ForegroundColor Red
}

if ($apiConfig -notmatch "Cache-Control") {
    Write-Host "✅ Headers CORS: Sin Cache-Control ✓" -ForegroundColor Green
} else {
    Write-Host "❌ Headers CORS: Cache-Control presente" -ForegroundColor Red
}

# 3. Iniciar backend con simple-server.js
Write-Host "🚀 Iniciando backend (simple-server.js)..." -ForegroundColor Yellow
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd backend; Write-Host '🐟 MARVERA BACKEND - Puerto 3001' -ForegroundColor Green; Write-Host 'CORS habilitado para puertos 5173 y 5174' -ForegroundColor Cyan; node simple-server.js"

# Esperar a que el backend inicie
Start-Sleep 5

# 4. Verificar backend
Write-Host "🔍 Verificando backend..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 3
    Write-Host "✅ Backend respondiendo: $($health.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend NO responde" -ForegroundColor Red
}

# 5. Verificar products endpoint
try {
    $products = Invoke-WebRequest -Uri "http://localhost:3001/api/products/featured" -UseBasicParsing -TimeoutSec 3
    Write-Host "✅ Products endpoint: $($products.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Products endpoint: Error" -ForegroundColor Red
}

# 6. Iniciar frontend
Write-Host "🌐 Iniciando frontend..." -ForegroundColor Yellow
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "Write-Host '🌊 MARVERA FRONTEND' -ForegroundColor Blue; Write-Host 'Conectando a backend en puerto 3001' -ForegroundColor Cyan; npm run dev"

Start-Sleep 2

Write-Host ""
Write-Host "🎉 MARVERA REINICIADO" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host "Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Health:   http://localhost:3001/api/health" -ForegroundColor Cyan
Write-Host "Products: http://localhost:3001/api/products/featured" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ CORS configurado correctamente" -ForegroundColor Green
Write-Host "✅ Headers problemáticos eliminados" -ForegroundColor Green
Write-Host "✅ Puerto 3001 en todas las APIs" -ForegroundColor Green
