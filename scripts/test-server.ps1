# Script para probar la conexión al servidor MarVera
# Ejecutar: .\scripts\test-server.ps1

$SERVER_IP = "187.33.155.127"
$SERVER_PORT = "3001"
$BASE_URL = "http://${SERVER_IP}:${SERVER_PORT}"

Write-Host "🔍 Probando conexión al servidor MarVera..." -ForegroundColor Yellow
Write-Host "📍 Servidor: $BASE_URL" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n1️⃣ Probando Health Check..." -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health Check - OK" -ForegroundColor Green
        $healthData = $response.Content | ConvertFrom-Json
        Write-Host "   Mensaje: $($healthData.message)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Health Check - Error: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Health Check - Sin conexión: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Featured Products
Write-Host "`n2️⃣ Probando Productos Destacados..." -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/products/featured" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Productos Destacados - OK" -ForegroundColor Green
        $productsData = $response.Content | ConvertFrom-Json
        Write-Host "   Productos encontrados: $($productsData.count)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Productos Destacados - Error: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Productos Destacados - Sin conexión: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: All Products
Write-Host "`n3️⃣ Probando Todos los Productos..." -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/products" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Todos los Productos - OK" -ForegroundColor Green
        $allProductsData = $response.Content | ConvertFrom-Json
        Write-Host "   Productos totales: $($allProductsData.count)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Todos los Productos - Error: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Todos los Productos - Sin conexión: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Login
Write-Host "`n4️⃣ Probando Login..." -ForegroundColor White
try {
    $loginData = @{
        email = "admin@marvera.com"
        password = "admin123456"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$BASE_URL/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Login - OK" -ForegroundColor Green
        $loginResponse = $response.Content | ConvertFrom-Json
        Write-Host "   Usuario: $($loginResponse.user.email)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Login - Error: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Login - Sin conexión: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 Resumen:" -ForegroundColor Yellow
Write-Host "   - Si todos los tests pasan ✅, el servidor está funcionando correctamente" -ForegroundColor Gray
Write-Host "   - Si fallan ❌, necesitas ejecutar el script start-server.sh en tu servidor" -ForegroundColor Gray
Write-Host "   - Para ver logs del servidor: ssh root@$SERVER_IP 'tail -f /root/marvera/backend/server.log'" -ForegroundColor Gray

Write-Host "`n🔗 URLs disponibles:" -ForegroundColor Cyan
Write-Host "   Health: $BASE_URL/api/health" -ForegroundColor Gray
Write-Host "   Productos: $BASE_URL/api/products/featured" -ForegroundColor Gray
Write-Host "   Login: $BASE_URL/api/auth/login (POST)" -ForegroundColor Gray
