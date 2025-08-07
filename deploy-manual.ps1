# Deploy manual simple
Write-Host "🚀 Iniciando deploy manual..." -ForegroundColor Cyan

# Comprimir archivos
Compress-Archive -Path "dist\*" -DestinationPath "marvera-deploy.zip" -Force
Write-Host "✅ Archivos comprimidos" -ForegroundColor Green

# Copiar al servidor usando plink/pscp si están disponibles
$scpCommand = "scp -i ~/.ssh/id_rsa marvera-deploy.zip root@209.38.251.88:/tmp/"
$sshCommand = "ssh -i ~/.ssh/id_rsa root@209.38.251.88 'cd /tmp && unzip -o marvera-deploy.zip -d /var/www/marvera/ && rm marvera-deploy.zip && systemctl reload nginx'"

Write-Host "📦 Archivo comprimido creado: marvera-deploy.zip" -ForegroundColor Yellow
Write-Host "🔧 Para completar el deploy, ejecuta estos comandos manualmente:" -ForegroundColor Yellow
Write-Host $scpCommand -ForegroundColor White
Write-Host $sshCommand -ForegroundColor White
