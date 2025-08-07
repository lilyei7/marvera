const fs = require('fs');
let content = fs.readFileSync('/var/www/marvera/backend/server-fixed.js', 'utf8');

// 1. Replace the existing static multer configuration with dynamic one
const oldStorageConfig = `// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, branchImagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = \`branch_\${Date.now()}_\${Math.round(Math.random() * 1E9)}\${path.extname(file.originalname)}\`;
    cb(null, uniqueName);
  }
});`;

const newStorageConfig = `// Dynamic multer configuration for branches and products
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Detect if it's for products or branches
    const isProductUpload = req.route.path.includes('/products');
    const uploadDir = isProductUpload ? 
      path.join(__dirname, 'uploads', 'products') : 
      branchImagesDir;
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const isProductUpload = req.route.path.includes('/products');
    const prefix = isProductUpload ? 'product' : 'branch';
    const uniqueName = \`\${prefix}_\${Date.now()}_\${Math.round(Math.random() * 1E9)}\${path.extname(file.originalname)}\`;
    cb(null, uniqueName);
  }
});`;

content = content.replace(oldStorageConfig, newStorageConfig);

// 2. Change products endpoint to support multiple images (up to 7)
const oldProductsEndpoint = "app.post('/api/admin/products', upload.single('image'), async (req, res) => {";
const newProductsEndpoint = "app.post('/api/admin/products', upload.array('images', 7), async (req, res) => {";

content = content.replace(oldProductsEndpoint, newProductsEndpoint);

// 3. Update the image handling logic for multiple files
const oldImageHandling = `// Handle uploaded image
    let imageUrl = null;
    if (req.file) {
      imageUrl = \`/uploads/products/\${req.file.filename}\`;
    }`;

const newImageHandling = `// Handle uploaded images (multiple)
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => \`/uploads/products/\${file.filename}\`);
    }
    
    // Convert to JSON string for database storage
    const imagesJson = JSON.stringify(imageUrls);`;

content = content.replace(oldImageHandling, newImageHandling);

// 4. Update the product creation to use images array
const oldProductCreation = `console.log('💾 Extracted data:', { name, description, price, category, unit, inStock, isFeatured, imageUrl });`;
const newProductCreation = `console.log('💾 Extracted data:', { name, description, price, category, unit, inStock, isFeatured, imageUrls, imagesJson });`;

content = content.replace(oldProductCreation, newProductCreation);

// 5. Update database insertion to use images field
content = content.replace(
  'images: imageUrl ? JSON.stringify([imageUrl]) : JSON.stringify(["/images/default.webp"])',
  'images: imagesJson.length > 2 ? imagesJson : JSON.stringify(["/images/default.webp"])'
);

fs.writeFileSync('/var/www/marvera/backend/server-fixed.js', content);
console.log('✅ Multer configuration updated for multiple product images');
