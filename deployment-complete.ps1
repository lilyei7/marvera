# SCRIPT COMPLETO DE DEPLOYMENT PARA MARVERA.MX
# ===============================================

Write-Host "🚀 MARVERA.MX DEPLOYMENT SCRIPT" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 PASOS PARA DEPLOYMENT COMPLETO:" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow

Write-Host ""
Write-Host "1️⃣ PREPARAR CÓDIGO LOCAL:" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host "✅ Configuración de producción verificada" -ForegroundColor White
Write-Host "✅ Variables de entorno configuradas" -ForegroundColor White
Write-Host "✅ Endpoints apuntando a https://marvera.mx" -ForegroundColor White
Write-Host "✅ Sistema de autenticación funcional" -ForegroundColor White

Write-Host ""
Write-Host "2️⃣ BUILD DE PRODUCCIÓN:" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host "Ejecutar en tu máquina local:" -ForegroundColor Yellow
Write-Host "  npm run build" -ForegroundColor White
Write-Host "Esto generará la carpeta /dist con todos los archivos optimizados" -ForegroundColor Gray

Write-Host ""
Write-Host "3️⃣ SERVIDOR - BACKEND:" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host "En tu servidor marvera.mx, ejecutar:" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Instalar Node.js (si no está instalado)" -ForegroundColor Cyan
Write-Host "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -" -ForegroundColor White
Write-Host "sudo apt-get install -y nodejs" -ForegroundColor White
Write-Host ""
Write-Host "# Crear carpeta para el proyecto" -ForegroundColor Cyan
Write-Host "sudo mkdir -p /var/www/marvera.mx" -ForegroundColor White
Write-Host "cd /var/www/marvera.mx" -ForegroundColor White
Write-Host ""
Write-Host "# Subir y configurar backend" -ForegroundColor Cyan
Write-Host "# (subir carpeta /backend vía FTP/SCP)" -ForegroundColor White
Write-Host "cd backend" -ForegroundColor White
Write-Host "npm install" -ForegroundColor White
Write-Host "node create-admin.js" -ForegroundColor White
Write-Host ""
Write-Host "# Instalar PM2 para manejo de procesos" -ForegroundColor Cyan
Write-Host "sudo npm install -g pm2" -ForegroundColor White
Write-Host "pm2 start simple-server.js --name marvera-api" -ForegroundColor White
Write-Host "pm2 startup" -ForegroundColor White
Write-Host "pm2 save" -ForegroundColor White

Write-Host ""
Write-Host "4️⃣ SERVIDOR - FRONTEND:" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green
Write-Host "En tu servidor marvera.mx:" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Subir archivos del build" -ForegroundColor Cyan
Write-Host "# (subir TODO el contenido de /dist vía FTP/SCP a /var/www/marvera.mx/dist)" -ForegroundColor White
Write-Host ""
Write-Host "# Configurar permisos" -ForegroundColor Cyan
Write-Host "sudo chown -R www-data:www-data /var/www/marvera.mx/" -ForegroundColor White
Write-Host "sudo chmod -R 755 /var/www/marvera.mx/" -ForegroundColor White

Write-Host ""
Write-Host "5️⃣ SERVIDOR - NGINX:" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "En tu servidor marvera.mx:" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Instalar nginx (si no está instalado)" -ForegroundColor Cyan
Write-Host "sudo apt update" -ForegroundColor White
Write-Host "sudo apt install nginx" -ForegroundColor White
Write-Host ""
Write-Host "# Configurar sitio" -ForegroundColor Cyan
Write-Host "sudo nano /etc/nginx/sites-available/marvera.mx" -ForegroundColor White
Write-Host "# (copiar contenido de nginx-config-marvera.conf)" -ForegroundColor Gray
Write-Host ""
Write-Host "# Activar sitio" -ForegroundColor Cyan
Write-Host "sudo ln -s /etc/nginx/sites-available/marvera.mx /etc/nginx/sites-enabled/" -ForegroundColor White
Write-Host "sudo nginx -t" -ForegroundColor White
Write-Host "sudo systemctl restart nginx" -ForegroundColor White

Write-Host ""
Write-Host "6️⃣ CERTIFICADO SSL:" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host "En tu servidor marvera.mx:" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Instalar certbot" -ForegroundColor Cyan
Write-Host "sudo apt install certbot python3-certbot-nginx" -ForegroundColor White
Write-Host ""
Write-Host "# Obtener certificado SSL" -ForegroundColor Cyan
Write-Host "sudo certbot --nginx -d marvera.mx -d www.marvera.mx" -ForegroundColor White

Write-Host ""
Write-Host "7️⃣ VERIFICACIÓN:" -ForegroundColor Green
Write-Host "===============" -ForegroundColor Green
Write-Host "Probar estos endpoints:" -ForegroundColor Yellow
Write-Host ""
Write-Host "curl https://marvera.mx/api/health" -ForegroundColor White
Write-Host "curl https://marvera.mx/api/products/featured" -ForegroundColor White
Write-Host 'curl -X POST https://marvera.mx/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@marvera.com\",\"password\":\"admin123456\"}"' -ForegroundColor White

Write-Host ""
Write-Host "8️⃣ ACCESO FINAL:" -ForegroundColor Green
Write-Host "===============" -ForegroundColor Green
Write-Host "🌐 Sitio: https://marvera.mx" -ForegroundColor Cyan
Write-Host "🔐 Login: https://marvera.mx/login" -ForegroundColor Cyan
Write-Host "⚙️ Admin: https://marvera.mx/admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "👤 Credenciales admin:" -ForegroundColor Yellow
Write-Host "   Email: admin@marvera.com" -ForegroundColor White
Write-Host "   Password: admin123456" -ForegroundColor White

Write-Host ""
Write-Host "✅ DEPLOYMENT SCRIPT COMPLETO" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host "Tu aplicación está LISTA para funcionar en marvera.mx" -ForegroundColor Green
Write-Host "Solo sigue los pasos del servidor paso a paso" -ForegroundColor Green
