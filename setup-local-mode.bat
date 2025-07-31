@echo off
echo Configurando MarVera para desarrollo local...
echo.

echo # Variables de entorno para MarVera - Configuracion Local > .env.local
echo # Este archivo tiene prioridad sobre .env >> .env.local
echo. >> .env.local
echo # URL de la API >> .env.local
echo # Usar localhost para desarrollo local >> .env.local
echo VITE_API_URL=http://localhost:3001 >> .env.local
echo. >> .env.local
echo # Backend URL para proxy >> .env.local
echo VITE_BACKEND_URL=http://187.33.155.127:3001 >> .env.local
echo. >> .env.local
echo # Modo fallback (true para usar datos locales, false para requerir servidor) >> .env.local
echo VITE_ENABLE_FALLBACK=true >> .env.local
echo. >> .env.local
echo # Tiempo de espera para conexiones (ms) >> .env.local
echo VITE_API_TIMEOUT=5000 >> .env.local
echo. >> .env.local
echo # Socket.IO URL >> .env.local
echo VITE_SOCKET_URL=http://localhost:3001 >> .env.local
echo. >> .env.local
echo # Mapbox token >> .env.local
echo VITE_MAPBOX_TOKEN=pk.test.placeholder >> .env.local
echo. >> .env.local
echo # Stripe key >> .env.local
echo VITE_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder >> .env.local

echo Configuracion establecida para modo LOCAL.
echo.
echo Para iniciar el servidor local, ejecuta:
echo   start-local.bat
echo.
echo Para iniciar el frontend, ejecuta:
echo   npm run dev
echo.
echo Para mas informacion, consulta el archivo LOCAL_DEV_GUIDE.md
echo.
echo Presiona cualquier tecla para salir...

pause > nul
