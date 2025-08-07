app.post('/api/admin/products', upload.array('images', 7), async (req, res) => {
  try {
    console.log('📝 Creating product with data:', req.body);
    console.log('📸 Files received:', req.files?.length || 0);
    
    // Handle FormData vs JSON
    let { name, description, price, category, unit, inStock, isFeatured } = req.body;

    // Validar campos requeridos
    if (!name || !price || !category) {
      return res.status(400).json({ 
        success: false,
        message: 'Los campos nombre, precio y categoría son requeridos' 
      });
    }

    // Function to create slug from name
    function createSlug(name) {
      return name
        .toLowerCase()
        .replace(/[áäâà]/g, 'a')
        .replace(/[éëêè]/g, 'e')
        .replace(/[íïîì]/g, 'i')
        .replace(/[óöôò]/g, 'o')
        .replace(/[úüûù]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Buscar categoría existente por nombre o slug
    const categorySlug = createSlug(category);
    let categoryRecord = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: category, mode: 'insensitive' } },
          { slug: categorySlug }
        ]
      }
    });

    if (!categoryRecord) {
      // Solo crear si realmente no existe
      try {
        categoryRecord = await prisma.category.create({
          data: {
            name: category,
            slug: categorySlug,
            description: `Categoría de ${category}`
          }
        });
      } catch (createError) {
        // Si falla por slug duplicado, buscar por slug
        if (createError.code === 'P2002') {
          categoryRecord = await prisma.category.findFirst({
            where: { slug: categorySlug }
          });
        } else {
          throw createError;
        }
      }
    }

    // Construir URLs de imágenes si se subieron archivos
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
      console.log('📸 Imágenes procesadas:', imageUrls.length, imageUrls);
    }

    console.log('💾 Extracted data:', { name, description, price, category, unit, inStock, isFeatured, imageUrls });

    // Crear el producto
    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        categoryId: categoryRecord.id,
        unit: unit || 'kg',
        stock: (inStock === 'true' || inStock === true) ? 100 : 0,
        isActive: true,
        isFeatured: (isFeatured === 'true' || isFeatured === true),
        images: JSON.stringify(imageUrls), // Store as JSON array
        slug: createSlug(name) + '-' + Date.now()
      },
      include: {
        category: true
      }
    });

    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      comparePrice: product.comparePrice,
      categoryId: product.categoryId,
      category: product.category.name,
      unit: product.unit,
      inStock: product.stock > 0,
      imageUrl: imageUrls, // Return array of image URLs
      isFeatured: product.isFeatured,
      stock: product.stock,
      images: imageUrls // Also include images array
    };

    console.log('✅ Producto creado:', product.name, 'con', imageUrls.length, 'imágenes');
    res.status(201).json({
      success: true,
      data: transformedProduct
    });
  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    
    // Si hay error, eliminar archivos subidos
    if (req.files && req.files.length > 0) {
      const fs = require('fs');
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error al eliminar archivo:', err);
        });
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
});
