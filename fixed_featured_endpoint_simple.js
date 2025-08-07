// FIXED FEATURED PRODUCTS ENDPOINT - SIMPLIFIED
app.get('/api/products/featured', async (req, res) => {
  try {
    console.log('🐟 Featured products requested (using real database - simplified)');
    
    // Local Prisma client to ensure it's available
    const { PrismaClient } = require('@prisma/client');
    const localPrisma = new PrismaClient();
    
    // Get real featured products from database (without category relation first)
    const featuredProducts = await localPrisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    // Close the connection
    await localPrisma.$disconnect();

    // Format the response to match frontend expectations
    const formattedProducts = featuredProducts.map(product => {
      let imageUrl = null;
      let images = [];
      
      // Parse images if they exist
      if (product.images) {
        try {
          const parsedImages = JSON.parse(product.images);
          if (Array.isArray(parsedImages) && parsedImages.length > 0) {
            images = parsedImages;
            imageUrl = parsedImages[0]; // Use first image as main image
          }
        } catch (e) {
          console.warn('Error parsing images for product:', product.id, e);
        }
      }
      
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        category: 'Mariscos', // Default category for now
        imageUrl: imageUrl || '/images/default-product.jpg',
        image: imageUrl || '/images/default-product.jpg', // For backward compatibility
        images: images,
        description: product.description || '',
        isFeatured: product.isFeatured,
        inStock: product.stock > 0,
        stock: product.stock,
        unit: product.unit || 'kg'
      };
    });

    console.log(`✅ Found ${formattedProducts.length} featured products from database`);
    
    res.json({
      success: true,
      data: formattedProducts,
      count: formattedProducts.length,
      timestamp: new Date().toISOString()
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
