// TEMP FEATURED PRODUCTS ENDPOINT - DIRECT SQL
app.get('/api/products/featured', async (req, res) => {
  try {
    console.log('🐟 Featured products requested (using direct SQL)');
    
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    
    const dbPath = path.join(__dirname, 'prisma', 'dev.db');
    const db = new sqlite3.Database(dbPath);
    
    const query = `
      SELECT id, name, price, description, images, stock, unit, categoryId
      FROM products 
      WHERE isFeatured = 1 AND isActive = 1
      ORDER BY id ASC
    `;
    
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('❌ SQL Error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: err.message
        });
      }
      
      // Format the response
      const formattedProducts = rows.map(product => {
        let imageUrl = null;
        let images = [];
        
        // Parse images if they exist
        if (product.images) {
          try {
            const parsedImages = JSON.parse(product.images);
            if (Array.isArray(parsedImages) && parsedImages.length > 0) {
              images = parsedImages;
              imageUrl = parsedImages[0];
            }
          } catch (e) {
            console.warn('Error parsing images for product:', product.id, e);
          }
        }
        
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          category: 'Mariscos',
          imageUrl: imageUrl || '/images/default-product.jpg',
          image: imageUrl || '/images/default-product.jpg',
          images: images,
          description: product.description || '',
          isFeatured: true,
          inStock: product.stock > 0,
          stock: product.stock,
          unit: product.unit || 'kg'
        };
      });
      
      console.log(`✅ Found ${formattedProducts.length} featured products from database`);
      
      db.close();
      
      res.json({
        success: true,
        data: formattedProducts,
        count: formattedProducts.length,
        timestamp: new Date().toISOString()
      });
    });
    
  } catch (error) {
    console.error('❌ Error al obtener productos destacados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});
