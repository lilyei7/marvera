#!/bin/bash

# Script de reparación rápida para MarVera
echo "🔧 Reparación rápida de MarVera..."
echo "================================="

# Variables
SERVER_IP="187.33.155.127"

# Función para matar procesos problemáticos
kill_processes() {
    echo "🔄 Matando procesos problemáticos..."
    
    # Matar procesos de node en puertos específicos
    sudo fuser -k 3001/tcp 2>/dev/null || echo "Puerto 3001 libre"
    sudo fuser -k 5173/tcp 2>/dev/null || echo "Puerto 5173 libre"
    
    # Esperar un momento
    sleep 2
}

# Función para reiniciar servicios systemd
restart_systemd() {
    echo "⚙️ Reiniciando servicios systemd..."
    
    # Detener servicios
    sudo systemctl stop marvera-backend marvera-frontend 2>/dev/null
    
    # Esperar
    sleep 3
    
    # Iniciar servicios
    sudo systemctl start marvera-backend
    sudo systemctl start marvera-frontend
    
    # Verificar estado
    echo "📊 Estado de servicios:"
    sudo systemctl status marvera-backend --no-pager -l
    sudo systemctl status marvera-frontend --no-pager -l
}

# Función para ejecutar manualmente
start_manual() {
    echo "🚀 Iniciando manualmente (usar en terminales separadas)..."
    
    echo "Terminal 1 - Backend:"
    echo "cd $(pwd)/backend && npm run dev"
    
    echo ""
    echo "Terminal 2 - Frontend:"
    echo "cd $(pwd) && npm run dev"
    
    echo ""
    echo "⚠️  Ejecuta estos comandos en terminales separadas si systemd no funciona"
}

# Función para verificar nginx
check_nginx() {
    echo "🔍 Verificando Nginx..."
    
    # Verificar configuración
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        echo "✅ Configuración de Nginx válida"
        sudo systemctl restart nginx
        echo "✅ Nginx reiniciado"
    else
        echo "❌ Error en configuración de Nginx"
        return 1
    fi
}

# Función para verificar dependencias
check_dependencies() {
    echo "📦 Verificando dependencias..."
    
    # Frontend
    if [ ! -d "node_modules" ]; then
        echo "📦 Instalando dependencias del frontend..."
        npm install
    fi
    
    # Backend
    if [ ! -d "backend/node_modules" ]; then
        echo "📦 Instalando dependencias del backend..."
        cd backend && npm install && cd ..
    fi
}

# Función principal de reparación
repair() {
    echo "🎯 Iniciando reparación completa..."
    
    # Actualizar código
    echo "📥 Actualizando código desde GitHub..."
    git pull origin main
    
    # Verificar dependencias
    check_dependencies
    
    # Verificar nginx
    check_nginx
    
    # Matar procesos problemáticos
    kill_processes
    
    # Intentar systemd primero
    if sudo systemctl list-unit-files | grep -q marvera-backend; then
        echo "⚙️ Usando servicios systemd..."
        restart_systemd
    else
        echo "⚠️  Servicios systemd no encontrados"
        start_manual
        return 0
    fi
    
    # Verificar que todo funcione
    sleep 5
    echo ""
    echo "🔍 Verificación final:"
    
    # Verificar puertos
    if sudo ss -tuln | grep -q ":3001 "; then
        echo "✅ Backend escuchando en puerto 3001"
    else
        echo "❌ Backend NO está escuchando en puerto 3001"
        echo "🔧 Ejecutar manualmente: cd backend && npm run dev"
    fi
    
    if sudo ss -tuln | grep -q ":5173 "; then
        echo "✅ Frontend escuchando en puerto 5173"
    else
        echo "❌ Frontend NO está escuchando en puerto 5173"
        echo "🔧 Ejecutar manualmente: npm run dev"
    fi
    
    if sudo ss -tuln | grep -q ":80 "; then
        echo "✅ Nginx escuchando en puerto 80"
    else
        echo "❌ Nginx NO está escuchando en puerto 80"
        echo "🔧 Ejecutar: sudo systemctl start nginx"
    fi
    
    echo ""
    echo "🌐 URLs para verificar:"
    echo "   Frontend: http://$SERVER_IP/"
    echo "   Admin:    http://$SERVER_IP/admin"
    echo "   API:      http://$SERVER_IP/api/health"
    echo ""
    echo "📋 Ver logs en tiempo real:"
    echo "   Backend:  sudo journalctl -u marvera-backend -f"
    echo "   Frontend: sudo journalctl -u marvera-frontend -f"
    echo "   Nginx:    sudo tail -f /var/log/nginx/marvera_error.log"
}

# Función de reparación rápida (solo reiniciar)
quick_restart() {
    echo "⚡ Reinicio rápido..."
    kill_processes
    sudo systemctl restart nginx marvera-backend marvera-frontend
    sleep 3
    echo "✅ Reinicio completado"
}

# Verificar argumentos
case "$1" in
    "quick")
        quick_restart
        ;;
    "manual")
        start_manual
        ;;
    "nginx")
        check_nginx
        ;;
    "deps")
        check_dependencies
        ;;
    *)
        repair
        ;;
esac
