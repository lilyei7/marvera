# Script simple para corregir IP
Write-Host "Corrigiendo IP en archivos principales..."

# Archivos críticos para corregir
$criticalFiles = @(
    "backend\src\index.ts",
    "backend\simple-server.js", 
    "backend\production-server.js",
    "backend\quick-server.js",
    "src\config\serverConfig.ts",
    ".env.local.dev"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "Corrigiendo: $file"
        (Get-Content $file) -replace "187\.33\.155\.127", "148.230.87.198" | Set-Content $file
    }
}

Write-Host "IP corregida en archivos críticos!"
