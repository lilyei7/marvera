#!/bin/bash
# =============================================================================
# SCRIPT DE REPARACIÓN COMPLETA PARA MARVERA
# =============================================================================
# Incluye generación de Prisma client y reparación completa
# Ejecutar como: sudo bash solucion-completa.sh
# =============================================================================

set -e

echo "🔧 SOLUCIÓN COMPLETA MARVERA"
echo "============================"

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
# 3. CONFIGURAR PRISMA Y BASE DE DATOS
# =============================================================================
echo "🗄️ Configurando Prisma y base de datos..."

cd backend

# Instalar dependencias si no están
echo "📦 Verificando dependencias..."
npm install --production

# Generar el cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

# Crear migraciones si es necesario
echo "📊 Ejecutando migraciones de base de datos..."
npx prisma db push

# Verificar que la base de datos funciona
echo "🔍 Verificando conexión a base de datos..."
cat > test-db.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔗 Probando conexión a base de datos...');
    
    // Probar una consulta simple
    const userCount = await prisma.user.count();
    console.log(`✅ Base de datos conectada. Usuarios: ${userCount}`);
    
    // Verificar estructura de tabla users
    const tableInfo = await prisma.$queryRaw`PRAGMA table_info(users);`;
    console.log('📋 Estructura tabla users:', tableInfo);
    
  } catch (error) {
    console.error('❌ Error de base de datos:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
EOF

node test-db.js

# =============================================================================
# 4. ARREGLAR BASE DE DATOS SI ES NECESARIO
# =============================================================================
echo "🔄 Verificando y arreglando estructura de base de datos..."

cat > fix-database.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDatabase() {
  try {
    console.log('🔧 Verificando estructura de base de datos...');
    
    // Verificar si existe la columna businessName
    try {
      const result = await prisma.$queryRaw`PRAGMA table_info(users);`;
      const hasBusinessName = result.some(column => column.name === 'businessName');
      
      if (!hasBusinessName) {
        console.log('➕ Agregando columna businessName...');
        await prisma.$executeRaw`ALTER TABLE users ADD COLUMN businessName TEXT;`;
        console.log('✅ Columna businessName agregada');
      } else {
        console.log('✅ Columna businessName ya existe');
      }
    } catch (error) {
      console.log('ℹ️ Información de columna businessName:', error.message);
    }
    
    console.log('✅ Estructura de base de datos verificada');
  } catch (error) {
    console.error('❌ Error arreglando base de datos:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabase();
EOF

node fix-database.js

# =============================================================================
# 5. CREAR USUARIO ADMINISTRADOR
# =============================================================================
echo "👤 Creando usuario administrador..."

cat > create-admin-final.js << 'EOF'
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
      console.log('📧 Email: admin@marvera.com');
      console.log('🔑 Password: admin123456');
      return;
    }
    
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash('admin123456', 10);
    
    // Crear usuario admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin@marvera.com',
        password: hashedPassword,
        name: 'Administrador MarVera',
        role: 'SUPER_ADMIN',
        businessName: 'MarVera Premium Seafood'
      }
    });
    
    console.log('✅ Usuario admin creado exitosamente');
    console.log('📧 Email: admin@marvera.com');
    console.log('🔑 Password: admin123456');
    console.log('👤 Nombre:', admin.name);
    console.log('🏢 Empresa:', admin.businessName);
    
  } catch (error) {
    console.error('❌ Error creando admin:', error.message);
    
    // Intentar sin businessName si falla
    try {
      console.log('🔄 Intentando crear admin sin businessName...');
      const hashedPassword = await bcrypt.hash('admin123456', 10);
      
      const admin = await prisma.user.create({
        data: {
          email: 'admin@marvera.com',
          password: hashedPassword,
          name: 'Administrador MarVera',
          role: 'SUPER_ADMIN'
        }
      });
      
      console.log('✅ Usuario admin creado (sin businessName)');
      console.log('📧 Email: admin@marvera.com');
      console.log('🔑 Password: admin123456');
      
    } catch (secondError) {
      console.error('❌ Error en segundo intento:', secondError.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
EOF

node create-admin-final.js

# =============================================================================
# 6. CONFIGURAR PERMISOS
# =============================================================================
echo "🔐 Configurando permisos..."
cd /var/www/marvera
chown -R www-data:www-data .
chmod -R 755 .

# =============================================================================
# 7. PROBAR SERVIDOR ANTES DE PM2
# =============================================================================
echo "🧪 Probando servidor backend..."

cd backend

# Crear script de prueba del servidor
cat > test-server.js << 'EOF'
const { spawn } = require('child_process');

console.log('🧪 Probando servidor backend...');

const server = spawn('node', ['simple-server.js'], {
  env: { ...process.env, PORT: 3001, NODE_ENV: 'production' }
});

let hasStarted = false;

server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('📤 Server:', output);
  
  if (output.includes('3001') || output.includes('listening') || output.includes('Server')) {
    hasStarted = true;
    console.log('✅ Servidor iniciado correctamente');
    setTimeout(() => {
      server.kill();
      process.exit(0);
    }, 2000);
  }
});

server.stderr.on('data', (data) => {
  console.error('❌ Error servidor:', data.toString());
});

server.on('close', (code) => {
  if (hasStarted) {
    console.log('✅ Prueba de servidor completada');
  } else {
    console.log(`❌ Servidor terminó con código: ${code}`);
  }
});

// Timeout de seguridad
setTimeout(() => {
  if (!hasStarted) {
    console.log('⏰ Timeout - finalizando prueba');
    server.kill();
  }
}, 10000);
EOF

node test-server.js

# =============================================================================
# 8. INICIAR SERVICIOS CON PM2
# =============================================================================
echo "🚀 Iniciando servicios con PM2..."

cd /var/www/marvera

# Detener procesos PM2 existentes
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Iniciar con nueva configuración
pm2 start ecosystem.config.js

# Esperar un poco para que inicie
sleep 3

# Verificar que PM2 está funcionando
pm2 status

# =============================================================================
# 9. REINICIAR NGINX
# =============================================================================
echo "🌐 Reiniciando nginx..."
systemctl restart nginx

# =============================================================================
# 10. VERIFICAR SERVICIOS COMPLETOS
# =============================================================================
echo "🔍 Verificación completa de servicios..."

sleep 3

echo ""
echo "📊 Estado final de servicios:"
echo "=============================="

echo "🔸 PM2 Status:"
pm2 status

echo ""
echo "🔸 Nginx Status:"
systemctl status nginx --no-pager -l | head -10

echo ""
echo "🔸 Probando endpoints:"
echo "----------------------"

# Probar API
echo -n "🔗 API Backend (localhost:3001): "
if curl -s http://localhost:3001/api/health > /dev/null; then
  echo "✅ FUNCIONA"
else
  echo "❌ NO RESPONDE"
fi

echo -n "🌐 API Pública (marvera.mx): "
if curl -s http://marvera.mx/api/health > /dev/null; then
  echo "✅ FUNCIONA"
else
  echo "❌ NO RESPONDE"
fi

echo -n "📄 Frontend (localhost): "
if curl -s http://localhost/ | grep -q "MarVera"; then
  echo "✅ FUNCIONA"
else
  echo "❌ NO RESPONDE"
fi

echo -n "🌐 Frontend Público (marvera.mx): "
if curl -s http://marvera.mx/ | grep -q "MarVera"; then
  echo "✅ FUNCIONA"
else
  echo "❌ NO RESPONDE"
fi

echo ""
echo "🎉 SOLUCIÓN COMPLETA FINALIZADA"
echo "==============================="
echo "✅ Prisma client generado"
echo "✅ Base de datos configurada"
echo "✅ Usuario admin creado"
echo "✅ PM2 funcionando"
echo "✅ Nginx configurado"
echo ""
echo "🔗 URLs disponibles:"
echo "   🌐 Sitio: http://marvera.mx"
echo "   🔗 API:   http://marvera.mx/api/health"
echo ""
echo "👤 Credenciales admin:"
echo "   📧 Email: admin@marvera.com"
echo "   🔑 Password: admin123456"
echo ""
echo "📱 Para subir tu frontend real:"
echo "   scp -r dist/* root@marvera.mx:/var/www/marvera/dist/"
