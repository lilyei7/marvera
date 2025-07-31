# Script para iniciar el servidor proxy local de MarVera
# Ejecutar: .\scripts\start-proxy-server.ps1

Write-Host "🚀 Iniciando servidor proxy de MarVera..." -ForegroundColor Green

# Verificar si Node.js está instalado
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js no está instalado. Por favor, instala Node.js primero." -ForegroundColor Red
    exit 1
}

# Verificar si se tienen los módulos necesarios
$requiredModules = @("express", "cors", "http-proxy-middleware")
$packageJsonPath = "package.json"
$nodeModulesPath = "node_modules"

if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install express cors http-proxy-middleware
}

# Iniciar el servidor proxy
Write-Host "🔄 Iniciando servidor proxy en http://localhost:3000..." -ForegroundColor Cyan
Write-Host "📡 Este servidor actuará como intermediario con el backend remoto" -ForegroundColor Cyan
Write-Host "🛡️ Cuando el backend remoto no esté disponible, se usarán datos locales" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Endpoints disponibles:" -ForegroundColor Yellow
Write-Host "   - http://localhost:3000/api/health" -ForegroundColor Gray
Write-Host "   - http://localhost:3000/api/products/featured" -ForegroundColor Gray
Write-Host "   - http://localhost:3000/api/products" -ForegroundColor Gray
Write-Host ""
Write-Host "📱 Acceso desde tu frontend:" -ForegroundColor Yellow
Write-Host "   Configurado a través de VITE_API_URL en .env.local" -ForegroundColor Gray
Write-Host ""

# Iniciar el servidor
node local-server.js
