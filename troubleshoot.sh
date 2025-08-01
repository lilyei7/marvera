#!/bin/bash
# =============================================================================
# MARVERA - HERRAMIENTAS DE RESOLUCIÓN DE PROBLEMAS
# =============================================================================
# Este script ayuda a diagnosticar y resolver problemas comunes
# Uso: sudo ./troubleshoot.sh [comando]
# =============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Variables
PRODUCTION_DIR="/var/www/marvera.mx"
LOG_DIR="/var/log/marvera"
DOMAIN="marvera.mx"

# =============================================================================
# FUNCIÓN: Mostrar ayuda
# =============================================================================
show_help() {
    echo -e "${CYAN}🔧 HERRAMIENTAS DE RESOLUCIÓN DE PROBLEMAS - MARVERA${NC}"
    echo "================================================="
    echo ""
    echo -e "${YELLOW}Comandos disponibles:${NC}"
    echo ""
    echo -e "${BLUE}DIAGNÓSTICO:${NC}"
    echo -e "  ${CYAN}./troubleshoot.sh status${NC}        - Estado completo del sistema"
    echo -e "  ${CYAN}./troubleshoot.sh logs${NC}          - Ver logs en tiempo real"
    echo -e "  ${CYAN}./troubleshoot.sh check${NC}         - Verificar configuración"
    echo -e "  ${CYAN}./troubleshoot.sh ports${NC}         - Ver puertos en uso"
    echo ""
    echo -e "${BLUE}CONTROL DE SERVICIOS:${NC}"
    echo -e "  ${CYAN}./troubleshoot.sh restart${NC}       - Reiniciar todo"
    echo -e "  ${CYAN}./troubleshoot.sh stop${NC}          - Parar todos los servicios"
    echo -e "  ${CYAN}./troubleshoot.sh start${NC}         - Iniciar todos los servicios"
    echo -e "  ${CYAN}./troubleshoot.sh pm2${NC}           - Gestión específica de PM2"
    echo -e "  ${CYAN}./troubleshoot.sh nginx${NC}         - Gestión específica de nginx"
    echo ""
    echo -e "${BLUE}SOLUCIÓN DE PROBLEMAS:${NC}"
    echo -e "  ${CYAN}./troubleshoot.sh fix-port${NC}      - Liberar puerto 3001"
    echo -e "  ${CYAN}./troubleshoot.sh fix-permissions${NC} - Corregir permisos"
    echo -e "  ${CYAN}./troubleshoot.sh fix-build${NC}     - Recompilar aplicación"
    echo -e "  ${CYAN}./troubleshoot.sh fix-db${NC}        - Reparar base de datos"
    echo ""
    echo -e "${BLUE}MANTENIMIENTO:${NC}"
    echo -e "  ${CYAN}./troubleshoot.sh backup${NC}        - Crear backup completo"
    echo -e "  ${CYAN}./troubleshoot.sh update${NC}        - Actualizar desde GitHub"
    echo -e "  ${CYAN}./troubleshoot.sh clean${NC}         - Limpiar archivos temporales"
    echo ""
}

