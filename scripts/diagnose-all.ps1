# Script maestro para diagnóstico completo de MarVera
# Ejecutar: .\scripts\diagnose-all.ps1

param(
    [switch]$SkipServer,
    [switch]$SkipFrontend
)

Write-Host "🔬 Diagnóstico Completo de MarVera" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# 1. Información del sistema
Write-Host "`n📊 Información del Sistema:" -ForegroundColor Yellow
Write-Host "   OS: $(Get-WmiObject -Class Win32_OperatingSystem | Select-Object -ExpandProperty Caption)" -ForegroundColor Gray
Write-Host "   PowerShell: $($PSVersionTable.PSVersion)" -ForegroundColor Gray
Write-Host "   Fecha: $(Get-Date)" -ForegroundColor Gray

# 2. Verificar Node.js y npm
Write-Host "`n📦 Verificando dependencias:" -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js no instalado" -ForegroundColor Red
}

try {
    $npmVersion = npm --version 2>$null
    Write-Host "   ✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm no disponible" -ForegroundColor Red
}

# 3. Verificar estructura del proyecto
Write-Host "`n📁 Verificando estructura del proyecto:" -ForegroundColor Yellow
$projectPath = "c:\Users\lilye\OneDrive\Desktop\marvera"
$requiredFiles = @(
    "package.json",
    "src\store\slices\featuredProductsSlice.ts",
    "src\utils\serverConfig.ts",
    "scripts\start-server.sh",
    "scripts\test-server.ps1",
    "scripts\test-frontend.ps1"
)

foreach ($file in $requiredFiles) {
    $fullPath = Join-Path $projectPath $file
    if (Test-Path $fullPath) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file faltante" -ForegroundColor Red
    }
}

# 4. Test del servidor (si no se omite)
if (-not $SkipServer) {
    Write-Host "`n🌐 Probando conexión al servidor:" -ForegroundColor Yellow
    & "$projectPath\scripts\test-server.ps1"
}

# 5. Verificar frontend (si no se omite)
if (-not $SkipFrontend) {
    Write-Host "`n⚛️  Verificando frontend:" -ForegroundColor Yellow
    & "$projectPath\scripts\test-frontend.ps1"
}

# 6. Resumen y recomendaciones
Write-Host "`n📋 Resumen y Recomendaciones:" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

Write-Host "`n🔧 Si el servidor no responde:" -ForegroundColor Yellow
Write-Host "   1. Conéctate a tu servidor: ssh root@187.33.155.127" -ForegroundColor Gray
Write-Host "   2. Ejecuta: chmod +x /root/marvera/start-server.sh" -ForegroundColor Gray
Write-Host "   3. Ejecuta: ./start-server.sh" -ForegroundColor Gray
Write-Host "   4. Verifica logs: tail -f /root/marvera/backend/server.log" -ForegroundColor Gray

Write-Host "`n⚛️  Si el frontend tiene problemas:" -ForegroundColor Yellow
Write-Host "   1. Instala dependencias: npm install" -ForegroundColor Gray
Write-Host "   2. Inicia el servidor: npm run dev" -ForegroundColor Gray
Write-Host "   3. Abre http://localhost:5173 en tu navegador" -ForegroundColor Gray
Write-Host "   4. Revisa la consola del navegador (F12)" -ForegroundColor Gray

Write-Host "`n🔍 Monitoreo en tiempo real:" -ForegroundColor Yellow
Write-Host "   - Frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host "   - Backend: http://187.33.155.127:3001/api/health" -ForegroundColor Gray
Write-Host "   - Logs servidor: ssh root@187.33.155.127 'tail -f /root/marvera/backend/server.log'" -ForegroundColor Gray

Write-Host "`n🆘 Si persisten los errores AbortError:" -ForegroundColor Yellow
Write-Host "   1. Verifica que el servidor esté corriendo" -ForegroundColor Gray
Write-Host "   2. Prueba abrir http://187.33.155.127:3001/api/health directamente" -ForegroundColor Gray
Write-Host "   3. Revisa configuración de firewall/CORS" -ForegroundColor Gray
Write-Host "   4. El frontend debería mostrar datos fallback automáticamente" -ForegroundColor Gray

Write-Host "`n✨ ¡Diagnóstico completado!" -ForegroundColor Green
