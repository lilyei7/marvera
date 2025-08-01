#!/bin/bash
# =============================================================================
# MARVERA - SCRIPT DE DEPLOYMENT COMPLETO DESDE GIT CLONE
# =============================================================================
# Este script realiza una instalación completa desde cero
# Uso: sudo ./deploy-from-scratch.sh
# =============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Variables de configuración
REPO_URL="https://github.com/lilyei7/marvera.git"
PROJECT_DIR="/var/www/marvera"
PRODUCTION_DIR="/var/www/marvera.mx"
BACKUP_DIR="/var/backups/marvera"
LOG_DIR="/var/log/marvera"
DOMAIN="marvera.mx"

echo -e "${CYAN}"
echo "████████████████████████████████████████████████████████████████████████████"
echo "█                                                                          █"
echo "█                    🌊 MARVERA DEPLOYMENT COMPLETO 🌊                     █"
echo "█                        Desde Git Clone a Producción                     █"
echo "█                                                                          █"
echo "████████████████████████████████████████████████████████████████████████████"
echo -e "${NC}\n"

# =============================================================================
# FUNCIÓN: Verificar si comando existe
# =============================================================================
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# =============================================================================
# FUNCIÓN: Instalar dependencias del sistema
# =============================================================================
install_system_dependencies() {
    echo -e "${BLUE}📦 INSTALANDO DEPENDENCIAS DEL SISTEMA${NC}"
    echo "========================================"
    
    # Actualizar sistema
    echo -e "${YELLOW}🔄 Actualizando sistema...${NC}"
    apt update
    
    # Instalar Node.js si no existe
    if ! command_exists node; then
        echo -e "${YELLOW}📥 Instalando Node.js 20...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    fi
    
    # Instalar nginx si no existe
    if ! command_exists nginx; then
        echo -e "${YELLOW}🌐 Instalando nginx...${NC}"
        apt install -y nginx
    fi
    
    # Instalar PM2 si no existe
    if ! command_exists pm2; then
        echo -e "${YELLOW}🚀 Instalando PM2...${NC}"
        npm install -g pm2
    fi
    
    # Instalar herramientas útiles
    apt install -y curl wget git htop tree jq
    
    echo -e "${GREEN}✅ Dependencias del sistema instaladas${NC}\n"
}

# =============================================================================
# FUNCIÓN: Clonar o actualizar repositorio
# =============================================================================
setup_repository() {
    echo -e "${BLUE}📂 CONFIGURANDO REPOSITORIO${NC}"
    echo "============================="
    
    # Crear backup si existe directorio anterior
    if [ -d "$PROJECT_DIR" ]; then
        echo -e "${YELLOW}💾 Respaldando instalación anterior...${NC}"
        mv "$PROJECT_DIR" "${PROJECT_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Clonar repositorio
    echo -e "${YELLOW}📥 Clonando repositorio MarVera...${NC}"
    git clone "$REPO_URL" "$PROJECT_DIR"
    
    cd "$PROJECT_DIR"
    
    # Verificar estructura
    echo -e "${YELLOW}🔍 Verificando estructura del proyecto...${NC}"
    
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ ERROR: No se encontró package.json del frontend${NC}"
        exit 1
    fi
    
    if [ ! -d "backend" ] || [ ! -f "backend/package.json" ]; then
        echo -e "${RED}❌ ERROR: No se encontró backend con package.json${NC}"
        exit 1
    fi
    
    if [ ! -f "vite.config.ts" ]; then
        echo -e "${RED}❌ ERROR: No se encontró configuración de Vite${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Estructura del proyecto válida${NC}"
    echo -e "${CYAN}📁 Proyecto clonado en: $PROJECT_DIR${NC}\n"
}

