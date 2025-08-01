# 🌊 MARVERA - Script PowerShell para corregir localhost
# Ejecutar desde PowerShell en el directorio del proyecto

Write-Host "🔧 Corrección localhost → marvera.mx" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Verificar si estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ No se encuentra package.json. Ejecuta desde el directorio raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Crear backup
$backupDir = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "📦 Creando backup en: $backupDir" -ForegroundColor Yellow
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
if (Test-Path "src") { Copy-Item -Path "src" -Destination "$backupDir\src-backup" -Recurse -Force }
if (Test-Path "dist") { Copy-Item -Path "dist" -Destination "$backupDir\dist-backup" -Recurse -Force }

# Función para reemplazar texto en archivos
function Replace-InFiles {
    param(
        [string]$Pattern,
        [string]$Replacement,
        [string]$Description
    )
    
    Write-Host "🔄 $Description" -ForegroundColor Green
    
    # Buscar archivos TypeScript/JavaScript en src/
    if (Test-Path "src") {
        Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | ForEach-Object {
            $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
            if ($content -and $content.Contains($Pattern)) {
                $newContent = $content -replace [regex]::Escape($Pattern), $Replacement
                Set-Content -Path $_.FullName -Value $newContent -NoNewline
                Write-Host "  ✓ Actualizado: $($_.Name)" -ForegroundColor Gray
            }
        }
    }
    
    # Buscar archivos compilados en dist/
    if (Test-Path "dist") {
        Get-ChildItem -Path "dist" -Recurse -Include "*.js", "*.css", "*.html" | ForEach-Object {
            $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
            if ($content -and $content.Contains($Pattern)) {
                $newContent = $content -replace [regex]::Escape($Pattern), $Replacement
                Set-Content -Path $_.FullName -Value $newContent -NoNewline
                Write-Host "  ✓ Actualizado: $($_.Name)" -ForegroundColor Gray
            }
        }
    }
}

# Reemplazar diferentes patrones de localhost
Replace-InFiles "http://localhost:3001" "https://marvera.mx" "http://localhost:3001 → https://marvera.mx"
Replace-InFiles "https://localhost:3001" "https://marvera.mx" "https://localhost:3001 → https://marvera.mx"
Replace-InFiles "localhost:3001" "marvera.mx" "localhost:3001 → marvera.mx"
Replace-InFiles "http://localhost:5173" "https://marvera.mx" "http://localhost:5173 → https://marvera.mx"
Replace-InFiles "localhost:5173" "marvera.mx" "localhost:5173 → marvera.mx"

# Crear/actualizar environment.ts
$envPath = "src\config\environment.ts"
Write-Host "📝 Actualizando $envPath..." -ForegroundColor Yellow

if (-not (Test-Path "src\config")) {
    New-Item -ItemType Directory -Path "src\config" -Force | Out-Null
}

$envContent = @'
const isDevelopment = import.meta.env.DEV;

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001' 
  : 'https://marvera.mx';

export const API_ENDPOINTS = {
  // Auth endpoints
  login: `${API_BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/api/auth/register`,
  logout: `${API_BASE_URL}/api/auth/logout`,
  
  // Product endpoints
  products: `${API_BASE_URL}/api/products`,
  productsFeatured: `${API_BASE_URL}/api/products/featured`,
  
  // User endpoints
  userProfile: `${API_BASE_URL}/api/user/profile`,
  
  // Admin endpoints
  adminProducts: `${API_BASE_URL}/api/admin/products`,
  
  // Wholesale endpoints
  wholesaleProducts: `${API_BASE_URL}/api/wholesale-products`,
};

export const isProduction = !isDevelopment;
export const isDev = isDevelopment;
'@

Set-Content -Path $envPath -Value $envContent -NoNewline

# Limpiar y recompilar
Write-Host "🧹 Limpiando build anterior..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item -Path "dist" -Recurse -Force }

Write-Host "🔨 Recompilando proyecto..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
$env:VITE_API_URL = "https://marvera.mx/api"

try {
    & npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Compilación exitosa!" -ForegroundColor Green
        
        # Verificar localhost en el nuevo build
        $localhostCount = 0
        if (Test-Path "dist") {
            Get-ChildItem -Path "dist" -Recurse -Include "*.js", "*.css", "*.html" | ForEach-Object {
                $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
                if ($content -and $content.Contains("localhost")) {
                    $localhostCount++
                }
            }
        }
        
        if ($localhostCount -eq 0) {
            Write-Host "✨ ¡Build limpio! No hay referencias de localhost en dist/" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Aún hay $localhostCount archivos con referencias de localhost" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Error en la compilación" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error ejecutando npm run build: $_" -ForegroundColor Red
    exit 1
}

# Mostrar comandos para el servidor
Write-Host ""
Write-Host "🚀 COMANDOS PARA EL SERVIDOR:" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "# Copiar estos archivos al servidor y ejecutar:" -ForegroundColor White
Write-Host "sudo cp -r dist/* /var/www/marvera.mx/" -ForegroundColor Yellow
Write-Host "sudo systemctl reload nginx" -ForegroundColor Yellow
Write-Host "pm2 restart marvera-api" -ForegroundColor Yellow
Write-Host ""

Write-Host "📋 RESUMEN:" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
Write-Host "✅ Backup creado en: $backupDir" -ForegroundColor Green
Write-Host "✅ Referencias localhost corregidas" -ForegroundColor Green
Write-Host "✅ Proyecto recompilado" -ForegroundColor Green
Write-Host "✅ Listo para despliegue" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Ahora puedes subir la carpeta 'dist' a tu servidor!" -ForegroundColor Cyan
