@echo off
echo.
echo ========================================
echo       MarVera Backend Startup
echo ========================================
echo.

cd /d "c:\Users\lilye\OneDrive\Desktop\marvera\backend"

echo 🔍 Checking environment...
if not exist ".env" (
    echo ❌ .env file not found
    echo Creating .env file...
    copy .env.example .env
) else (
    echo ✅ .env file found
)

echo.
echo 🔍 Checking dependencies...
if not exist "node_modules" (
    echo ❌ Node modules not found
    echo Installing dependencies...
    npm install
) else (
    echo ✅ Node modules found
)

echo.
echo 🔍 Testing imports...
node test-imports.js

echo.
echo 🔍 Checking Prisma...
if not exist "prisma\dev.db" (
    echo ❌ Database not found
    echo Running Prisma migrations...
    npx prisma migrate deploy
    npx prisma generate
) else (
    echo ✅ Database found
)

echo.
echo 🚀 Starting backend server...
echo Server will start on http://localhost:3001
echo Press Ctrl+C to stop
echo.

npm run dev

pause
