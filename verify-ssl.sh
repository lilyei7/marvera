#!/bin/bash
# =============================================================================
# SCRIPT DE VERIFICACIÓN POST-SSL PARA MARVERA.MX
# =============================================================================
# Este script verifica que SSL esté funcionando correctamente
# Ejecutar como: bash verify-ssl.sh
# =============================================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

DOMAIN="marvera.mx"

echo -e "${CYAN}🔍 VERIFICACIÓN SSL PARA MARVERA.MX${NC}"
echo -e "${CYAN}==================================${NC}"
echo ""

# =============================================================================
# 1. VERIFICAR SERVICIOS
# =============================================================================
echo -e "${BLUE}🔧 Verificando servicios...${NC}"

# Nginx
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ nginx: ACTIVO${NC}"
else
    echo -e "${RED}❌ nginx: INACTIVO${NC}"
fi

# PM2
if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 jlist 2>/dev/null | jq -r '.[0].pm2_env.status' 2>/dev/null || echo "stopped")
    if [ "$PM2_STATUS" = "online" ]; then
        echo -e "${GREEN}✅ PM2: ONLINE${NC}"
    else
        echo -e "${YELLOW}⚠️ PM2: $PM2_STATUS${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ PM2: NO INSTALADO${NC}"
fi

echo ""

# =============================================================================
# 2. VERIFICAR CERTIFICADOS
# =============================================================================
echo -e "${BLUE}🔒 Verificando certificados SSL...${NC}"

