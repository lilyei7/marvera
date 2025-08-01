# 🌊 MARVERA - INSTALACIÓN MANUAL PASO A PASO

## 📋 INSTALACIÓN COMPLETA DESDE CERO

### PASO 1: PREPARAR EL SERVIDOR

#### 1.1 Actualizar sistema
```bash
sudo apt update
sudo apt upgrade -y
```

#### 1.2 Instalar Node.js 20
```bash
# Descargar e instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v20.x.x
npm --version   # Debe mostrar 10.x.x
```

#### 1.3 Instalar nginx
```bash
sudo apt install -y nginx

# Verificar que esté funcionando
sudo systemctl status nginx
sudo systemctl enable nginx  # Para que inicie automáticamente
```

#### 1.4 Instalar PM2 (gestor de procesos)
```bash
sudo npm install -g pm2

# Verificar instalación
pm2 --version
```

#### 1.5 Instalar herramientas útiles
```bash
sudo apt install -y curl wget git htop tree jq
```

---

### PASO 2: CLONAR EL PROYECTO

#### 2.1 Clonar repositorio
```bash
# Ir al directorio web
cd /var/www

# Clonar el proyecto
sudo git clone https://github.com/lilyei7/marvera.git
cd marvera

# Verificar que tienes todo
ls -la
# Debes ver: package.json, backend/, src/, vite.config.ts
```

#### 2.2 Verificar estructura del proyecto
```bash
# Ver estructura del frontend
cat package.json | grep name  # Debe mostrar "marvera"

# Ver estructura del backend
ls -la backend/
cat backend/package.json | grep name  # Debe mostrar "marvera-backend"

# Ver configuración de Vite
cat vite.config.ts
```

---

### PASO 3: INSTALAR DEPENDENCIAS

#### 3.1 Instalar dependencias del frontend
```bash
# Desde el directorio raíz (/var/www/marvera)
npm cache clean --force
npm install

# Verificar que se instaló correctamente
ls -la node_modules/  # Debe existir y tener contenido
npm list --depth=0    # Ver paquetes instalados
```

#### 3.2 Instalar dependencias del backend
```bash
cd backend
npm cache clean --force
npm install

# Verificar instalación
ls -la node_modules/
npm list --depth=0

# Regresar al directorio raíz
cd ..
```

---

### PASO 4: CONFIGURAR BASE DE DATOS

#### 4.1 Configurar variables de entorno del backend
```bash
cd backend

# Copiar archivo de ejemplo si existe
cp .env.example .env  # Si existe

# O crear archivo .env desde cero
sudo nano .env
```

**Contenido del archivo .env:**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL="file:./database.sqlite"
JWT_SECRET=marvera-super-secret-key-production-2024
CORS_ORIGIN=https://marvera.mx
```

#### 4.2 Configurar Prisma (si existe)
```bash
# Verificar si existe Prisma
ls -la prisma/

# Si existe schema.prisma, configurar Prisma
npx prisma generate

# Aplicar migraciones
npx prisma migrate deploy

# Si quieres datos de prueba (opcional)
npx prisma db seed

cd ..  # Regresar al directorio raíz
```

---

### PASO 5: COMPILAR LA APLICACIÓN

#### 5.1 Compilar frontend (React + TypeScript)
```bash
# Limpiar builds anteriores
rm -rf dist build

# Compilar frontend
npm run build

# Si falla por warnings de TypeScript, usar:
npx vite build --mode production

# Verificar que se creó dist/
ls -la dist/
ls -la dist/assets/  # Debe contener archivos .js y .css
```

#### 5.2 Compilar backend (TypeScript)
```bash
cd backend

# Limpiar compilación anterior
rm -rf dist

# Compilar TypeScript
npm run build

# Verificar que se creó dist/
ls -la dist/
ls -la dist/index.js  # Debe existir

