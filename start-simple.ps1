Write-Host "🚀 Iniciando MarVera..." -ForegroundColor Green

# Cambiar al directorio del proyecto
$projectDir = "c:\Users\lilye\OneDrive\Desktop\marvera"

# Iniciar backend
Write-Host "🔄 Iniciando backend..." -ForegroundColor Yellow
Set-Location "$projectDir\backend"
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "npm start"

# Esperar un poco
Start-Sleep -Seconds 5

# Iniciar frontend
Write-Host "🔄 Iniciando frontend..." -ForegroundColor Yellow  
Set-Location $projectDir
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "npm run dev"

# Esperar un poco más
Start-Sleep -Seconds 5

Write-Host "🎉 MarVera iniciado!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "👨‍💼 Admin: admin@marvera.com / admin123" -ForegroundColor Yellow

# Abrir navegador
Start-Process "http://localhost:5173"
