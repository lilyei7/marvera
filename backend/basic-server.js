console.log('🚀 Iniciando servidor de prueba...');

const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`📍 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  
  // Configurar CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.url === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      message: 'Servidor funcionando correctamente!',
      timestamp: new Date().toISOString(),
      server: '148.230.87.198:3001'
    }));
    return;
  }
  
  if (req.url === '/api/products/featured') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: [
        {
          id: 1,
          name: 'Salmón Premium',
          price: 299.99,
          category: 'Pescados',
          imageUrl: '/products/salmon.jpg',
          description: 'Salmón fresco',
          isFeatured: true,
          stock: 25
        },
        {
          id: 2,
          name: 'Camarones Jumbo',
          price: 450.00,
          category: 'Mariscos',
          imageUrl: '/products/camarones.jpg',
          description: 'Camarones jumbo',
          isFeatured: true,
          stock: 15
        }
      ],
      count: 2,
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // 404
  res.writeHead(404);
  res.end(JSON.stringify({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.url
  }));
});

const PORT = 3001;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`✅ Servidor HTTP básico corriendo en http://${HOST}:${PORT}`);
  console.log(`📍 Health check: http://148.230.87.198:${PORT}/api/health`);
  console.log(`🐟 Productos: http://148.230.87.198:${PORT}/api/products/featured`);
});

server.on('error', (err) => {
  console.error('❌ Error del servidor:', err);
});
