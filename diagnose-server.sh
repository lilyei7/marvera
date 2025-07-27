#!/bin/bash

# Script de diagnóstico para MarVera
echo "🔍 Diagnóstico completo de MarVera..."
echo "======================================"

# Variables
SERVER_IP="187.33.155.127"
FRONTEND_PORT="5173"
BACKEND_PORT="3001"

# Función para verificar puertos
check_ports() {
    echo ""
    echo "📊 Estado de puertos:"
    echo "--------------------"
    
    echo "🔍 Puerto 80 (Nginx):"
    sudo ss -tuln | grep ":80 " || echo "❌ Nginx no está escuchando en puerto 80"
    
    echo "🔍 Puerto $BACKEND_PORT (Backend):"
    sudo ss -tuln | grep ":$BACKEND_PORT " || echo "❌ Backend no está escuchando en puerto $BACKEND_PORT"
    
    echo "🔍 Puerto $FRONTEND_PORT (Frontend):"
    sudo ss -tuln | grep ":$FRONTEND_PORT " || echo "❌ Frontend no está escuchando en puerto $FRONTEND_PORT"
}

# Función para verificar servicios
check_services() {
    echo ""
    echo "⚙️ Estado de servicios:"
    echo "----------------------"
    
    echo "🔍 Nginx:"
    sudo systemctl is-active nginx && echo "✅ Nginx activo" || echo "❌ Nginx inactivo"
    
    echo "🔍 Backend MarVera:"
    sudo systemctl is-active marvera-backend 2>/dev/null && echo "✅ Backend activo" || echo "❌ Backend inactivo"
    
    echo "🔍 Frontend MarVera:"
    sudo systemctl is-active marvera-frontend 2>/dev/null && echo "✅ Frontend activo" || echo "❌ Frontend inactivo"
}

# Función para verificar logs
check_logs() {
    echo ""
    echo "📋 Últimos logs (últimas 10 líneas):"
    echo "------------------------------------"
    
    echo "🔍 Logs de Nginx:"
    sudo tail -n 5 /var/log/nginx/error.log 2>/dev/null || echo "❌ No se pueden leer logs de Nginx"
    
    echo ""
    echo "🔍 Logs de Backend:"
    sudo journalctl -u marvera-backend -n 5 --no-pager 2>/dev/null || echo "❌ No se pueden leer logs de Backend"
    
    echo ""
    echo "🔍 Logs de Frontend:"
    sudo journalctl -u marvera-frontend -n 5 --no-pager 2>/dev/null || echo "❌ No se pueden leer logs de Frontend"
}

# Función para verificar configuración
check_config() {
    echo ""
    echo "⚙️ Verificación de configuración:"
    echo "---------------------------------"
    
    echo "🔍 Configuración de Nginx:"
    sudo nginx -t && echo "✅ Configuración de Nginx válida" || echo "❌ Error en configuración de Nginx"
    
    echo "🔍 Variables de entorno:"
    [ -f .env ] && echo "✅ Archivo .env existe" || echo "❌ Archivo .env no encontrado"
    
    if [ -f .env ]; then
        echo "📋 Contenido de .env:"
        cat .env
    fi
}

# Función para verificar conectividad
check_connectivity() {
    echo ""
    echo "🌐 Verificación de conectividad:"
    echo "-------------------------------"
    
    echo "🔍 Nginx responde:"
    curl -s -o /dev/null -w "%{http_code}" http://localhost/ && echo " ✅ Nginx accesible localmente" || echo " ❌ Nginx no responde"
    
    echo "🔍 Backend responde:"
    curl -s -o /dev/null -w "%{http_code}" http://localhost:$BACKEND_PORT/api/health && echo " ✅ Backend accesible" || echo " ❌ Backend no responde"
    
    echo "🔍 Frontend responde:"
    curl -s -o /dev/null -w "%{http_code}" http://localhost:$FRONTEND_PORT/ && echo " ✅ Frontend accesible" || echo " ❌ Frontend no responde"
}

# Función para mostrar procesos
check_processes() {
    echo ""
    echo "🔄 Procesos relacionados:"
    echo "------------------------"
    
    echo "🔍 Procesos de Node.js:"
    ps aux | grep node | grep -v grep || echo "❌ No hay procesos de Node.js"
    
    echo ""
    echo "🔍 Procesos de Nginx:"
    ps aux | grep nginx | grep -v grep || echo "❌ No hay procesos de Nginx"
}

# Función principal
main() {
    check_services
    check_ports
    check_config
    check_connectivity
    check_processes
    check_logs
    
    echo ""
    echo "🎯 Recomendaciones basadas en el diagnóstico:"
    echo "============================================"
    
    # Verificar si hay problemas comunes
    if ! sudo systemctl is-active nginx >/dev/null 2>&1; then
        echo "❌ Nginx no está activo - ejecutar: sudo systemctl start nginx"
    fi
    
    if ! sudo systemctl is-active marvera-backend >/dev/null 2>&1; then
        echo "❌ Backend no está activo - ejecutar: sudo systemctl start marvera-backend"
    fi
    
    if ! sudo systemctl is-active marvera-frontend >/dev/null 2>&1; then
        echo "❌ Frontend no está activo - ejecutar: sudo systemctl start marvera-frontend"
    fi
    
    if ! sudo ss -tuln | grep ":$BACKEND_PORT " >/dev/null; then
        echo "❌ Backend no escucha en puerto $BACKEND_PORT"
        echo "   Solución: cd backend && npm run dev"
    fi
    
    if ! sudo ss -tuln | grep ":$FRONTEND_PORT " >/dev/null; then
        echo "❌ Frontend no escucha en puerto $FRONTEND_PORT"
        echo "   Solución: npm run dev"
    fi
    
    echo ""
    echo "🚀 Comandos para reiniciar todo:"
    echo "sudo systemctl restart nginx marvera-backend marvera-frontend"
    echo ""
    echo "🔧 Comandos para ejecutar manualmente:"
    echo "Terminal 1: cd backend && npm run dev"
    echo "Terminal 2: npm run dev"
}

# Ejecutar diagnóstico
case "$1" in
    "ports")
        check_ports
        ;;
    "services")
        check_services
        ;;
    "logs")
        check_logs
        ;;
    "config")
        check_config
        ;;
    "connectivity")
        check_connectivity
        ;;
    "processes")
        check_processes
        ;;
    *)
        main
        ;;
esac
