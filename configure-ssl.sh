#!/bin/bash
# =============================================================================
# SCRIPT DE CONFIGURACIÓN SSL PARA MARVERA.MX
# =============================================================================
# Este script instala Certbot y configura SSL con redirecciones automáticas
# Ejecutar como: sudo bash configure-ssl.sh
# =============================================================================

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Variables de configuración
DOMAIN="marvera.mx"
PROJECT_PATH="/var/www/marvera.mx"
NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN"
EMAIL="admin@marvera.mx"  # Cambiar por tu email real

echo -e "${CYAN}🔒 CONFIGURACIÓN SSL PARA MARVERA.MX${NC}"
echo -e "${CYAN}==================================${NC}"
echo ""

# =============================================================================
# 1. VERIFICAR PERMISOS DE ROOT
# =============================================================================
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ Este script debe ejecutarse como root (sudo)${NC}"
   exit 1
fi

echo -e "${GREEN}✅ Permisos de root verificados${NC}"

# =============================================================================
# 2. INSTALAR CERTBOT
# =============================================================================
echo -e "${BLUE}📦 Instalando Certbot...${NC}"

# Actualizar repositorios
apt update -y

# Instalar snapd si no está instalado
if ! command -v snap &> /dev/null; then
    echo -e "${YELLOW}🔧 Instalando snapd...${NC}"
    apt install snapd -y
    systemctl enable snapd
    systemctl start snapd
fi

# Remover certbot instalado con apt si existe
apt remove certbot python3-certbot-nginx -y 2>/dev/null || true

# Instalar certbot con snap (método recomendado)
echo -e "${YELLOW}🔧 Instalando Certbot con snap...${NC}"
snap install core; snap refresh core
snap install --classic certbot

# Crear enlace simbólico
ln -sf /snap/bin/certbot /usr/bin/certbot

echo -e "${GREEN}✅ Certbot instalado exitosamente${NC}"

# =============================================================================
# 3. VERIFICAR QUE EL DOMINIO ESTÉ FUNCIONANDO
# =============================================================================
echo -e "${BLUE}🌐 Verificando configuración del dominio...${NC}"

# Verificar que nginx esté corriendo
if ! systemctl is-active --quiet nginx; then
    echo -e "${YELLOW}🔧 Iniciando nginx...${NC}"
    systemctl start nginx
fi

# Probar que el sitio responda
echo -e "${YELLOW}🔧 Probando conectividad del dominio...${NC}"
if curl -s -f "http://$DOMAIN" > /dev/null; then
    echo -e "${GREEN}✅ El dominio $DOMAIN está respondiendo${NC}"
else
    echo -e "${RED}❌ El dominio $DOMAIN no está respondiendo${NC}"
    echo -e "${YELLOW}⚠️ Asegúrate de que el DNS esté configurado correctamente${NC}"
    echo -e "${YELLOW}⚠️ Continuando con la configuración SSL...${NC}"
fi

# =============================================================================
# 4. CREAR CONFIGURACIÓN NGINX TEMPORAL PARA SSL
# =============================================================================
echo -e "${BLUE}🔧 Preparando configuración nginx para SSL...${NC}"

cat > $NGINX_CONFIG << 'EOF'
# Configuración nginx para MarVera.mx - Pre SSL
server {
    listen 80;
    server_name marvera.mx www.marvera.mx;
    
    # Root directory
    root /var/www/marvera.mx/dist;
    index index.html;
    
    # Logs
    access_log /var/log/nginx/marvera.mx.access.log;
    error_log /var/log/nginx/marvera.mx.error.log;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/marvera.mx;
        allow all;
    }
    
    # Headers de seguridad básicos
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Archivos estáticos con cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # API Routes - Proxy al backend Node.js
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS Headers para API
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization' always;
        
        # Timeout settings
        proxy_connect_timeout       60s;
        proxy_send_timeout          60s;
        proxy_read_timeout          60s;
    }
    
    # React Router - Todas las rutas van a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Archivos especiales
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }
    
    location = /robots.txt {
        log_not_found off;
        access_log off;
    }
}
EOF

# Verificar configuración
nginx -t
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Configuración nginx verificada${NC}"
    systemctl reload nginx
else
    echo -e "${RED}❌ Error en configuración nginx${NC}"
    exit 1
fi

# =============================================================================
# 5. CREAR DIRECTORIO PARA ACME CHALLENGE
# =============================================================================
echo -e "${BLUE}📁 Creando directorio para verificación SSL...${NC}"
mkdir -p /var/www/marvera.mx/.well-known/acme-challenge
chown -R www-data:www-data /var/www/marvera.mx/.well-known

# =============================================================================
# 6. OBTENER CERTIFICADO SSL
# =============================================================================
echo -e "${BLUE}🔒 Obteniendo certificado SSL...${NC}"
echo -e "${YELLOW}📧 Usando email: $EMAIL${NC}"
echo -e "${YELLOW}🌐 Dominios: $DOMAIN, www.$DOMAIN${NC}"

