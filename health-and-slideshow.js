// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'MarVera Backend is running', 
    timestamp: new Date().toISOString() 
  });
});

// Slideshow Routes
app.get('/api/slideshow', function(req, res) {
  console.log('🎬 Slideshow publico solicitado');
  var slides = [
    {
      id: 1,
      title: 'Del mar directo a tu restaurante',
      subtitle: 'Productos frescos del mar',
      description: 'Mariscos frescos y productos del mar de la mas alta calidad',
      buttonText: 'Ver Productos',
      buttonLink: '/products',
      imageUrl: '/fondorectangulo3.png',
      backgroundColor: '#1E3A8A',
      textColor: '#FFFFFF',
      isActive: true,
      order: 0
    }
  ];
  console.log('✅ Enviando ' + slides.length + ' slides');
  res.json({ success: true, data: slides, count: slides.length });
});

app.get('/api/slideshow/all', function(req, res) {
  console.log('🔧 Admin slideshow solicitado');
  var slides = [
    {
      id: 1,
      title: 'Del mar directo a tu restaurante',
      subtitle: 'Productos frescos del mar',
      description: 'Mariscos frescos y productos del mar de la mas alta calidad',
      buttonText: 'Ver Productos',
      buttonLink: '/products',
      imageUrl: '/fondorectangulo3.png',
      backgroundColor: '#1E3A8A',
      textColor: '#FFFFFF',
      isActive: true,
      order: 0
    }
  ];
  console.log('✅ Enviando ' + slides.length + ' slides admin');
  res.json({ success: true, data: slides, count: slides.length });
});
