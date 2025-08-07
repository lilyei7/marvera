#!/bin/bash

# Script para agregar las rutas del slideshow al production-server.js de forma segura

# Conectar al servidor y agregar las rutas después de la línea del health check
ssh root@148.230.87.198 "
cd /var/www/marvera

# Crear una copia de seguridad
cp production-server.js production-server.js.backup

# Crear un archivo temporal con las rutas del slideshow
cat > slideshow-routes.js << 'EOF'

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

    console.log(\`✅ \${slides.length} slides encontrados\`);
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
    
    console.log(\`✅ \${slides.length} slides encontrados en total\`);
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

EOF

# Encontrar la línea después del health check
LINE_NUM=\$(grep -n 'Health check endpoint\\|health check' production-server.js | head -1 | cut -d: -f1)
if [ -z \"\$LINE_NUM\" ]; then
  LINE_NUM=\$(grep -n '/api/health' production-server.js | head -1 | cut -d: -f1)
fi

if [ -n \"\$LINE_NUM\" ]; then
  # Insertar las rutas después de la sección de health check
  AFTER_LINE=\$((LINE_NUM + 10))
  sed -i \"\${AFTER_LINE}r slideshow-routes.js\" production-server.js
  echo \"✅ Rutas del slideshow agregadas después de la línea \$AFTER_LINE\"
else
  echo \"❌ No se pudo encontrar la línea del health check\"
  exit 1
fi

# Limpiar archivo temporal
rm slideshow-routes.js

# Actualizar la lista de rutas disponibles en el catch-all
sed -i 's/\"POST /api/admin/offers/upload-image\"/\"POST /api/admin/offers/upload-image\",\"GET /api/slideshow\",\"GET /api/slideshow/all\"/g' production-server.js

echo \"✅ Script completado. Reiniciando PM2...\"
pm2 restart marvera-backend
"
