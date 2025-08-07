#!/bin/bash
# Script para optimizar imágenes existentes de gran tamaño

echo "🔧 Optimizando imágenes existentes en el servidor..."

# Crear script de optimización en el servidor
ssh root@148.230.87.198 "cat > /var/www/marvera/backend/optimize_existing_images.js << 'EOF'
const { optimizeImage } = require('./image_optimizer');
const fs = require('fs');
const path = require('path');

async function optimizeExistingImages() {
  const uploadsDir = path.join(__dirname, 'uploads/branches');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('❌ Directory uploads/branches not found');
    return;
  }
  
  const files = fs.readdirSync(uploadsDir);
  const imageFiles = files.filter(file => 
    file.match(/\.(png|jpg|jpeg)$/i) && 
    !file.includes('_thumb') && 
    !file.includes('_medium') && 
    !file.includes('_large')
  );
  
  console.log(\`📁 Found \${imageFiles.length} images to optimize\`);
  
  for (const file of imageFiles) {
    try {
      const inputPath = path.join(uploadsDir, file);
      const stats = fs.statSync(inputPath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      console.log(\`🔄 Processing \${file} (\${fileSizeMB}MB)...\`);
      
      // Solo procesar archivos mayores a 1MB
      if (stats.size > 1024 * 1024) {
        const baseName = path.basename(file, path.extname(file));
        
        // Crear diferentes tamaños optimizados
        const sizes = [
          { suffix: '_thumb', width: 200, height: 200, quality: 70 },
          { suffix: '_medium', width: 400, height: 400, quality: 80 },
          { suffix: '_large', width: 800, height: 800, quality: 85 }
        ];
        
        for (const size of sizes) {
          const outputPath = path.join(uploadsDir, \`\${baseName}\${size.suffix}.webp\`);
          
          // Solo crear si no existe ya
          if (!fs.existsSync(outputPath)) {
            await optimizeImage(inputPath, outputPath, {
              width: size.width,
              height: size.height,
              quality: size.quality,
              format: 'webp'
            });
          } else {
            console.log(\`  ⏭️  \${path.basename(outputPath)} already exists\`);
          }
        }
        
        console.log(\`  ✅ Created optimized versions for \${file}\`);
      } else {
        console.log(\`  ⏭️  \${file} is already small enough (\${fileSizeMB}MB)\`);
      }
    } catch (error) {
      console.error(\`  ❌ Error processing \${file}:\`, error.message);
    }
  }
  
  console.log('🎉 Optimization complete!');
}

optimizeExistingImages().catch(console.error);
EOF"

echo "✅ Optimization script created on server"

# Ejecutar la optimización
echo "🚀 Running optimization process..."
ssh root@148.230.87.198 "cd /var/www/marvera/backend && node optimize_existing_images.js"

echo "📊 Checking results..."
ssh root@148.230.87.198 "cd /var/www/marvera/backend/uploads/branches && ls -lh *.webp | head -10"
