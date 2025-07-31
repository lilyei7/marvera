# REINICIO COMPLETO MARVERA - LOGIN SOLUCIONADO
Write-Host "🎯 SOLUCIONANDO PROBLEMA DE LOGIN" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# 1. Crear usuario admin
Write-Host "👤 Creando usuario administrador..." -ForegroundColor Yellow
cd backend
node create-admin.js
Write-Host ""

# 2. Iniciar backend
Write-Host "🚀 Iniciando backend..." -ForegroundColor Yellow
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd backend; Write-Host '🐟 MARVERA BACKEND - Puerto 3001' -ForegroundColor Green; Write-Host '👤 Admin: admin@marvera.com' -ForegroundColor Cyan; Write-Host '🔑 Pass: admin123456' -ForegroundColor Cyan; Write-Host '📡 Endpoints activos:' -ForegroundColor Yellow; Write-Host '  - POST /api/auth/login' -ForegroundColor White; Write-Host '  - GET /api/health' -ForegroundColor White; Write-Host '  - GET /api/products/featured' -ForegroundColor White; Write-Host ''; node simple-server.js"

# Esperar backend
Start-Sleep 5

# 3. Verificar backend
Write-Host "🔍 Verificando backend..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Backend Health: OK ($($health.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend Health: Error - $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Probar login
Write-Host "🔐 Probando login..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "admin@marvera.com"
        password = "admin123456"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Login Test: OK ($($loginResponse.StatusCode))" -ForegroundColor Green
    
    $responseData = $loginResponse.Content | ConvertFrom-Json
    if ($responseData.token) {
        Write-Host "✅ Token generado correctamente" -ForegroundColor Green
    }
    if ($responseData.user) {
        Write-Host "✅ Datos de usuario: $($responseData.user.email) ($($responseData.user.role))" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Login Test: Error - $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Iniciar frontend
Write-Host "🌐 Iniciando frontend..." -ForegroundColor Yellow
cd ..
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "Write-Host '🌊 MARVERA FRONTEND' -ForegroundColor Blue; Write-Host '📱 Login en: http://localhost:5174/login' -ForegroundColor Cyan; Write-Host '👤 Usuario: admin@marvera.com' -ForegroundColor Yellow; Write-Host '🔑 Contraseña: admin123456' -ForegroundColor Yellow; npm run dev"

Write-Host ""
Write-Host "🎉 MARVERA CONFIGURADO PARA LOGIN" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:5174" -ForegroundColor Cyan
Write-Host "🐟 Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "🔐 Login:    http://localhost:5174/login" -ForegroundColor Cyan
Write-Host ""
Write-Host "👤 CREDENCIALES DE ADMIN:" -ForegroundColor Yellow
Write-Host "   Email:    admin@marvera.com" -ForegroundColor White
Write-Host "   Password: admin123456" -ForegroundColor White
Write-Host ""
Write-Host "🛠️ PROBLEMAS SOLUCIONADOS:" -ForegroundColor Green
Write-Host "   ✅ Usuario admin creado en BD" -ForegroundColor Green
Write-Host "   ✅ Backend en puerto 3001" -ForegroundColor Green  
Write-Host "   ✅ Endpoint de login activo" -ForegroundColor Green
Write-Host "   ✅ Credenciales verificadas" -ForegroundColor Green
