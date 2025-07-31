#!/bin/bash
echo "🔒 Configurando SSL con Let's Encrypt para MarVera..."

DOMAIN="marvera.mx"
EMAIL="admin@marvera.mx"  # Cambia por tu email

# Instalar Certbot
echo "📦 Instalando Certbot..."
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Verificar que Nginx está corriendo
echo "🔍 Verificando Nginx..."
sudo systemctl status nginx --no-pager -l

# Obtener certificados SSL
echo "🔒 Obteniendo certificados SSL..."
sudo certbot --nginx \
    -d $DOMAIN \
    -d www.$DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --redirect

# Configurar renovación automática
echo "🔄 Configurando renovación automática..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verificar configuración
echo "✅ Verificando configuración SSL..."
sudo certbot certificates

# Test de renovación
echo "🧪 Probando renovación..."
sudo certbot renew --dry-run

echo "✅ SSL configurado correctamente!"
echo ""
echo "🌐 Tu sitio ahora está disponible en:"
echo "   - https://$DOMAIN"
echo "   - https://www.$DOMAIN"
echo ""
echo "🔄 Los certificados se renovarán automáticamente cada 90 días"
