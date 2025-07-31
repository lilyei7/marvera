# Diagnostico simple de MarVera
# Ejecutar: .\diagnose-simple.ps1

Write-Host "DIAGNOSTICO LOCAL MARVERA" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "Fecha: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# 1. Verificar archivos criticos
Write-Host "1. ARCHIVOS CRITICOS" -ForegroundColor Yellow
Write-Host "--------------------" -ForegroundColor Yellow

$files = @{
    "package.json" = "Frontend package.json"
    "backend/package.json" = "Backend package.json" 
    "backend/prisma/dev.db" = "Base de datos SQLite"
    "src/config/apiConfig.ts" = "Configuracion API"
    "dist/index.html" = "Frontend compilado"
}

foreach ($file in $files.Keys) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "OK $($files[$file]): $file ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "NO $($files[$file]): $file" -ForegroundColor Red
    }
}

Write-Host ""

# 2. Verificar dependencias
Write-Host "2. DEPENDENCIAS" -ForegroundColor Yellow
Write-Host "---------------" -ForegroundColor Yellow

# Node.js
try {
    $nodeVersion = node --version 2>$null
    Write-Host "OK Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "NO Node.js no encontrado" -ForegroundColor Red
}

# NPM
try {
    $npmVersion = npm --version 2>$null  
    Write-Host "OK NPM: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "NO NPM no encontrado" -ForegroundColor Red
}

# Frontend modules
if (Test-Path "node_modules") {
    Write-Host "OK Frontend modules: Instalados" -ForegroundColor Green
} else {
    Write-Host "NO Frontend modules: No instalados" -ForegroundColor Red
}

# Backend modules
if (Test-Path "backend/node_modules") {
    Write-Host "OK Backend modules: Instalados" -ForegroundColor Green
} else {
    Write-Host "NO Backend modules: No instalados" -ForegroundColor Red
}

Write-Host ""

# 3. Verificar puertos
Write-Host "3. CONECTIVIDAD" -ForegroundColor Yellow
Write-Host "---------------" -ForegroundColor Yellow

# Puerto 3001 (Backend)
$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($port3001) {
    Write-Host "OK Puerto 3001: Ocupado (Backend activo)" -ForegroundColor Green
    
    # Probar health check
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 3 -UseBasicParsing
        Write-Host "OK Health check: Funciona (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "NO Health check: No responde" -ForegroundColor Red
    }
} else {
    Write-Host "NO Puerto 3001: Libre (Backend parado)" -ForegroundColor Red
}

# Puerto 5173 (Frontend)
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    Write-Host "OK Puerto 5173: Ocupado (Frontend activo)" -ForegroundColor Green
} else {
    Write-Host "NO Puerto 5173: Libre (Frontend parado)" -ForegroundColor Red
}

Write-Host ""

# 4. Base de datos
Write-Host "4. BASE DE DATOS" -ForegroundColor Yellow
Write-Host "----------------" -ForegroundColor Yellow

if (Test-Path "backend/prisma/dev.db") {
    $dbSize = (Get-Item "backend/prisma/dev.db").Length
    Write-Host "OK SQLite DB: Existe ($dbSize bytes)" -ForegroundColor Green
} else {
    Write-Host "NO SQLite DB: No existe" -ForegroundColor Red
}

Write-Host ""

# 5. Resumen
Write-Host "RESUMEN" -ForegroundColor Cyan
Write-Host "=======" -ForegroundColor Cyan

$problemas = @()

if (!(Test-Path "backend/prisma/dev.db")) { $problemas += "Base de datos faltante" }
if (!(Test-Path "node_modules")) { $problemas += "Frontend dependencies" }
if (!(Test-Path "backend/node_modules")) { $problemas += "Backend dependencies" }
if (!$port3001) { $problemas += "Backend no iniciado" }
if (!$port5173) { $problemas += "Frontend no iniciado" }

if ($problemas.Count -eq 0) {
    Write-Host "SISTEMA LOCAL FUNCIONANDO" -ForegroundColor Green
    Write-Host ""
    Write-Host "URLs disponibles:" -ForegroundColor Cyan
    Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
    Write-Host "  Backend:  http://localhost:3001" -ForegroundColor White
} else {
    Write-Host "PROBLEMAS ENCONTRADOS:" -ForegroundColor Red
    foreach ($problema in $problemas) {
        Write-Host "  - $problema" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Para solucionarlo ejecuta:" -ForegroundColor Cyan
    Write-Host "  .\start-local-complete.ps1" -ForegroundColor White
}

Write-Host ""
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "DIAGNOSTICO COMPLETADO" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