# Obtener certificado
certbot certonly \
    --nginx \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --expand

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificado SSL obtenido exitosamente${NC}"
else
    echo -e "${RED}❌ Error al obtener certificado SSL${NC}"
    echo -e "${YELLOW}💡 Verifica que el DNS esté configurado correctamente${NC}"
    exit 1
fi

# =============================================================================
# 7. CONFIGURAR NGINX CON SSL Y REDIRECCIONES
# =============================================================================
echo -e "${BLUE}🔧 Configurando nginx con SSL y redirecciones...${NC}"

cat > $NGINX_CONFIG << 'EOF'
# Configuración nginx para MarVera.mx - Con SSL
# Redirigir HTTP a HTTPS
server {
    listen 80;
    server_name marvera.mx www.marvera.mx;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/marvera.mx;
        allow all;
    }
    
    # Redirigir todo el tráfico HTTP a HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Redirigir www a dominio principal
server {
    listen 443 ssl http2;
    server_name www.marvera.mx;
    
    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/marvera.mx/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/marvera.mx/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # Redirigir www a dominio principal
    return 301 https://marvera.mx$request_uri;
}

# Configuración principal HTTPS
server {
    listen 443 ssl http2;
    server_name marvera.mx;
    
    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/marvera.mx/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/marvera.mx/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # Root directory
    root /var/www/marvera.mx/dist;
    index index.html;
    
    # Logs
    access_log /var/log/nginx/marvera.mx.access.log;
    error_log /var/log/nginx/marvera.mx.error.log;
    
    # Headers de seguridad avanzados
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Archivos estáticos con cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # API Routes - Proxy al backend Node.js
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS Headers para API
        add_header 'Access-Control-Allow-Origin' 'https://marvera.mx' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        # Timeout settings
        proxy_connect_timeout       60s;
        proxy_send_timeout          60s;
        proxy_read_timeout          60s;
    }
    
    # WebSocket support para Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # React Router - Todas las rutas van a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Archivos especiales
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }
    
    location = /robots.txt {
        log_not_found off;
        access_log off;
    }
    
    # Security headers para archivos específicos
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
}
EOF

# Verificar configuración
nginx -t
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Configuración nginx con SSL verificada${NC}"
else
    echo -e "${RED}❌ Error en configuración nginx con SSL${NC}"
    exit 1
fi

# =============================================================================
# 8. CONFIGURAR RENOVACIÓN AUTOMÁTICA
# =============================================================================
echo -e "${BLUE}🔄 Configurando renovación automática de SSL...${NC}"

# Crear script de renovación personalizado
cat > /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh << 'EOF'
#!/bin/bash
# Script de renovación para nginx
systemctl reload nginx
EOF

chmod +x /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh

# Probar renovación
echo -e "${YELLOW}🔧 Probando renovación de certificado...${NC}"
certbot renew --dry-run

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Renovación automática configurada correctamente${NC}"
else
    echo -e "${YELLOW}⚠️ Advertencia: Problema con la renovación automática${NC}"
fi

# =============================================================================
# 9. OPTIMIZAR CONFIGURACIÓN SSL
# =============================================================================
echo -e "${BLUE}⚡ Optimizando configuración SSL...${NC}"

# Generar parámetros DH más fuertes si no existen
if [ ! -f /etc/ssl/certs/dhparam.pem ]; then
    echo -e "${YELLOW}🔧 Generando parámetros DH (esto puede tomar unos minutos)...${NC}"
    openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
    echo -e "${GREEN}✅ Parámetros DH generados${NC}"
fi

# =============================================================================
# 10. REINICIAR SERVICIOS
# =============================================================================
echo -e "${BLUE}🔄 Reiniciando servicios...${NC}"

# Reiniciar nginx
systemctl restart nginx
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ nginx reiniciado exitosamente${NC}"
else
    echo -e "${RED}❌ Error al reiniciar nginx${NC}"
    systemctl status nginx
    exit 1
fi

# Reiniciar PM2 si está corriendo
if command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}🔧 Reiniciando aplicaciones PM2...${NC}"
    pm2 restart all 2>/dev/null || echo -e "${YELLOW}ℹ️ No hay aplicaciones PM2 corriendo${NC}"
fi

# =============================================================================
# 11. VERIFICAR CONFIGURACIÓN SSL
# =============================================================================
echo -e "${BLUE}✅ Verificando configuración SSL...${NC}"

sleep 5  # Esperar que nginx se estabilice

# Probar HTTPS
echo -e "${YELLOW}🔧 Probando conexión HTTPS...${NC}"
if curl -s -f "https://$DOMAIN" > /dev/null; then
    echo -e "${GREEN}✅ HTTPS funcionando correctamente${NC}"
else
    echo -e "${YELLOW}⚠️ Problema con HTTPS, verificando...${NC}"
fi

# Probar redirección HTTP a HTTPS
echo -e "${YELLOW}🔧 Probando redirección HTTP → HTTPS...${NC}"
HTTP_REDIRECT=$(curl -s -I "http://$DOMAIN" | grep -i "location: https")
if [ ! -z "$HTTP_REDIRECT" ]; then
    echo -e "${GREEN}✅ Redirección HTTP → HTTPS funcionando${NC}"