if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${GREEN}✅ Certificado encontrado${NC}"
    
    # Verificar validez
    EXPIRE_DATE=$(openssl x509 -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" -text -noout | grep "Not After" | cut -d: -f2-)
    EXPIRE_TIMESTAMP=$(date -d "$EXPIRE_DATE" +%s 2>/dev/null || echo "0")
    NOW_TIMESTAMP=$(date +%s)
    
    if [ "$EXPIRE_TIMESTAMP" -gt "$NOW_TIMESTAMP" ]; then
        DAYS_LEFT=$(( ($EXPIRE_TIMESTAMP - $NOW_TIMESTAMP) / 86400 ))
        echo -e "${GREEN}✅ Certificado válido por $DAYS_LEFT días${NC}"
        
        if [ $DAYS_LEFT -lt 30 ]; then
            echo -e "${YELLOW}⚠️ Certificado expira pronto${NC}"
        fi
    else
        echo -e "${RED}❌ Certificado expirado${NC}"
    fi
else
    echo -e "${RED}❌ Certificado no encontrado${NC}"
fi

echo ""

# =============================================================================
# 3. PROBAR CONECTIVIDAD
# =============================================================================
echo -e "${BLUE}🌐 Probando conectividad...${NC}"

# Test HTTPS
echo -n "🔒 HTTPS principal: "
if curl -s -f --max-time 10 "https://$DOMAIN" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ FUNCIONA${NC}"
else
    echo -e "${RED}❌ FALLO${NC}"
fi

# Test redirección HTTP
echo -n "📡 Redirección HTTP→HTTPS: "
HTTP_RESPONSE=$(curl -s -I --max-time 10 "http://$DOMAIN" 2>/dev/null | head -n 1)
HTTP_LOCATION=$(curl -s -I --max-time 10 "http://$DOMAIN" 2>/dev/null | grep -i "location:" | head -n 1)

if echo "$HTTP_LOCATION" | grep -q "https://$DOMAIN"; then
    echo -e "${GREEN}✅ FUNCIONA${NC}"
elif echo "$HTTP_RESPONSE" | grep -q "301\|302"; then
    echo -e "${YELLOW}⚠️ REDIRIGE (verificar destino)${NC}"
else
    echo -e "${RED}❌ NO REDIRIGE${NC}"
fi

# Test redirección WWW
echo -n "📡 Redirección WWW→principal: "
WWW_LOCATION=$(curl -s -I --max-time 10 "https://www.$DOMAIN" 2>/dev/null | grep -i "location:" | head -n 1)

if echo "$WWW_LOCATION" | grep -q "https://$DOMAIN"; then
    echo -e "${GREEN}✅ FUNCIONA${NC}"
else
    echo -e "${YELLOW}⚠️ VERIFICAR${NC}"
fi

# Test API
echo -n "🔗 API Endpoint: "
API_RESPONSE=$(curl -s --max-time 10 "https://$DOMAIN/api/health" 2>/dev/null)
if echo "$API_RESPONSE" | grep -q "success\|running\|healthy"; then
    echo -e "${GREEN}✅ FUNCIONA${NC}"
else
    echo -e "${YELLOW}⚠️ VERIFICAR BACKEND${NC}"
fi

echo ""

# =============================================================================
# 4. VERIFICAR CONFIGURACIÓN NGINX
# =============================================================================
echo -e "${BLUE}⚙️ Verificando configuración nginx...${NC}"

# Test configuración
if nginx -t > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Configuración nginx válida${NC}"
else
    echo -e "${RED}❌ Error en configuración nginx${NC}"
    echo -e "${YELLOW}🔧 Ejecutar: nginx -t${NC}"
fi

# Verificar puertos
echo -n "🔌 Puerto 80 (HTTP): "
if netstat -tlnp 2>/dev/null | grep -q ":80 " || ss -tlnp 2>/dev/null | grep -q ":80 "; then
    echo -e "${GREEN}✅ ACTIVO${NC}"
else
    echo -e "${RED}❌ INACTIVO${NC}"
fi

echo -n "🔌 Puerto 443 (HTTPS): "
if netstat -tlnp 2>/dev/null | grep -q ":443 " || ss -tlnp 2>/dev/null | grep -q ":443 "; then
    echo -e "${GREEN}✅ ACTIVO${NC}"
else
    echo -e "${RED}❌ INACTIVO${NC}"
fi

echo -n "🔌 Puerto 3001 (API): "
if netstat -tlnp 2>/dev/null | grep -q ":3001 " || ss -tlnp 2>/dev/null | grep -q ":3001 "; then
    echo -e "${GREEN}✅ ACTIVO${NC}"
else
    echo -e "${YELLOW}⚠️ BACKEND NO INICIADO${NC}"
fi

echo ""

# =============================================================================
# 5. VERIFICAR HEADERS DE SEGURIDAD
# =============================================================================
echo -e "${BLUE}🛡️ Verificando headers de seguridad...${NC}"

HEADERS=$(curl -s -I --max-time 10 "https://$DOMAIN" 2>/dev/null)

echo -n "🔒 Strict-Transport-Security: "
if echo "$HEADERS" | grep -qi "strict-transport-security"; then
    echo -e "${GREEN}✅ PRESENTE${NC}"
else
    echo -e "${YELLOW}⚠️ AUSENTE${NC}"
fi

echo -n "🛡️ X-Frame-Options: "
if echo "$HEADERS" | grep -qi "x-frame-options"; then
    echo -e "${GREEN}✅ PRESENTE${NC}"
else
    echo -e "${YELLOW}⚠️ AUSENTE${NC}"
fi

echo -n "🔐 X-Content-Type-Options: "
if echo "$HEADERS" | grep -qi "x-content-type-options"; then
    echo -e "${GREEN}✅ PRESENTE${NC}"
else
    echo -e "${YELLOW}⚠️ AUSENTE${NC}"
fi

echo ""

# =============================================================================
# 6. VERIFICAR ARCHIVOS IMPORTANTES
# =============================================================================
echo -e "${BLUE}📁 Verificando archivos del proyecto...${NC}"

PROJECT_PATH="/var/www/marvera.mx"

echo -n "📄 Frontend (dist/index.html): "
if [ -f "$PROJECT_PATH/dist/index.html" ]; then
    echo -e "${GREEN}✅ EXISTE${NC}"
else
    echo -e "${YELLOW}⚠️ NO ENCONTRADO${NC}"
fi

echo -n "⚙️ Backend (backend/): "
if [ -d "$PROJECT_PATH/backend" ]; then
    echo -e "${GREEN}✅ EXISTE${NC}"
else
    echo -e "${YELLOW}⚠️ NO ENCONTRADO${NC}"
fi

echo -n "🔧 ecosystem.config.js: "
if [ -f "$PROJECT_PATH/ecosystem.config.js" ] || [ -f "$PROJECT_PATH/ecosystem.config.cjs" ]; then
    echo -e "${GREEN}✅ EXISTE${NC}"
else
    echo -e "${YELLOW}⚠️ NO ENCONTRADO${NC}"
fi

echo ""

# =============================================================================
# 7. INFORMACIÓN DE LOGS
# =============================================================================
echo -e "${BLUE}📋 Información de logs...${NC}"

echo -e "${YELLOW}🔍 Para revisar logs:${NC}"
echo -e "   📝 Nginx Access: ${CYAN}tail -f /var/log/nginx/marvera.mx.access.log${NC}"
echo -e "   ❌ Nginx Error:  ${CYAN}tail -f /var/log/nginx/marvera.mx.error.log${NC}"
echo -e "   🚀 PM2 Logs:     ${CYAN}pm2 logs${NC}"
echo -e "   🔒 Certbot:      ${CYAN}tail -f /var/log/letsencrypt/letsencrypt.log${NC}"

echo ""

# =============================================================================
# 8. RESUMEN FINAL
# =============================================================================
echo -e "${CYAN}📊 RESUMEN FINAL${NC}"
echo -e "${CYAN}===============${NC}"

# Contar éxitos
SUCCESS_COUNT=0
TOTAL_TESTS=8

# Test básicos
curl -s -f --max-time 10 "https://$DOMAIN" > /dev/null 2>&1 && SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
[ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ] && SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
systemctl is-active --quiet nginx && SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
nginx -t > /dev/null 2>&1 && SUCCESS_COUNT=$((SUCCESS_COUNT + 1))

# Calcular porcentaje
PERCENTAGE=$((SUCCESS_COUNT * 100 / 4))

echo ""
if [ $PERCENTAGE -ge 75 ]; then
    echo -e "${GREEN}🎉 ESTADO: EXCELENTE ($PERCENTAGE% de tests pasaron)${NC}"
    echo -e "${GREEN}✅ MarVera está funcionando correctamente con SSL${NC}"
elif [ $PERCENTAGE -ge 50 ]; then
    echo -e "${YELLOW}⚠️ ESTADO: BUENO ($PERCENTAGE% de tests pasaron)${NC}"
    echo -e "${YELLOW}🔧 Revisar elementos marcados como 'VERIFICAR'${NC}"
else
    echo -e "${RED}❌ ESTADO: REQUIERE ATENCIÓN ($PERCENTAGE% de tests pasaron)${NC}"
    echo -e "${RED}🚨 Revisar configuración y logs${NC}"
fi

echo ""
echo -e "${BLUE}🔗 URLs para probar:${NC}"
echo -e "   🌐 Principal:  ${GREEN}https://marvera.mx${NC}"
echo -e "   🌐 Con WWW:    ${GREEN}https://www.marvera.mx${NC} (debe redirigir)"
echo -e "   🔗 API:        ${GREEN}https://marvera.mx/api/health${NC}"
echo -e "   📊 SSL Test:   ${GREEN}https://www.ssllabs.com/ssltest/analyze.html?d=marvera.mx${NC}"

echo ""
echo -e "${PURPLE}🔧 Comandos útiles:${NC}"
echo -e "   🔄 Reiniciar nginx: ${CYAN}sudo systemctl restart nginx${NC}"
echo -e "   🔄 Reiniciar PM2:   ${CYAN}pm2 restart all${NC}"
echo -e "   🔄 Renovar SSL:     ${CYAN}sudo certbot renew${NC}"
echo -e "   📊 Estado SSL:      ${CYAN}bash /var/www/marvera.mx/ssl-check.sh${NC}"
