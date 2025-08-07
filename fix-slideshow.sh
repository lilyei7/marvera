#!/bin/bash

# Script mejorado para agregar slideshow sin conflictos con Prisma

ssh root@148.230.87.198 "
cd /var/www/marvera

# Comentar las rutas problemáticas que usan prisma.specialOffer
sed -i 's/app\.get.*\/api\/offers.*async/\/\/ &/' production-server.js
sed -i 's/app\.get.*\/api\/admin\/offers.*async/\/\/ &/' production-server.js
sed -i 's/app\.post.*\/api\/admin\/offers.*async/\/\/ &/' production-server.js
sed -i 's/app\.put.*\/api\/admin\/offers.*async/\/\/ &/' production-server.js
sed -i 's/app\.delete.*\/api\/admin\/offers.*async/\/\/ &/' production-server.js

# Agregar rutas del slideshow después del health check
cat > /tmp/slideshow_simple.js << 'EOF'

// ==========================================
// SLIDESHOW ROUTES (DATOS ESTÁTICOS)
// ==========================================

app.get('/api/slideshow', async (req, res) => {
  try {
    console.log('🎬 Slideshow público solicitado');
    const slides = [{
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
      order: 0
    }];
    console.log(\`✅ \${slides.length} slides encontrados\`);
    res.json({ success: true, data: slides, count: slides.length });
  } catch (error) {
    console.error('❌ Error slideshow:', error);
    res.status(500).json({ success: false, message: 'Error interno' });
  }
});

app.get('/api/slideshow/all', async (req, res) => {
  try {
    console.log('🔧 Admin slideshow solicitado');
    const slides = [{
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
      order: 0
    }];
    console.log(\`✅ \${slides.length} slides admin encontrados\`);
    res.json({ success: true, data: slides, count: slides.length });
  } catch (error) {
    console.error('❌ Error admin slideshow:', error);
    res.status(500).json({ success: false, message: 'Error interno' });
  }
});
EOF

# Insertar después del health check
sed -i '/app\.get.*\/api\/health/r /tmp/slideshow_simple.js' production-server.js

echo '✅ Slideshow agregado exitosamente'
pm2 restart marvera-backend
"
