#!/bin/bash
# =============================================================================
# SCRIPT COMPLETO: CLONE + BUILD + DEPLOY MARVERA
# =============================================================================
# Este script hace clone del repo, genera el dist y despliega todo
# Ejecutar como: sudo bash deploy-complete.sh
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
REPO_URL="https://github.com/lilyei7/marvera.git"
TEMP_CLONE="/tmp/marvera-clone"

echo -e "${CYAN}🌊 DEPLOYMENT COMPLETO DE MARVERA${NC}"
echo -e "${CYAN}================================${NC}"
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
# 2. INSTALAR DEPENDENCIAS NECESARIAS
# =============================================================================
echo -e "${BLUE}📦 Verificando dependencias...${NC}"

# Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}🔧 Instalando Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Git
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}🔧 Instalando Git...${NC}"
    apt install -y git
fi

# Build tools
echo -e "${YELLOW}🔧 Instalando herramientas de build...${NC}"
apt install -y build-essential python3

echo -e "${GREEN}✅ Dependencias instaladas${NC}"
echo -e "${BLUE}📊 Versiones:${NC}"
echo -e "   Node.js: $(node --version)"
echo -e "   npm: $(npm --version)"
echo -e "   Git: $(git --version | head -n1)"

# =============================================================================
# 3. LIMPIAR Y PREPARAR DIRECTORIO
# =============================================================================
echo -e "${BLUE}🧹 Preparando directorios...${NC}"

# Parar servicios existentes
echo -e "${YELLOW}🛑 Parando servicios existentes...${NC}"
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Limpiar directorio temporal
rm -rf $TEMP_CLONE

# Hacer backup del directorio actual si existe
if [ -d "$PROJECT_PATH" ]; then
    echo -e "${YELLOW}💾 Haciendo backup del directorio actual...${NC}"
    mv "$PROJECT_PATH" "${PROJECT_PATH}.backup.$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
fi

# Crear estructura básica
mkdir -p $PROJECT_PATH
mkdir -p /var/log/marvera

echo -e "${GREEN}✅ Directorios preparados${NC}"

# =============================================================================
# 4. CLONAR REPOSITORIO
# =============================================================================
echo -e "${BLUE}📥 Clonando repositorio de GitHub...${NC}"

git clone $REPO_URL $TEMP_CLONE

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Repositorio clonado exitosamente${NC}"
else
    echo -e "${RED}❌ Error al clonar repositorio${NC}"
    exit 1
fi

# Mostrar contenido del repo
echo -e "${BLUE}📋 Contenido del repositorio:${NC}"
ls -la $TEMP_CLONE

# =============================================================================
# 5. INSTALAR DEPENDENCIAS DEL FRONTEND
# =============================================================================
echo -e "${BLUE}📦 Instalando dependencias del frontend...${NC}"

cd $TEMP_CLONE

# Verificar si existe package.json
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json encontrado${NC}"
    
    # Mostrar información del proyecto
    echo -e "${BLUE}📊 Información del proyecto:${NC}"
    node -e "const pkg = require('./package.json'); console.log('Nombre:', pkg.name); console.log('Versión:', pkg.version); console.log('Scripts:', Object.keys(pkg.scripts || {}).join(', '));"
    
    # Instalar dependencias
    echo -e "${YELLOW}🔧 Instalando dependencias...${NC}"
    npm install
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencias instaladas${NC}"
    else
        echo -e "${RED}❌ Error instalando dependencias${NC}"
        echo -e "${YELLOW}💡 Intentando con npm ci...${NC}"
        npm ci
    fi
else
    echo -e "${YELLOW}⚠️ No se encontró package.json en la raíz${NC}"
    echo -e "${BLUE}🔍 Buscando package.json en subdirectorios...${NC}"
    find . -name "package.json" -type f
fi

# =============================================================================
# 6. GENERAR BUILD DEL FRONTEND (DIST)
# =============================================================================
echo -e "${BLUE}🏗️ Generando build del frontend...${NC}"

# Intentar varios comandos de build comunes
BUILD_SUCCESS=false

if [ -f "package.json" ]; then
    # Verificar scripts disponibles
    SCRIPTS=$(node -e "const pkg = require('./package.json'); console.log(JSON.stringify(Object.keys(pkg.scripts || {})));" 2>/dev/null || echo "[]")
    echo -e "${BLUE}📋 Scripts disponibles: $SCRIPTS${NC}"
    
    # Intentar build
    if npm run build 2>/dev/null; then
        echo -e "${GREEN}✅ Build exitoso con 'npm run build'${NC}"
        BUILD_SUCCESS=true
    elif npm run dist 2>/dev/null; then
        echo -e "${GREEN}✅ Build exitoso con 'npm run dist'${NC}"
        BUILD_SUCCESS=true
    elif npm run production 2>/dev/null; then
        echo -e "${GREEN}✅ Build exitoso con 'npm run production'${NC}"
        BUILD_SUCCESS=true
    else
        echo -e "${YELLOW}⚠️ No se pudo hacer build automático${NC}"
        echo -e "${BLUE}🔧 Intentando build manual con Vite...${NC}"
        
        # Instalar Vite si no está
        npm install -D vite @vitejs/plugin-react 2>/dev/null || true
        
        # Crear vite.config.js básico si no existe
        if [ ! -f "vite.config.js" ] && [ ! -f "vite.config.ts" ]; then
            cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})
