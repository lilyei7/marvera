const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../../config/db');
const authenticateToken = require('../../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../../public/uploads/images');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    console.log('Uploading to directory:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Create unique filename
    const uniqueFilename = `product-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    console.log('Creating file with name:', uniqueFilename);
    cb(null, uniqueFilename);
  }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('No es un archivo de imagen válido'), false);
  }
};

// Configure multer with options
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// GET all products
router.get('/', async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT p.*, c.name AS categoryName 
       FROM products p
       LEFT JOIN categories c ON p.categoryId = c.id
       ORDER BY p.createdAt DESC`
    );
    
    // Get images for each product
    for (let product of products) {
      const [images] = await db.query(
        'SELECT imageUrl FROM product_images WHERE productId = ?',
        [product.id]
      );
      product.images = images.map(img => img.imageUrl);
      
      // Add first image as main image
      product.image = product.images.length > 0 ? product.images[0] : null;
    }
    
    res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// GET featured products
router.get('/featured', async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT p.*, c.name AS categoryName, c.emoji
       FROM products p
       LEFT JOIN categories c ON p.categoryId = c.id
       WHERE p.isFeatured = 1
       ORDER BY p.createdAt DESC
       LIMIT 6`
    );
    
    // Get images for each product
    for (let product of products) {
      const [images] = await db.query(
        'SELECT imageUrl FROM product_images WHERE productId = ?',
        [product.id]
      );
      product.images = images.map(img => img.imageUrl);
      
      // Add first image as main image
      product.image = product.images.length > 0 ? product.images[0] : null;
      
      // Format for frontend
      product.tag = 'Destacado';
      product.tagColor = 'bg-primary';
      product.inStock = product.stock > 0;
      product.unit = product.unit || 'kg';
    }
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Error al obtener productos destacados' });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT p.*, c.name AS categoryName, c.emoji
       FROM products p
       LEFT JOIN categories c ON p.categoryId = c.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    const product = products[0];
    
    // Get images
    const [images] = await db.query(
      'SELECT imageUrl FROM product_images WHERE productId = ?',
      [product.id]
    );
    
    product.images = images.map(img => img.imageUrl);
    
    res.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
});

// POST new product
router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => {
  console.log('POST /api/products received');
  console.log('Files received:', req.files?.length || 0);
  try {
    // Start a transaction
    await db.query('START TRANSACTION');
    
    const {
      name,
      description,
      price,
      categoryId,
      unit,
      stock,
      isFeatured
    } = req.body;
    
    // Insert product
    const [result] = await db.query(
      `INSERT INTO products (name, description, price, categoryId, unit, stock, isFeatured)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || '',
        parseFloat(price),
        categoryId,
        unit || 'kg',
        parseInt(stock, 10) || 0,
        isFeatured === '1' ? 1 : 0
      ]
    );
    
    const productId = result.insertId;
    
    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      console.log('Processing', req.files.length, 'uploaded files');
      for (const file of req.files) {
        console.log('Processing file:', file.filename);
        // Save the image URL to the database
        const imageUrl = `/uploads/images/${file.filename}`;
        await db.query(
          'INSERT INTO product_images (productId, imageUrl) VALUES (?, ?)',
          [productId, imageUrl]
        );
        console.log('Image URL saved to database:', imageUrl);
      }
    } else {
      console.log('No files uploaded');
    }
    
    // Commit the transaction
    await db.query('COMMIT');
    
    res.status(201).json({
      message: 'Producto creado con éxito',
      productId
    });
  } catch (error) {
    // Rollback in case of error
    await db.query('ROLLBACK');
    console.error('Error creating product:', error);
    res.status(500).json({
      message: 'Error al crear el producto',
      error: error.message
    });
  }
});

// PUT update product
router.put('/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    // Start a transaction
    await db.query('START TRANSACTION');
    
    const productId = req.params.id;
    
    // Check if product exists
    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    const {
      name,
      description,
      price,
      categoryId,
      unit,
      stock,
      isFeatured
    } = req.body;
    
    // Update product
    await db.query(
      `UPDATE products
       SET name = ?, description = ?, price = ?, categoryId = ?, unit = ?, stock = ?, isFeatured = ?, updatedAt = NOW()
       WHERE id = ?`,
      [
        name,
        description || '',
        parseFloat(price),
        categoryId,
        unit || 'kg',
        parseInt(stock, 10) || 0,
        isFeatured === '1' ? 1 : 0,
        productId
      ]
    );
    
    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      console.log('Processing', req.files.length, 'uploaded files for update');
      for (const file of req.files) {
        console.log('Processing file:', file.filename);
        // Save the image URL to the database
        const imageUrl = `/uploads/images/${file.filename}`;
        await db.query(
          'INSERT INTO product_images (productId, imageUrl) VALUES (?, ?)',
          [productId, imageUrl]
        );
        console.log('Image URL saved to database:', imageUrl);
      }
    }
    
    // Commit the transaction
    await db.query('COMMIT');
    
    res.status(200).json({
      message: 'Producto actualizado con éxito',
      productId
    });
  } catch (error) {
    // Rollback in case of error
    await db.query('ROLLBACK');
    console.error('Error updating product:', error);
    res.status(500).json({
      message: 'Error al actualizar el producto',
      error: error.message
    });
  }
});

// DELETE product
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Start a transaction
    await db.query('START TRANSACTION');
    
    // Get images to delete from filesystem
    const [images] = await db.query(
      'SELECT imageUrl FROM product_images WHERE productId = ?',
      [productId]
    );
    
    // Delete images from database
    await db.query('DELETE FROM product_images WHERE productId = ?', [productId]);
    
    // Delete product
    await db.query('DELETE FROM products WHERE id = ?', [productId]);
    
    // Commit transaction
    await db.query('COMMIT');
    
    // Delete image files (outside transaction)
    for (const image of images) {
      // Only delete local files, not external URLs
      if (image.imageUrl.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '../../../public', image.imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    
    res.status(200).json({
      message: 'Producto eliminado con éxito'
    });
  } catch (error) {
    // Rollback in case of error
    await db.query('ROLLBACK');
    console.error('Error deleting product:', error);
    res.status(500).json({
      message: 'Error al eliminar el producto',
      error: error.message
    });
  }
});

module.exports = router;
