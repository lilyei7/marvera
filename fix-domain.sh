#!/bin/bash
echo "🔧 Diagnóstico y arreglo completo de MarVera..."

# 1. Verificar DNS
echo "🔍 Verificando DNS..."
dig +short marvera.mx
dig +short www.marvera.mx

# 2. Verificar procesos
echo "🔍 Verificando procesos..."
sudo lsof -i:80
sudo lsof -i:443
sudo lsof -i:3001

# 3. Verificar logs de Nginx
echo "🔍 Logs de Nginx..."
sudo tail -20 /var/log/nginx/error.log

# 4. Configuración simple CORRECTA para dominio
echo "🔧 Creando configuración correcta..."

# Eliminar configuraciones conflictivas
sudo rm -f /etc/nginx/sites-enabled/*

# Nueva configuración SOLO para el dominio
cat > /tmp/marvera-domain.conf << 'EOF'
# MarVera - Configuración para dominio
server {
    listen 80;
    server_name marvera.mx www.marvera.mx;
    
    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name marvera.mx www.marvera.mx;
    
    # Certificados SSL de Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/marvera.mx/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/marvera.mx/privkey.pem;
    
    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Logs específicos
    access_log /var/log/nginx/marvera-access.log;
    error_log /var/log/nginx/marvera-error.log;
    
    # Directorio del frontend
    root /var/www/marvera/dist;
    index index.html;
    
    # Configuración para React SPA
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # API Backend
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }
    
    # Socket.IO para tiempo real
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Assets estáticos con cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # Healthcheck público
    location /health {
        access_log off;
        return 200 "OK MarVera";
        add_header Content-Type text/plain;
    }
}
EOF

# Copiar configuración
sudo cp /tmp/marvera-domain.conf /etc/nginx/sites-available/marvera.mx
sudo ln -s /etc/nginx/sites-available/marvera.mx /etc/nginx/sites-enabled/

# 5. Probar configuración
echo "🧪 Probando configuración..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Error en configuración de Nginx. Creando configuración básica..."
    
    # Configuración de respaldo sin SSL
    cat > /tmp/marvera-basic.conf << 'EOF'
server {
    listen 80;
    server_name marvera.mx www.marvera.mx 148.230.87.198;
    
    root /var/www/marvera/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /health {
        return 200 "OK MarVera Basic";
        add_header Content-Type text/plain;
    }
}
EOF
    
    sudo rm -f /etc/nginx/sites-enabled/*
    sudo cp /tmp/marvera-basic.conf /etc/nginx/sites-available/marvera-basic
    sudo ln -s /etc/nginx/sites-available/marvera-basic /etc/nginx/sites-enabled/
    sudo nginx -t
fi

# 6. Reiniciar Nginx
echo "🔄 Reiniciando Nginx..."
sudo systemctl restart nginx

# 7. Verificar estado de Nginx
sudo systemctl status nginx --no-pager

# 8. Asegurar que el backend esté corriendo
echo "🚀 Verificando/iniciando backend..."
cd /var/www/marvera

# Detener procesos existentes
pm2 delete all 2>/dev/null || true
sudo pkill -f node 2>/dev/null || true

# Iniciar backend simple
if [ -f "simple-backend.js" ]; then
    echo "Iniciando backend con PM2..."
    pm2 start simple-backend.js --name "marvera-backend"
else
    echo "Iniciando basic-server..."
    cd backend
    pm2 start basic-server.js --name "marvera-backend"
fi

pm2 save

# 9. Verificar que todo funcione
echo ""
echo "🧪 Verificando servicios..."
echo "Backend:"
curl -s http://localhost:3001/api/health | head -3 || echo "❌ Backend no responde"

echo ""
echo "Nginx:"
curl -s -I http://localhost/health | head -3 || echo "❌ Nginx no responde"

echo ""
echo "✅ Diagnóstico completado!"
echo ""
echo "🌐 Tu sitio debería estar disponible en:"
echo "   - http://marvera.mx"
echo "   - https://marvera.mx (si SSL funciona)"
echo ""
echo "🔍 Para diagnosticar más:"
echo "   - sudo systemctl status nginx"
echo "   - pm2 logs"
echo "   - sudo tail -f /var/log/nginx/error.log"
echo ""
echo "📊 APIs:"
echo "   - curl http://marvera.mx/api/health"
echo "   - curl http://marvera.mx/health"
EOF
