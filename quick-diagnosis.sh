#!/bin/bash
# =============================================================================
# DIAGNÓSTICO RÁPIDO DE MARVERA 404
# =============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🔍 DIAGNÓSTICO RÁPIDO MARVERA 404${NC}"
echo -e "${CYAN}=================================${NC}"
echo ""

# =============================================================================
# 1. VERIFICAR SERVICIOS PRINCIPALES
# =============================================================================
echo -e "${BLUE}📊 Estado de servicios:${NC}"

# PM2 Status
echo -n "🚀 PM2: "
if command -v pm2 >/dev/null 2>&1; then
    PM2_COUNT=$(pm2 jlist 2>/dev/null | jq '. | length' 2>/dev/null || echo "0")
    if [ "$PM2_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ $PM2_COUNT proceso(s) activo(s)${NC}"
        pm2 status --no-color 2>/dev/null || echo "Error obteniendo status"
    else
        echo -e "${RED}❌ Sin procesos activos${NC}"
    fi
else
    echo -e "${RED}❌ PM2 no instalado${NC}"
fi

echo ""

# Nginx Status
echo -n "🌐 nginx: "
if systemctl is-active --quiet nginx 2>/dev/null; then
    echo -e "${GREEN}✅ ACTIVO${NC}"
else
    echo -e "${RED}❌ INACTIVO${NC}"
fi

echo ""

# =============================================================================
# 2. VERIFICAR ARCHIVOS CRÍTICOS
# =============================================================================
echo -e "${BLUE}📂 Archivos críticos:${NC}"

# Directorio de producción
echo -n "📁 /var/www/marvera.mx: "
if [ -d "/var/www/marvera.mx" ]; then
    FILE_COUNT=$(ls -la /var/www/marvera.mx 2>/dev/null | wc -l)
    echo -e "${GREEN}✅ Existe ($FILE_COUNT archivos)${NC}"
    
    # Index.html
    echo -n "📄 index.html: "
    if [ -f "/var/www/marvera.mx/index.html" ]; then
        SIZE=$(stat -c%s "/var/www/marvera.mx/index.html" 2>/dev/null || echo "0")
        echo -e "${GREEN}✅ Existe (${SIZE} bytes)${NC}"
    else
        echo -e "${RED}❌ NO EXISTE${NC}"
    fi
    
    # Backend
    echo -n "⚙️ backend/server.js: "
    if [ -f "/var/www/marvera.mx/backend/server.js" ]; then
        echo -e "${GREEN}✅ Existe${NC}"
    else
        echo -e "${RED}❌ NO EXISTE${NC}"
    fi
    
    # Configuración PM2
    echo -n "🚀 ecosystem.config.cjs: "
    if [ -f "/var/www/marvera.mx/ecosystem.config.cjs" ]; then
        echo -e "${GREEN}✅ Existe${NC}"
    else
        echo -e "${RED}❌ NO EXISTE${NC}"
    fi
    
else
    echo -e "${RED}❌ NO EXISTE${NC}"
fi

echo ""

# =============================================================================
# 3. VERIFICAR CONFIGURACIÓN NGINX
# =============================================================================
echo -e "${BLUE}🌐 Configuración nginx:${NC}"

NGINX_CONFIG="/etc/nginx/sites-available/marvera.mx"
echo -n "📋 Config marvera.mx: "
if [ -f "$NGINX_CONFIG" ]; then
    echo -e "${GREEN}✅ Existe${NC}"
    
    # Verificar root directory en config
    ROOT_DIR=$(grep -o "root [^;]*" "$NGINX_CONFIG" 2>/dev/null | head -1 | cut -d' ' -f2 || echo "not_found")
    echo "   📁 Root: $ROOT_DIR"
    
    # Verificar si está habilitado
    if [ -L "/etc/nginx/sites-enabled/marvera.mx" ]; then
        echo -e "   🔗 Estado: ${GREEN}✅ HABILITADO${NC}"
    else
        echo -e "   🔗 Estado: ${RED}❌ DESHABILITADO${NC}"
    fi
else
    echo -e "${RED}❌ NO EXISTE${NC}"
fi

echo ""

# =============================================================================
# 4. TEST DE CONECTIVIDAD
# =============================================================================
echo -e "${BLUE}🔗 Tests de conectividad:${NC}"

# Test local
echo -n "🏠 Localhost: "
if curl -s -f --max-time 5 "http://localhost" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ FUNCIONANDO${NC}"
elif curl -s -f --max-time 5 "http://localhost:80" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ FUNCIONANDO (puerto 80)${NC}"
else
    echo -e "${RED}❌ NO RESPONDE${NC}"
fi

# Test HTTPS
echo -n "🔒 HTTPS: "
if curl -s -f --max-time 10 "https://marvera.mx" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ FUNCIONANDO${NC}"
else
    echo -e "${RED}❌ ERROR 404/500${NC}"
fi

# Test API
echo -n "🔗 API: "
if curl -s -f --max-time 10 "https://marvera.mx/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ FUNCIONANDO${NC}"
else
    echo -e "${RED}❌ NO RESPONDE${NC}"
fi

echo ""

# =============================================================================
# 5. LOGS RECIENTES
# =============================================================================
echo -e "${BLUE}📝 Logs recientes:${NC}"

# PM2 Logs
echo "🚀 PM2 Logs (últimas 5 líneas):"
if command -v pm2 >/dev/null 2>&1; then
    pm2 logs --lines 5 --no-color 2>/dev/null || echo "   Sin logs de PM2"
else
    echo "   PM2 no disponible"
fi

echo ""

# Nginx Error Log
echo "🌐 nginx Error Log (últimas 5 líneas):"
if [ -f "/var/log/nginx/marvera.mx.error.log" ]; then
    tail -5 /var/log/nginx/marvera.mx.error.log 2>/dev/null || echo "   No se pueden leer logs"
else
    echo "   Log no encontrado"
fi

echo ""

# =============================================================================
# 6. RECOMENDACIONES DE SOLUCIÓN
# =============================================================================
echo -e "${CYAN}💡 RECOMENDACIONES:${NC}"
echo ""

# Verificar si el problema es de archivos
if [ ! -f "/var/www/marvera.mx/index.html" ]; then
    echo -e "${YELLOW}🔧 SOLUCIÓN 1: Regenerar frontend${NC}"
    echo "   cd /var/www/marvera && npm run build"
    echo "   cp -r dist/* /var/www/marvera.mx/"
    echo ""
fi

# Verificar si el problema es de nginx
if [ ! -f "/etc/nginx/sites-available/marvera.mx" ] || [ ! -L "/etc/nginx/sites-enabled/marvera.mx" ]; then
    echo -e "${YELLOW}🔧 SOLUCIÓN 2: Reconfigurar nginx${NC}"
    echo "   ln -sf /etc/nginx/sites-available/marvera.mx /etc/nginx/sites-enabled/"
    echo "   systemctl reload nginx"
    echo ""
fi

# Verificar si el problema es de PM2
PM2_COUNT=$(pm2 jlist 2>/dev/null | jq '. | length' 2>/dev/null || echo "0")
if [ "$PM2_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}🔧 SOLUCIÓN 3: Reiniciar PM2${NC}"
    echo "   cd /var/www/marvera.mx"
    echo "   pm2 start ecosystem.config.cjs"
    echo ""
fi

echo -e "${GREEN}🎯 Para solución automática, ejecuta:${NC}"
echo -e "${CYAN}   bash server-build-deploy.sh${NC}"
echo ""
echo -e "${BLUE}📊 Para estado actual detallado:${NC}"
echo -e "${CYAN}   pm2 status && systemctl status nginx${NC}"
