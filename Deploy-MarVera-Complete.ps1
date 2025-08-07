# 🚀 Script de Deploy Completo - MarVera (PowerShell)
# Automatiza el proceso de build y deploy evitando problemas de assets

param(
    [switch]$Force = $false
)

Write-Host "🔧 MarVera Deploy Script - Inicio" -ForegroundColor Green
Write-Host "=================================="

# 1. Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encuentra package.json. Ejecuta desde la raíz del proyecto." -ForegroundColor Red
    exit 1
}

# 2. Build del proyecto
Write-Host "📦 Ejecutando build..." -ForegroundColor Yellow
try {
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }
} catch {
    Write-Host "❌ Error en el build. Abortando deploy." -ForegroundColor Red
    exit 1
}

# 3. Verificar archivos generados
Write-Host "🔍 Verificando archivos generados en dist/..." -ForegroundColor Yellow
if (-not (Test-Path "dist")) {
    Write-Host "❌ Error: No existe directorio dist/" -ForegroundColor Red
    exit 1
}

# Listar archivos CSS y JS generados
Write-Host "📄 Archivos CSS/JS generados:" -ForegroundColor Cyan
Get-ChildItem -Path "dist/assets/" -Filter "index-*.css" | ForEach-Object { Write-Host "  CSS: $($_.Name)" }
Get-ChildItem -Path "dist/assets/" -Filter "index-*.js" | ForEach-Object { Write-Host "  JS: $($_.Name)" }

# Verificar que index.html existe
if (-not (Test-Path "dist/index.html")) {
    Write-Host "❌ Error: No se encuentra dist/index.html" -ForegroundColor Red
    exit 1
}

# Mostrar referencias en HTML
Write-Host "🔗 Referencias en index.html:" -ForegroundColor Cyan
Select-String -Path "dist/index.html" -Pattern "assets/index-.*\.(js|css)" | ForEach-Object {
    Write-Host "  $($_.Line.Trim())" -ForegroundColor White
}

# 4. Confirmar deploy
if (-not $Force) {
    Write-Host ""
    $response = Read-Host "¿Continuar con el deploy a producción? (y/N)"
    if ($response -notmatch "^[Yy]$") {
        Write-Host "🚫 Deploy cancelado por el usuario." -ForegroundColor Yellow
        exit 0
    }
}

# 5. Deploy al servidor
$SERVER = "root@148.230.87.198"
$DEPLOY_PATH = "/var/www/marvera"

Write-Host "🚀 Iniciando deploy al servidor..." -ForegroundColor Green

# Crear backup de index.html actual
Write-Host "💾 Creando backup de index.html..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
ssh $SERVER "cp $DEPLOY_PATH/index.html $DEPLOY_PATH/index.html.backup.$timestamp"

# Subir archivos
Write-Host "📤 Subiendo archivos al servidor..." -ForegroundColor Yellow

# Subir assets
Write-Host "  📁 Subiendo assets..." -ForegroundColor Cyan
scp -r ./dist/assets/* "${SERVER}:${DEPLOY_PATH}/assets/"

# Subir index.html (CRÍTICO)
Write-Host "  📄 Subiendo index.html..." -ForegroundColor Cyan
scp ./dist/index.html "${SERVER}:${DEPLOY_PATH}/"

# Subir otros archivos estáticos si existen
if (Test-Path "dist/images") {
    Write-Host "  🖼️  Subiendo imágenes..." -ForegroundColor Cyan
    scp -r ./dist/images/* "${SERVER}:${DEPLOY_PATH}/images/" 2>$null
}

# 6. Establecer permisos correctos
Write-Host "🔒 Estableciendo permisos..." -ForegroundColor Yellow
ssh $SERVER "chmod -R 755 $DEPLOY_PATH/assets/"
ssh $SERVER "chmod 644 $DEPLOY_PATH/index.html"

# 7. Verificación post-deploy
Write-Host "✅ Verificando deploy..." -ForegroundColor Green

# Verificar que HTML y assets coinciden
Write-Host "🔍 Verificando consistencia HTML vs Assets..." -ForegroundColor Yellow
$htmlRefs = ssh $SERVER "cat $DEPLOY_PATH/index.html | grep -E 'assets/index-.*\.(js|css)' | sed 's/.*assets\///; s/[\`"<>].*//' | tr '\n' ' '"
$actualFiles = ssh $SERVER "ls $DEPLOY_PATH/assets/ | grep '^index-' | tr '\n' ' '"

Write-Host "  📄 Referencias en HTML: $htmlRefs" -ForegroundColor White
Write-Host "  📁 Archivos en assets/: $actualFiles" -ForegroundColor White

# 8. Test de conectividad
Write-Host "🌐 Probando conectividad..." -ForegroundColor Yellow

# Obtener nombres de archivos desde HTML
$jsFile = ssh $SERVER "cat $DEPLOY_PATH/index.html | grep -o 'assets/index-[^`"]*\.js' | sed 's/assets\///'"
$cssFile = ssh $SERVER "cat $DEPLOY_PATH/index.html | grep -o 'assets/index-[^`"]*\.css' | sed 's/assets\///'"

if ($jsFile) {
    Write-Host "  🧪 Probando JS: $jsFile" -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "https://marvera.mx/assets/$jsFile" -Method Head -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ JS accesible" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ❌ JS no accesible: $($_.Exception.Message)" -ForegroundColor Red
    }
}

if ($cssFile) {
    Write-Host "  🧪 Probando CSS: $cssFile" -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "https://marvera.mx/assets/$cssFile" -Method Head -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ CSS accesible" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ❌ CSS no accesible: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 9. Test de sitio web
Write-Host "🌍 Probando sitio web..." -ForegroundColor Yellow
try {
    $siteResponse = Invoke-WebRequest -Uri "https://marvera.mx" -UseBasicParsing -ErrorAction Stop
    if ($siteResponse.Content -match "MarVera") {
        Write-Host "  ✅ Sitio web respondiendo correctamente" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Sitio web puede tener problemas" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Error al acceder al sitio: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Deploy completado!" -ForegroundColor Green
Write-Host "=================================="
Write-Host "📍 Sitio: https://marvera.mx" -ForegroundColor Cyan
Write-Host "📄 Logs: ssh $SERVER 'tail -f /var/log/nginx/access.log'" -ForegroundColor Cyan
Write-Host "🔄 Backup: $DEPLOY_PATH/index.html.backup.*" -ForegroundColor Cyan
Write-Host ""
