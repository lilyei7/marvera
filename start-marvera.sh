#!/bin/bash

# Script para iniciar MarVera completo
echo "🚀 Iniciando MarVera..."

# Función para verificar si un puerto está en uso
check_port() {
    netstat -an | grep ":$1 " > /dev/null 2>&1
}

# Verificar si el backend está corriendo
if check_port 3001; then
    echo "✅ Backend ya está ejecutándose en puerto 3001"
else
    echo "🔄 Iniciando backend..."
    cd "c:\Users\lilye\OneDrive\Desktop\marvera\backend"
    start "MarVera Backend" cmd /k "npm start"
    echo "⏳ Esperando que inicie el backend..."
    sleep 5
fi

# Verificar si el frontend está corriendo
if check_port 5173; then
    echo "✅ Frontend ya está ejecutándose en puerto 5173"
else
    echo "🔄 Iniciando frontend..."
    cd "c:\Users\lilye\OneDrive\Desktop\marvera"
    start "MarVera Frontend" cmd /k "npm run dev"
    echo "⏳ Esperando que inicie el frontend..."
    sleep 5
fi

echo "🎉 MarVera iniciado completamente!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:3001"
echo "👨‍💼 Admin Panel: http://localhost:5173/admin"
echo ""
echo "Credenciales de prueba:"
echo "👤 Admin: admin@marvera.com / admin123"
echo "👤 Usuario: user@marvera.com / user123"
