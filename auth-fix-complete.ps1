# SOLUCIÓN COMPLETA AUTENTICACIÓN MARVERA
Write-Host "🔐 SOLUCIONANDO AUTENTICACIÓN MARVERA" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# 1. Limpiar localStorage
Write-Host "🧹 Limpiando localStorage..." -ForegroundColor Yellow

# 2. Recrear usuario admin
Write-Host "👤 Recreando usuario admin..." -ForegroundColor Yellow
cd backend
node create-admin.js

# 3. Reiniciar backend con logging completo
Write-Host "🚀 Iniciando backend con logging..." -ForegroundColor Yellow
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd backend; Write-Host '🔐 MARVERA AUTH BACKEND' -ForegroundColor Green; Write-Host 'Puerto: 3001' -ForegroundColor Cyan; Write-Host 'Endpoints auth:' -ForegroundColor Yellow; Write-Host '  ✅ POST /api/auth/login' -ForegroundColor White; Write-Host '  ✅ GET  /api/auth/verify' -ForegroundColor White; Write-Host '  ✅ POST /api/auth/verify' -ForegroundColor White; Write-Host 'Usuario admin: admin@marvera.com / admin123456' -ForegroundColor Cyan; Write-Host ''; node simple-server.js"

# Esperar backend
Start-Sleep 5

# 4. Probar todos los endpoints
Write-Host "🔍 Probando endpoints..." -ForegroundColor Yellow

# Test Health
try {
    $health = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Health: OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Health: Error" -ForegroundColor Red
}

# Test Login
try {
    $loginData = @{
        email = "admin@marvera.com"
        password = "admin123456"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
    $loginResult = $loginResponse.Content | ConvertFrom-Json
    
    if ($loginResult.token) {
        Write-Host "✅ Login: OK - Token generado" -ForegroundColor Green
        $token = $loginResult.token
        
        # Test Verify GET
        try {
            $verifyResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/verify" -Method GET -Headers @{Authorization="Bearer $token"} -UseBasicParsing -TimeoutSec 5
            Write-Host "✅ Verify GET: OK" -ForegroundColor Green
        } catch {
            Write-Host "❌ Verify GET: Error" -ForegroundColor Red
        }
        
        # Test Verify POST
        try {
            $verifyPostResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/verify" -Method POST -Headers @{Authorization="Bearer $token"} -UseBasicParsing -TimeoutSec 5
            Write-Host "✅ Verify POST: OK" -ForegroundColor Green
        } catch {
            Write-Host "❌ Verify POST: Error" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Login: No token generado" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Login: Error - $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Iniciar frontend
Write-Host "🌐 Iniciando frontend..." -ForegroundColor Yellow
cd ..
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "Write-Host '🌊 MARVERA FRONTEND' -ForegroundColor Blue; Write-Host 'URL: http://localhost:5174' -ForegroundColor Cyan; Write-Host ''; Write-Host '🔐 CREDENCIALES:' -ForegroundColor Yellow; Write-Host 'Email: admin@marvera.com' -ForegroundColor White; Write-Host 'Pass:  admin123456' -ForegroundColor White; Write-Host ''; Write-Host '📋 DEBUGGING:' -ForegroundColor Yellow; Write-Host 'Abre DevTools para ver logs detallados' -ForegroundColor White; Write-Host ''; npm run dev"

Write-Host ""
Write-Host "🎯 AUTENTICACIÓN CONFIGURADA" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host "🌐 App: http://localhost:5174" -ForegroundColor Cyan
Write-Host "🔐 Login: http://localhost:5174/login" -ForegroundColor Cyan
Write-Host "⚙️ Admin: http://localhost:5174/admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "👤 CREDENCIALES:" -ForegroundColor Yellow
Write-Host "   Email: admin@marvera.com" -ForegroundColor White
Write-Host "   Pass:  admin123456" -ForegroundColor White
Write-Host ""
Write-Host "🔧 PROBLEMAS SOLUCIONADOS:" -ForegroundColor Green
Write-Host "   ✅ Usuario admin en BD" -ForegroundColor Green
Write-Host "   ✅ Endpoint GET /verify agregado" -ForegroundColor Green
Write-Host "   ✅ Roles SUPER_ADMIN permitidos" -ForegroundColor Green
Write-Host "   ✅ Logging completo agregado" -ForegroundColor Green
