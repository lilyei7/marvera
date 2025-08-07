#!/bin/bash
# Simple fix: change Multer to save products in correct directory

echo "🔧 Applying simple multer fix for products..."

cd /var/www/marvera/backend

# Replace the destination function
sed -i '/destination: (req, file, cb) => {/,/},/ {
    /destination: (req, file, cb) => {/!{
        /},/!d
    }
}' server-fixed.js

sed -i '/destination: (req, file, cb) => {/a\
    const isProductUpload = req.route && req.route.path.includes("admin/products");\
    const uploadDir = isProductUpload ? path.join(__dirname, "uploads", "products") : branchImagesDir;\
    cb(null, uploadDir);\
  },' server-fixed.js

# Replace the filename function to use correct prefix
sed -i 's/branch_\${Date.now()}/\${req.route \&\& req.route.path.includes("admin\/products") ? "product" : "branch"}_\${Date.now()}/g' server-fixed.js

echo "✅ Simple multer fix applied"

# Verify syntax
node -c server-fixed.js && echo "✅ Syntax OK" || echo "❌ Syntax Error"