# =============================================================================
# FUNCIÓN: Estado del sistema
# =============================================================================
show_status() {
    echo -e "${BLUE}📊 ESTADO COMPLETO DEL SISTEMA${NC}"
    echo "=============================="
    echo ""
    
    # Verificar archivos
    echo -e "${CYAN}📁 Archivos críticos:${NC}"
    if [ -f "$PRODUCTION_DIR/index.html" ]; then
        SIZE=$(stat -c%s "$PRODUCTION_DIR/index.html")
        echo -e "   ✅ Frontend: ${SIZE} bytes"
    else
        echo -e "   ❌ Frontend: NO EXISTE"
    fi
    
    if [ -f "$PRODUCTION_DIR/backend/dist/index.js" ]; then
        SIZE=$(stat -c%s "$PRODUCTION_DIR/backend/dist/index.js")
        echo -e "   ✅ Backend: ${SIZE} bytes"
    else
        echo -e "   ❌ Backend: NO EXISTE"
    fi
    
    if [ -f "$PRODUCTION_DIR/backend/database.sqlite" ]; then
        SIZE=$(stat -c%s "$PRODUCTION_DIR/backend/database.sqlite")
        echo -e "   ✅ Base de datos: ${SIZE} bytes"
    else
        echo -e "   ❌ Base de datos: NO EXISTE"
    fi
    
    echo ""
    
    # Estado de servicios
    echo -e "${CYAN}🔧 Servicios:${NC}"
    
    # PM2
    if command -v pm2 >/dev/null 2>&1; then
        PM2_COUNT=$(pm2 jlist 2>/dev/null | jq '. | length' 2>/dev/null || echo "0")
        if [ "$PM2_COUNT" -gt 0 ]; then
            echo -e "   ✅ PM2: $PM2_COUNT proceso(s) activo(s)"
            pm2 status --no-color 2>/dev/null || true
        else
            echo -e "   ❌ PM2: Sin procesos activos"
        fi
    else
        echo -e "   ❌ PM2: No instalado"
    fi
    
    # nginx
    if systemctl is-active --quiet nginx; then
        echo -e "   ✅ nginx: ACTIVO"
    else
        echo -e "   ❌ nginx: INACTIVO"
    fi
    
    echo ""
    
    # Uso de recursos
    echo -e "${CYAN}💾 Recursos del sistema:${NC}"
    echo -n "   🧠 RAM: "
    free -h | grep '^Mem:' | awk '{print $3 "/" $2 " (" $3/$2*100 "% usado)"}'
    
    echo -n "   💽 Disco: "
    df -h "$PRODUCTION_DIR" | tail -1 | awk '{print $3 "/" $2 " (" $5 " usado)"}'
    
    echo -n "   ⚡ CPU: "
    top -bn1 | grep "Cpu(s)" | awk '{print $2 $3}' | sed 's/%us,//g'
    
    echo ""
    
    # Conectividad
    echo -e "${CYAN}🌐 Tests de conectividad:${NC}"
    
    if curl -s -f --max-time 5 "http://localhost:3001/api/health" >/dev/null 2>&1; then
        echo -e "   ✅ Backend (3001): FUNCIONANDO"
    else
        echo -e "   ❌ Backend (3001): NO RESPONDE"
    fi
    
    if curl -s -f --max-time 5 "http://localhost" >/dev/null 2>&1; then
        echo -e "   ✅ Frontend (80): FUNCIONANDO"
    else
        echo -e "   ❌ Frontend (80): NO RESPONDE"
    fi
    
    echo ""
}

# =============================================================================
# FUNCIÓN: Ver logs
# =============================================================================
show_logs() {
    echo -e "${BLUE}📝 LOGS EN TIEMPO REAL${NC}"
    echo "====================="
    echo ""
    echo -e "${YELLOW}Presiona Ctrl+C para salir${NC}"
    echo ""
    
    # Mostrar logs de PM2 y nginx
    if command -v pm2 >/dev/null 2>&1; then
        echo -e "${CYAN}🚀 Logs de PM2:${NC}"
        pm2 logs --lines 10
    else
        echo -e "${RED}❌ PM2 no disponible${NC}"
    fi
}

# =============================================================================
# FUNCIÓN: Verificar configuración
# =============================================================================
check_config() {
    echo -e "${BLUE}🔍 VERIFICACIÓN DE CONFIGURACIÓN${NC}"
    echo "================================"
    echo ""
    
    # nginx config
    echo -e "${CYAN}🌐 Configuración nginx:${NC}"
    if nginx -t 2>/dev/null; then
        echo -e "   ✅ Configuración válida"
    else
        echo -e "   ❌ Configuración con errores"
        nginx -t
    fi
    
    # PM2 config
    echo -e "${CYAN}🚀 Configuración PM2:${NC}"
    if [ -f "$PRODUCTION_DIR/ecosystem.config.cjs" ]; then
        echo -e "   ✅ ecosystem.config.cjs existe"
    else
        echo -e "   ❌ ecosystem.config.cjs no encontrado"
    fi
    
    # Variables de entorno
    echo -e "${CYAN}🔧 Variables de entorno:${NC}"
    if [ -f "$PRODUCTION_DIR/backend/.env" ]; then
        echo -e "   ✅ .env existe"
        echo -e "   📋 Contenido:"
        cat "$PRODUCTION_DIR/backend/.env" | grep -v "SECRET\|PASSWORD" | sed 's/^/      /'
    else
        echo -e "   ❌ .env no encontrado"
    fi
    
    echo ""
}

