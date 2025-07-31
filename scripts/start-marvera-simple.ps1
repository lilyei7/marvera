# Script para iniciar el sistema completo de MarVera (Frontend + Proxy Server)
# Ejecutar: .\scripts\start-marvera-simple.ps1

Write-Host "Iniciando MarVera (Sistema Completo)..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Verificar Node.js
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js no esta instalado. Por favor, instala Node.js primero." -ForegroundColor Red
    exit 1
}

# Variables
$projectPath = "c:\Users\lilye\OneDrive\Desktop\marvera"
$proxyPort = 3000
$frontendPort = 5173

# Iniciar servidor proxy
Write-Host "Iniciando servidor proxy en http://localhost:$proxyPort..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath'; node local-server.js" -WindowStyle Normal

# Esperar a que el proxy esté listo
Write-Host "Esperando a que el servidor proxy inicie (5 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Iniciar el frontend
Write-Host "Iniciando frontend React en http://localhost:$frontendPort..." -ForegroundColor Green
Write-Host "El frontend se conectara al proxy en http://localhost:$proxyPort" -ForegroundColor Cyan
Write-Host "Instrucciones:" -ForegroundColor Yellow
Write-Host "   1. El frontend deberia abrirse automaticamente en tu navegador" -ForegroundColor Gray
Write-Host "   2. Si el servidor remoto esta disponible, se usaran esos datos" -ForegroundColor Gray
Write-Host "   3. Si el servidor remoto no responde, se usaran datos locales de fallback" -ForegroundColor Gray
Write-Host "   4. Puedes ver el estado del servidor visitando http://localhost:$proxyPort" -ForegroundColor Gray
Write-Host "Iniciando frontend..." -ForegroundColor Green

# Iniciar el frontend
npm run dev
