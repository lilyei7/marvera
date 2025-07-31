# 🚀 Guía de Instalación de MarVera en Producción

## Información del Servidor
- **IP**: 148.230.87.198
- **Usuario**: root
- **Contraseña**: Oficina808#12
- **Dominio**: https://marvera.mx

## Paso 1: Preparar archivos localmente

1. En tu máquina local, ejecuta:
   ```bash
   prepare-for-production.bat
   ```

2. Esto hará:
   - Copiar la configuración de producción
   - Instalar dependencias
   - Compilar el proyecto
   - Preparar archivos para subir

## Paso 2: Conectar al servidor

```bash
ssh root@148.230.87.198
# Contraseña: Oficina808#12
```

## Paso 3: Instalar dependencias del servidor

1. Subir el archivo `install-server.sh` al servidor
2. Darle permisos de ejecución:
   ```bash
   chmod +x install-server.sh
   ```
3. Ejecutar instalación:
   ```bash
   ./install-server.sh
   ```

Este script instalará:
- Node.js 18.x
- PM2 (gestor de procesos)
- Nginx (servidor web)
- PostgreSQL (base de datos)
- Certbot (certificados SSL)
- Configuración de firewall y seguridad

## Paso 4: Subir archivos del proyecto

### Frontend (subir a `/var/www/marvera/`):
```bash
# Desde tu máquina local, usar SCP o SFTP
scp -r ./src root@148.230.87.198:/var/www/marvera/
scp -r ./dist root@148.230.87.198:/var/www/marvera/
scp ./package.json root@148.230.87.198:/var/www/marvera/
scp ./.env.production root@148.230.87.198:/var/www/marvera/.env
scp ./vite.config.ts root@148.230.87.198:/var/www/marvera/
scp ./index.html root@148.230.87.198:/var/www/marvera/
scp ./tailwind.config.js root@148.230.87.198:/var/www/marvera/
scp ./postcss.config.js root@148.230.87.198:/var/www/marvera/
scp ./tsconfig.json root@148.230.87.198:/var/www/marvera/
scp ./eslint.config.js root@148.230.87.198:/var/www/marvera/
```

### Backend (subir a `/var/www/marvera-backend/`):
```bash
# Subir archivos del backend
scp -r ./backend/* root@148.230.87.198:/var/www/marvera-backend/
```

### Scripts de configuración:
```bash
scp ./deploy-marvera.sh root@148.230.87.198:/root/
scp ./nginx-marvera-production.conf root@148.230.87.198:/root/
```

## Paso 5: Configurar dominio DNS

Antes de continuar, asegúrate de que el dominio `marvera.mx` apunte a la IP `148.230.87.198`:

1. En tu proveedor de DNS, configura:
   - Registro A: `marvera.mx` → `148.230.87.198`
   - Registro A: `www.marvera.mx` → `148.230.87.198`

2. Verifica la propagación:
   ```bash
   nslookup marvera.mx
   ping marvera.mx
   ```

## Paso 6: Ejecutar despliegue

En el servidor, ejecuta:
```bash
chmod +x deploy-marvera.sh
./deploy-marvera.sh
```

Este script hará:
- Instalar dependencias del backend
- Compilar el frontend
- Configurar Nginx
- Obtener certificados SSL con Let's Encrypt
- Iniciar la aplicación con PM2
- Configurar todos los servicios

## Paso 7: Verificar instalación

1. **Verificar servicios**:
   ```bash
   # Estado de Nginx
   systemctl status nginx
   
   # Estado del backend
   sudo -u marvera pm2 status
   
   # Logs del backend
   sudo -u marvera pm2 logs marvera-backend
   
   # Logs de Nginx
   tail -f /var/log/nginx/marvera_error.log
   ```

2. **Probar la aplicación**:
   - Visita: https://marvera.mx
   - Prueba la API: https://marvera.mx/api/health

## Paso 8: Configuración de la base de datos

Si tienes un script SQL para la base de datos, ejecútalo:
```bash
sudo -u postgres psql -d marvera_db -f tu_script.sql
```

## Comandos útiles para mantenimiento

### Gestión de la aplicación:
```bash
# Reiniciar backend
sudo -u marvera pm2 restart marvera-backend

# Ver logs en tiempo real
sudo -u marvera pm2 logs marvera-backend --lines 50

# Reiniciar Nginx
systemctl restart nginx

# Verificar certificados SSL
certbot certificates
```

### Actualizar la aplicación:
```bash
# 1. Subir nuevos archivos
# 2. Recompilar frontend
cd /var/www/marvera
sudo -u marvera npm run build

# 3. Reiniciar backend
sudo -u marvera pm2 restart marvera-backend

# 4. Reiniciar Nginx si es necesario
systemctl reload nginx
```

### Monitoreo:
```bash
# Uso de recursos
htop

# Espacio en disco
df -h

# Estado de la base de datos
sudo -u postgres psql -c "\l"
```

## Estructura final del servidor:

```
/var/www/marvera/          # Frontend (React compilado)
├── dist/                  # Archivos estáticos compilados
├── src/                   # Código fuente
├── package.json
└── .env

/var/www/marvera-backend/  # Backend (Node.js/Express)
├── server.js              # Archivo principal
├── package.json
├── ecosystem.config.js    # Configuración PM2
└── .env

/etc/nginx/sites-available/marvera.mx  # Configuración Nginx
/var/log/nginx/marvera_*.log          # Logs de Nginx
/var/log/pm2/marvera-*.log            # Logs de la aplicación
```

## Seguridad adicional (recomendado)

1. **Cambiar contraseña root**:
   ```bash
   passwd root
   ```

2. **Crear usuario no-root para SSH**:
   ```bash
   adduser tuusuario
   usermod -aG sudo tuusuario
   ```

3. **Configurar autenticación por clave SSH**:
   ```bash
   # Generar clave SSH en tu máquina local
   ssh-keygen -t rsa -b 4096
   
   # Copiar clave pública al servidor
   ssh-copy-id tuusuario@148.230.87.198
   ```

4. **Deshabilitar autenticación por contraseña**:
   ```bash
   nano /etc/ssh/sshd_config
   # Cambiar: PasswordAuthentication no
   systemctl restart ssh
   ```

## ¡Listo! 🎉

Tu aplicación MarVera debería estar funcionando en:
- **Sitio web**: https://marvera.mx
- **API**: https://marvera.mx/api

Si tienes algún problema, revisa los logs y no dudes en preguntar.