# =============================================================================
# FUNCIÓN: Ver puertos
# =============================================================================
show_ports() {
    echo -e "${BLUE}🔌 PUERTOS EN USO${NC}"
    echo "================"
    echo ""
    
    echo -e "${CYAN}Puerto 80 (nginx):${NC}"
    netstat -tulpn | grep :80 || echo "   No hay procesos en puerto 80"
    
    echo -e "${CYAN}Puerto 3001 (backend):${NC}"
    netstat -tulpn | grep :3001 || echo "   No hay procesos en puerto 3001"
    
    echo -e "${CYAN}Todos los puertos de escucha:${NC}"
    netstat -tulpn | grep LISTEN
    
    echo ""
}

# =============================================================================
# FUNCIÓN: Reiniciar todo
# =============================================================================
restart_all() {
    echo -e "${BLUE}🔄 REINICIANDO TODOS LOS SERVICIOS${NC}"
    echo "=================================="
    echo ""
    
    echo -e "${YELLOW}🛑 Parando servicios...${NC}"
    pm2 stop all 2>/dev/null || true
    
    echo -e "${YELLOW}🚀 Iniciando PM2...${NC}"
    cd "$PRODUCTION_DIR"
    pm2 start ecosystem.config.cjs
    
    echo -e "${YELLOW}🌐 Recargando nginx...${NC}"
    systemctl reload nginx
    
    echo -e "${GREEN}✅ Servicios reiniciados${NC}"
    echo ""
}

# =============================================================================
# FUNCIÓN: Parar servicios
# =============================================================================
stop_services() {
    echo -e "${BLUE}🛑 PARANDO TODOS LOS SERVICIOS${NC}"
    echo "============================="
    echo ""
    
    echo -e "${YELLOW}🛑 Parando PM2...${NC}"
    pm2 stop all 2>/dev/null || true
    pm2 delete all 2>/dev/null || true
    
    echo -e "${YELLOW}🛑 Parando nginx...${NC}"
    systemctl stop nginx
    
    echo -e "${GREEN}✅ Servicios parados${NC}"
    echo ""
}

# =============================================================================
# FUNCIÓN: Iniciar servicios
# =============================================================================
start_services() {
    echo -e "${BLUE}🚀 INICIANDO TODOS LOS SERVICIOS${NC}"
    echo "==============================="
    echo ""
    
    echo -e "${YELLOW}🌐 Iniciando nginx...${NC}"
    systemctl start nginx
    
    echo -e "${YELLOW}🚀 Iniciando PM2...${NC}"
    cd "$PRODUCTION_DIR"
    pm2 start ecosystem.config.cjs
    
    echo -e "${GREEN}✅ Servicios iniciados${NC}"
    echo ""
}

# =============================================================================
# FUNCIÓN: Gestión PM2
# =============================================================================
manage_pm2() {
    echo -e "${BLUE}🚀 GESTIÓN PM2${NC}"
    echo "============="
    echo ""
    
    echo -e "${CYAN}Estado actual:${NC}"
    pm2 status
    
    echo ""
    echo -e "${YELLOW}Comandos disponibles:${NC}"
    echo "1. Ver logs"
    echo "2. Reiniciar aplicación"
    echo "3. Parar aplicación"
    echo "4. Iniciar aplicación"
    echo "5. Eliminar aplicación"
    echo "6. Salir"
    
    read -p "Selecciona una opción (1-6): " option
    
    case $option in
        1) pm2 logs ;;
        2) pm2 restart marvera-api ;;
        3) pm2 stop marvera-api ;;
        4) pm2 start marvera-api ;;
        5) pm2 delete marvera-api ;;
        6) return ;;
        *) echo "Opción inválida" ;;
    esac
}

