# 🌊 MARVERA - GUÍA COMPLETA DE INSTALACIÓN Y DEPLOYMENT

## 📋 ÍNDICE
1. [Conceptos Básicos](#conceptos-básicos)
2. [Instalación desde Git Clone](#instalación-desde-git-clone)
3. [Desarrollo Local](#desarrollo-local)
4. [Build de Producción](#build-de-producción)
5. [Deployment en Servidor](#deployment-en-servidor)
6. [Resolución de Problemas](#resolución-de-problemas)
7. [Comandos de Mantenimiento](#comandos-de-mantenimiento)

---

## 🧠 CONCEPTOS BÁSICOS

### ¿Qué es cada parte de MarVera?

**Frontend (React + TypeScript + Vite):**
- `src/` = Código fuente de React (componentes, páginas, estilos)
- `dist/` = Código compilado y optimizado para producción
- `package.json` = Dependencias y scripts del frontend
- `vite.config.ts` = Configuración del bundler

**Backend (Node.js + TypeScript + Express):**
- `backend/src/` = Código fuente del servidor API
- `backend/dist/` = Código JavaScript compilado desde TypeScript
- `backend/package.json` = Dependencias del servidor
- `backend/prisma/` = Configuración de base de datos

**¿Por qué necesitamos "dist"?**
- El navegador no entiende TypeScript, solo JavaScript
- Vite toma tu código TypeScript/React y lo convierte a JavaScript optimizado
- El `dist/` contiene archivos listos para servir al navegador

---

## 🚀 INSTALACIÓN DESDE GIT CLONE

### Paso 1: Clonar el Repositorio

```bash
# Clonar en directorio de desarrollo
git clone https://github.com/lilyei7/marvera.git
cd marvera

# O clonar en servidor de producción
sudo git clone https://github.com/lilyei7/marvera.git /var/www/marvera
cd /var/www/marvera
```

### Paso 2: Verificar Estructura
```bash
# Verificar que tienes todo lo necesario
ls -la

# Deberías ver:
# - package.json (frontend)
# - backend/ (directorio del servidor)
# - src/ (código fuente frontend)
# - vite.config.ts (configuración)
```

### Paso 3: Instalar Node.js (si no está instalado)

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verificar instalación:**
```bash
node --version  # Debe ser v18+ o v20+
npm --version   # Debe ser 8+
```

---

## 🛠️ DESARROLLO LOCAL

### Paso 1: Instalar Dependencias del Frontend
```bash
# Desde el directorio raíz del proyecto
npm install

# Esto instala todas las dependencias listadas en package.json
# Crea node_modules/ con todas las librerías necesarias
```

### Paso 2: Instalar Dependencias del Backend
```bash
cd backend
npm install
cd ..

# Esto instala Express, Prisma, bcrypt, JWT, etc.
```

### Paso 3: Configurar Base de Datos
```bash
cd backend

# Copiar configuración de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones
nano .env

# Configurar Prisma (si usas base de datos)
npx prisma generate
npx prisma migrate dev

cd ..
```

### Paso 4: Ejecutar en Modo Desarrollo

**Terminal 1 - Frontend:**
```bash
npm run dev
# Esto inicia Vite en puerto 5173
# Hot reload: cambios se ven inmediatamente
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
# Esto inicia el servidor en puerto 3001
# Nodemon: reinicia automáticamente al cambiar código
```

**Verificar que funciona:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api/health

---

## 🏗️ BUILD DE PRODUCCIÓN

### ¿Qué hace el build?

El build toma tu código TypeScript/React y:
1. Compila TypeScript → JavaScript
2. Optimiza el código (minificación)
3. Combina archivos CSS
4. Optimiza imágenes
5. Crea archivos listos para producción

### Paso 1: Build del Frontend
```bash
# Limpiar builds anteriores
rm -rf dist

# Compilar para producción
npm run build

# Verificar que se creó
ls -la dist/
```

**Contenido de dist/:**
- `index.html` = Página principal
- `assets/` = JavaScript, CSS, imágenes optimizadas
- Todos los archivos están minificados y optimizados

### Paso 2: Build del Backend
```bash
cd backend

# Limpiar compilación anterior
rm -rf dist

# Compilar TypeScript
npm run build

# Verificar
ls -la dist/
```

**Contenido de backend/dist/:**
- `index.js` = Servidor compilado
- Todos los archivos .ts convertidos a .js

---

## 🌐 DEPLOYMENT EN SERVIDOR

### Script de Deployment Completo

Vamos a crear un script que hace todo automáticamente:

```bash
# Crear script de deployment
nano deploy-complete.sh
```

### Paso 1: Preparar el Servidor
```bash
# Instalar PM2 (gestor de procesos)
sudo npm install -g pm2

# Instalar nginx (servidor web)
sudo apt update
sudo apt install nginx

# Crear directorios
sudo mkdir -p /var/www/marvera.mx
sudo mkdir -p /var/log/marvera
sudo mkdir -p /var/backups/marvera
```

### Paso 2: Configurar nginx

**Crear configuración:**
```bash
sudo nano /etc/nginx/sites-available/marvera.mx
```

**Contenido del archivo:**
```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    
    # Redirigir a HTTPS si tienes SSL
    # return 301 https://$server_name$request_uri;
    
    root /var/www/marvera.mx;
    index index.html;
    
    # Servir archivos estáticos (frontend)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy para API (backend)
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Habilitar el sitio:**
```bash
sudo ln -s /etc/nginx/sites-available/marvera.mx /etc/nginx/sites-enabled/
sudo nginx -t  # Verificar configuración
sudo systemctl reload nginx
```

### Paso 3: Deployment Automático

**Crear script completo:**
```bash
nano deploy-production.sh
chmod +x deploy-production.sh
```

---

## 🔧 RESOLUCIÓN DE PROBLEMAS

### Problema: Puerto 3001 en uso
```bash
# Ver qué está usando el puerto
sudo lsof -i :3001

# Matar proceso específico
sudo kill -9 [PID]

# O matar todos los procesos de PM2
pm2 stop all
pm2 delete all
```

### Problema: npm install falla
```bash
# Limpiar cache
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Problema: Build de TypeScript falla
```bash
# Ver errores específicos
npm run build

# Si son warnings de variables no usadas (como antes):
npx vite build --mode production

# Si son errores reales, revisar el código
npx tsc --noEmit
```

### Problema: nginx no sirve archivos
```bash
# Verificar permisos
sudo chown -R www-data:www-data /var/www/marvera.mx
sudo chmod -R 755 /var/www/marvera.mx

# Verificar configuración
sudo nginx -t

# Ver logs de error
sudo tail -f /var/log/nginx/error.log
```

### Problema: Base de datos no conecta
```bash
cd backend

# Verificar que existe la BD
ls -la *.sqlite

# Regenerar cliente Prisma
npx prisma generate

# Aplicar migraciones
npx prisma migrate deploy
```

---

## 📊 COMANDOS DE MANTENIMIENTO

### Monitoreo de PM2
```bash
# Ver estado de procesos
pm2 status

# Ver logs en tiempo real
pm2 logs

# Ver logs de aplicación específica
pm2 logs marvera-api

# Reiniciar aplicación
pm2 restart marvera-api

# Parar aplicación
pm2 stop marvera-api

# Eliminar aplicación
pm2 delete marvera-api
```

### Monitoreo de nginx
```bash
# Estado del servicio
sudo systemctl status nginx

# Reiniciar nginx
sudo systemctl restart nginx

# Recargar configuración
sudo systemctl reload nginx

# Ver logs de acceso
sudo tail -f /var/log/nginx/access.log

# Ver logs de error
sudo tail -f /var/log/nginx/error.log
```

### Monitoreo del Sistema
```bash
# Uso de memoria
free -h

# Uso de disco
df -h

# Procesos que más consumen
top

# Puertos en uso
sudo netstat -tulpn | grep :3001
sudo netstat -tulpn | grep :80
```

### Backup y Restauración
```bash
# Backup de la base de datos
cp /var/www/marvera.mx/backend/database.sqlite /var/backups/marvera/database-$(date +%Y%m%d_%H%M%S).sqlite

# Backup completo del sitio
tar -czf /var/backups/marvera/marvera-$(date +%Y%m%d_%H%M%S).tar.gz /var/www/marvera.mx

# Restaurar backup
tar -xzf /var/backups/marvera/marvera-YYYYMMDD_HHMMSS.tar.gz -C /
```

---

## 🚀 FLUJO COMPLETO DE TRABAJO

### Desarrollo Local:
1. `git clone` → `npm install` → `npm run dev`
2. Hacer cambios en `src/`
3. Verificar en http://localhost:5173

### Deploy a Producción:
1. `git pull` (en servidor)
2. `npm run build` (compilar frontend)
3. `cd backend && npm run build` (compilar backend)
4. `pm2 restart marvera-api` (reiniciar servidor)
5. Verificar en tu dominio

### En caso de problemas:
1. Revisar logs: `pm2 logs`
2. Verificar nginx: `sudo nginx -t`
3. Verificar permisos: `ls -la /var/www/marvera.mx`
4. Reiniciar servicios si es necesario

---

¿Te gustaría que creemos el script de deployment completo basado en esta guía?
