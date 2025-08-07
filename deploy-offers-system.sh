#!/bin/bash

echo "🎁 MarVera - Deploying Offers System Complete"
echo "=============================================="

# 1. Frontend build
echo "📦 Building frontend..."
npm run build

# 2. Deploy frontend files
echo "🚀 Deploying frontend..."
scp -r ./dist/* root@148.230.87.198:/var/www/marvera/

# 3. Deploy compiled backend
echo "📡 Deploying backend..."
scp ./backend/dist/index.js root@148.230.87.198:/var/www/marvera/backend/
scp -r ./backend/dist/routes/* root@148.230.87.198:/var/www/marvera/backend/routes/

# 4. Install multer on server
echo "📦 Installing multer on server..."
ssh root@148.230.87.198 "cd /var/www/marvera/backend && npm install multer"

# 5. Create uploads directory
echo "📁 Creating uploads directory..."
ssh root@148.230.87.198 "mkdir -p /var/www/marvera/uploads/offers && chmod 755 /var/www/marvera/uploads/offers"

# 6. Copy and configure nginx for uploads
echo "🔧 Configuring nginx for uploads..."
ssh root@148.230.87.198 "nginx -t && systemctl reload nginx"

# 7. Restart backend with compiled version
echo "🔄 Restarting backend..."
ssh root@148.230.87.198 "pm2 restart marvera-backend || pm2 start /var/www/marvera/backend/index.js --name marvera-backend"

# 8. Test endpoints
echo "🧪 Testing endpoints..."
sleep 3
curl -s https://marvera.mx/api/health
echo
curl -s https://marvera.mx/api/admin/offers

echo "✅ Deploy complete!"
echo "🌐 Site: https://marvera.mx/"
echo "🔧 Admin: https://marvera.mx/admin/offers"