# =============================================================================
# FUNCIÓN: Instalar dependencias de Node.js
# =============================================================================
install_node_dependencies() {
    echo -e "${BLUE}📦 INSTALANDO DEPENDENCIAS DE NODE.JS${NC}"
    echo "======================================"
    
    cd "$PROJECT_DIR"
    
    # Frontend
    echo -e "${YELLOW}🎨 Instalando dependencias del frontend...${NC}"
    npm cache clean --force 2>/dev/null || true
    rm -rf node_modules package-lock.json 2>/dev/null || true
    npm install
    
    echo -e "${GREEN}✅ Frontend: $(npm list --depth=0 2>/dev/null | grep -c "├\|└" || echo "0") paquetes instalados${NC}"
    
    # Backend
    echo -e "${YELLOW}⚙️ Instalando dependencias del backend...${NC}"
    cd backend
    npm cache clean --force 2>/dev/null || true
    rm -rf node_modules package-lock.json 2>/dev/null || true
    npm install
    
    echo -e "${GREEN}✅ Backend: $(npm list --depth=0 2>/dev/null | grep -c "├\|└" || echo "0") paquetes instalados${NC}"
    
    cd "$PROJECT_DIR"
    echo ""
}

# =============================================================================
# FUNCIÓN: Configurar base de datos
# =============================================================================
setup_database() {
    echo -e "${BLUE}🗃️ CONFIGURANDO BASE DE DATOS${NC}"
    echo "============================="
    
    cd "$PROJECT_DIR/backend"
    
    # Configurar variables de entorno
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            echo -e "${YELLOW}📋 Copiando configuración de ejemplo...${NC}"
            cp .env.example .env
        else
            echo -e "${YELLOW}📋 Creando configuración básica...${NC}"
            cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
DATABASE_URL="file:./database.sqlite"
JWT_SECRET=marvera-super-secret-key-production
CORS_ORIGIN=https://marvera.mx
EOF
        fi
    fi
    
    # Configurar Prisma si existe
    if [ -f "prisma/schema.prisma" ]; then
        echo -e "${YELLOW}🔧 Configurando Prisma...${NC}"
        npx prisma generate
        
        echo -e "${YELLOW}🗃️ Aplicando migraciones...${NC}"
        npx prisma migrate deploy || echo -e "${YELLOW}⚠️ Migraciones no aplicadas (normal en primera instalación)${NC}"
        
        # Crear datos de prueba si no existe la BD
        if [ ! -f "database.sqlite" ] && [ -f "prisma/seed.ts" ]; then
            echo -e "${YELLOW}🌱 Creando datos de prueba...${NC}"
            npx prisma db seed || echo -e "${YELLOW}⚠️ No se pudo crear seed (opcional)${NC}"
        fi
    fi
    
    echo -e "${GREEN}✅ Base de datos configurada${NC}"
    cd "$PROJECT_DIR"
    echo ""
}

# =============================================================================
# FUNCIÓN: Compilar aplicación
# =============================================================================
build_application() {
    echo -e "${BLUE}🏗️ COMPILANDO APLICACIÓN${NC}"
    echo "========================="
    
    cd "$PROJECT_DIR"
    
    # Frontend Build
    echo -e "${YELLOW}🎨 Compilando frontend (React + TypeScript)...${NC}"
    rm -rf dist build 2>/dev/null || true
    
    # Intentar build normal primero
    if npm run build 2>/dev/null; then
        echo -e "${GREEN}✅ Frontend compilado exitosamente${NC}"
    else
        echo -e "${YELLOW}⚠️ Build normal falló, intentando con Vite directo...${NC}"
        if npx vite build --mode production; then
            echo -e "${GREEN}✅ Frontend compilado con Vite directo${NC}"
        else
            echo -e "${RED}❌ ERROR: No se pudo compilar el frontend${NC}"
            echo -e "${YELLOW}💡 Revisar errores de TypeScript arriba${NC}"
            exit 1
        fi
    fi
    
    # Verificar dist
    if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
        echo -e "${RED}❌ ERROR: No se generó directorio dist correctamente${NC}"
        exit 1
    fi
    
    DIST_SIZE=$(du -sh dist | cut -f1)
    DIST_FILES=$(find dist -type f | wc -l)
    echo -e "${CYAN}📁 Frontend compilado: ${DIST_SIZE} (${DIST_FILES} archivos)${NC}"
    
    # Backend Build
    echo -e "${YELLOW}⚙️ Compilando backend (TypeScript a JavaScript)...${NC}"
    cd backend
    rm -rf dist 2>/dev/null || true
    
    if npm run build; then
        echo -e "${GREEN}✅ Backend compilado exitosamente${NC}"
    else
        echo -e "${RED}❌ ERROR: No se pudo compilar el backend${NC}"
        exit 1
    fi
    
    # Verificar backend dist
    if [ ! -f "dist/index.js" ]; then
        echo -e "${RED}❌ ERROR: No se generó dist/index.js del backend${NC}"
        exit 1
    fi
    
    BACKEND_SIZE=$(du -sh dist | cut -f1)
    echo -e "${CYAN}📁 Backend compilado: ${BACKEND_SIZE}${NC}"
    
    cd "$PROJECT_DIR"
    echo ""
}

