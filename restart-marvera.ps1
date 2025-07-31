# Script para reiniciar MarVera con configuracion corregida
Write-Host "🔄 REINICIANDO MARVERA CON CONFIGURACION CORREGIDA" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Matar procesos existentes
Write-Host "🛑 Deteniendo procesos existentes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*3001*" -or $_.CommandLine -like "*5173*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 2

# 2. Verificar que API apunte al puerto correcto
Write-Host "🔧 Verificando configuracion de API..." -ForegroundColor Yellow
$apiConfig = Get-Content "src/config/apiConfig.ts" -Raw
if ($apiConfig -match "localhost:3001") {
    Write-Host "✅ API configurada correctamente para puerto 3001" -ForegroundColor Green
} else {
    Write-Host "❌ API NO configurada para puerto 3001" -ForegroundColor Red
}

# 3. Compilar frontend
Write-Host "📦 Compilando frontend..." -ForegroundColor Yellow
npm run build

# 4. Iniciar backend en puerto 3001
Write-Host "🚀 Iniciando backend en puerto 3001..." -ForegroundColor Yellow
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd backend; Write-Host 'BACKEND MARVERA - Puerto 3001' -ForegroundColor Green; node local-backend.js"
Start-Sleep 3

# 5. Verificar que backend responda
Write-Host "🔍 Verificando backend..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Backend respondiendo en puerto 3001" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend NO responde en puerto 3001" -ForegroundColor Red
}

# 6. Iniciar frontend en puerto 5173
Write-Host "🌐 Iniciando frontend en puerto 5173..." -ForegroundColor Yellow
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "Write-Host 'FRONTEND MARVERA - Puerto 5173' -ForegroundColor Blue; npm run dev"
Start-Sleep 2

Write-Host ""
Write-Host "🎉 MARVERA INICIADO" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "Health:   http://localhost:3001/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Si ves errores de conexion, verifica que las dos ventanas" -ForegroundColor Yellow
Write-Host "   de PowerShell se hayan abierto correctamente." -ForegroundColor Yellow