# =============================================================================
# FUNCIÓN: Gestión nginx
# =============================================================================
manage_nginx() {
    echo -e "${BLUE}🌐 GESTIÓN NGINX${NC}"
    echo "==============="
    echo ""
    
    echo -e "${CYAN}Estado actual:${NC}"
    systemctl status nginx --no-pager
    
    echo ""
    echo -e "${YELLOW}Comandos disponibles:${NC}"
    echo "1. Ver configuración"
    echo "2. Test configuración"
    echo "3. Recargar configuración"
    echo "4. Reiniciar nginx"
    echo "5. Ver logs de error"
    echo "6. Ver logs de acceso"
    echo "7. Salir"
    
    read -p "Selecciona una opción (1-7): " option
    
    case $option in
        1) cat "/etc/nginx/sites-available/$DOMAIN" ;;
        2) nginx -t ;;
        3) systemctl reload nginx ;;
        4) systemctl restart nginx ;;
        5) tail -f "/var/log/nginx/$DOMAIN.error.log" ;;
        6) tail -f "/var/log/nginx/$DOMAIN.access.log" ;;
        7) return ;;
        *) echo "Opción inválida" ;;
    esac
}

# =============================================================================
# FUNCIÓN: Liberar puerto 3001
# =============================================================================
fix_port() {
    echo -e "${BLUE}🔌 LIBERANDO PUERTO 3001${NC}"
    echo "========================"
    echo ""
    
    echo -e "${CYAN}Procesos usando puerto 3001:${NC}"
    PROCESSES=$(lsof -ti:3001 2>/dev/null || echo "")
    
    if [ -z "$PROCESSES" ]; then
        echo -e "${GREEN}✅ Puerto 3001 libre${NC}"
        return
    fi
    
    echo "$PROCESSES"
    
    echo -e "${YELLOW}¿Matar estos procesos? (y/n):${NC}"
    read -p "" confirm
    
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        echo "$PROCESSES" | xargs kill -9
        echo -e "${GREEN}✅ Procesos eliminados${NC}"
    else
        echo -e "${YELLOW}⚠️ Operación cancelada${NC}"
    fi
    
    echo ""
}

# =============================================================================
# FUNCIÓN: Corregir permisos
# =============================================================================
fix_permissions() {
    echo -e "${BLUE}🔐 CORRIGIENDO PERMISOS${NC}"
    echo "======================"
    echo ""
    
    echo -e "${YELLOW}🔧 Configurando propietario...${NC}"
    chown -R www-data:www-data "$PRODUCTION_DIR"
    chown -R www-data:www-data "$LOG_DIR"
    
    echo -e "${YELLOW}🔒 Configurando permisos...${NC}"
    find "$PRODUCTION_DIR" -type d -exec chmod 755 {} \;
    find "$PRODUCTION_DIR" -type f -exec chmod 644 {} \;
    
    echo -e "${GREEN}✅ Permisos corregidos${NC}"
    echo ""
}

