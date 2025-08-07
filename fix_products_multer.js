const fs = require('fs');
let content = fs.readFileSync('/var/www/marvera/backend/server-fixed.js', 'utf8');

// 1. Add multer to the products endpoint
content = content.replace(
  "app.post('/api/admin/products', async (req, res) => {",
  "app.post('/api/admin/products', upload.single('image'), async (req, res) => {"
);

// 2. Replace the destructuring to handle FormData
const oldDestructuring = "const { name, description, price, category, unit, inStock, isFeatured, imageUrl } = req.body;";
const newDestructuring = `// Handle FormData vs JSON
    let { name, description, price, category, unit, inStock, isFeatured } = req.body;
    
    // Handle uploaded image  
    let imageUrl = null;
    if (req.file) {
      imageUrl = \`/uploads/products/\${req.file.filename}\`;
    }
    
    console.log('💾 Extracted data:', { name, description, price, category, unit, inStock, isFeatured, imageUrl });`;

content = content.replace(oldDestructuring, newDestructuring);

fs.writeFileSync('/var/www/marvera/backend/server-fixed.js', content);
console.log('Products endpoint updated for FormData');
