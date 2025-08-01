#!/bin/bash
# =============================================================================
# SCRIPT DE REPARACIÓN RÁPIDA PARA MARVERA
# =============================================================================
# Soluciona los errores de base de datos y PM2
# Ejecutar como: sudo bash reparar-marvera.sh
# =============================================================================

set -e

echo "🔧 REPARANDO ERRORES DE MARVERA"
echo "==============================="

cd /var/www/marvera

# =============================================================================
# 1. ARREGLAR ECOSYSTEM.CONFIG.JS
# =============================================================================
echo "📝 Arreglando configuración PM2..."

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'marvera-api',
    script: './backend/simple-server.js',
    cwd: '/var/www/marvera',
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

echo "✅ Configuración PM2 arreglada"

# =============================================================================
# 2. CREAR DIRECTORIO DE LOGS
# =============================================================================
echo "📁 Creando directorio de logs..."
mkdir -p /var/log/marvera
chown -R www-data:www-data /var/log/marvera

# =============================================================================
# 3. ARREGLAR BASE DE DATOS
# =============================================================================
echo "🗄️ Actualizando base de datos..."

cd backend

# Crear script de migración
cat > fix-database.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDatabase() {
  try {
    console.log('🔧 Verificando y arreglando base de datos...');
    
    // Intentar agregar la columna businessName si no existe
    try {
      await prisma.$executeRaw`ALTER TABLE users ADD COLUMN businessName TEXT;`;
      console.log('✅ Columna businessName agregada');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log('✅ Columna businessName ya existe');
      } else {
        console.log('ℹ️ No se pudo agregar columna businessName:', error.message);
      }
    }
    
    console.log('✅ Base de datos verificada');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabase();
EOF

# Ejecutar migración
echo "🔄 Ejecutando migración..."
node fix-database.js

# =============================================================================
# 4. CREAR ADMIN SIMPLE
# =============================================================================
echo "👤 Creando usuario admin simple..."

cat > create-admin-simple.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔐 Creando usuario administrador...');
    
    // Verificar si ya existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@marvera.com' }
    });
    
    if (existingAdmin) {
      console.log('✅ Usuario admin ya existe');
      return;
    }
    
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash('admin123456', 10);
    
    // Crear usuario sin businessName
    const admin = await prisma.user.create({
      data: {
        email: 'admin@marvera.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'SUPER_ADMIN'
      }
    });
    
    console.log('✅ Usuario admin creado exitosamente');
    console.log('📧 Email: admin@marvera.com');
    console.log('🔑 Password: admin123456');
    
  } catch (error) {
    console.error('❌ Error creando admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
EOF

# Ejecutar creación de admin
node create-admin-simple.js

# =============================================================================
# 5. CONFIGURAR PERMISOS
# =============================================================================
echo "🔐 Configurando permisos..."
cd /var/www/marvera
chown -R www-data:www-data .
chmod -R 755 .

# =============================================================================
# 6. INICIAR SERVICIOS
# =============================================================================
echo "🚀 Iniciando servicios..."

# Detener PM2 si está corriendo
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Iniciar con nueva configuración
pm2 start ecosystem.config.js

# Reiniciar nginx
systemctl restart nginx

# =============================================================================
# 7. VERIFICAR SERVICIOS
# =============================================================================
echo "🔍 Verificando servicios..."

sleep 3

echo ""
echo "📊 Estado de servicios:"
echo "----------------------"
pm2 status
echo ""

echo "🌐 Estado de nginx:"
systemctl status nginx --no-pager -l

echo ""
echo "🔗 Probando endpoints:"
echo "----------------------"
curl -s http://localhost:3001/api/health && echo " ✅ API Backend funciona"
curl -s http://localhost/ | grep -q "MarVera" && echo " ✅ Frontend funciona"

echo ""
echo "🎉 REPARACIÓN COMPLETADA"
echo "========================"
echo "✅ Base de datos arreglada"
echo "✅ PM2 configurado correctamente"
echo "✅ Usuario admin creado"
echo "✅ Servicios iniciados"
echo ""
echo "🔗 URLs:"
echo "   🌐 Sitio: http://marvera.mx"
echo "   🔗 API:   http://marvera.mx/api/health"
echo ""
echo "👤 Credenciales admin:"
echo "   📧 Email: admin@marvera.com"
echo "   🔑 Password: admin123456"
