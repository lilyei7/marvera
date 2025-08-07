# Deploy MarVera completo usando archivo comprimido
# Para Windows PowerShell

Write-Host "🚀 Deploy MarVera con archivo comprimido" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Verificar que existe dist
if (-not (Test-Path "dist")) {
    Write-Host "❌ No se encuentra la carpeta 'dist'. Ejecuta 'npm run build' primero." -ForegroundColor Red
    exit 1
}

# Crear directorio temporal para el build
Write-Host "📦 Preparando archivos para compresión..." -ForegroundColor Yellow
if (Test-Path "deploy-temp") { Remove-Item -Recurse -Force "deploy-temp" }
New-Item -ItemType Directory -Path "deploy-temp" | Out-Null

# Copiar archivos del backend
Write-Host "📂 Copiando backend..." -ForegroundColor Yellow
Copy-Item -Recurse -Path "backend" -Destination "deploy-temp\"
Remove-Item -Recurse -Force "deploy-temp\backend\node_modules" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "deploy-temp\backend\dist" -ErrorAction SilentlyContinue

# Copiar archivos del frontend (dist)
Write-Host "📂 Copiando frontend..." -ForegroundColor Yellow
Copy-Item -Recurse -Path "dist" -Destination "deploy-temp\"

# Copiar archivos de configuración
Write-Host "📂 Copiando configuración..." -ForegroundColor Yellow
Copy-Item -Path "package.json" -Destination "deploy-temp\"
if (Test-Path ".env.production") {
    Copy-Item -Path ".env.production" -Destination "deploy-temp\.env"
}

# Crear archivo comprimido usando tar (disponible en Windows 10+)
Write-Host "🗜️ Comprimiendo archivos..." -ForegroundColor Yellow
tar -czf marvera-complete.tar.gz -C deploy-temp .

# Subir al servidor
Write-Host "📡 Subiendo al servidor 148.230.87.198..." -ForegroundColor Yellow
scp marvera-complete.tar.gz root@148.230.87.198:/tmp/

# Ejecutar comandos en el servidor
Write-Host "🖥️ Ejecutando comandos en el servidor..." -ForegroundColor Yellow

$sshCommands = @"
cd /var/www

# Detener servicios
echo "🛑 Deteniendo servicios..."
pm2 stop marvera-backend 2>/dev/null || true
systemctl stop nginx

# Backup actual
echo "💾 Creando backup..."
if [ -d "marvera" ]; then
  mv marvera marvera-backup-`$(date +%Y%m%d-%H%M%S`)
fi

# Crear directorio y extraer
echo "📦 Extrayendo archivos..."
mkdir -p marvera
cd marvera
tar -xzf /tmp/marvera-complete.tar.gz

# Instalar dependencias del backend
echo "📥 Instalando dependencias backend..."
cd backend
npm install --production

# Compilar TypeScript
echo "🔨 Compilando TypeScript..."
npm run build

# Configurar base de datos
echo "🗄️ Configurando base de datos..."
npx prisma generate
npx prisma db push --force-reset

