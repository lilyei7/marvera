// ==========================================
// SLIDESHOW ROUTES - AGREGADO AUTOMÁTICAMENTE
// ==========================================

// GET /api/slideshow - Obtener slides activos
app.get('/api/slideshow', async (req, res) => {
  try {
    console.log('🎬 Slideshow público solicitado');
    
    // Por ahora devolver datos estáticos hasta que se arregle Prisma
    const slides = [
      {
        id: 1,
        title: 'Del mar directo a tu restaurante',
        subtitle: 'Productos frescos del mar',
        description: 'Mariscos frescos y productos del mar de la más alta calidad',
        buttonText: 'Ver Productos',
        buttonLink: '/products',
        imageUrl: '/fondorectangulo3.png',
        backgroundColor: '#1E3A8A',
        textColor: '#FFFFFF',
        isActive: true,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    console.log(`✅ ${slides.length} slides encontrados`);
    res.json({
      success: true,
      data: slides,
      count: slides.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error al obtener slideshow:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/slideshow/all - Obtener todos los slides (admin)
app.get('/api/slideshow/all', async (req, res) => {
  try {
    console.log('🔧 Todos los slides solicitados (admin)');
    
    // Por ahora devolver datos estáticos
    const slides = [
      {
        id: 1,
        title: 'Del mar directo a tu restaurante',
        subtitle: 'Productos frescos del mar',
        description: 'Mariscos frescos y productos del mar de la más alta calidad',
        buttonText: 'Ver Productos',
        buttonLink: '/products',
        imageUrl: '/fondorectangulo3.png',
        backgroundColor: '#1E3A8A',
        textColor: '#FFFFFF',
        isActive: true,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    console.log(`✅ ${slides.length} slides encontrados en total`);
    res.json({
      success: true,
      data: slides,
      count: slides.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error en admin slideshow:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
      data: []
    });
  }
});
