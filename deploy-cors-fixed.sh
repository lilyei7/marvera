#!/bin/bash
# 🌊 MARVERA - Script de despliegue completo con correcciones CORS

echo "🚀 DESPLIEGUE COMPLETO DE MARVERA"
echo "================================="

# 1. Subir frontend corregido
echo "📤 Subiendo frontend..."
scp -r dist/* root@srv936134.hstgr.cloud:/var/www/marvera.mx/

# 2. Subir backend corregido
echo "📤 Subiendo backend..."
scp -r backend/dist/* root@srv936134.hstgr.cloud:/var/www/marvera.mx/backend/dist/
scp backend/.env root@srv936134.hstgr.cloud:/var/www/marvera.mx/backend/

# 3. Conectar al servidor y reiniciar servicios
echo "🔄 Conectando al servidor para reiniciar servicios..."
ssh root@srv936134.hstgr.cloud << 'EOF'
# Configurar permisos
sudo chown -R www-data:www-data /var/www/marvera.mx
sudo chmod -R 755 /var/www/marvera.mx

# Reiniciar PM2
cd /var/www/marvera.mx
pm2 restart all

# Reiniciar nginx
sudo systemctl reload nginx

# Verificar estado
echo "📊 Estado de los servicios:"
pm2 status
echo ""
echo "🌐 Probando endpoints:"
curl -s http://localhost:3001/api/health || echo "❌ Backend no responde"
curl -s http://localhost || echo "❌ Frontend no responde"

echo ""
echo "✅ Despliegue completado!"
echo "🌐 Sitio: https://marvera.mx"
echo "🔐 Login: https://marvera.mx/login"
echo "⚙️ Admin: https://marvera.mx/admin"
EOF

echo ""
echo "🎯 PRÓXIMOS PASOS:"
echo "1. Visitar: https://marvera.mx"
echo "2. Probar login con: admin@marvera.com / admin123"
echo "3. Verificar que no hay errores CORS en la consola"
