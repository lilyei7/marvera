# BUILD PARA PRODUCCIÓN MARVERA.MX
Write-Host "🏗️ BUILDING MARVERA PARA PRODUCCIÓN" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# 1. Limpiar build anterior
Write-Host "🧹 Limpiando build anterior..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Carpeta dist eliminada" -ForegroundColor Green
}

# 2. Instalar dependencias
Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow
npm install
Write-Host "✅ Dependencias verificadas" -ForegroundColor Green

# 3. Build para producción
Write-Host "🏗️ Ejecutando build de producción..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
npm run build

if (Test-Path "dist") {
    Write-Host "✅ Build completado exitosamente" -ForegroundColor Green
    
    # Verificar archivos críticos
    $indexFile = "dist/index.html"
    if (Test-Path $indexFile) {
        Write-Host "✅ index.html generado" -ForegroundColor Green
    } else {
        Write-Host "❌ index.html NO encontrado" -ForegroundColor Red
    }
    
    $assetsFolder = "dist/assets"
    if (Test-Path $assetsFolder) {
        Write-Host "✅ Carpeta assets generada" -ForegroundColor Green
        $jsFiles = Get-ChildItem -Path $assetsFolder -Filter "*.js" | Measure-Object
        $cssFiles = Get-ChildItem -Path $assetsFolder -Filter "*.css" | Measure-Object
        Write-Host "   📄 Archivos JS: $($jsFiles.Count)" -ForegroundColor White
        Write-Host "   🎨 Archivos CSS: $($cssFiles.Count)" -ForegroundColor White
    } else {
        Write-Host "❌ Carpeta assets NO encontrada" -ForegroundColor Red
    }
    
    # Mostrar tamaño del build
    $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
    $distSizeMB = [math]::Round($distSize / 1MB, 2)
    Write-Host "📊 Tamaño total del build: $distSizeMB MB" -ForegroundColor Cyan
    
} else {
    Write-Host "❌ Build FALLÓ - Carpeta dist no creada" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📂 ARCHIVOS LISTOS PARA SUBIR A MARVERA.MX:" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Carpeta: /dist" -ForegroundColor Yellow
Get-ChildItem -Path "dist" -Recurse -Name | ForEach-Object {
    Write-Host "   📄 $_" -ForegroundColor White
}

Write-Host ""
Write-Host "🚀 INSTRUCCIONES DE DEPLOYMENT:" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host "1. Subir TODO el contenido de /dist a marvera.mx" -ForegroundColor White
Write-Host "2. Configurar nginx/apache para servir desde esa carpeta" -ForegroundColor White
Write-Host "3. Configurar proxy /api/* -> localhost:3001" -ForegroundColor White
Write-Host "4. Instalar y configurar backend en servidor" -ForegroundColor White
Write-Host ""
Write-Host "✅ BUILD LISTO PARA PRODUCCIÓN" -ForegroundColor Green
