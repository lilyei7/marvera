@echo off
echo Preparando archivos de MarVera para produccion...
echo ================================================

echo 1. Copiando archivo de configuracion de produccion...
copy .env.production .env

echo 2. Instalando dependencias...
npm install

echo 3. Compilando proyecto para produccion...
npm run build

echo 4. Creando archivo comprimido para subir...
echo.
echo Los siguientes archivos deben subirse al servidor:
echo.
echo FRONTEND (subir a /var/www/marvera/):
echo   - Todos los archivos del proyecto (excepto node_modules)
echo   - Especialmente la carpeta 'dist' generada
echo.
echo BACKEND (subir a /var/www/marvera-backend/):
echo   - Todos los archivos del backend
echo   - archivo package.json
echo   - servidor Express (server.js o app.js)
echo.
echo SCRIPTS DE INSTALACION:
echo   - install-server.sh
echo   - deploy-marvera.sh
echo   - nginx-marvera-production.conf
echo.
echo Archivos preparados correctamente.
echo Sube estos archivos al servidor y ejecuta los scripts de instalacion.

pause
