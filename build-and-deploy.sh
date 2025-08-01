#!/bin/bash
# =============================================================================
# SCRIPT SIMPLE: SOLO BUILD Y DEPLOY
# =============================================================================
# Para cuando ya tienes el proyecto localmente y solo necesitas hacer build
# Ejecutar como: bash build-and-deploy.sh
# =============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🏗️ BUILD Y DEPLOY MARVERA${NC}"
echo -e "${CYAN}========================${NC}"
echo ""

# =============================================================================
# 1. VERIFICAR QUE ESTAMOS EN EL DIRECTORIO CORRECTO
# =============================================================================
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ No se encontró package.json en el directorio actual${NC}"
    echo -e "${YELLOW}💡 Asegúrate de estar en la raíz del proyecto MarVera${NC}"
    exit 1
fi

echo -e "${GREEN}✅ package.json encontrado${NC}"

# Mostrar información del proyecto
PROJECT_NAME=$(node -e "console.log(require('./package.json').name)" 2>/dev/null || echo "Desconocido")
PROJECT_VERSION=$(node -e "console.log(require('./package.json').version)" 2>/dev/null || echo "Desconocido")

echo -e "${BLUE}📊 Proyecto: $PROJECT_NAME v$PROJECT_VERSION${NC}"

# =============================================================================
# 2. INSTALAR DEPENDENCIAS
# =============================================================================
echo -e "${BLUE}📦 Instalando dependencias...${NC}"

if [ -f "package-lock.json" ]; then
    npm ci
else
    npm install
fi

echo -e "${GREEN}✅ Dependencias instaladas${NC}"

# =============================================================================
# 3. GENERAR BUILD (DIST)
# =============================================================================
echo -e "${BLUE}🏗️ Generando build del frontend...${NC}"

# Limpiar dist anterior si existe
rm -rf dist build

# Intentar varios comandos de build
BUILD_SUCCESS=false

if npm run build 2>/dev/null; then
    echo -e "${GREEN}✅ Build exitoso con 'npm run build'${NC}"
    BUILD_SUCCESS=true
elif npm run dist 2>/dev/null; then
    echo -e "${GREEN}✅ Build exitoso con 'npm run dist'${NC}"
    BUILD_SUCCESS=true
elif npx vite build 2>/dev/null; then
    echo -e "${GREEN}✅ Build exitoso con 'vite build'${NC}"
    BUILD_SUCCESS=true
else
    echo -e "${RED}❌ No se pudo generar el build${NC}"
    echo -e "${YELLOW}💡 Scripts disponibles:${NC}"
    node -e "const pkg = require('./package.json'); console.log(Object.keys(pkg.scripts || {}).join(', '));"
    exit 1
fi

# Verificar que se generó dist o build
DIST_DIR=""
if [ -d "dist" ]; then
    DIST_DIR="dist"
elif [ -d "build" ]; then
    DIST_DIR="build"
else
    echo -e "${RED}❌ No se encontró directorio dist o build${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build generado en: $DIST_DIR${NC}"
echo -e "${BLUE}📁 Contenido del build:${NC}"
ls -la $DIST_DIR/

# =============================================================================
# 4. PREPARAR ARCHIVOS PARA DEPLOY
# =============================================================================
echo -e "${BLUE}📦 Preparando archivos para deploy...${NC}"

# Crear directorio temporal para el deploy
DEPLOY_DIR="/tmp/marvera-deploy"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR/frontend
mkdir -p $DEPLOY_DIR/backend

# Copiar frontend
cp -r $DIST_DIR/* $DEPLOY_DIR/frontend/

# Preparar backend
if [ -d "backend" ]; then
    cp -r backend/* $DEPLOY_DIR/backend/
elif [ -d "server" ]; then
    cp -r server/* $DEPLOY_DIR/backend/
elif [ -f "server.js" ]; then
    cp server.js $DEPLOY_DIR/backend/
    cp package.json $DEPLOY_DIR/backend/ 2>/dev/null || true
else
    echo -e "${YELLOW}⚠️ No se encontró backend, creando uno básico...${NC}"
    
    # Crear backend básico
    cat > $DEPLOY_DIR/backend/package.json << 'EOF'
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

    cat > $DEPLOY_DIR/backend/server.js << 'EOF'
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
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🌊 MarVera API en puerto ${PORT}`);
});
EOF
fi

# Crear ecosystem config
cat > $DEPLOY_DIR/ecosystem.config.cjs << 'EOF'
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
    }
  }]
};
EOF

echo -e "${GREEN}✅ Archivos preparados en $DEPLOY_DIR${NC}"

# =============================================================================
# 5. MOSTRAR COMANDOS PARA DEPLOY EN SERVIDOR
# =============================================================================
echo ""
echo -e "${CYAN}📋 COMANDOS PARA EJECUTAR EN EL SERVIDOR${NC}"
echo -e "${CYAN}=======================================${NC}"
echo ""
echo -e "${YELLOW}1. Copiar archivos al servidor:${NC}"
echo -e "${BLUE}scp -r $DEPLOY_DIR/* root@tu-servidor:/var/www/marvera.mx/${NC}"
echo ""
echo -e "${YELLOW}2. En el servidor, ejecutar:${NC}"
echo -e "${BLUE}sudo systemctl stop nginx${NC}"
echo -e "${BLUE}sudo pm2 stop all${NC}"
echo -e "${BLUE}sudo rm -rf /var/www/marvera.mx/*${NC}"
echo -e "${BLUE}sudo cp -r $DEPLOY_DIR/frontend/* /var/www/marvera.mx/${NC}"
echo -e "${BLUE}sudo cp -r $DEPLOY_DIR/backend /var/www/marvera.mx/${NC}"
echo -e "${BLUE}sudo cp $DEPLOY_DIR/ecosystem.config.cjs /var/www/marvera.mx/${NC}"
echo -e "${BLUE}cd /var/www/marvera.mx/backend && sudo npm install --production${NC}"
echo -e "${BLUE}sudo chown -R www-data:www-data /var/www/marvera.mx${NC}"
echo -e "${BLUE}sudo chmod -R 755 /var/www/marvera.mx${NC}"
echo -e "${BLUE}cd /var/www/marvera.mx && sudo pm2 start ecosystem.config.cjs${NC}"
echo -e "${BLUE}sudo systemctl start nginx${NC}"
echo ""
echo -e "${YELLOW}3. Verificar:${NC}"
echo -e "${BLUE}curl https://marvera.mx/api/health${NC}"
echo -e "${BLUE}curl https://marvera.mx${NC}"
echo ""
echo -e "${GREEN}✅ Build completado! Archivos listos para deploy en:${NC}"
echo -e "${CYAN}$DEPLOY_DIR${NC}"
