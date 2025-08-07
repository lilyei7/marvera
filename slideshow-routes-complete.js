// ==========================================
// SLIDESHOW API ROUTES - WORKING VERSION
// ==========================================

// GET /api/slideshow - Obtener slides activos para el público
app.get('/api/slideshow', async (req, res) => {
  try {
    console.log('🎬 Slideshow público solicitado');
    
    // Datos estáticos por ahora, luego se conectará a BD
    const slides = [
      {
        id: 1,
        title: 'Del mar directo a tu restaurante',
        subtitle: 'Productos frescos del mar',
        description: 'Mariscos frescos y productos del mar de la más alta calidad',
        buttonText: 'Ver Productos',
        buttonLink: '/productos',
        imageUrl: '/fondorectangulo3.png',
        backgroundColor: '#1E3A8A',
        textColor: '#FFFFFF',
        isActive: true,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Calidad Premium',
        subtitle: 'Los mejores mariscos',
        description: 'Selección especial de productos del mar',
        buttonText: 'Explorar',
        buttonLink: '/productos',
        imageUrl: '/fondorectangulo3.png',
        backgroundColor: '#40E0D0',
        textColor: '#1E3A8A',
        isActive: true,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    console.log(`✅ ${slides.length} slides encontrados para público`);
    res.json({
      success: true,
      data: slides,
      count: slides.length,
      message: 'Slides obtenidos correctamente'
    });
    
  } catch (error) {
    console.error('❌ Error al obtener slideshow público:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/slideshow/all - Obtener todos los slides para admin
app.get('/api/slideshow/all', async (req, res) => {
  try {
    console.log('🔧 Admin slideshow solicitado');
    
    // Verificar autenticación admin (simplificado)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autorización requerido'
      });
    }
    
    // Datos estáticos para admin (incluye inactivos)
    const slides = [
      {
        id: 1,
        title: 'Del mar directo a tu restaurante',
        subtitle: 'Productos frescos del mar',
        description: 'Mariscos frescos y productos del mar de la más alta calidad',
        buttonText: 'Ver Productos',
        buttonLink: '/productos',
        imageUrl: '/fondorectangulo3.png',
        backgroundColor: '#1E3A8A',
        textColor: '#FFFFFF',
        isActive: true,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Calidad Premium',
        subtitle: 'Los mejores mariscos',
        description: 'Selección especial de productos del mar',
        buttonText: 'Explorar',
        buttonLink: '/productos',
        imageUrl: '/fondorectangulo3.png',
        backgroundColor: '#40E0D0',
        textColor: '#1E3A8A',
        isActive: true,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        title: 'Slide Inactivo',
        subtitle: 'Para pruebas',
        description: 'Este slide está desactivado',
        buttonText: 'Ver',
        buttonLink: '/productos',
        imageUrl: '/fondorectangulo3.png',
        backgroundColor: '#6B7280',
        textColor: '#FFFFFF',
        isActive: false,
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    console.log(`✅ ${slides.length} slides encontrados para admin`);
    res.json({
      success: true,
      data: slides,
      count: slides.length,
      message: 'Todos los slides obtenidos correctamente'
    });
    
  } catch (error) {
    console.error('❌ Error al obtener slideshow admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/slideshow - Crear nuevo slide
app.post('/api/slideshow', async (req, res) => {
  try {
    console.log('📝 Creando nuevo slide');
    
    // Verificar autenticación admin
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autorización requerido'
      });
    }
    
    const { title, subtitle, description, buttonText, buttonLink, imageUrl, backgroundColor, textColor, isActive, order } = req.body;
    
    // Validaciones básicas
    if (!title || !subtitle) {
      return res.status(400).json({
        success: false,
        message: 'Título y subtítulo son requeridos'
      });
    }
    
    // Simular creación (luego se conectará a BD)
    const newSlide = {
      id: Date.now(), // ID temporal
      title,
      subtitle,
      description: description || '',
      buttonText: buttonText || 'Ver Más',
      buttonLink: buttonLink || '/productos',
      imageUrl: imageUrl || '/fondorectangulo3.png',
      backgroundColor: backgroundColor || '#1E3A8A',
      textColor: textColor || '#FFFFFF',
      isActive: isActive !== undefined ? isActive : true,
      order: order !== undefined ? order : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log(`✅ Slide creado con ID: ${newSlide.id}`);
    res.status(201).json({
      success: true,
      data: newSlide,
      message: 'Slide creado correctamente'
    });
    
  } catch (error) {
    console.error('❌ Error al crear slide:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/slideshow/:id - Actualizar slide
app.put('/api/slideshow/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📝 Actualizando slide ID: ${id}`);
    
    // Verificar autenticación admin
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autorización requerido'
      });
    }
    
    const updateData = req.body;
    
    // Simular actualización (luego se conectará a BD)
    const updatedSlide = {
      id: parseInt(id),
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    console.log(`✅ Slide ${id} actualizado correctamente`);
    res.json({
      success: true,
      data: updatedSlide,
      message: 'Slide actualizado correctamente'
    });
    
  } catch (error) {
    console.error('❌ Error al actualizar slide:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/slideshow/:id - Eliminar slide
app.delete('/api/slideshow/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Eliminando slide ID: ${id}`);
    
    // Verificar autenticación admin
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autorización requerido'
      });
    }
    
    // Simular eliminación (luego se conectará a BD)
    console.log(`✅ Slide ${id} eliminado correctamente`);
    res.json({
      success: true,
      message: 'Slide eliminado correctamente'
    });
    
  } catch (error) {
    console.error('❌ Error al eliminar slide:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

console.log('🎬 Rutas de Slideshow registradas:');
console.log('  - GET /api/slideshow (público)');
console.log('  - GET /api/slideshow/all (admin)');
console.log('  - POST /api/slideshow (crear)');
console.log('  - PUT /api/slideshow/:id (actualizar)');
console.log('  - DELETE /api/slideshow/:id (eliminar)');
