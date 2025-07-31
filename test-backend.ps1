# Test backend server
Write-Host "🧪 Testing backend connection..." -ForegroundColor Yellow

# Change to backend directory
Set-Location -Path "backend"

# Check if node_modules exist
if (Test-Path "node_modules") {
    Write-Host "✅ Node modules found" -ForegroundColor Green
} else {
    Write-Host "❌ Node modules not found. Running npm install..." -ForegroundColor Red
    npm install
}

# Check if dist folder exists
if (Test-Path "dist") {
    Write-Host "✅ Dist folder found" -ForegroundColor Green
} else {
    Write-Host "❌ Dist folder not found. Building project..." -ForegroundColor Red
    npm run build
}

# Try to start the server
Write-Host "🚀 Starting backend server..." -ForegroundColor Blue
node dist/index.js
