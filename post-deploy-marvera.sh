#!/bin/bash
# =============================================================================
# SCRIPT POST-DEPLOYMENT PARA MARVERA.MX
# =============================================================================
# Ejecutar después de subir los archivos del frontend y backend
# Uso: bash post-deploy-marvera.sh
# =============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_PATH="/var/www/marvera.mx"
BACKEND_PATH="$PROJECT_PATH/backend"
FRONTEND_PATH="$PROJECT_PATH/dist"

echo -e "${CYAN}🚀 POST-DEPLOYMENT MARVERA.MX${NC}"
echo -e "${CYAN}=============================${NC}"
echo ""

# Verificar permisos de root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ Este script debe ejecutarse como root (sudo)${NC}"
   exit 1
fi

# =============================================================================
# 1. VERIFICAR ARCHIVOS
# =============================================================================
echo -e "${BLUE}📁 Verificando archivos...${NC}"

if [ ! -f "$FRONTEND_PATH/index.html" ]; then
    echo -e "${RED}❌ No se encontró index.html en $FRONTEND_PATH${NC}"
    echo -e "${YELLOW}   Asegúrate de subir el contenido de tu carpeta /dist${NC}"
    exit 1
fi

if [ ! -f "$BACKEND_PATH/simple-server.js" ]; then
    echo -e "${RED}❌ No se encontró simple-server.js en $BACKEND_PATH${NC}"
    echo -e "${YELLOW}   Asegúrate de subir tu carpeta /backend completa${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Archivos encontrados${NC}"

# =============================================================================
# 2. INSTALAR DEPENDENCIAS DEL BACKEND
# =============================================================================
echo -e "${BLUE}📦 Instalando dependencias del backend...${NC}"

cd $BACKEND_PATH

if [ -f "package.json" ]; then
    npm install --production
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
else
    echo -e "${RED}❌ No se encontró package.json en el backend${NC}"
    exit 1
fi

# =============================================================================
# 3. CONFIGURAR BASE DE DATOS
# =============================================================================
echo -e "${BLUE}🗄️ Configurando base de datos...${NC}"

if [ -f "create-admin.js" ]; then
    echo -e "${YELLOW}👤 Creando usuario administrador...${NC}"
    node create-admin.js
    echo -e "${GREEN}✅ Usuario admin creado: admin@marvera.com / admin123456${NC}"
else
    echo -e "${YELLOW}⚠️ No se encontró create-admin.js${NC}"
fi

# =============================================================================
# 4. CONFIGURAR PERMISOS
# =============================================================================
echo -e "${BLUE}🔐 Configurando permisos...${NC}"

cd $PROJECT_PATH
chown -R www-data:www-data .
chmod -R 755 .

# Permisos especiales para la base de datos
if [ -f "$BACKEND_PATH/prisma/dev.db" ]; then
    chmod 664 $BACKEND_PATH/prisma/dev.db
    chown www-data:www-data $BACKEND_PATH/prisma/dev.db
fi

echo -e "${GREEN}✅ Permisos configurados${NC}"

# =============================================================================
# 5. INICIAR/REINICIAR SERVICIOS
# =============================================================================
echo -e "${BLUE}🔄 Iniciando servicios...${NC}"

# Detener PM2 si está corriendo
pm2 stop marvera-api 2>/dev/null || true
pm2 delete marvera-api 2>/dev/null || true

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save

echo -e "${GREEN}✅ Backend iniciado con PM2${NC}"

# Reiniciar nginx
systemctl restart nginx
echo -e "${GREEN}✅ nginx reiniciado${NC}"

# =============================================================================
# 6. VERIFICAR SERVICIOS
# =============================================================================
echo -e "${BLUE}🔍 Verificando servicios...${NC}"

# Verificar PM2
if pm2 show marvera-api > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PM2: marvera-api está corriendo${NC}"
else
    echo -e "${RED}❌ PM2: Error con marvera-api${NC}"
fi

# Verificar nginx
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ nginx está corriendo${NC}"
else
    echo -e "${RED}❌ nginx no está corriendo${NC}"
fi

# =============================================================================
# 7. PROBAR ENDPOINTS
# =============================================================================
echo -e "${BLUE}🧪 Probando endpoints...${NC}"

sleep 3  # Esperar a que el servidor inicie

# Probar API Health
if curl -f -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${GREEN}✅ API Health: Funcionando${NC}"
else
    echo -e "${RED}❌ API Health: No responde${NC}"
fi

# Probar productos
if curl -f -s http://localhost:3001/api/products/featured > /dev/null; then
    echo -e "${GREEN}✅ API Products: Funcionando${NC}"
else
    echo -e "${YELLOW}⚠️ API Products: Verificar más tarde${NC}"
fi

# Probar página principal
if curl -f -s http://localhost/ > /dev/null; then
    echo -e "${GREEN}✅ Frontend: Funcionando${NC}"
else
    echo -e "${YELLOW}⚠️ Frontend: Verificar configuración${NC}"
fi

# =============================================================================
# 8. CONFIGURAR SSL (OPCIONAL)
# =============================================================================
echo ""
echo -e "${YELLOW}🔒 ¿Configurar SSL automáticamente? (y/n)${NC}"
read -p "Respuesta: " ssl_choice

if [[ $ssl_choice =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🔒 Configurando SSL con Let's Encrypt...${NC}"
    
    # Verificar que el dominio apunte al servidor
    if dig +short marvera.mx | grep -q "$(curl -s ifconfig.me)"; then
        certbot --nginx -d marvera.mx -d www.marvera.mx --non-interactive --agree-tos --email admin@marvera.mx
        echo -e "${GREEN}✅ SSL configurado exitosamente${NC}"
    else
        echo -e "${YELLOW}⚠️ El dominio no apunta a este servidor. Configurar SSL manualmente más tarde.${NC}"
    fi
else
    echo -e "${YELLOW}ℹ️ SSL no configurado. Para configurar más tarde:${NC}"
    echo -e "   certbot --nginx -d marvera.mx -d www.marvera.mx"
fi

# =============================================================================
# 9. MOSTRAR INFORMACIÓN FINAL
# =============================================================================
echo ""
echo -e "${CYAN}🎉 DEPLOYMENT COMPLETADO${NC}"
echo -e "${CYAN}=======================${NC}"
echo ""
echo -e "${GREEN}✅ MarVera está funcionando:${NC}"
echo -e "   🌐 Sitio web: http://marvera.mx"
echo -e "   🔗 API Health: http://marvera.mx/api/health"
echo -e "   🔐 Login: http://marvera.mx/login"
echo -e "   ⚙️ Admin: http://marvera.mx/admin"
echo ""
echo -e "${YELLOW}👤 Credenciales de administrador:${NC}"
echo -e "   📧 Email: admin@marvera.com"
echo -e "   🔑 Password: admin123456"
echo ""
echo -e "${BLUE}📊 Comandos útiles:${NC}"
echo -e "   pm2 status                    # Ver estado de la aplicación"
echo -e "   pm2 logs marvera-api          # Ver logs de la aplicación"
echo -e "   pm2 restart marvera-api       # Reiniciar aplicación"
echo -e "   systemctl status nginx        # Ver estado de nginx"
echo -e "   tail -f /var/log/nginx/marvera.mx.error.log  # Ver logs de nginx"
echo ""
echo -e "${GREEN}🚀 ¡MarVera está listo para usar!${NC}"