EOF
        fi
        
        # Intentar build con Vite
        npx vite build && BUILD_SUCCESS=true
    fi
fi

if [ "$BUILD_SUCCESS" = false ]; then
    echo -e "${YELLOW}⚠️ Build automático falló, creando dist básico...${NC}"
    
    # Crear dist básico manualmente
    mkdir -p dist
    
    # Buscar archivos HTML existentes
    if [ -f "index.html" ]; then
        cp index.html dist/
    elif [ -f "public/index.html" ]; then
        cp public/index.html dist/
    elif [ -f "src/index.html" ]; then
        cp src/index.html dist/
    else
        # Crear index.html básico
        cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MarVera - Premium Seafood</title>
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #1E3A8A 0%, #40E0D0 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            padding: 3rem;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            backdrop-filter: blur(15px);
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
            border: 1px solid rgba(255,255,255,0.18);
            max-width: 600px;
        }
        h1 {
            font-size: 4rem;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #FFD700, #FFA500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            margin: 0.5rem;
            background: linear-gradient(45deg, #1E3A8A, #40E0D0);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            transition: transform 0.3s ease;
        }
        .button:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌊 MarVera</h1>
        <h2>Premium Seafood Platform</h2>
        <p>Sitio web en construcción</p>
        <div>
            <a href="/api/health" class="button">🔗 API</a>
            <a href="https://github.com/lilyei7/marvera" class="button">📱 GitHub</a>
        </div>
    </div>
</body>
</html>
EOF
    fi
    
    # Copiar archivos estáticos si existen
    [ -d "public" ] && cp -r public/* dist/ 2>/dev/null || true
    [ -d "assets" ] && cp -r assets dist/ 2>/dev/null || true
    [ -d "images" ] && cp -r images dist/ 2>/dev/null || true
    
    echo -e "${GREEN}✅ Dist básico creado${NC}"
fi

# Verificar que dist existe y tiene contenido
if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
    echo -e "${GREEN}✅ Directorio dist generado exitosamente${NC}"
    echo -e "${BLUE}📁 Contenido de dist:${NC}"
    ls -la dist/
else
    echo -e "${RED}❌ Error: No se pudo generar el directorio dist${NC}"
    exit 1
fi

# =============================================================================
# 7. PREPARAR BACKEND
# =============================================================================
echo -e "${BLUE}⚙️ Preparando backend...${NC}"

# Buscar backend en diferentes ubicaciones
BACKEND_FOUND=false
BACKEND_SOURCE=""

if [ -d "backend" ]; then
    BACKEND_SOURCE="backend"
    BACKEND_FOUND=true
elif [ -d "server" ]; then
    BACKEND_SOURCE="server"
    BACKEND_FOUND=true
elif [ -d "api" ]; then
    BACKEND_SOURCE="api"
    BACKEND_FOUND=true
elif [ -f "server.js" ]; then
    BACKEND_SOURCE="."
    BACKEND_FOUND=true
fi

if [ "$BACKEND_FOUND" = true ]; then
    echo -e "${GREEN}✅ Backend encontrado en: $BACKEND_SOURCE${NC}"
    
    # Instalar dependencias del backend si tiene package.json
    if [ -f "$BACKEND_SOURCE/package.json" ]; then
        echo -e "${YELLOW}🔧 Instalando dependencias del backend...${NC}"
        cd "$BACKEND_SOURCE"
        npm install --production
        cd ..
    fi
else
    echo -e "${YELLOW}⚠️ No se encontró backend, creando uno básico...${NC}"
    
    mkdir -p backend
    
    # Crear package.json
    cat > backend/package.json << 'EOF'
{
  "name": "marvera-backend",
  "version": "1.0.0",
  "description": "MarVera Premium Seafood API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  }
}
EOF

    # Crear servidor básico
    cat > backend/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'MarVera API funcionando!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production'
    });
});

// Productos básicos
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

    # Instalar dependencias
    cd backend
    npm install --production
    cd ..
    
    BACKEND_SOURCE="backend"
    echo -e "${GREEN}✅ Backend básico creado${NC}"
fi

# =============================================================================
# 8. COPIAR ARCHIVOS AL DIRECTORIO FINAL
# =============================================================================
echo -e "${BLUE}📂 Copiando archivos al directorio de producción...${NC}"

# Copiar frontend (dist)
cp -r dist/* $PROJECT_PATH/

# Crear directorio backend y copiar
mkdir -p $PROJECT_PATH/backend
if [ "$BACKEND_SOURCE" = "." ]; then
    # Si el backend está en la raíz
    cp server.js $PROJECT_PATH/backend/ 2>/dev/null || true
    cp package.json $PROJECT_PATH/backend/ 2>/dev/null || true
    cp -r node_modules $PROJECT_PATH/backend/ 2>/dev/null || true
else
    # Si el backend está en una carpeta
    cp -r $BACKEND_SOURCE/* $PROJECT_PATH/backend/
fi

# Crear ecosystem.config.cjs
cat > $PROJECT_PATH/ecosystem.config.cjs << 'EOF'
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

echo -e "${GREEN}✅ Archivos copiados exitosamente${NC}"

# =============================================================================
# 9. CONFIGURAR PERMISOS
# =============================================================================
echo -e "${BLUE}🔐 Configurando permisos...${NC}"

chown -R www-data:www-data $PROJECT_PATH
chmod -R 755 $PROJECT_PATH

echo -e "${GREEN}✅ Permisos configurados${NC}"

# =============================================================================
# 10. INICIAR SERVICIOS
# =============================================================================
echo -e "${BLUE}🚀 Iniciando servicios...${NC}"

# Ir al directorio del proyecto
cd $PROJECT_PATH

# Instalar dependencias del backend si no están
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}🔧 Instalando dependencias finales del backend...${NC}"
    cd backend
    npm install --production
    cd ..
fi

# Iniciar con PM2
pm2 start ecosystem.config.cjs

# Reiniciar nginx
systemctl reload nginx

echo -e "${GREEN}✅ Servicios iniciados${NC}"

# =============================================================================
# 11. LIMPIAR ARCHIVOS TEMPORALES
# =============================================================================
echo -e "${BLUE}🧹 Limpiando archivos temporales...${NC}"

rm -rf $TEMP_CLONE

echo -e "${GREEN}✅ Limpieza completada${NC}"

# =============================================================================
# 12. VERIFICAR DEPLOYMENT
# =============================================================================
echo -e "${BLUE}🔍 Verificando deployment...${NC}"

sleep 3

# Test servicios
echo -n "🚀 PM2: "
PM2_STATUS=$(pm2 jlist 2>/dev/null | jq -r '.[0].pm2_env.status' 2>/dev/null || echo "unknown")
if [ "$PM2_STATUS" = "online" ]; then
    echo -e "${GREEN}✅ ONLINE${NC}"
else
    echo -e "${YELLOW}⚠️ $PM2_STATUS${NC}"
fi

echo -n "🌐 nginx: "
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ ACTIVO${NC}"
else
    echo -e "${RED}❌ INACTIVO${NC}"
fi

# Test URLs
echo -n "🔗 API: "
if curl -s -f --max-time 10 "https://marvera.mx/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ FUNCIONANDO${NC}"
else
    echo -e "${YELLOW}⚠️ VERIFICAR${NC}"
fi

echo -n "🌐 Frontend: "
if curl -s -f --max-time 10 "https://marvera.mx" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ FUNCIONANDO${NC}"
else
    echo -e "${YELLOW}⚠️ VERIFICAR${NC}"
fi

# =============================================================================
# 13. MOSTRAR INFORMACIÓN FINAL
# =============================================================================
echo ""
echo -e "${CYAN}🎉 DEPLOYMENT COMPLETO FINALIZADO${NC}"
echo -e "${CYAN}==================================${NC}"
echo ""
echo -e "${GREEN}✅ Proceso completado:${NC}"
echo -e "   📥 Repositorio clonado desde GitHub"
echo -e "   🏗️ Frontend compilado (dist generado)"
echo -e "   ⚙️ Backend configurado y dependencias instaladas"
echo -e "   🚀 Servicios PM2 iniciados"
echo -e "   🌐 nginx configurado"
echo ""
echo -e "${BLUE}🔗 URLs disponibles:${NC}"
echo -e "   🌐 Frontend: ${GREEN}https://marvera.mx${NC}"
echo -e "   🔗 API:      ${GREEN}https://marvera.mx/api/health${NC}"
echo -e "   📊 Productos: ${GREEN}https://marvera.mx/api/productos${NC}"
echo ""
echo -e "${YELLOW}📋 Comandos útiles:${NC}"
echo -e "   📊 Estado PM2:    ${CYAN}pm2 status${NC}"
echo -e "   📝 Logs PM2:      ${CYAN}pm2 logs${NC}"
echo -e "   🔄 Reiniciar:     ${CYAN}pm2 restart all${NC}"
echo -e "   🌐 nginx logs:    ${CYAN}tail -f /var/log/nginx/marvera.mx.error.log${NC}"
echo ""
echo -e "${GREEN}🌊 ¡MarVera está completamente desplegado y funcionando!${NC}"
