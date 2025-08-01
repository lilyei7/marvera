# 🌊 MarVera - Scripts de Deployment

## 📋 Resumen

Estos scripts automatizan completamente la configuración de nginx, PM2 y toda la infraestructura necesaria para MarVera en tu servidor.

## 🚀 Uso Rápido

### 1. Configuración Inicial del Servidor
```bash
# Subir setup-marvera.sh a tu servidor
scp setup-marvera.sh root@marvera.mx:/root/

# Conectar al servidor y ejecutar
ssh root@marvera.mx
chmod +x setup-marvera.sh
sudo bash setup-marvera.sh
```

### 2. Subir Archivos de la Aplicación
```bash
# Desde tu máquina local, hacer build
npm run build

# Subir backend
scp -r backend/ root@marvera.mx:/var/www/marvera.mx/

# Subir frontend (contenido de dist/)
scp -r dist/* root@marvera.mx:/var/www/marvera.mx/dist/

# Subir script post-deployment
scp post-deploy-marvera.sh root@marvera.mx:/var/www/marvera.mx/
```

### 3. Finalizar Deployment
```bash
# En el servidor
ssh root@marvera.mx
cd /var/www/marvera.mx
chmod +x post-deploy-marvera.sh
sudo bash post-deploy-marvera.sh
```

## 📁 Archivos Incluidos

### `setup-marvera.sh`
**Configuración inicial del servidor**
- ✅ Instala Node.js, nginx, PM2, certbot
- ✅ Configura nginx con proxy para API
- ✅ Crea estructura de directorios
- ✅ Configura firewall y permisos
- ✅ Crea página de prueba temporal

### `post-deploy-marvera.sh` 
**Deployment de la aplicación**
- ✅ Instala dependencias del backend
- ✅ Crea usuario administrador
- ✅ Configura permisos correctos
- ✅ Inicia servicios con PM2
- ✅ Prueba todos los endpoints
- ✅ Opción para configurar SSL automáticamente

## 🛠️ Lo que hacen los scripts

### Configuración de nginx
```nginx
# Proxy para API
location /api/ {
    proxy_pass http://localhost:3001;
    # Headers CORS configurados
    # Timeouts optimizados
}

# React Router
location / {
    try_files $uri $uri/ /index.html;
}
```

### Configuración de PM2
```javascript
{
  name: 'marvera-api',
  script: './backend/simple-server.js',
  instances: 1,
  autorestart: true,
  env: { NODE_ENV: 'production', PORT: 3001 }
}
```

## 🔧 Servicios Configurados

| Servicio | Puerto | Función |
|----------|--------|---------|
| nginx | 80/443 | Servidor web + proxy |
| Node.js/PM2 | 3001 | Backend API |
| Frontend | nginx | Archivos estáticos React |

## 🔐 Configuración SSL

El script puede configurar SSL automáticamente:
```bash
# Manual (si el automático falla)
certbot --nginx -d marvera.mx -d www.marvera.mx
```

## 📊 URLs Finales

- 🌐 **Sitio**: https://marvera.mx
- 🔗 **API**: https://marvera.mx/api/health  
- 🔐 **Login**: https://marvera.mx/login
- ⚙️ **Admin**: https://marvera.mx/admin

## 👤 Credenciales

- **Email**: admin@marvera.com
- **Password**: admin123456

## 🐛 Troubleshooting

### Ver logs
```bash
pm2 logs marvera-api
tail -f /var/log/nginx/marvera.mx.error.log
```

### Reiniciar servicios
```bash
pm2 restart marvera-api
systemctl restart nginx
```

### Verificar estado
```bash
pm2 status
systemctl status nginx
curl http://localhost:3001/api/health
```

## 📂 Estructura Final

```
/var/www/marvera.mx/
├── backend/
│   ├── simple-server.js
│   ├── package.json
│   ├── create-admin.js
│   └── prisma/
├── dist/
│   ├── index.html
│   └── assets/
├── ecosystem.config.js
├── deploy.sh
└── post-deploy-marvera.sh
```

## ✅ Checklist de Deployment

- [ ] Ejecutar `setup-marvera.sh` en servidor limpio
- [ ] Hacer `npm run build` en local
- [ ] Subir carpeta `backend/` completa
- [ ] Subir contenido de `dist/` 
- [ ] Ejecutar `post-deploy-marvera.sh`
- [ ] Verificar URLs funcionando
- [ ] Configurar SSL si es necesario

## 🎯 Resultado

Después de ejecutar estos scripts tendrás:
- ✅ MarVera funcionando en producción
- ✅ SSL configurado (opcional)
- ✅ PM2 manejando el backend
- ✅ nginx sirviendo frontend y proxy API
- ✅ Usuario admin creado y funcional
- ✅ Todos los endpoints probados y funcionando

¡Tu aplicación MarVera estará completamente operativa en marvera.mx! 🎉