# =============================================================================
# FUNCIÓN: Recompilar aplicación
# =============================================================================
fix_build() {
    echo -e "${BLUE}🏗️ RECOMPILANDO APLICACIÓN${NC}"
    echo "=========================="
    echo ""
    
    cd /var/www/marvera
    
    echo -e "${YELLOW}🎨 Recompilando frontend...${NC}"
    rm -rf dist
    npm run build || npx vite build --mode production
    
    echo -e "${YELLOW}⚙️ Recompilando backend...${NC}"
    cd backend
    rm -rf dist
    npm run build
    cd ..
    
    echo -e "${YELLOW}📂 Copiando a producción...${NC}"
    cp -r dist/* "$PRODUCTION_DIR/"
    cp -r backend/dist "$PRODUCTION_DIR/backend/"
    
    echo -e "${YELLOW}🚀 Reiniciando servicios...${NC}"
    pm2 restart marvera-api
    
    echo -e "${GREEN}✅ Aplicación recompilada${NC}"
    echo ""
}

# =============================================================================
# FUNCIÓN: Reparar base de datos
# =============================================================================
fix_database() {
    echo -e "${BLUE}🗃️ REPARANDO BASE DE DATOS${NC}"
    echo "========================="
    echo ""
    
    cd "$PRODUCTION_DIR/backend"
    
    if [ -f "prisma/schema.prisma" ]; then
        echo -e "${YELLOW}🔧 Regenerando cliente Prisma...${NC}"
        npx prisma generate
        
        echo -e "${YELLOW}🗃️ Aplicando migraciones...${NC}"
        npx prisma migrate deploy || echo -e "${YELLOW}⚠️ Migraciones no aplicadas${NC}"
        
        echo -e "${GREEN}✅ Base de datos reparada${NC}"
    else
        echo -e "${YELLOW}⚠️ No se encontró esquema Prisma${NC}"
    fi
    
    echo ""
}

# =============================================================================
# FUNCIÓN: Crear backup
# =============================================================================
create_backup() {
    echo -e "${BLUE}💾 CREANDO BACKUP COMPLETO${NC}"
    echo "=========================="
    echo ""
    
    BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
    BACKUP_PATH="/var/backups/marvera/backup_$BACKUP_DATE"
    
    mkdir -p "$BACKUP_PATH"
    
    echo -e "${YELLOW}📂 Respaldando aplicación...${NC}"
    tar -czf "$BACKUP_PATH/application.tar.gz" "$PRODUCTION_DIR"
    
    echo -e "${YELLOW}🗃️ Respaldando base de datos...${NC}"
    if [ -f "$PRODUCTION_DIR/backend/database.sqlite" ]; then
        cp "$PRODUCTION_DIR/backend/database.sqlite" "$BACKUP_PATH/database.sqlite"
    fi
    
    echo -e "${YELLOW}📝 Respaldando configuraciones...${NC}"
    cp "/etc/nginx/sites-available/$DOMAIN" "$BACKUP_PATH/nginx.conf"
    
    echo -e "${GREEN}✅ Backup creado en: $BACKUP_PATH${NC}"
    echo ""
}

# =============================================================================
# FUNCIÓN: Actualizar desde GitHub
# =============================================================================
update_from_github() {
    echo -e "${BLUE}📥 ACTUALIZANDO DESDE GITHUB${NC}"
    echo "============================"
    echo ""
    
    cd /var/www/marvera
    
    echo -e "${YELLOW}📥 Descargando cambios...${NC}"
    git pull origin main
    
    echo -e "${YELLOW}📦 Actualizando dependencias...${NC}"
    npm install
    cd backend
    npm install
    cd ..
    
    echo -e "${YELLOW}🏗️ Recompilando...${NC}"
    npm run build || npx vite build --mode production
    cd backend
    npm run build
    cd ..
    
    echo -e "${YELLOW}📂 Desplegando...${NC}"
    cp -r dist/* "$PRODUCTION_DIR/"
    cp -r backend/dist "$PRODUCTION_DIR/backend/"
    
    echo -e "${YELLOW}🚀 Reiniciando...${NC}"
    pm2 restart marvera-api
    
    echo -e "${GREEN}✅ Actualización completada${NC}"
    echo ""
}

# =============================================================================
# FUNCIÓN: Limpiar archivos temporales
# =============================================================================
clean_temp() {
    echo -e "${BLUE}🧹 LIMPIANDO ARCHIVOS TEMPORALES${NC}"
    echo "==============================="
    echo ""
    
    echo -e "${YELLOW}🗑️ Limpiando cache npm...${NC}"
    npm cache clean --force 2>/dev/null || true
    
    echo -e "${YELLOW}🗑️ Limpiando logs antiguos...${NC}"
    find "$LOG_DIR" -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    echo -e "${YELLOW}🗑️ Limpiando backups antiguos...${NC}"
    find /var/backups/marvera -name "*.tar.gz" -mtime +30 -delete 2>/dev/null || true
    
    echo -e "${GREEN}✅ Limpieza completada${NC}"
    echo ""
}

# =============================================================================
# FUNCIÓN PRINCIPAL
# =============================================================================
main() {
    case "${1:-help}" in
        "status") show_status ;;
        "logs") show_logs ;;
        "check") check_config ;;
        "ports") show_ports ;;
        "restart") restart_all ;;
        "stop") stop_services ;;
        "start") start_services ;;
        "pm2") manage_pm2 ;;
        "nginx") manage_nginx ;;
        "fix-port") fix_port ;;
        "fix-permissions") fix_permissions ;;
        "fix-build") fix_build ;;
        "fix-db") fix_database ;;
        "backup") create_backup ;;
        "update") update_from_github ;;
        "clean") clean_temp ;;
        "help"|*) show_help ;;
    esac
}

# Ejecutar
main "$@"