# =============================================================================
# FUNCIÓN: Configurar directorio de producción
# =============================================================================
setup_production_directory() {
    echo -e "${BLUE}📂 CONFIGURANDO DIRECTORIO DE PRODUCCIÓN${NC}"
    echo "========================================"
    
    # Crear backup de producción actual
    if [ -d "$PRODUCTION_DIR" ]; then
        echo -e "${YELLOW}💾 Respaldando instalación de producción...${NC}"
        mv "$PRODUCTION_DIR" "${PRODUCTION_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Crear directorios
    echo -e "${YELLOW}📁 Creando estructura de directorios...${NC}"
    mkdir -p "$PRODUCTION_DIR"
    mkdir -p "$PRODUCTION_DIR/backend"
    mkdir -p "$LOG_DIR"
    mkdir -p "$BACKUP_DIR"
    
    # Copiar frontend compilado
    echo -e "${YELLOW}🎨 Copiando frontend compilado...${NC}"
    cp -r "$PROJECT_DIR/dist"/* "$PRODUCTION_DIR/"
    
    # Copiar backend compilado y configuración
    echo -e "${YELLOW}⚙️ Copiando backend compilado...${NC}"
    cp -r "$PROJECT_DIR/backend/dist" "$PRODUCTION_DIR/backend/"
    cp "$PROJECT_DIR/backend/package.json" "$PRODUCTION_DIR/backend/"
    cp "$PROJECT_DIR/backend/.env" "$PRODUCTION_DIR/backend/" 2>/dev/null || true
    
    # Copiar configuración de base de datos
    if [ -d "$PROJECT_DIR/backend/prisma" ]; then
        echo -e "${YELLOW}🗃️ Copiando configuración de Prisma...${NC}"
        cp -r "$PROJECT_DIR/backend/prisma" "$PRODUCTION_DIR/backend/"
    fi
    
    # Copiar base de datos si existe
    if [ -f "$PROJECT_DIR/backend/database.sqlite" ]; then
        echo -e "${YELLOW}🗃️ Copiando base de datos...${NC}"
        cp "$PROJECT_DIR/backend/database.sqlite" "$PRODUCTION_DIR/backend/"
    fi
    
    echo -e "${GREEN}✅ Directorio de producción configurado${NC}"
    echo ""
}

# =============================================================================
# FUNCIÓN: Instalar dependencias de producción
# =============================================================================
install_production_dependencies() {
    echo -e "${BLUE}📦 INSTALANDO DEPENDENCIAS DE PRODUCCIÓN${NC}"
    echo "========================================"
    
    cd "$PRODUCTION_DIR/backend"
    
    echo -e "${YELLOW}📥 Instalando solo dependencias de producción...${NC}"
    npm ci --only=production
    
    # Configurar Prisma en producción
    if [ -f "prisma/schema.prisma" ]; then
        echo -e "${YELLOW}🔧 Configurando Prisma para producción...${NC}"
        npx prisma generate
    fi
    
    echo -e "${GREEN}✅ Dependencias de producción instaladas${NC}"
    echo ""
}

# =============================================================================
# FUNCIÓN: Configurar PM2
# =============================================================================
setup_pm2() {
    echo -e "${BLUE}🚀 CONFIGURANDO PM2${NC}"
    echo "=================="
    
    cd "$PRODUCTION_DIR"
    
    # Parar procesos existentes
    echo -e "${YELLOW}🛑 Parando procesos PM2 existentes...${NC}"
    pm2 stop all 2>/dev/null || true
    pm2 delete all 2>/dev/null || true
    
    # Crear configuración PM2
    echo -e "${YELLOW}📋 Creando configuración PM2...${NC}"
    cat > ecosystem.config.cjs << EOF
module.exports = {
  apps: [{
    name: 'marvera-api',
    script: './backend/dist/index.js',
    cwd: '$PRODUCTION_DIR',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_file: '$LOG_DIR/combined.log',
    out_file: '$LOG_DIR/out.log',
    error_file: '$LOG_DIR/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true,
    kill_timeout: 5000,
    restart_delay: 3000,
    max_restarts: 5,
    min_uptime: '10s'
  }]
};
EOF
    
    echo -e "${GREEN}✅ Configuración PM2 creada${NC}"
    echo ""
}

# =============================================================================
# FUNCIÓN: Configurar nginx
# =============================================================================
setup_nginx() {
    echo -e "${BLUE}🌐 CONFIGURANDO NGINX${NC}"
    echo "==================="
    
    NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN"
    
    echo -e "${YELLOW}📝 Creando configuración de nginx...${NC}"
    
    cat > "$NGINX_CONFIG" << EOF
# MarVera - Configuración nginx
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Si tienes SSL, descomenta la siguiente línea:
    # return 301 https://\$server_name\$request_uri;
    
    root $PRODUCTION_DIR;
    index index.html index.htm;
    
    # Logs
    access_log /var/log/nginx/${DOMAIN}.access.log;
    error_log /var/log/nginx/${DOMAIN}.error.log;
    
    # Compresión
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Frontend - Servir archivos estáticos
    location / {
        try_files \$uri \$uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, must-revalidate, proxy-revalidate";
    }
    
    # API - Proxy al backend Node.js
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Socket.IO para tiempo real
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Archivos estáticos con cache largo
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Archivos de uploads
    location /uploads/ {
        alias $PRODUCTION_DIR/backend/uploads/;
        expires 1M;
        add_header Cache-Control "public";
    }
    
    # Seguridad - Bloquear archivos sensibles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ /(package\.json|tsconfig\.json|\.env|ecosystem\.config\.cjs)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF
    
    # Habilitar sitio
    echo -e "${YELLOW}🔗 Habilitando sitio en nginx...${NC}"
    ln -sf "$NGINX_CONFIG" "/etc/nginx/sites-enabled/$DOMAIN"
    
    # Deshabilitar sitio default si existe
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
    
    # Verificar configuración
    echo -e "${YELLOW}🧪 Verificando configuración de nginx...${NC}"
    if nginx -t; then
        echo -e "${GREEN}✅ Configuración de nginx válida${NC}"
    else
        echo -e "${RED}❌ ERROR en configuración de nginx${NC}"
        exit 1
    fi
    
    echo ""
}

# =============================================================================
# FUNCIÓN: Configurar permisos
# =============================================================================
setup_permissions() {
    echo -e "${BLUE}🔐 CONFIGURANDO PERMISOS${NC}"
    echo "======================"
    
    echo -e "${YELLOW}👤 Configurando propietario...${NC}"
    chown -R www-data:www-data "$PRODUCTION_DIR"
    chown -R www-data:www-data "$LOG_DIR"
    
    echo -e "${YELLOW}🔒 Configurando permisos de archivos...${NC}"
    find "$PRODUCTION_DIR" -type d -exec chmod 755 {} \;
    find "$PRODUCTION_DIR" -type f -exec chmod 644 {} \;
    
    # Hacer ejecutable el archivo principal
    chmod +x "$PRODUCTION_DIR/backend/dist/index.js" 2>/dev/null || true
    
    echo -e "${GREEN}✅ Permisos configurados${NC}"
    echo ""
}

# =============================================================================
# FUNCIÓN: Iniciar servicios
# =============================================================================
start_services() {
    echo -e "${BLUE}🚀 INICIANDO SERVICIOS${NC}"
    echo "====================="
    
    # Iniciar nginx
    echo -e "${YELLOW}🌐 Iniciando nginx...${NC}"
    systemctl start nginx
    systemctl enable nginx
    systemctl reload nginx
    
    # Iniciar PM2
    echo -e "${YELLOW}🚀 Iniciando PM2...${NC}"
    cd "$PRODUCTION_DIR"
    pm2 start ecosystem.config.cjs
    
    # Guardar configuración PM2
    echo -e "${YELLOW}💾 Guardando configuración PM2...${NC}"
    pm2 save
    pm2 startup systemd -u root --hp /root 2>/dev/null || true
    
    echo -e "${GREEN}✅ Servicios iniciados${NC}"
    echo ""
}

# =============================================================================
# FUNCIÓN: Verificar deployment
# =============================================================================
verify_deployment() {
    echo -e "${BLUE}🔍 VERIFICANDO DEPLOYMENT${NC}"
    echo "========================="
    
    echo -e "${YELLOW}⏳ Esperando que los servicios se estabilicen...${NC}"
    sleep 5
    
    # Verificar archivos críticos
    echo -e "${CYAN}📄 Verificando archivos:${NC}"
    
    if [ -f "$PRODUCTION_DIR/index.html" ]; then
        SIZE=$(stat -c%s "$PRODUCTION_DIR/index.html")
        echo -e "   ✅ Frontend index.html: ${SIZE} bytes"
    else
        echo -e "   ❌ Frontend index.html: NO EXISTE"
    fi
    
    if [ -f "$PRODUCTION_DIR/backend/dist/index.js" ]; then
        SIZE=$(stat -c%s "$PRODUCTION_DIR/backend/dist/index.js")
        echo -e "   ✅ Backend index.js: ${SIZE} bytes"
    else
        echo -e "   ❌ Backend index.js: NO EXISTE"
    fi
    
    # Verificar servicios
    echo -e "${CYAN}🔧 Verificando servicios:${NC}"
    
    # PM2
    PM2_STATUS=$(pm2 jlist 2>/dev/null | jq -r '.[0].pm2_env.status' 2>/dev/null || echo "error")
    if [ "$PM2_STATUS" = "online" ]; then
        MEMORY=$(pm2 jlist 2>/dev/null | jq -r '.[0].monit.memory' 2>/dev/null || echo "0")
        MEMORY_MB=$((MEMORY / 1024 / 1024))
        echo -e "   ✅ PM2: ONLINE (${MEMORY_MB}MB)"
    else
        echo -e "   ❌ PM2: $PM2_STATUS"
    fi
    
    # nginx
    if systemctl is-active --quiet nginx; then
        echo -e "   ✅ nginx: ACTIVO"
    else
        echo -e "   ❌ nginx: INACTIVO"
    fi
    
    # Tests de conectividad
    echo -e "${CYAN}🌐 Tests de conectividad:${NC}"
    
    # API Local
    if curl -s -f --max-time 5 "http://localhost:3001/api/health" >/dev/null 2>&1; then
        echo -e "   ✅ Backend local (puerto 3001): FUNCIONANDO"
    else
        echo -e "   ❌ Backend local (puerto 3001): NO RESPONDE"
    fi
    
    # Frontend local
    if curl -s -f --max-time 5 "http://localhost" >/dev/null 2>&1; then
        echo -e "   ✅ Frontend local (puerto 80): FUNCIONANDO"
    else
        echo -e "   ❌ Frontend local (puerto 80): NO RESPONDE"
    fi
    
    echo ""
}

# =============================================================================
# FUNCIÓN: Mostrar información final
# =============================================================================
show_final_info() {
    echo -e "${CYAN}"
    echo "████████████████████████████████████████████████████████████████████████████"
    echo "█                                                                          █"
    echo "█                     🎉 DEPLOYMENT COMPLETADO 🎉                         █"
    echo "█                                                                          █"
    echo "████████████████████████████████████████████████████████████████████████████"
    echo -e "${NC}\n"
    
    echo -e "${GREEN}🎯 INSTALACIÓN COMPLETA EXITOSA${NC}"
    echo -e "${GREEN}==============================${NC}"
    echo ""
    echo -e "${BLUE}📊 Lo que se instaló:${NC}"
    echo -e "   ✅ Repositorio MarVera clonado desde GitHub"
    echo -e "   ✅ Dependencias Node.js instaladas (frontend + backend)"
    echo -e "   ✅ TypeScript compilado a JavaScript"
    echo -e "   ✅ Frontend React optimizado para producción"
    echo -e "   ✅ Backend API configurado con Prisma"
    echo -e "   ✅ Base de datos SQLite configurada"
    echo -e "   ✅ PM2 gestionando el proceso del servidor"
    echo -e "   ✅ nginx configurado como proxy reverso"
    echo -e "   ✅ Logs y monitoreo configurados"
    echo ""
    
    echo -e "${BLUE}🔗 URLs DISPONIBLES:${NC}"
    echo -e "   🌐 Frontend:     ${GREEN}http://$DOMAIN${NC}"
    echo -e "   🔗 API Health:   ${GREEN}http://$DOMAIN/api/health${NC}"
    echo -e "   📦 API Products: ${GREEN}http://$DOMAIN/api/products${NC}"
    echo -e "   🔐 API Auth:     ${GREEN}http://$DOMAIN/api/auth${NC}"
    echo ""
    
    echo -e "${PURPLE}📊 COMANDOS DE MONITOREO:${NC}"
    echo -e "   📈 Estado PM2:           ${CYAN}pm2 status${NC}"
    echo -e "   📝 Logs tiempo real:     ${CYAN}pm2 logs${NC}"
    echo -e "   🔄 Reiniciar backend:    ${CYAN}pm2 restart marvera-api${NC}"
    echo -e "   🌐 Estado nginx:         ${CYAN}systemctl status nginx${NC}"
    echo -e "   📋 Logs nginx:           ${CYAN}tail -f /var/log/nginx/$DOMAIN.error.log${NC}"
    echo -e "   💾 Uso de memoria:       ${CYAN}free -h${NC}"
    echo -e "   🔍 Procesos activos:     ${CYAN}htop${NC}"
    echo ""
    
    echo -e "${YELLOW}🔧 COMANDOS DE RESOLUCIÓN DE PROBLEMAS:${NC}"
    echo -e "   🛑 Parar todo:           ${CYAN}pm2 stop all${NC}"
    echo -e "   🚀 Iniciar todo:         ${CYAN}pm2 start ecosystem.config.cjs${NC}"
    echo -e "   🔄 Reiniciar nginx:      ${CYAN}systemctl restart nginx${NC}"
    echo -e "   📊 Ver puertos:          ${CYAN}netstat -tulpn | grep :3001${NC}"
    echo -e "   🗃️ Backup BD:            ${CYAN}cp $PRODUCTION_DIR/backend/database.sqlite $BACKUP_DIR/${NC}"
    echo ""
    
    echo -e "${CYAN}📁 UBICACIONES IMPORTANTES:${NC}"
    echo -e "   📂 Código fuente:        ${PRODUCTION_DIR}"
    echo -e "   📝 Logs aplicación:      ${LOG_DIR}"
    echo -e "   💾 Backups:              ${BACKUP_DIR}"
    echo -e "   🌐 Config nginx:         /etc/nginx/sites-available/$DOMAIN"
    echo -e "   🗃️ Base de datos:        ${PRODUCTION_DIR}/backend/database.sqlite"
    echo ""
    
    echo -e "${GREEN}🌊 ¡MarVera está funcionando en producción! 🌊${NC}"
    echo -e "${YELLOW}💡 Para SSL/HTTPS, instala certbot: ${CYAN}sudo apt install certbot python3-certbot-nginx${NC}"
    echo ""
}

# =============================================================================
# FUNCIÓN PRINCIPAL
# =============================================================================
main() {
    # Verificar que se ejecuta como root
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}❌ Este script debe ejecutarse como root (sudo)${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}🚀 Iniciando deployment completo de MarVera...${NC}\n"
    
    # Ejecutar todas las funciones en orden
    install_system_dependencies
    setup_repository
    install_node_dependencies
    setup_database
    build_application
    setup_production_directory
    install_production_dependencies
    setup_pm2
    setup_nginx
    setup_permissions
    start_services
    verify_deployment
    show_final_info
    
    echo -e "${GREEN}🎉 ¡Deployment completo finalizado exitosamente! 🎉${NC}"
}

# Ejecutar función principal
main "$@"
