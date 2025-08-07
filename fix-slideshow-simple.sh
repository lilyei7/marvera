#!/bin/bash

ssh root@148.230.87.198 "
cd /var/www/marvera

# Hacer backup
cp production-server.js production-server-backup-clean.js

# Buscar la línea del health check
HEALTH_LINE=\$(grep -n 'app.get.*\/api\/health' production-server.js | head -1 | cut -d: -f1)
echo \"Health check en línea: \$HEALTH_LINE\"

# Crear archivo temporal con rutas simple
cat > slideshow-routes.js << 'ROUTES_EOF'

// Slideshow Routes
app.get('/api/slideshow', function(req, res) {
  console.log('Slideshow publico solicitado');
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
  res.json({ success: true, data: slides, count: slides.length });
});

app.get('/api/slideshow/all', function(req, res) {
  console.log('Admin slideshow solicitado');
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
  res.json({ success: true, data: slides, count: slides.length });
});

ROUTES_EOF

# Eliminar rutas existentes del slideshow
sed -i '/slideshow/d' production-server.js

# Insertar las nuevas rutas después del health check
sed -i '\${HEALTH_LINE}r slideshow-routes.js' production-server.js

echo 'Rutas insertadas, reiniciando servidor...'
pm2 restart marvera-backend
sleep 3
pm2 status
"
