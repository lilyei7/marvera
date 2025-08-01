# 🚀 SOLUCIÓN RÁPIDA PARA TU SERVIDOR MARVERA

## 📍 Situación Actual
- Tu servidor tiene la estructura: `/var/www/marvera/backend`
- Necesitas configurar nginx, PM2 y solucionar el Error 500

## ⚡ Solución en 3 Pasos

### Paso 1: Subir el script al servidor
```bash
# Desde tu PC, subir el script:
scp quick-setup.sh root@marvera.mx:/var/www/marvera/
```

### Paso 2: Ejecutar en el servidor
```bash
# Conectar al servidor
ssh root@marvera.mx

# Ir al directorio correcto
cd /var/www/marvera

# Dar permisos y ejecutar
chmod +x quick-setup.sh
sudo bash quick-setup.sh
```

### Paso 3: Verificar que funciona
```bash
# Probar estos comandos en el servidor:
curl http://localhost:3001/api/health
curl http://localhost/
pm2 status
```

## 🎯 Lo que hace el script

1. ✅ **Instala**: Node.js, nginx, PM2 (si no están)
2. ✅ **Crea**: directorio `/var/www/marvera/dist/` con página temporal
3. ✅ **Configura**: nginx con proxy a puerto 3001
4. ✅ **Instala**: dependencias de tu backend
5. ✅ **Crea**: usuario admin (admin@marvera.com / admin123456)
6. ✅ **Inicia**: backend con PM2
7. ✅ **Configura**: permisos correctos

## 📊 Resultado Esperado

Después de ejecutar verás:
```
🎉 CONFIGURACIÓN COMPLETADA
=========================
✅ MarVera configurado en:
   📁 Proyecto: /var/www/marvera
   🌐 Frontend: /var/www/marvera/dist
   ⚙️ Backend: /var/www/marvera/backend

🔗 URLs:
   🌐 Sitio: http://marvera.mx
   🔗 API: http://marvera.mx/api/health
```

## 🔧 Si hay problemas

Ver logs:
```bash
pm2 logs marvera-api
tail -f /var/log/nginx/marvera.mx.error.log
systemctl status nginx
```

Reiniciar servicios:
```bash
pm2 restart marvera-api
systemctl restart nginx
```

## 📱 Subir tu Frontend Real

Una vez que funcione, puedes subir tu build real:
```bash
# Desde tu PC:
npm run build
scp -r dist/* root@marvera.mx:/var/www/marvera/dist/

# En el servidor:
pm2 restart marvera-api
```

¡Este script debería solucionar tu Error 500 completamente! 🎉
