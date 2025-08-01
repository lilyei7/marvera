# DIAGNÓSTICO RÁPIDO PARA MARVERA.MX
# ===================================

Write-Host "🔍 DIAGNÓSTICO MARVERA.MX" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

Write-Host ""
Write-Host "🌐 PROBANDO ENDPOINTS REMOTOS:" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow

# Test 1: Página principal
Write-Host "1️⃣ Probando página principal..." -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "https://marvera.mx" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    if ($response.Content.Length -gt 0) {
        Write-Host "✅ Contenido recibido: $($response.Content.Length) bytes" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

# Test 2: API Health Check
Write-Host ""
Write-Host "2️⃣ Probando API Health..." -ForegroundColor White
try {
    $healthResponse = Invoke-WebRequest -Uri "https://marvera.mx/api/health" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ API Health: $($healthResponse.StatusCode)" -ForegroundColor Green
    $healthData = $healthResponse.Content | ConvertFrom-Json
    Write-Host "✅ Backend respondiendo: $($healthData.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ API Health Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

# Test 3: Productos destacados
Write-Host ""
Write-Host "3️⃣ Probando productos destacados..." -ForegroundColor White
try {
    $productsResponse = Invoke-WebRequest -Uri "https://marvera.mx/api/products/featured" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Products API: $($productsResponse.StatusCode)" -ForegroundColor Green
    $productsData = $productsResponse.Content | ConvertFrom-Json
    if ($productsData.data -and $productsData.data.Count -gt 0) {
        Write-Host "✅ Productos encontrados: $($productsData.data.Count)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Products API Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

# Test 4: Login endpoint
Write-Host ""
Write-Host "4️⃣ Probando login..." -ForegroundColor White
try {
    $loginData = @{
        email = "admin@marvera.com"
        password = "admin123456"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-WebRequest -Uri "https://marvera.mx/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Login API: $($loginResponse.StatusCode)" -ForegroundColor Green
    $loginResult = $loginResponse.Content | ConvertFrom-Json
    if ($loginResult.token) {
        Write-Host "✅ Token generado correctamente" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Login API Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📊 RESUMEN DEL DIAGNÓSTICO:" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

Write-Host ""
Write-Host "🔧 POSIBLES SOLUCIONES SI HAY ERRORES:" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Yellow

Write-Host ""
Write-Host "Si obtienes Error 500:" -ForegroundColor Red
Write-Host "1. Verificar que el backend Node.js esté corriendo:" -ForegroundColor White
Write-Host "   pm2 status" -ForegroundColor Gray
Write-Host "   pm2 logs marvera-api" -ForegroundColor Gray

Write-Host ""
Write-Host "2. Verificar configuración de nginx:" -ForegroundColor White
Write-Host "   sudo nginx -t" -ForegroundColor Gray
Write-Host "   sudo systemctl status nginx" -ForegroundColor Gray

Write-Host ""
Write-Host "3. Verificar logs del servidor:" -ForegroundColor White
Write-Host "   sudo tail -f /var/log/nginx/marvera.mx.error.log" -ForegroundColor Gray
Write-Host "   pm2 logs marvera-api --lines 50" -ForegroundColor Gray

Write-Host ""
Write-Host "Si obtienes Error 404:" -ForegroundColor Red
Write-Host "1. Verificar que los archivos estén en /var/www/marvera.mx/dist" -ForegroundColor White
Write-Host "2. Verificar permisos: sudo chown -R www-data:www-data /var/www/marvera.mx/" -ForegroundColor White

Write-Host ""
Write-Host "Si obtienes Error de conexión:" -ForegroundColor Red
Write-Host "1. Verificar DNS: nslookup marvera.mx" -ForegroundColor White
Write-Host "2. Verificar SSL: openssl s_client -connect marvera.mx:443" -ForegroundColor White

Write-Host ""
Write-Host "🚀 COMANDOS DE REINICIO RÁPIDO:" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host "sudo systemctl restart nginx" -ForegroundColor White
Write-Host "pm2 restart marvera-api" -ForegroundColor White
Write-Host "pm2 reload marvera-api" -ForegroundColor White
