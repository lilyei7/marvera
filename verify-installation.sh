#!/bin/bash

# Script de verificación post-instalación
# Verificar que MarVera esté funcionando correctamente

echo "🔍 Verificando instalación de MarVera..."
echo "======================================"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_service() {
    if systemctl is-active --quiet $1; then
        echo -e "✅ $1: ${GREEN}Activo${NC}"
    else
        echo -e "❌ $1: ${RED}Inactivo${NC}"
    fi
}

check_port() {
    if netstat -tuln | grep -q ":$1 "; then
        echo -e "✅ Puerto $1: ${GREEN}Abierto${NC}"
    else
        echo -e "❌ Puerto $1: ${RED}Cerrado${NC}"
    fi
}

check_url() {
    if curl -s -o /dev/null -w "%{http_code}" "$1" | grep -q "200\|301\|302"; then
        echo -e "✅ URL $1: ${GREEN}Responde${NC}"
    else
        echo -e "❌ URL $1: ${RED}No responde${NC}"
    fi
}

echo "📊 Estado de servicios:"
check_service "nginx"
check_service "postgresql"

echo ""
echo "🔌 Estado de puertos:"
check_port "80"
check_port "443"
check_port "3001"

echo ""
echo "🌐 Verificando URLs:"
check_url "http://marvera.mx"
check_url "https://marvera.mx"
check_url "https://marvera.mx/api/health"

echo ""
echo "📱 Estado de PM2:"
sudo -u marvera pm2 status

echo ""
echo "🔒 Certificados SSL:"
certbot certificates

echo ""
echo "💾 Espacio en disco:"
df -h /

echo ""
echo "🔍 Últimas líneas del log de Nginx:"
tail -5 /var/log/nginx/marvera_error.log

echo ""
echo "🔍 Últimas líneas del log de la aplicación:"
sudo -u marvera pm2 logs marvera-backend --lines 5

echo ""
echo "✅ Verificación completada"
