const fs = require('fs');
let content = fs.readFileSync('/var/www/marvera/backend/server-fixed.js', 'utf8');

// Fix the inconsistent image handling section
const oldImageSection = `    // Handle FormData vs JSON
    let { name, description, price, category, unit, inStock, isFeatured } = req.body;
    
    // Handle uploaded image
    let imageUrl = null;
    if (req.file) {
      imageUrl = \`/uploads/products/\${req.file.filename}\`;
    }
    
    console.log('💾 Extracted data:', { name, description, price, category, unit, inStock, isFeatured, imageUrls, imagesJson });`;

const newImageSection = `    // Handle FormData vs JSON
    let { name, description, price, category, unit, inStock, isFeatured } = req.body;
    
    // Handle uploaded images (multiple files)
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => \`/uploads/products/\${file.filename}\`);
    }
    
    // Convert to JSON string for database storage
    const imagesJson = JSON.stringify(imageUrls);
    
    console.log('💾 Extracted data:', { name, description, price, category, unit, inStock, isFeatured, imageUrls, imagesJson });`;

content = content.replace(oldImageSection, newImageSection);

// Also need to update the database insertion part to use the correct variable
content = content.replace(
  'images: imagesJson.length > 2 ? imagesJson : JSON.stringify(["/images/default.webp"])',
  'images: imageUrls.length > 0 ? imagesJson : JSON.stringify(["/images/default.webp"])'
);

fs.writeFileSync('/var/www/marvera/backend/server-fixed.js', content);
console.log('✅ Fixed imageUrls undefined error - Multiple images support ready');
