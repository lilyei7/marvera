# Script PowerShell para iniciar MarVera
Write-Host "🚀 Iniciando MarVera..." -ForegroundColor Green

# Función para verificar si un puerto está en uso
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Cambiar al directorio del proyecto
$projectDir = "c:\Users\lilye\OneDrive\Desktop\marvera"
Set-Location $projectDir

# Verificar si el backend está corriendo
if (Test-Port 3001) {
    Write-Host "✅ Backend ya está ejecutándose en puerto 3001" -ForegroundColor Green
} else {
    Write-Host "🔄 Iniciando backend..." -ForegroundColor Yellow
    Set-Location "$projectDir\backend"
    Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
    Write-Host "⏳ Esperando que inicie el backend..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8
    Set-Location $projectDir
}

# Verificar si el frontend está corriendo
if (Test-Port 5173) {
    Write-Host "✅ Frontend ya está ejecutándose en puerto 5173" -ForegroundColor Green
} else {
    Write-Host "🔄 Iniciando frontend..." -ForegroundColor Yellow
    Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
    Write-Host "⏳ Esperando que inicie el frontend..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8
}

Write-Host ""
Write-Host "🎉 MarVera iniciado completamente!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "👨‍💼 Admin Panel: http://localhost:5173/admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "Credenciales de prueba:" -ForegroundColor White
Write-Host "👤 Admin: admin@marvera.com / admin123" -ForegroundColor Yellow
Write-Host "👤 Usuario: user@marvera.com / user123" -ForegroundColor Yellow
Write-Host ""
Write-Host "Presiona cualquier tecla para abrir el navegador..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Abrir el navegador
Start-Process "http://localhost:5173"
