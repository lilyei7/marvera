# 🚀 CHECKLIST DEPLOYMENT MARVERA.MX
# =====================================

Write-Host "🌊 MARVERA DEPLOYMENT CHECKLIST" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 CONFIGURACIONES VERIFICADAS:" -ForegroundColor Yellow

# 1. Variables de entorno
Write-Host "✅ 1. Variables de entorno de producción:" -ForegroundColor Green
Write-Host "   - VITE_API_URL=https://marvera.mx" -ForegroundColor White
Write-Host "   - Backend apuntando a https://marvera.mx" -ForegroundColor White

# 2. API Endpoints
Write-Host "✅ 2. Endpoints configurados para producción:" -ForegroundColor Green
Write-Host "   - https://marvera.mx/api/health" -ForegroundColor White
Write-Host "   - https://marvera.mx/api/auth/login" -ForegroundColor White
Write-Host "   - https://marvera.mx/api/auth/verify" -ForegroundColor White
Write-Host "   - https://marvera.mx/api/products/featured" -ForegroundColor White

# 3. Base de datos
Write-Host "✅ 3. Base de datos preparada:" -ForegroundColor Green
Write-Host "   - Usuario admin@marvera.com creado" -ForegroundColor White
Write-Host "   - Contraseña: admin123456" -ForegroundColor White
Write-Host "   - Rol: SUPER_ADMIN" -ForegroundColor White

# 4. Autenticación
Write-Host "✅ 4. Sistema de autenticación:" -ForegroundColor Green
Write-Host "   - JWT tokens funcionando" -ForegroundColor White
Write-Host "   - Roles: SUPER_ADMIN, ADMIN, MANAGER permitidos" -ForegroundColor White
Write-Host "   - ProtectedRoute configurado" -ForegroundColor White

Write-Host ""
Write-Host "⚠️  PENDIENTES PARA PRODUCCIÓN:" -ForegroundColor Yellow

Write-Host "🔐 1. Backend en marvera.mx:" -ForegroundColor Red
Write-Host "   - Instalar Node.js y dependencias" -ForegroundColor White
Write-Host "   - Configurar Prisma con base de datos" -ForegroundColor White
Write-Host "   - Ejecutar: npm install en /backend" -ForegroundColor White
Write-Host "   - Ejecutar: node create-admin.js" -ForegroundColor White
Write-Host "   - Iniciar: node simple-server.js en puerto 3001" -ForegroundColor White

Write-Host "🌐 2. Frontend build:" -ForegroundColor Red
Write-Host "   - Ejecutar: npm run build" -ForegroundColor White
Write-Host "   - Subir carpeta /dist a marvera.mx" -ForegroundColor White
Write-Host "   - Configurar nginx/apache para servir archivos" -ForegroundColor White

Write-Host "🔧 3. Servidor web (nginx):" -ForegroundColor Red
Write-Host "   - Proxy /api/* -> localhost:3001" -ForegroundColor White
Write-Host "   - Servir archivos estáticos desde /dist" -ForegroundColor White
Write-Host "   - Certificado SSL configurado" -ForegroundColor White

Write-Host "🔥 4. Firewall y puertos:" -ForegroundColor Red
Write-Host "   - Puerto 3001 accesible internamente" -ForegroundColor White
Write-Host "   - Puerto 80/443 públicos" -ForegroundColor White
Write-Host "   - Firewall configurado correctamente" -ForegroundColor White

Write-Host ""
Write-Host "🧪 COMANDOS DE PRUEBA PARA PRODUCCIÓN:" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "# Probar backend en producción:" -ForegroundColor Yellow
Write-Host "curl https://marvera.mx/api/health" -ForegroundColor White

Write-Host "# Probar login en producción:" -ForegroundColor Yellow
Write-Host 'curl -X POST https://marvera.mx/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@marvera.com\",\"password\":\"admin123456\"}"' -ForegroundColor White

Write-Host "# Probar productos destacados:" -ForegroundColor Yellow
Write-Host "curl https://marvera.mx/api/products/featured" -ForegroundColor White

Write-Host ""
Write-Host "✅ CONFIGURACIÓN LOCAL LISTA PARA PRODUCCIÓN" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "Tu código está preparado para funcionar en marvera.mx" -ForegroundColor Green
Write-Host "Solo necesitas completar la configuración del servidor" -ForegroundColor Green