# Poblar datos de ejemplo
echo "📝 Poblando datos..."
sqlite3 prisma/dev.db << 'EOSQL'
INSERT OR REPLACE INTO categories (id, name, description, isActive, createdAt, updatedAt) VALUES
(1, 'Camarones', 'Camarones frescos y congelados de la más alta calidad', 1, datetime('now'), datetime('now')),
(2, 'Pulpo', 'Pulpo fresco del Pacífico y Golfo de México', 1, datetime('now'), datetime('now')),
(3, 'Pescado', 'Pescado fresco de temporada', 1, datetime('now'), datetime('now')),
(4, 'Langostinos', 'Langostinos gigantes premium', 1, datetime('now'), datetime('now')),
(5, 'Atún', 'Atún fresco para sashimi y preparaciones gourmet', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO products (id, name, slug, description, price, categoryId, stock, unit, images, isActive, isFeatured, createdAt, updatedAt) VALUES
(1, 'Camarones Frescos Premium', 'camarones-frescos-premium', 'Camarones frescos del Golfo de México, tamaño jumbo', 450.00, 1, 100, 'kg', '["/images/camaron.jpg"]', 1, 1, datetime('now'), datetime('now')),
(2, 'Pulpo Fresco del Pacífico', 'pulpo-fresco-pacifico', 'Pulpo fresco capturado en aguas del Pacífico mexicano', 380.00, 2, 50, 'kg', '["/images/pulpo.jpg"]', 1, 1, datetime('now'), datetime('now')),
(3, 'Pescado Huachinango', 'pescado-huachinango', 'Huachinango fresco, ideal para preparaciones gourmet', 320.00, 3, 75, 'kg', '["/images/huachinango.jpg"]', 1, 0, datetime('now'), datetime('now')),
(4, 'Langostinos Gigantes', 'langostinos-gigantes', 'Langostinos de tamaño extra grande, perfectos para platillos especiales', 550.00, 4, 30, 'kg', '["/images/langostinos.jpg"]', 1, 1, datetime('now'), datetime('now')),
(5, 'Atún Fresco Sashimi', 'atun-fresco-sashimi', 'Atún de la más alta calidad, ideal para sashimi y sushi', 680.00, 5, 25, 'kg', '["/images/atun.jpg"]', 1, 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO slideshow_slides (id, title, subtitle, description, buttonText, buttonLink, imageUrl, backgroundColor, textColor, isActive, order, createdAt, updatedAt) VALUES
(1, 'Del mar directo a tu restaurante', 'Productos frescos del mar', 'Mariscos frescos y productos del mar de la más alta calidad para tu negocio', 'Ver Productos', '/productos', '/fondorectangulo3.png', '#1E3A8A', '#FFFFFF', 1, 0, datetime('now'), datetime('now')),
(2, 'Calidad Premium MarVera', 'Los mejores mariscos', 'Selección especial de productos del mar con la mejor calidad y frescura', 'Ver Catálogo', '/productos', '/fondorectangulo3.png', '#40E0D0', '#1E3A8A', 1, 1, datetime('now'), datetime('now')),
(3, 'Frescura Garantizada', 'Directamente del océano', 'Productos capturados diariamente para garantizar máxima frescura', 'Conocer Más', '/nosotros', '/fondorectangulo3.png', '#87CEEB', '#1E3A8A', 1, 2, datetime('now'), datetime('now'));
EOSQL

# Iniciar backend con PM2
echo "🚀 Iniciando backend..."
pm2 start dist/index.js --name "marvera-backend" --env production
pm2 save

# Configurar frontend en nginx
cd /var/www/marvera

# Configurar nginx
echo "🌐 Configurando nginx..."
cat > /etc/nginx/sites-available/marvera << 'EONGINX'
server {
    listen 80;
    listen [::]:80;
    server_name marvera.mx www.marvera.mx 148.230.87.198;

    # Frontend
    location / {
        root /var/www/marvera/dist;
        index index.html;
        try_files `$uri `$uri/ /index.html;
        
        # Headers para SPA
        add_header Cache-Control "no-cache";
        expires -1;
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)`$ {
        root /var/www/marvera/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EONGINX

# Activar sitio
ln -sf /etc/nginx/sites-available/marvera /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Iniciar nginx
echo "🌐 Iniciando nginx..."
nginx -t && systemctl start nginx

# Verificar servicios
echo "✅ Verificando servicios..."
systemctl status nginx --no-pager
pm2 status

echo "🎉 Deploy completado!"
echo "🌐 Frontend: http://marvera.mx"
echo "🔌 Backend: http://marvera.mx/api"

# Limpiar archivo temporal
rm -f /tmp/marvera-complete.tar.gz
"@

# Ejecutar comandos SSH
ssh root@148.230.87.198 $sshCommands

# Limpiar archivos locales
Write-Host "🧹 Limpiando archivos temporales..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "deploy-temp" -ErrorAction SilentlyContinue
Remove-Item -Force "marvera-complete.tar.gz" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🎉 Deploy completado exitosamente!" -ForegroundColor Green
Write-Host "🌐 URL: https://marvera.mx" -ForegroundColor Cyan
Write-Host "👨‍💼 Admin: admin@marvera.com / admin123" -ForegroundColor Cyan
Write-Host ""
