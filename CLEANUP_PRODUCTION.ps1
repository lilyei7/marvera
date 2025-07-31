# ============================================================================
# SCRIPT DE LIMPIEZA COMPLETA PARA PRODUCCIÓN MARVERA
# Ejecutar: .\CLEANUP_PRODUCTION.ps1
# ============================================================================

Write-Host "🧹 INICIANDO LIMPIEZA COMPLETA PARA PRODUCCIÓN" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Configuración para producción
$PRODUCTION_IP = "148.230.87.198"
$PRODUCTION_DOMAIN = "marvera.mx"
$OLD_IP = "187.33.155.127"

# 1. ELIMINAR ARCHIVOS INNECESARIOS
Write-Host "🗑️ Eliminando archivos de desarrollo y test..." -ForegroundColor Yellow

$filesToDelete = @(
    "test-*.ps1",
    "test-*.js", 
    "test-*.html",
    "test-*.md",
    "*local*.js",
    "*local*.bat",
    "*local*.ps1",
    "setup-local-mode.bat",
    "start-all-local.bat",
    "LOCAL_DEV_GUIDE.md",
    "server-local.js",
    "local-server.js",
    ".env.local",
    ".env.local.dev",
    "start-marvera.ps1",
    "start-marvera.sh",
    "start-simple.ps1",
    "startup-backend.bat",
    "scripts/test-*.ps1",
    "scripts/diagnose-*.ps1",
    "scripts/start-*.ps1",
    "backend/test-*.js",
    "backend/clean-users.js",
    "backend/make-user-admin.js",
    "backend/fix-*.js",
    "backend/check-*.js",
    "backend/seed-*.js",
    "dist/test-*.html",
    "public/test-*.html"
)

foreach ($pattern in $filesToDelete) {
    Get-ChildItem -Path . -Name $pattern -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
        $fullPath = Join-Path $PWD $_
        if (Test-Path $fullPath) {
            Remove-Item $fullPath -Force -ErrorAction SilentlyContinue
            Write-Host "   ❌ Eliminado: $_" -ForegroundColor Gray
        }
    }
}

# 2. LIMPIAR REFERENCIAS A IP INCORRECTA
Write-Host "🔧 Corrigiendo referencias de IP..." -ForegroundColor Yellow

$filesToFix = Get-ChildItem -Path . -Include "*.js", "*.ts", "*.json", "*.md", "*.sh", "*.conf", "*.env*" -Recurse | 
    Where-Object { $_.Name -notlike "node_modules*" -and $_.Name -notlike ".git*" -and $_.Name -notlike "dist*" }

foreach ($file in $filesToFix) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content -and $content.Contains($OLD_IP)) {
            $newContent = $content -replace $OLD_IP, $PRODUCTION_IP
            $newContent = $newContent -replace "http://148\.230\.87\.198", "https://marvera.mx"
            Set-Content -Path $file.FullName -Value $newContent -ErrorAction SilentlyContinue
            Write-Host "   ✅ Corregido: $($file.Name)" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ⚠️ Error procesando: $($file.Name)" -ForegroundColor Red
    }
}

# 3. LIMPIAR REFERENCIAS A LOCALHOST
Write-Host "🌐 Eliminando referencias a localhost..." -ForegroundColor Yellow

foreach ($file in $filesToFix) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            $newContent = $content -replace "http://localhost:5173", "https://marvera.mx"
            $newContent = $newContent -replace "http://localhost:3000", "https://marvera.mx/api"
            $newContent = $newContent -replace "http://localhost:3001", "https://marvera.mx/api"
            $newContent = $newContent -replace "localhost:5173", "marvera.mx"
            $newContent = $newContent -replace "localhost:3001", "marvera.mx"
            if ($newContent -ne $content) {
                Set-Content -Path $file.FullName -Value $newContent -ErrorAction SilentlyContinue
                Write-Host "   ✅ URLs corregidas: $($file.Name)" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "   ⚠️ Error procesando URLs: $($file.Name)" -ForegroundColor Red
    }
}

