// ==========================================  
// SLIDESHOW ROUTES - DIRECT INSERT
// ==========================================

// GET /api/slideshow - Obtener slides activos (público)
app.get('/api/slideshow', async (req, res) => {
  try {
    console.log('🎬 Slideshow público solicitado - BD');
    const slides = await prisma.slideshow.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
    console.log(`✅ ${slides.length} slides activos encontrados`);
    res.json({
      success: true,
      data: slides,
      count: slides.length,
      message: 'Slides obtenidos correctamente'
    });
  } catch (error) {
    console.error('❌ Error slideshow BD:', error);
    // Fallback a datos estáticos si falla BD
    const fallbackSlides = [{
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
      order: 0
    }];
    res.json({ success: true, data: fallbackSlides, count: 1 });
  }
});

// GET /api/slideshow/all - Obtener todos los slides (admin)
app.get('/api/slideshow/all', async (req, res) => {
  try {
    console.log('🔧 Admin slideshow solicitado - BD');
    const slides = await prisma.slideshow.findMany({
      orderBy: { order: 'asc' }
    });
    console.log(`✅ ${slides.length} slides totales encontrados`);
    res.json({
      success: true,
      data: slides,
      count: slides.length,
      message: 'Todos los slides obtenidos'
    });
  } catch (error) {
    console.error('❌ Error admin slideshow BD:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

console.log('🎬 Rutas slideshow registradas correctamente');
