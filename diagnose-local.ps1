# Diagnóstico completo local de MarVera
# Ejecutar: .\diagnose-local.ps1

Write-Host "🔍 DIAGNÓSTICO LOCAL MARVERA" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "Fecha: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# 1. Verificar archivos críticos
Write-Host "📁 1. ARCHIVOS CRÍTICOS" -ForegroundColor Yellow
Write-Host "-----------------------" -ForegroundColor Yellow

$files = @{
    "package.json" = "Frontend package.json"
    "backend/package.json" = "Backend package.json"
    "backend/prisma/dev.db" = "Base de datos SQLite"
    "backend/prisma/schema.prisma" = "Esquema Prisma"
    "src/config/apiConfig.ts" = "Configuración API"
    "dist/index.html" = "Frontend compilado"
}

foreach ($file in $files.Keys) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "✅ $($files[$file]): $file ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "❌ $($files[$file]): $file" -ForegroundColor Red
    }
}

Write-Host ""

# 2. Verificar dependencias
Write-Host "📦 2. DEPENDENCIAS" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow

# Node.js
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no encontrado" -ForegroundColor Red
}

# NPM
try {
    $npmVersion = npm --version 2>$null
    Write-Host "✅ NPM: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ NPM no encontrado" -ForegroundColor Red
}

# Frontend node_modules
if (Test-Path "node_modules") {
    $moduleCount = (Get-ChildItem "node_modules" -Directory).Count
    Write-Host "✅ Frontend modules: $moduleCount instalados" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend modules: No instalados" -ForegroundColor Red
}

# Backend node_modules
if (Test-Path "backend/node_modules") {
    $backendModuleCount = (Get-ChildItem "backend/node_modules" -Directory).Count
    Write-Host "✅ Backend modules: $backendModuleCount instalados" -ForegroundColor Green
} else {
    Write-Host "❌ Backend modules: No instalados" -ForegroundColor Red
}

Write-Host ""

# 3. Verificar configuración API
Write-Host "🔧 3. CONFIGURACIÓN API" -ForegroundColor Yellow
Write-Host "-----------------------" -ForegroundColor Yellow

if (Test-Path "src/config/apiConfig.ts") {
    $apiConfig = Get-Content "src/config/apiConfig.ts" -Raw
    
    if ($apiConfig -match "API_BASE_URL.*=.*'([^']*)'") {
        Write-Host "✅ API_BASE_URL: $($matches[1])" -ForegroundColor Green
    } else {
        Write-Host "❌ API_BASE_URL no encontrada" -ForegroundColor Red
    }
    
    # Verificar endpoints duplicados
    if ($apiConfig -match "/api/api/") {
        Write-Host "❌ URLs duplicadas detectadas (/api/api/)" -ForegroundColor Red
    } else {
        Write-Host "✅ URLs sin duplicación" -ForegroundColor Green
    }
} else {
    Write-Host "❌ apiConfig.ts no encontrado" -ForegroundColor Red
}

Write-Host ""

# 4. Probar conexión local
Write-Host "🌐 4. CONECTIVIDAD LOCAL" -ForegroundColor Yellow
Write-Host "------------------------" -ForegroundColor Yellow

# Verificar si hay algo en puerto 3001
$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($port3001) {
    Write-Host "✅ Puerto 3001: Ocupado" -ForegroundColor Green
    
    # Probar health check
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 3 -UseBasicParsing
        Write-Host "✅ Health check: Respondiendo (Status: $($response.StatusCode))" -ForegroundColor Green
        
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   Mensaje: $($data.message)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Health check: No responde" -ForegroundColor Red
    }
    
    # Probar productos
    try {
        $prodResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/products/featured" -TimeoutSec 3 -UseBasicParsing
        $prodData = $prodResponse.Content | ConvertFrom-Json
        Write-Host "✅ Productos API: $($prodData.count) productos disponibles" -ForegroundColor Green
    } catch {
        Write-Host "❌ Productos API: No responde" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Puerto 3001: Libre (backend no iniciado)" -ForegroundColor Red
}

# Verificar puerto 5173 (Vite)
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    Write-Host "✅ Puerto 5173: Ocupado (Vite dev server)" -ForegroundColor Green
} else {
    Write-Host "❌ Puerto 5173: Libre (frontend no iniciado)" -ForegroundColor Red
}

Write-Host ""

# 5. Verificar base de datos
Write-Host "💾 5. BASE DE DATOS" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow

if (Test-Path "backend/prisma/dev.db") {
    $dbSize = (Get-Item "backend/prisma/dev.db").Length
    Write-Host "✅ SQLite DB: Existe ($dbSize bytes)" -ForegroundColor Green
    
    # Verificar tablas (si sqlite3 está disponible)
    try {
        Set-Location backend
        $tables = npx prisma db execute --command=".tables" 2>$null
        if ($tables) {
            Write-Host "✅ Tablas: Accesibles" -ForegroundColor Green
        }
        Set-Location ..
    } catch {
        Write-Host "⚠️ Tablas: No se puede verificar" -ForegroundColor Orange
    }
} else {
    Write-Host "❌ SQLite DB: No existe" -ForegroundColor Red
}

Write-Host ""

# 6. Resumen y recomendaciones
Write-Host "📊 RESUMEN" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan

$issues = @()

if (!(Test-Path "backend/prisma/dev.db")) { $issues += "Base de datos faltante" }
if (!(Test-Path "node_modules")) { $issues += "Frontend dependencies" }
if (!(Test-Path "backend/node_modules")) { $issues += "Backend dependencies" }
if (!$port3001) { $issues += "Backend no iniciado" }
if (!$port5173) { $issues += "Frontend no iniciado" }

if ($issues.Count -eq 0) {
    Write-Host "🎉 Sistema local funcionando correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 URLs disponibles:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
    Write-Host "   Backend:  http://localhost:3001" -ForegroundColor White
    Write-Host "   Health:   http://localhost:3001/api/health" -ForegroundColor White
} else {
    Write-Host "⚠️ Problemas encontrados:" -ForegroundColor Orange
    foreach ($issue in $issues) {
        Write-Host "   • $issue" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "🔧 Para solucionarlo:" -ForegroundColor Cyan
    Write-Host "   .\start-local-complete.ps1" -ForegroundColor White
}

Write-Host ""
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "🏁 DIAGNÓSTICO COMPLETADO" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
