#!/bin/bash

echo "🗄️ Configurando PostgreSQL para MarVera"
echo "========================================"

# Instalar PostgreSQL si no está instalado
echo "📦 Instalando PostgreSQL..."
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Iniciar y habilitar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crear usuario y base de datos para MarVera
echo "👤 Configurando usuario y base de datos..."

sudo -u postgres psql << EOF
-- Crear usuario
CREATE USER marvera_user WITH PASSWORD 'MarvEr4_S3cur3_P4ss';

-- Crear base de datos
CREATE DATABASE marvera_db OWNER marvera_user;

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE marvera_db TO marvera_user;

-- Conectar a la base de datos
\c marvera_db

-- Otorgar permisos en el esquema public
GRANT ALL ON SCHEMA public TO marvera_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO marvera_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO marvera_user;

-- Mostrar info
\l
\du
EOF

echo "✅ PostgreSQL configurado correctamente"

# Verificar conexión
echo "🧪 Verificando conexión..."
PGPASSWORD='MarvEr4_S3cur3_P4ss' psql -h localhost -U marvera_user -d marvera_db -c "SELECT version();"

if [ $? -eq 0 ]; then
    echo "✅ Conexión a PostgreSQL exitosa"
else
    echo "❌ Error en conexión a PostgreSQL"
fi

echo ""
echo "📊 Información de la base de datos:"
echo "   • Host: localhost"
echo "   • Puerto: 5432"
echo "   • Base de datos: marvera_db"
echo "   • Usuario: marvera_user"
echo "   • Contraseña: MarvEr4_S3cur3_P4ss"
echo ""
echo "🔗 URL de conexión:"
echo "   postgresql://marvera_user:MarvEr4_S3cur3_P4ss@localhost:5432/marvera_db"