cd ..  # Regresar al directorio raíz
```

---

### PASO 6: CREAR DIRECTORIO DE PRODUCCIÓN

#### 6.1 Crear estructura de directorios
```bash
# Crear directorios necesarios
sudo mkdir -p /var/www/marvera.mx
sudo mkdir -p /var/www/marvera.mx/backend
sudo mkdir -p /var/log/marvera
sudo mkdir -p /var/backups/marvera
```

#### 6.2 Copiar archivos compilados
```bash
# Copiar frontend compilado
sudo cp -r dist/* /var/www/marvera.mx/

# Copiar backend compilado
sudo cp -r backend/dist /var/www/marvera.mx/backend/
sudo cp backend/package.json /var/www/marvera.mx/backend/
sudo cp backend/.env /var/www/marvera.mx/backend/

# Copiar configuración de Prisma (si existe)
sudo cp -r backend/prisma /var/www/marvera.mx/backend/ 2>/dev/null || echo "No Prisma config"

# Copiar base de datos (si existe)
sudo cp backend/database.sqlite /var/www/marvera.mx/backend/ 2>/dev/null || echo "No database file"
```

#### 6.3 Verificar archivos copiados
```bash
# Verificar frontend
ls -la /var/www/marvera.mx/
ls -la /var/www/marvera.mx/index.html  # Debe existir

# Verificar backend
ls -la /var/www/marvera.mx/backend/
ls -la /var/www/marvera.mx/backend/dist/index.js  # Debe existir
```

---

### PASO 7: INSTALAR DEPENDENCIAS DE PRODUCCIÓN

#### 7.1 Instalar dependencias del backend en producción
```bash
cd /var/www/marvera.mx/backend
sudo npm ci --only=production

# Verificar instalación
ls -la node_modules/

# Configurar Prisma en producción (si existe)
sudo npx prisma generate 2>/dev/null || echo "No Prisma"
```

---

### PASO 8: CONFIGURAR PM2

#### 8.1 Crear configuración PM2
```bash
cd /var/www/marvera.mx
sudo nano ecosystem.config.cjs
```

**Contenido del archivo ecosystem.config.cjs:**
```javascript
module.exports = {
  apps: [{
    name: 'marvera-api',
    script: './backend/dist/index.js',
    cwd: '/var/www/marvera.mx',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_file: '/var/log/marvera/combined.log',
    out_file: '/var/log/marvera/out.log',
    error_file: '/var/log/marvera/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true,
    kill_timeout: 5000,
    restart_delay: 3000,
    max_restarts: 5,
    min_uptime: '10s'
  }]
};
```

#### 8.2 Iniciar aplicación con PM2
```bash
# Parar procesos existentes
pm2 stop all
pm2 delete all

# Iniciar aplicación
pm2 start ecosystem.config.cjs

# Verificar estado
pm2 status
pm2 logs  # Ver logs en tiempo real (Ctrl+C para salir)

# Guardar configuración para reinicio automático
pm2 save
pm2 startup
```

---

### PASO 9: CONFIGURAR NGINX

#### 9.1 Crear configuración nginx
```bash
sudo nano /etc/nginx/sites-available/marvera.mx
```

**Contenido del archivo de configuración nginx:**
```nginx
server {
    listen 80;
    server_name marvera.mx www.marvera.mx;
    
    # Para SSL, descomenta esta línea:
    # return 301 https://$server_name$request_uri;
    
    root /var/www/marvera.mx;
    index index.html index.htm;
    
    # Logs
    access_log /var/log/nginx/marvera.mx.access.log;
    error_log /var/log/nginx/marvera.mx.error.log;
    
    # Compresión
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Frontend - Servir archivos estáticos
    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, must-revalidate, proxy-revalidate";
    }
    
    # API - Proxy al backend Node.js
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
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
    
    # Archivos estáticos con cache largo
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Archivos de uploads
    location /uploads/ {
        alias /var/www/marvera.mx/backend/uploads/;
        expires 1M;
        add_header Cache-Control "public";
    }
    
    # Seguridad - Bloquear archivos sensibles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ /(package\.json|tsconfig\.json|\.env|ecosystem\.config\.cjs)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

#### 9.2 Habilitar sitio nginx
```bash
# Habilitar el sitio
sudo ln -sf /etc/nginx/sites-available/marvera.mx /etc/nginx/sites-enabled/

# Deshabilitar sitio default (opcional)
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Si todo está bien, recargar nginx
sudo systemctl reload nginx
sudo systemctl restart nginx
```

---

### PASO 10: CONFIGURAR PERMISOS

#### 10.1 Configurar propietarios y permisos
```bash
# Configurar propietario
sudo chown -R www-data:www-data /var/www/marvera.mx
sudo chown -R www-data:www-data /var/log/marvera

# Configurar permisos
sudo find /var/www/marvera.mx -type d -exec chmod 755 {} \;
sudo find /var/www/marvera.mx -type f -exec chmod 644 {} \;

# Hacer ejecutable el archivo principal del backend
sudo chmod +x /var/www/marvera.mx/backend/dist/index.js
```

---

### PASO 11: VERIFICAR INSTALACIÓN

#### 11.1 Verificar servicios
```bash
# Estado de PM2
pm2 status

# Estado de nginx
sudo systemctl status nginx

# Ver logs en tiempo real
pm2 logs  # Logs de la aplicación
tail -f /var/log/nginx/marvera.mx.error.log  # Logs de nginx
```

#### 11.2 Tests de conectividad
```bash
# Test backend local
curl http://localhost:3001/api/health

# Test frontend local
curl http://localhost

# Test con tu dominio (si tienes DNS configurado)
curl http://marvera.mx
curl http://marvera.mx/api/health
```

#### 11.3 Verificar archivos críticos
```bash
# Verificar frontend
ls -la /var/www/marvera.mx/index.html
du -sh /var/www/marvera.mx/

# Verificar backend
ls -la /var/www/marvera.mx/backend/dist/index.js
ls -la /var/www/marvera.mx/backend/database.sqlite
```

---

## 🔧 COMANDOS DE MANTENIMIENTO

### Comandos PM2
```bash
pm2 status                    # Ver estado
pm2 logs                      # Ver logs
pm2 logs marvera-api          # Logs específicos
pm2 restart marvera-api       # Reiniciar app
pm2 stop marvera-api          # Parar app
pm2 start marvera-api         # Iniciar app
pm2 delete marvera-api        # Eliminar app
pm2 monit                     # Monitor en tiempo real
```

### Comandos nginx
```bash
sudo systemctl status nginx       # Estado
sudo systemctl restart nginx      # Reiniciar
sudo systemctl reload nginx       # Recargar config
sudo nginx -t                     # Test config
tail -f /var/log/nginx/marvera.mx.error.log  # Ver logs
```

### Resolución de problemas
```bash
# Si puerto 3001 está ocupado
sudo lsof -i :3001               # Ver qué lo usa
sudo kill -9 [PID]               # Matar proceso específico

# Si hay problemas de permisos
sudo chown -R www-data:www-data /var/www/marvera.mx
sudo chmod -R 755 /var/www/marvera.mx

# Si necesitas recompilar
cd /var/www/marvera
npm run build                    # Frontend
cd backend && npm run build      # Backend
```

### Backup
```bash
# Backup de base de datos
sudo cp /var/www/marvera.mx/backend/database.sqlite /var/backups/marvera/

# Backup completo
sudo tar -czf /var/backups/marvera/marvera-$(date +%Y%m%d).tar.gz /var/www/marvera.mx
```

---

## 🎯 RESUMEN DE VERIFICACIÓN FINAL

Si todo está bien, deberías poder:

1. **Ver tu sitio**: http://tu-dominio.com
2. **Ver API**: http://tu-dominio.com/api/health
3. **PM2 online**: `pm2 status` muestra "online"
4. **nginx activo**: `systemctl status nginx` muestra "active"

¡Tu MarVera estará funcionando completamente! 🌊
