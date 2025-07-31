@echo off
echo MarVera - Iniciando entorno de desarrollo LOCAL completo
echo ========================================================
echo.

echo 1. Configurando variables de entorno para modo local...
call setup-local-mode.bat > nul

echo 2. Iniciando servidor backend local en segundo plano...
start "MarVera Backend Local" cmd /c start-local.bat

echo Esperando 3 segundos para que el servidor se inicie...
ping -n 4 127.0.0.1 > nul

echo 3. Iniciando frontend...
echo.
echo Acceso al frontend: http://localhost:5173
echo Acceso a la API local: http://localhost:3001
echo.
echo La aplicacion se abrira en tu navegador.
echo.

npm run dev
