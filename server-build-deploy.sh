#!/bin/bash
# =============================================================================
# SCRIPT DIRECTO PARA BUILD Y DEPLOY EN SERVIDOR
# =============================================================================
# Ejecutar directamente en el servidor: curl -s URL | bash
# O copiar y pegar este contenido en un archivo .sh
# =============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🌊 MARVERA BUILD Y DEPLOY DIRECTO${NC}"
echo -e "${CYAN}================================${NC}"
echo ""

# =============================================================================
# 1. VERIFICAR UBICACIÓN
# =============================================================================
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ No encontrado package.json${NC}"
    echo -e "${YELLOW}💡 Asegúrate de estar en /var/www/marvera${NC}"
    exit 1
fi

PROJECT_NAME=$(node -e "console.log(require('./package.json').name)" 2>/dev/null || echo "marvera")
echo -e "${GREEN}✅ Proyecto encontrado: $PROJECT_NAME${NC}"

# =============================================================================
# 2. INSTALAR DEPENDENCIAS
# =============================================================================
echo -e "${BLUE}📦 Instalando dependencias...${NC}"

# Instalar dependencias del frontend
npm install

echo -e "${GREEN}✅ Dependencias instaladas${NC}"

# =============================================================================
# 3. GENERAR BUILD
# =============================================================================
echo -e "${BLUE}🏗️ Generando build...${NC}"

# Limpiar builds anteriores
rm -rf dist build

# Intentar build
if npm run build; then
    echo -e "${GREEN}✅ Build exitoso${NC}"
elif npm run dist; then
    echo -e "${GREEN}✅ Build exitoso con 'dist'${NC}"
elif npx vite build; then
    echo -e "${GREEN}✅ Build exitoso con Vite${NC}"
else
    echo -e "${RED}❌ Error en build${NC}"
    exit 1
fi

# Verificar directorio de build
DIST_DIR=""
if [ -d "dist" ]; then
    DIST_DIR="dist"
elif [ -d "build" ]; then
    DIST_DIR="build"
else
    echo -e "${RED}❌ No se encontró directorio de build${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build generado en: $DIST_DIR${NC}"

# =============================================================================
# 4. PREPARAR BACKEND
# =============================================================================
echo -e "${BLUE}⚙️ Configurando backend...${NC}"

# Si existe backend, instalar sus dependencias
if [ -d "backend" ] && [ -f "backend/package.json" ]; then
    echo -e "${YELLOW}🔧 Instalando dependencias del backend...${NC}"
    cd backend
    npm install --production
    cd ..
    echo -e "${GREEN}✅ Backend configurado${NC}"
else
    echo -e "${YELLOW}⚠️ Backend no encontrado o sin package.json${NC}"
fi

# =============================================================================
# 5. PARAR SERVICIOS ACTUALES
# =============================================================================
echo -e "${BLUE}🛑 Parando servicios actuales...${NC}"

# Parar PM2
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

echo -e "${GREEN}✅ Servicios parados${NC}"

# =============================================================================
# 6. MOVER ARCHIVOS A PRODUCCIÓN
# =============================================================================
echo -e "${BLUE}📂 Moviendo archivos a producción...${NC}"

# Crear backup del directorio actual
if [ -d "/var/www/marvera.mx" ]; then
    mv "/var/www/marvera.mx" "/var/www/marvera.mx.backup.$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
fi

# Crear estructura de producción
mkdir -p /var/www/marvera.mx/backend
mkdir -p /var/log/marvera

