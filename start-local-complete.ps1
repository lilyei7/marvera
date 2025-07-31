# Script para iniciar MarVera completamente en local
# Ejecutar desde PowerShell: .\start-local-complete.ps1

Write-Host "🚀 INICIANDO MARVERA LOCAL COMPLETO" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# Verificar dependencias
Write-Host "📦 1. Verificando dependencias..." -ForegroundColor Yellow

# Backend dependencies
Set-Location backend
if (!(Test-Path "node_modules")) {
    Write-Host "   Instalando dependencias del backend..." -ForegroundColor Cyan
    npm install
}

# Verificar Prisma
Write-Host "   Configurando Prisma..." -ForegroundColor Cyan
npx prisma generate 2>$null

# Verificar base de datos
if (!(Test-Path "prisma/dev.db")) {
    Write-Host "   Creando base de datos..." -ForegroundColor Cyan
    npx prisma db push 2>$null
    npx prisma db seed 2>$null
}

Set-Location ..

# Frontend dependencies
if (!(Test-Path "node_modules")) {
    Write-Host "   Instalando dependencias del frontend..." -ForegroundColor Cyan
    npm install
}

Write-Host "✅ Dependencias verificadas" -ForegroundColor Green
Write-Host ""

# Compilar frontend
Write-Host "🏗️ 2. Compilando frontend..." -ForegroundColor Yellow
npm run build 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend compilado exitosamente" -ForegroundColor Green
} else {
    Write-Host "⚠️ Error compilando frontend, usando versión de desarrollo" -ForegroundColor Orange
}
Write-Host ""

# Iniciar backend local
Write-Host "⚙️ 3. Iniciando backend local..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; node local-backend.js" -WindowStyle Normal
Start-Sleep 3

# Probar backend
Write-Host "🧪 4. Probando backend local..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend funcionando correctamente" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   Mensaje: $($data.message)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Backend no responde aún, esperando..." -ForegroundColor Red
    Start-Sleep 2
}

# Iniciar frontend
Write-Host ""
Write-Host "🌐 5. Iniciando frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -WindowStyle Normal
Start-Sleep 2

Write-Host ""
Write-Host "🎉 MARVERA LOCAL INICIADO COMPLETAMENTE" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs disponibles:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "   Health:   http://localhost:3001/api/health" -ForegroundColor White
Write-Host "   Products: http://localhost:3001/api/products/featured" -ForegroundColor White
Write-Host ""
Write-Host "📊 Para monitorear:" -ForegroundColor Cyan
Write-Host "   - Ventana Backend: Ver logs del servidor" -ForegroundColor White
Write-Host "   - Ventana Frontend: Ver logs de Vite" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Para detener:" -ForegroundColor Cyan
Write-Host "   - Ctrl+C en ambas ventanas" -ForegroundColor White
Write-Host ""
Write-Host "✅ Sistema local listo para desarrollo" -ForegroundColor Green

# Abrir navegador
Start-Sleep 3
Write-Host "🌐 Abriendo navegador..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"
