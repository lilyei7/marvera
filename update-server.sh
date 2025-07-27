#!/bin/bash

# Script para actualizar configuración de nginx y reiniciar servicios
echo "🔄 Actualizando MarVera con soporte para archivos grandes..."

# Variables
SERVER_IP="187.33.155.127"

echo "📋 Actualizando desde GitHub..."
git pull origin main

echo "📦 Reinstalando dependencias..."
npm install
cd backend && npm install && cd ..

echo "🔧 Actualizando configuración de Nginx..."
# Copiar nueva configuración de nginx
sudo cp nginx-marvera.conf /etc/nginx/sites-available/marvera

# Verificar configuración
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuración de Nginx válida"
    
    # Recargar nginx
    sudo systemctl reload nginx
    echo "✅ Nginx recargado"
    
    # Reiniciar servicios de la aplicación
    echo "🔄 Reiniciando servicios de MarVera..."
    sudo systemctl restart marvera-backend
    sudo systemctl restart marvera-frontend
    
    echo ""
    echo "✅ ¡Actualización completada!"
    echo ""
    echo "🌐 Servicios disponibles:"
    echo "   Frontend: http://$SERVER_IP/"
    echo "   Admin:    http://$SERVER_IP/admin"
    echo "   API:      http://$SERVER_IP/api/health"
    echo ""
    echo "📊 Nuevos límites de archivo:"
    echo "   Nginx: 50MB máximo"
    echo "   Backend: 25MB por archivo"
    echo "   Múltiples archivos: Soportado"
    echo ""
    echo "🔍 Ver logs:"
    echo "   Backend:  sudo journalctl -u marvera-backend -f"
    echo "   Frontend: sudo journalctl -u marvera-frontend -f"
    echo "   Nginx:    sudo tail -f /var/log/nginx/marvera_error.log"
    
else
    echo "❌ Error en la configuración de Nginx"
    echo "🔍 Verificar configuración manualmente:"
    echo "   sudo nginx -t"
    exit 1
fi

echo ""
echo "🎯 Comandos de verificación:"
echo "   curl http://$SERVER_IP/api/health"
echo "   sudo systemctl status nginx marvera-backend marvera-frontend"
