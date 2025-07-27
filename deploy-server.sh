#!/bin/bash

# Script de despliegue para servidor Linux
echo "🚀 Iniciando despliegue de MarVera..."

# Variables
SERVER_IP="187.33.155.127"
FRONTEND_PORT="5173"
BACKEND_PORT="3001"

echo "📋 Configuraciones del servidor:"
echo "IP del servidor: $SERVER_IP"
echo "Puerto frontend: $FRONTEND_PORT"
echo "Puerto backend: $BACKEND_PORT"

# Función para abrir puertos en el firewall
setup_firewall() {
    echo "🔥 Configurando firewall..."
    
    # Abrir puerto del frontend
    sudo ufw allow $FRONTEND_PORT/tcp
    echo "✅ Puerto $FRONTEND_PORT abierto para frontend"
    
    # Abrir puerto del backend
    sudo ufw allow $BACKEND_PORT/tcp
    echo "✅ Puerto $BACKEND_PORT abierto para backend"
    
    # Verificar estado del firewall
    sudo ufw status
}

# Función para instalar dependencias
install_dependencies() {
    echo "📦 Instalando dependencias..."
    
    # Frontend
    echo "🎨 Instalando dependencias del frontend..."
    npm install
    
    # Backend
    echo "🔧 Instalando dependencias del backend..."
    cd backend
    npm install
    cd ..
    
    echo "✅ Dependencias instaladas"
}

# Función para configurar variables de entorno
setup_env() {
    echo "⚙️ Configurando variables de entorno..."
    
    # Crear archivo .env para producción
    cat > .env << EOF
VITE_API_URL=http://$SERVER_IP:$BACKEND_PORT
VITE_MAPBOX_TOKEN=pk.test.placeholder
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
VITE_SOCKET_URL=http://$SERVER_IP:$BACKEND_PORT
EOF
    
    echo "✅ Variables de entorno configuradas"
}

# Función para verificar que los puertos estén escuchando
check_ports() {
    echo "🔍 Verificando puertos..."
    
    echo "Frontend (puerto $FRONTEND_PORT):"
    ss -tuln | grep $FRONTEND_PORT || echo "❌ Puerto $FRONTEND_PORT no está escuchando"
    
    echo "Backend (puerto $BACKEND_PORT):"
    ss -tuln | grep $BACKEND_PORT || echo "❌ Puerto $BACKEND_PORT no está escuchando"
}

# Función principal
main() {
    echo "🎯 Ejecutando configuración completa..."
    
    # Ejecutar todas las funciones
    setup_firewall
    install_dependencies
    setup_env
    
    echo ""
    echo "✅ Configuración completada!"
    echo ""
    echo "📝 Próximos pasos:"
    echo "1. Ejecutar el backend: cd backend && npm run dev"
    echo "2. Ejecutar el frontend: npm run dev"
    echo "3. Acceder desde: http://$SERVER_IP:$FRONTEND_PORT"
    echo ""
    echo "🔍 Para verificar puertos ejecuta: bash deploy-server.sh check"
}

# Verificar argumentos
if [ "$1" = "check" ]; then
    check_ports
elif [ "$1" = "firewall" ]; then
    setup_firewall
elif [ "$1" = "env" ]; then
    setup_env
else
    main
fi