# 4. LIMPIAR DATOS DE DESARROLLO
Write-Host "📊 Eliminando datos de prueba..." -ForegroundColor Yellow

$devPatterns = @(
    "development",
    "test.*data",
    "fake.*data",
    "demo.*data",
    "mock.*",
    "// Para desarrollo",
    "En desarrollo",
    "test.*user",
    "usuario.*test"
)

foreach ($file in $filesToFix) {
    if ($file.Extension -eq ".js" -or $file.Extension -eq ".ts") {
        try {
            $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
            if ($content) {
                $hasChanges = $false
                foreach ($pattern in $devPatterns) {
                    if ($content -match $pattern) {
                        $hasChanges = $true
                        break
                    }
                }
                if ($hasChanges) {
                    Write-Host "   ⚠️ Contiene datos de desarrollo: $($file.Name)" -ForegroundColor Yellow
                }
            }
        } catch {}
    }
}

# 5. CREAR ARCHIVOS DE PRODUCCIÓN LIMPIOS
Write-Host "📝 Creando archivos de producción..." -ForegroundColor Yellow

# .env de producción limpio
$prodEnv = @"
# PRODUCCIÓN MARVERA - VARIABLES DE ENTORNO
NODE_ENV=production
HOST=148.230.87.198
PORT=3001

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=marvera_db
DB_USER=marvera_user
DB_PASSWORD=MarvEr4_S3cur3_P4ss

# JWT y seguridad
JWT_SECRET=marvera_jwt_secret_production_2025_secure

# URLs de producción
VITE_API_URL=https://marvera.mx/api
VITE_BACKEND_URL=https://marvera.mx/api
VITE_SOCKET_URL=https://marvera.mx
SERVER_URL=https://marvera.mx

# CORS
CORS_ORIGINS=https://marvera.mx,https://www.marvera.mx

# Configuraciones de producción
VITE_ENABLE_FALLBACK=false
VITE_API_TIMEOUT=8000

# APIs externas (reemplazar con valores reales)
VITE_MAPBOX_TOKEN=your_real_mapbox_token_here
VITE_STRIPE_PUBLISHABLE_KEY=your_real_stripe_key_here
"@

Set-Content -Path ".env.production.clean" -Value $prodEnv
Write-Host "   ✅ Creado: .env.production.clean" -ForegroundColor Green

# 6. SCRIPT DE VERIFICACIÓN
$verifyScript = @"
#!/bin/bash
# Verificación de limpieza de producción

echo "🔍 VERIFICANDO LIMPIEZA..."

# Buscar referencias problemáticas
echo "Buscando IP antigua..."
grep -r "187.33.155.127" . --exclude-dir=node_modules --exclude-dir=.git || echo "✅ No encontrada"

echo "Buscando localhost..."
grep -r "localhost:5173\|localhost:3001" . --exclude-dir=node_modules --exclude-dir=.git || echo "✅ No encontrado"

echo "Buscando datos de test..."
grep -r "test.*data\|fake.*data\|mock" . --exclude-dir=node_modules --exclude-dir=.git || echo "✅ No encontrados"

echo "✅ Verificación completa"
"@

Set-Content -Path "verify-cleanup.sh" -Value $verifyScript
Write-Host "   ✅ Creado: verify-cleanup.sh" -ForegroundColor Green

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "✅ LIMPIEZA COMPLETA TERMINADA" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 SIGUIENTES PASOS:" -ForegroundColor Yellow
Write-Host "1. Revisar .env.production.clean y actualizar con datos reales" -ForegroundColor Gray
Write-Host "2. Copiar .env.production.clean a .env.production" -ForegroundColor Gray
Write-Host "3. Ejecutar en el servidor: bash verify-cleanup.sh" -ForegroundColor Gray
Write-Host "4. Reconstruir proyecto: npm run build" -ForegroundColor Gray
Write-Host "5. Desplegar en producción" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️ IMPORTANTE: Revisar manualmente los archivos marcados con datos de desarrollo" -ForegroundColor Red
