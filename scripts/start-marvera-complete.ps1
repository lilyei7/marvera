# Script para iniciar el sistema completo de MarVera (Frontend + Proxy Server)
# Ejecutar: .\scripts\start-marvera-complete.ps1

Write-Host "🚀 Iniciando MarVera (Sistema Completo)..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Verificar Node.js
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js no está instalado. Por favor, instala Node.js primero." -ForegroundColor Red
    exit 1
}

# Variables
$projectPath = "c:\Users\lilye\OneDrive\Desktop\marvera"
$proxyPort = 3000
$frontendPort = 5173

# Función para verificar si un puerto está en uso
function Test-PortInUse {
    param($port)
    
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Verificar si los puertos necesarios están disponibles
if (Test-PortInUse $proxyPort) {
    Write-Host "⚠️ El puerto $proxyPort ya está en uso. El servidor proxy podría no iniciarse correctamente." -ForegroundColor Yellow
}

if (Test-PortInUse $frontendPort) {
    Write-Host "⚠️ El puerto $frontendPort ya está en uso. El frontend podría no iniciarse correctamente." -ForegroundColor Yellow
}

# Iniciar servidor proxy en una nueva ventana de PowerShell
Write-Host "`n📡 Iniciando servidor proxy en http://localhost:$proxyPort..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectPath'; .\scripts\start-proxy-server.ps1" -WindowStyle Normal

# Esperar a que el proxy esté listo
Write-Host "⏳ Esperando a que el servidor proxy inicie (5 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Iniciar el frontend en la ventana actual
Write-Host "`n⚛️ Iniciando frontend React en http://localhost:$frontendPort..." -ForegroundColor Green
Write-Host "📱 El frontend se conectará al proxy en http://localhost:$proxyPort" -ForegroundColor Cyan
Write-Host "`n📋 Instrucciones:" -ForegroundColor Yellow
Write-Host "   1. El frontend debería abrirse automáticamente en tu navegador" -ForegroundColor Gray
Write-Host "   2. Si el servidor remoto está disponible, se usarán esos datos" -ForegroundColor Gray
Write-Host "   3. Si el servidor remoto no responde, se usarán datos locales de fallback" -ForegroundColor Gray
Write-Host "   4. Puedes ver el estado del servidor visitando http://localhost:$proxyPort" -ForegroundColor Gray
Write-Host "`n🚀 Iniciando frontend..." -ForegroundColor Green

# Iniciar el frontend
npm run dev
