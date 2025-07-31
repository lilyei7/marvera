# Script para corregir todos los puertos de una vez
Write-Host "🔧 CORRIGIENDO TODOS LOS PUERTOS A 3001" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

$filesToFix = @(
    "src\components\admin\CategoryManager.tsx",
    "src\store\slices\branchSlice.ts", 
    "src\components\admin\ProductsAdmin.tsx",
    "src\components\admin\WholesaleManager.tsx",
    "src\components\admin\ProductsManager.tsx",
    "src\components\admin\FeaturedProductsAdmin.tsx",
    "src\components\admin\CategoryManagerNew.tsx"
)

foreach ($file in $filesToFix) {
    if (Test-Path $file) {
        Write-Host "🔧 Corrigiendo: $file" -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw
        
        # Reemplazar las referencias incorrectas
        $content = $content -replace "import\.meta\.env\.VITE_API_URL \|\| 'http://localhost:5173'", "import.meta.env.DEV ? 'http://localhost:3001' : 'https://marvera.mx'"
        $content = $content -replace "import\.meta\.env\.VITE_API_URL \|\| 'http://localhost:3000'", "import.meta.env.DEV ? 'http://localhost:3001' : 'https://marvera.mx'"
        
        Set-Content $file -Value $content -NoNewline
        Write-Host "✅ Corregido: $file" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No encontrado: $file" -ForegroundColor Orange
    }
}

Write-Host ""
Write-Host "🔍 Verificando archivos..." -ForegroundColor Yellow

$apiConfig = Get-Content "src\config\apiConfig.ts" -Raw
if ($apiConfig -match "localhost:3001") {
    Write-Host "✅ apiConfig.ts: Puerto 3001 ✓" -ForegroundColor Green
} else {
    Write-Host "❌ apiConfig.ts: Puerto incorrecto" -ForegroundColor Red
}

$envLocal = Get-Content ".env.local" -Raw
if ($envLocal -match "localhost:3001") {
    Write-Host "✅ .env.local: Puerto 3001 ✓" -ForegroundColor Green
} else {
    Write-Host "❌ .env.local: Puerto incorrecto" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 TODOS LOS PUERTOS CORREGIDOS A 3001" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
