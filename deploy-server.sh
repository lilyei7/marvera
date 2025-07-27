#!/bin/bash

# Script de despliegue para servidor Linux con Nginx
echo "🚀 Iniciando despliegue completo de MarVera..."

# Variables
SERVER_IP="187.33.155.127"
FRONTEND_PORT="5173"
BACKEND_PORT="3001"

echo "📋 Configuraciones del servidor:"
echo "IP del servidor: $SERVER_IP"
echo "Puerto frontend: $FRONTEND_PORT"
echo "Puerto backend: $BACKEND_PORT"

# Función para instalar nginx
install_nginx() {
    echo "🔧 Instalando y configurando Nginx..."
    
    # Actualizar paquetes
    sudo apt update
    
    # Instalar nginx
    sudo apt install -y nginx
    
    # Habilitar nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
    
    echo "✅ Nginx instalado y habilitado"
}

# Función para configurar nginx
setup_nginx() {
    echo "⚙️ Configurando Nginx para MarVera..."
    
    # Copiar configuración
    sudo cp nginx-marvera.conf /etc/nginx/sites-available/marvera
    
    # Crear enlace simbólico
    sudo ln -sf /etc/nginx/sites-available/marvera /etc/nginx/sites-enabled/
    
    # Remover configuración default si existe
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Verificar configuración
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        # Recargar nginx
        sudo systemctl reload nginx
        echo "✅ Nginx configurado correctamente"
    else
        echo "❌ Error en la configuración de Nginx"
        return 1
    fi
}

# Función para abrir puertos en el firewall
setup_firewall() {
    echo "🔥 Configurando firewall..."
    
    # Abrir puerto HTTP (80)
    sudo ufw allow 80/tcp
    echo "✅ Puerto 80 (HTTP) abierto"
    
    # Abrir puerto alternativo (8080)
    sudo ufw allow 8080/tcp
    echo "✅ Puerto 8080 abierto"
    
    # Abrir puertos internos (solo si es necesario para debugging)
    sudo ufw allow $FRONTEND_PORT/tcp
    sudo ufw allow $BACKEND_PORT/tcp
    echo "✅ Puertos internos configurados"
    
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
    
    # Crear archivo .env para nginx
    cat > .env << EOF
VITE_API_URL=http://$SERVER_IP
VITE_MAPBOX_TOKEN=pk.test.placeholder
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
VITE_SOCKET_URL=http://$SERVER_IP
EOF
    
    echo "✅ Variables de entorno configuradas para Nginx"
}

# Función para verificar servicios
check_services() {
    echo "🔍 Verificando servicios..."
    
    echo "Nginx status:"
    sudo systemctl status nginx --no-pager -l
    
    echo ""
    echo "Puertos escuchando:"
    sudo ss -tuln | grep -E "(80|8080|$FRONTEND_PORT|$BACKEND_PORT)"
    
    echo ""
    echo "Firewall status:"
    sudo ufw status
}

# Función para crear servicios systemd
create_systemd_services() {
    echo "⚙️ Creando servicios systemd..."
    
    # Servicio para el backend
    sudo tee /etc/systemd/system/marvera-backend.service > /dev/null << EOF
[Unit]
Description=MarVera Backend API
After=network.target

[Service]
Type=simple
User=\$USER
WorkingDirectory=$(pwd)/backend
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

    # Servicio para el frontend
    sudo tee /etc/systemd/system/marvera-frontend.service > /dev/null << EOF
[Unit]
Description=MarVera Frontend (Vite)
After=network.target

[Service]
Type=simple
User=\$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10
Environment=NODE_ENV=development

[Install]
WantedBy=multi-user.target
EOF

    # Recargar systemd
    sudo systemctl daemon-reload
    
    echo "✅ Servicios systemd creados"
}

# Función para iniciar servicios
start_services() {
    echo "🚀 Iniciando servicios..."
    
    # Habilitar e iniciar servicios
    sudo systemctl enable marvera-backend
    sudo systemctl enable marvera-frontend
    
    sudo systemctl start marvera-backend
    sudo systemctl start marvera-frontend
    
    echo "✅ Servicios iniciados"
}

# Función principal
main() {
    echo "🎯 Ejecutando configuración completa con Nginx..."
    
    # Ejecutar todas las funciones
    install_nginx
    setup_firewall
    install_dependencies
    setup_env
    setup_nginx
    create_systemd_services
    start_services
    
    echo ""
    echo "✅ ¡Configuración completada!"
    echo ""
    echo "🌐 Accesos disponibles:"
    echo "   Frontend: http://$SERVER_IP/"
    echo "   Admin:    http://$SERVER_IP/admin"
    echo "   API:      http://$SERVER_IP/api/health"
    echo "   Backup:   http://$SERVER_IP:8080/"
    echo ""
    echo "� Comandos útiles:"
    echo "   Ver logs backend:  sudo journalctl -u marvera-backend -f"
    echo "   Ver logs frontend: sudo journalctl -u marvera-frontend -f"
    echo "   Ver logs nginx:    sudo tail -f /var/log/nginx/marvera_error.log"
    echo "   Reiniciar nginx:   sudo systemctl restart nginx"
    echo ""
}

# Verificar argumentos
case "$1" in
    "nginx")
        install_nginx
        setup_nginx
        ;;
    "firewall")
        setup_firewall
        ;;
    "services")
        create_systemd_services
        start_services
        ;;
    "check")
        check_services
        ;;
    "env")
        setup_env
        ;;
    *)
        main
        ;;
esac