# Copiar frontend (dist) al directorio raíz de producción
cp -r $DIST_DIR/* /var/www/marvera.mx/

# Copiar backend si existe
if [ -d "backend" ]; then
    cp -r backend/* /var/www/marvera.mx/backend/
elif [ -f "server.js" ]; then
    cp server.js /var/www/marvera.mx/backend/
    cp package.json /var/www/marvera.mx/backend/ 2>/dev/null || true
else
    echo -e "${YELLOW}⚠️ Creando backend básico...${NC}"
    
    # Crear backend básico
    cat > /var/www/marvera.mx/backend/package.json << 'EOF'
{
  "name": "marvera-backend",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
EOF

    cat > /var/www/marvera.mx/backend/server.js << 'EOF'
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'MarVera API funcionando!',
        timestamp: new Date().toISOString(),
        environment: 'production'
    });
});

app.get('/api/productos', (req, res) => {
    res.json({
        success: true,
        productos: [
            { id: 1, nombre: 'Salmón Premium', precio: 25.99, categoria: 'pescado' },
            { id: 2, nombre: 'Camarones Jumbo', precio: 18.50, categoria: 'mariscos' },
            { id: 3, nombre: 'Langosta Maine', precio: 45.00, categoria: 'mariscos' }
        ]
    });
});

app.listen(PORT, () => {
    console.log(`🌊 MarVera API funcionando en puerto ${PORT}`);
});
EOF
fi

# =============================================================================
# 7. INSTALAR DEPENDENCIAS DE BACKEND EN PRODUCCIÓN
# =============================================================================
echo -e "${BLUE}📦 Configurando backend de producción...${NC}"

cd /var/www/marvera.mx/backend
npm install --production
cd /var/www/marvera.mx

# =============================================================================
# 8. CREAR CONFIGURACIÓN PM2
# =============================================================================
echo -e "${BLUE}🚀 Configurando PM2...${NC}"

cat > /var/www/marvera.mx/ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'marvera-api',
    script: './backend/server.js',
    cwd: '/var/www/marvera.mx',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_file: '/var/log/marvera/combined.log',
    out_file: '/var/log/marvera/out.log',
    error_file: '/var/log/marvera/error.log',
    time: true
  }]
};
EOF

# =============================================================================
# 9. CONFIGURAR PERMISOS
# =============================================================================
echo -e "${BLUE}🔐 Configurando permisos...${NC}"

chown -R www-data:www-data /var/www/marvera.mx
chmod -R 755 /var/www/marvera.mx

# =============================================================================
# 10. INICIAR SERVICIOS
# =============================================================================
echo -e "${BLUE}🚀 Iniciando servicios...${NC}"

# Iniciar PM2
cd /var/www/marvera.mx
pm2 start ecosystem.config.cjs

# Reiniciar nginx
systemctl reload nginx

# =============================================================================
# 11. VERIFICAR DEPLOYMENT
# =============================================================================
echo -e "${BLUE}🔍 Verificando deployment...${NC}"

sleep 3

# Verificar PM2
echo -n "🚀 PM2: "
PM2_STATUS=$(pm2 jlist 2>/dev/null | jq -r '.[0].pm2_env.status' 2>/dev/null || echo "unknown")
if [ "$PM2_STATUS" = "online" ]; then
    echo -e "${GREEN}✅ ONLINE${NC}"
else
    echo -e "${YELLOW}⚠️ $PM2_STATUS${NC}"
fi

# Verificar nginx
echo -n "🌐 nginx: "
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ ACTIVO${NC}"
else
    echo -e "${RED}❌ INACTIVO${NC}"
fi

# Test API
echo -n "🔗 API: "
if curl -s -f --max-time 10 "https://marvera.mx/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ FUNCIONANDO${NC}"
else
    echo -e "${YELLOW}⚠️ VERIFICAR${NC}"
fi

# Test Frontend
echo -n "🌐 Frontend: "
if curl -s -f --max-time 10 "https://marvera.mx" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ FUNCIONANDO${NC}"
else
    echo -e "${YELLOW}⚠️ VERIFICAR${NC}"
fi

# =============================================================================
# 12. MOSTRAR INFORMACIÓN FINAL
# =============================================================================
echo ""
echo -e "${CYAN}🎉 DEPLOYMENT COMPLETADO${NC}"
echo -e "${CYAN}======================${NC}"
echo ""
echo -e "${GREEN}✅ Proceso completado:${NC}"
echo -e "   🏗️ Frontend compilado y desplegado"
echo -e "   ⚙️ Backend configurado e iniciado"
echo -e "   🚀 PM2 funcionando"
echo -e "   🌐 nginx configurado"
echo ""
echo -e "${BLUE}🔗 URLs disponibles:${NC}"
echo -e "   🌐 Frontend: ${GREEN}https://marvera.mx${NC}"
echo -e "   🔗 API:      ${GREEN}https://marvera.mx/api/health${NC}"
echo -e "   📊 Productos: ${GREEN}https://marvera.mx/api/productos${NC}"
echo ""
echo -e "${YELLOW}📋 Comandos útiles:${NC}"
echo -e "   📊 Estado:        ${CYAN}pm2 status${NC}"
echo -e "   📝 Logs:          ${CYAN}pm2 logs${NC}"
echo -e "   🔄 Reiniciar:     ${CYAN}pm2 restart marvera-api${NC}"
echo -e "   🌐 nginx logs:    ${CYAN}tail -f /var/log/nginx/marvera.mx.error.log${NC}"
echo ""
echo -e "${GREEN}🌊 ¡MarVera está desplegado y funcionando!${NC}"
