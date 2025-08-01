# SOLUCIÓN PARA ERROR 500 EN MARVERA.MX
# ======================================

Write-Host "🔧 SOLUCIÓN ERROR 500 MARVERA.MX" -ForegroundColor Red
Write-Host "=================================" -ForegroundColor Red

Write-Host ""
Write-Host "📊 DIAGNÓSTICO ACTUAL:" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow
Write-Host "✅ API funcionando: https://marvera.mx/api/health (Status 200)" -ForegroundColor Green
Write-Host "❌ Frontend fallando: https://marvera.mx (Error 500)" -ForegroundColor Red

Write-Host ""
Write-Host "🎯 PROBLEMA IDENTIFICADO:" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "El backend Node.js está corriendo correctamente" -ForegroundColor White
Write-Host "El problema está en la configuración del servidor web" -ForegroundColor White
Write-Host "para servir los archivos estáticos del frontend" -ForegroundColor White

Write-Host ""
Write-Host "🔧 SOLUCIONES A EJECUTAR EN EL SERVIDOR:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

Write-Host ""
Write-Host "1️⃣ VERIFICAR ARCHIVOS DEL FRONTEND:" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host "# Conectarse al servidor y verificar:" -ForegroundColor Cyan
Write-Host "ls -la /var/www/marvera.mx/dist/" -ForegroundColor White
Write-Host "# Debe existir index.html y carpeta assets/" -ForegroundColor Gray

Write-Host ""
Write-Host "2️⃣ VERIFICAR PERMISOS:" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host "sudo chown -R www-data:www-data /var/www/marvera.mx/" -ForegroundColor White
Write-Host "sudo chmod -R 755 /var/www/marvera.mx/" -ForegroundColor White

Write-Host ""
Write-Host "3️⃣ VERIFICAR CONFIGURACIÓN NGINX:" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host "sudo nginx -t" -ForegroundColor White
Write-Host "# Si hay errores, revisar /etc/nginx/sites-available/marvera.mx" -ForegroundColor Gray

Write-Host ""
Write-Host "4️⃣ VER LOGS DE ERROR:" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host "sudo tail -f /var/log/nginx/marvera.mx.error.log" -ForegroundColor White
Write-Host "# Esto mostrará el error específico" -ForegroundColor Gray

Write-Host ""
Write-Host "5️⃣ CONFIGURACIÓN NGINX SIMPLE (EMERGENCY):" -ForegroundColor Red
Write-Host "============================================" -ForegroundColor Red
Write-Host "Si la configuración está rota, usar esta versión mínima:" -ForegroundColor Yellow

$nginxConfig = @"
server {
    listen 80;
    server_name marvera.mx www.marvera.mx;
    root /var/www/marvera.mx/dist;
    index index.html;
    
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
    }
    
    location / {
        try_files `$uri `$uri/ /index.html;
    }
}
"@

Write-Host $nginxConfig -ForegroundColor White

Write-Host ""
Write-Host "6️⃣ COMANDOS DE REINICIO:" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host "sudo systemctl restart nginx" -ForegroundColor White
Write-Host "sudo systemctl status nginx" -ForegroundColor White

Write-Host ""
Write-Host "📱 VERIFICACIÓN RÁPIDA:" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host "Después de los cambios, probar:" -ForegroundColor Yellow
Write-Host "curl -I http://marvera.mx" -ForegroundColor White
Write-Host "curl -I https://marvera.mx" -ForegroundColor White

Write-Host ""
Write-Host "🆘 SI NADA FUNCIONA - PLAN B:" -ForegroundColor Red
Write-Host "=============================" -ForegroundColor Red
Write-Host "1. Crear carpeta temporal:" -ForegroundColor White
Write-Host "   mkdir -p /var/www/marvera.mx/temp" -ForegroundColor Gray
Write-Host "2. Crear index.html simple:" -ForegroundColor White
Write-Host "   echo '<h1>MarVera Works!</h1>' > /var/www/marvera.mx/temp/index.html" -ForegroundColor Gray
Write-Host "3. Cambiar root temporalmente a /var/www/marvera.mx/temp" -ForegroundColor White
Write-Host "4. Si funciona, el problema son los archivos del build" -ForegroundColor White

Write-Host ""
Write-Host "✅ ARCHIVOS DE AYUDA CREADOS:" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host "📄 nginx-config-marvera.conf - Configuración nginx completa" -ForegroundColor White
Write-Host "📄 deployment-complete.ps1 - Guía paso a paso" -ForegroundColor White