else
    echo -e "${YELLOW}⚠️ Problema con redirección HTTP → HTTPS${NC}"
fi

# Probar redirección www
echo -e "${YELLOW}🔧 Probando redirección www → dominio principal...${NC}"
WWW_REDIRECT=$(curl -s -I "https://www.$DOMAIN" | grep -i "location: https://$DOMAIN")
if [ ! -z "$WWW_REDIRECT" ]; then
    echo -e "${GREEN}✅ Redirección www → dominio principal funcionando${NC}"
else
    echo -e "${YELLOW}⚠️ Problema con redirección www${NC}"
fi

# =============================================================================
# 12. CREAR SCRIPT DE MONITOREO SSL
# =============================================================================
echo -e "${BLUE}📊 Creando script de monitoreo SSL...${NC}"

cat > /var/www/marvera.mx/ssl-check.sh << 'EOF'
#!/bin/bash
# Script de monitoreo SSL para MarVera

echo "🔒 ESTADO SSL DE MARVERA.MX"
echo "=========================="
echo ""

# Verificar certificado
echo "📋 Información del certificado:"
openssl x509 -in /etc/letsencrypt/live/marvera.mx/fullchain.pem -text -noout | grep -E "(Subject:|Issuer:|Not Before|Not After)"
echo ""

# Verificar días hasta expiración
EXPIRE_DATE=$(openssl x509 -in /etc/letsencrypt/live/marvera.mx/fullchain.pem -text -noout | grep "Not After" | cut -d: -f2-)
EXPIRE_TIMESTAMP=$(date -d "$EXPIRE_DATE" +%s)
NOW_TIMESTAMP=$(date +%s)
DAYS_LEFT=$(( ($EXPIRE_TIMESTAMP - $NOW_TIMESTAMP) / 86400 ))

echo "⏰ Días hasta expiración: $DAYS_LEFT"
if [ $DAYS_LEFT -lt 30 ]; then
    echo "⚠️ ADVERTENCIA: Certificado expira pronto"
else
    echo "✅ Certificado vigente"
fi
echo ""

# Probar conexiones
echo "🌐 Pruebas de conectividad:"
echo -n "HTTPS: "
if curl -s -f "https://marvera.mx" > /dev/null; then
    echo "✅ OK"
else
    echo "❌ FALLO"
fi

echo -n "Redirección HTTP: "
if curl -s -I "http://marvera.mx" | grep -i "location: https" > /dev/null; then
    echo "✅ OK"
else
    echo "❌ FALLO"
fi

echo -n "Redirección WWW: "
if curl -s -I "https://www.marvera.mx" | grep -i "location: https://marvera.mx" > /dev/null; then
    echo "✅ OK"
else
    echo "❌ FALLO"
fi

echo -n "API: "
if curl -s -f "https://marvera.mx/api/health" > /dev/null; then
    echo "✅ OK"
else
    echo "❌ FALLO"
fi

echo ""
echo "🔗 URLs disponibles:"
echo "   📱 Sitio web: https://marvera.mx"
echo "   🔗 API:       https://marvera.mx/api/health"
echo "   📊 SSL Test:  https://www.ssllabs.com/ssltest/analyze.html?d=marvera.mx"
EOF

chmod +x /var/www/marvera.mx/ssl-check.sh

# =============================================================================
# 13. MOSTRAR INFORMACIÓN FINAL
# =============================================================================
echo ""
echo -e "${CYAN}🎉 CONFIGURACIÓN SSL COMPLETADA${NC}"
echo -e "${CYAN}===============================${NC}"
echo ""
echo -e "${GREEN}✅ Certificado SSL instalado para:${NC}"
echo -e "   🌐 marvera.mx"
echo -e "   🌐 www.marvera.mx"
echo ""
echo -e "${GREEN}✅ Redirecciones configuradas:${NC}"
echo -e "   📡 HTTP → HTTPS automático"
echo -e "   📡 www.marvera.mx → marvera.mx"
echo ""
echo -e "${GREEN}✅ Servicios reiniciados:${NC}"
echo -e "   🌐 nginx"
echo -e "   🚀 PM2 (si estaba corriendo)"
echo ""
echo -e "${BLUE}🔗 URLs disponibles:${NC}"
echo -e "   🌐 Sitio: ${GREEN}https://marvera.mx${NC}"
echo -e "   🔗 API:   ${GREEN}https://marvera.mx/api/health${NC}"
echo ""
echo -e "${YELLOW}📋 Comandos útiles:${NC}"
echo -e "   🔍 Verificar SSL: ${CYAN}bash /var/www/marvera.mx/ssl-check.sh${NC}"
echo -e "   🔄 Renovar SSL:   ${CYAN}certbot renew${NC}"
echo -e "   📊 Estado nginx:  ${CYAN}systemctl status nginx${NC}"
echo ""
echo -e "${PURPLE}🔒 Renovación automática: ${GREEN}ACTIVADA${NC}"
echo -e "${PURPLE}📧 Email de notificaciones: ${GREEN}$EMAIL${NC}"
echo ""
echo -e "${GREEN}✅ MarVera ahora es accesible de forma segura via HTTPS!${NC}"
