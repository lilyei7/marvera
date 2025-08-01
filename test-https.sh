#!/bin/bash
# =============================================================================
# SCRIPT DE PRUEBA RÁPIDA HTTPS - MARVERA.MX
# =============================================================================
# Ejecutar como: bash test-https.sh
# =============================================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔍 PRUEBA RÁPIDA HTTPS - MARVERA.MX${NC}"
echo -e "${CYAN}==================================${NC}"
echo ""

# Test 1: HTTPS Principal
echo -e "${BLUE}🔒 Probando HTTPS principal...${NC}"
HTTPS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://marvera.mx" 2>/dev/null || echo "000")
echo -n "   https://marvera.mx: "
if [ "$HTTPS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ OK (HTTP $HTTPS_RESPONSE)${NC}"
else
    echo -e "${RED}❌ FALLO (HTTP $HTTPS_RESPONSE)${NC}"
fi

# Test 2: API Health
echo -e "${BLUE}🔗 Probando API...${NC}"
API_RESPONSE=$(curl -s --max-time 10 "https://marvera.mx/api/health" 2>/dev/null || echo "{}")
echo -n "   https://marvera.mx/api/health: "
if echo "$API_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ OK${NC}"
    echo "      Respuesta: $(echo "$API_RESPONSE" | jq -r '.message' 2>/dev/null || echo "API funcionando")"
else
    echo -e "${RED}❌ FALLO${NC}"
fi

# Test 3: Redirección HTTP
echo -e "${BLUE}📡 Probando redirección HTTP→HTTPS...${NC}"
HTTP_REDIRECT=$(curl -s -I --max-time 10 "http://marvera.mx" 2>/dev/null | grep -i "location:" | head -n 1)
echo -n "   http://marvera.mx → "
if echo "$HTTP_REDIRECT" | grep -q "https://marvera.mx"; then
    echo -e "${GREEN}✅ REDIRIGE CORRECTAMENTE${NC}"
else
    echo -e "${YELLOW}⚠️ VERIFICAR REDIRECCIÓN${NC}"
fi

# Test 4: Redirección WWW
echo -e "${BLUE}📡 Probando redirección WWW...${NC}"
WWW_REDIRECT=$(curl -s -I --max-time 10 "https://www.marvera.mx" 2>/dev/null | grep -i "location:" | head -n 1)
echo -n "   https://www.marvera.mx → "
if echo "$WWW_REDIRECT" | grep -q "https://marvera.mx"; then
    echo -e "${GREEN}✅ REDIRIGE CORRECTAMENTE${NC}"
else
    echo -e "${YELLOW}⚠️ VERIFICAR REDIRECCIÓN${NC}"
fi

# Test 5: Certificado SSL
echo -e "${BLUE}🔒 Verificando certificado SSL...${NC}"
if [ -f "/etc/letsencrypt/live/marvera.mx/fullchain.pem" ]; then
    EXPIRE_DATE=$(openssl x509 -in "/etc/letsencrypt/live/marvera.mx/fullchain.pem" -text -noout | grep "Not After" | cut -d: -f2-)
    EXPIRE_TIMESTAMP=$(date -d "$EXPIRE_DATE" +%s 2>/dev/null || echo "0")
    NOW_TIMESTAMP=$(date +%s)
    
    if [ "$EXPIRE_TIMESTAMP" -gt "$NOW_TIMESTAMP" ]; then
        DAYS_LEFT=$(( ($EXPIRE_TIMESTAMP - $NOW_TIMESTAMP) / 86400 ))
        echo -e "   Certificado: ${GREEN}✅ VÁLIDO por $DAYS_LEFT días${NC}"
    else
        echo -e "   Certificado: ${RED}❌ EXPIRADO${NC}"
    fi
else
    echo -e "   Certificado: ${RED}❌ NO ENCONTRADO${NC}"
fi

# Test 6: Servicios
echo -e "${BLUE}🔧 Verificando servicios...${NC}"

# nginx
if systemctl is-active --quiet nginx; then
    echo -e "   nginx: ${GREEN}✅ ACTIVO${NC}"
else
    echo -e "   nginx: ${RED}❌ INACTIVO${NC}"
fi

# PM2
if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 jlist 2>/dev/null | jq -r '.[0].pm2_env.status' 2>/dev/null || echo "stopped")
    if [ "$PM2_STATUS" = "online" ]; then
        echo -e "   PM2: ${GREEN}✅ ONLINE${NC}"
    else
        echo -e "   PM2: ${YELLOW}⚠️ $PM2_STATUS${NC}"
    fi
else
    echo -e "   PM2: ${YELLOW}⚠️ NO INSTALADO${NC}"
fi

echo ""
echo -e "${CYAN}📊 RESUMEN FINAL${NC}"
echo -e "${CYAN}===============${NC}"

# Contar tests exitosos
SUCCESS=0
[ "$HTTPS_RESPONSE" = "200" ] && SUCCESS=$((SUCCESS + 1))
echo "$API_RESPONSE" | grep -q "success" && SUCCESS=$((SUCCESS + 1))
echo "$HTTP_REDIRECT" | grep -q "https://marvera.mx" && SUCCESS=$((SUCCESS + 1))
echo "$WWW_REDIRECT" | grep -q "https://marvera.mx" && SUCCESS=$((SUCCESS + 1))
systemctl is-active --quiet nginx && SUCCESS=$((SUCCESS + 1))

TOTAL=5
PERCENTAGE=$((SUCCESS * 100 / TOTAL))

if [ $SUCCESS -ge 4 ]; then
    echo -e "${GREEN}🎉 EXCELENTE: $SUCCESS/$TOTAL tests pasaron ($PERCENTAGE%)${NC}"
    echo -e "${GREEN}✅ MarVera HTTPS está funcionando correctamente!${NC}"
elif [ $SUCCESS -ge 3 ]; then
    echo -e "${YELLOW}⚠️ BUENO: $SUCCESS/$TOTAL tests pasaron ($PERCENTAGE%)${NC}"
    echo -e "${YELLOW}🔧 Revisar elementos que fallaron${NC}"
else
    echo -e "${RED}❌ PROBLEMAS: $SUCCESS/$TOTAL tests pasaron ($PERCENTAGE%)${NC}"
    echo -e "${RED}🚨 Requiere atención inmediata${NC}"
fi

echo ""
echo -e "${BLUE}🔗 URLs para probar en navegador:${NC}"
echo -e "   🌐 Principal: ${GREEN}https://marvera.mx${NC}"
echo -e "   🔗 API:       ${GREEN}https://marvera.mx/api/health${NC}"
echo -e "   📊 Status:    ${GREEN}https://marvera.mx/api/status${NC}"

if [ $SUCCESS -lt 4 ]; then
    echo ""
    echo -e "${YELLOW}🔧 Para solucionar problemas:${NC}"
    echo -e "   📋 Ejecutar: ${CYAN}sudo bash fix-https.sh${NC}"
    echo -e "   🔍 Logs nginx: ${CYAN}tail -f /var/log/nginx/marvera.mx.error.log${NC}"
    echo -e "   🚀 Logs PM2: ${CYAN}pm2 logs${NC}"
fi
