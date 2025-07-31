// local-server.js - Servidor proxy local para MarVera
// Este script crea un servidor local que actúa como proxy para conectarse al 
// servidor backend remoto cuando está disponible, o servir datos de ejemplo cuando no.

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');

// Configuración
const LOCAL_PORT = 3000;
const REMOTE_SERVER = 'http://187.33.155.127:3001';
const API_TIMEOUT = 5000;

// Datos fallback para cuando el servidor remoto no está disponible
const fallbackData = {
  'featured-products': [
    {
      id: "1",
      name: "Salmón Azul Premium",
      description: "Salmón fresco de Alaska, corte premium",
      price: 179.99,
      image: "/products/salmon.webp",
      category: "pescados",
      emoji: "🐟",
      tag: "Premium",
      tagColor: "bg-amber-500",
      inStock: true,
      unit: "kg"
    },
    {
      id: "2",
      name: "Camarones Jumbo",
      description: "Camarones grandes ideales para parrilla",
      price: 249.99,
      image: "/products/camarones.webp",
      category: "mariscos",
      emoji: "🦐",
      tag: "Fresco",
      tagColor: "bg-green-500",
      inStock: true,
      unit: "kg"
    },
    {
      id: "3",
      name: "Filete de Atún",
      description: "Atún fresco cortado en filetes",
      price: 199.99,
      image: "/products/atun.webp",
      category: "pescados",
      emoji: "🐟",
      tag: "Popular",
      tagColor: "bg-blue-500",
      inStock: true,
      unit: "kg"
    }
  ],
  'products': [
    // Los mismos productos de arriba, más algunos otros
    {
      id: "1",
      name: "Salmón Azul Premium",
      description: "Salmón fresco de Alaska, corte premium",
      price: 179.99,
      image: "/products/salmon.webp",
      category: "pescados",
      emoji: "🐟",
      tag: "Premium",
      tagColor: "bg-amber-500",
      inStock: true,
      unit: "kg"
    },
    {
      id: "2",
      name: "Camarones Jumbo",
      description: "Camarones grandes ideales para parrilla",
      price: 249.99,
      image: "/products/camarones.webp",
      category: "mariscos",
      emoji: "🦐",
      tag: "Fresco",
      tagColor: "bg-green-500",
      inStock: true,
      unit: "kg"
    },
    {
      id: "3",
      name: "Filete de Atún",
      description: "Atún fresco cortado en filetes",
      price: 199.99,
      image: "/products/atun.webp",
      category: "pescados",
      emoji: "🐟",
      tag: "Popular",
      tagColor: "bg-blue-500",
      inStock: true,
      unit: "kg"
    },
    {
      id: "4",
      name: "Ostras Francesas",
      description: "Ostras importadas de Francia",
      price: 299.99,
      image: "/products/ostras.webp",
      category: "moluscos",
      emoji: "🦪",
      tag: "Importado",
      tagColor: "bg-purple-500",
      inStock: true,
      unit: "docena"
    },
    {
      id: "5",
      name: "Langosta Caribeña",
      description: "Langosta fresca del Caribe",
      price: 349.99,
      image: "/products/langosta.webp",
      category: "crustaceos",
      emoji: "🦞",
      tag: "Gourmet",
      tagColor: "bg-red-500",
      inStock: true,
      unit: "kg"
    }
  ]
};

// Crear servidor Express
const app = express();

// Permitir CORS para el frontend local
app.use(cors());

// Middleware para verificar si el servidor remoto está disponible
const checkRemoteServer = async (req, res, next) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`${REMOTE_SERVER}/api/health`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      // El servidor remoto está disponible, continuar con el proxy
      console.log('✅ Servidor remoto disponible, usando proxy');
      next();
    } else {
      // El servidor remoto respondió, pero con error
      console.log(`⚠️ Servidor remoto respondió con error: ${response.status}`);
      useLocalFallback(req, res);
    }
  } catch (error) {
    // No se pudo conectar al servidor remoto
    console.log('❌ No se pudo conectar al servidor remoto, usando datos locales');
    useLocalFallback(req, res);
  }
};

// Función para servir datos locales de fallback
const useLocalFallback = (req, res) => {
  const path = req.path.replace('/api/', '');
  
  if (path === 'health') {
    return res.json({ status: 'ok', mode: 'local', message: 'MarVera API funcionando en modo local' });
  }
  
  if (path === 'products/featured') {
    return res.json(fallbackData['featured-products']);
  }
  
  if (path === 'products') {
    return res.json(fallbackData['products']);
  }
  
  // Para cualquier otro endpoint
  return res.status(404).json({ error: 'Endpoint no disponible en modo local' });
};

// Crear proxy para el servidor remoto
const apiProxy = createProxyMiddleware({
  target: REMOTE_SERVER,
  changeOrigin: true,
  pathRewrite: { '^/api': '/api' },
  timeout: API_TIMEOUT,
  onError: (err, req, res) => {
    console.log('🔄 Error en proxy, usando datos locales');
    useLocalFallback(req, res);
  }
});

// Rutas de la API
app.use('/api', checkRemoteServer, apiProxy);

// Servir archivos estáticos
const productsDir = path.join(__dirname, 'public', 'assets', 'products');
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

// Copiar algunas imágenes de ejemplo al directorio de productos si no existen
const sampleImages = [
  { name: 'salmon.webp', fallback: 'default.webp' },
  { name: 'camarones.webp', fallback: 'default.webp' },
  { name: 'atun.webp', fallback: 'default.webp' },
  { name: 'default.webp', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' }
];

// Crear imágenes de muestra
sampleImages.forEach(img => {
  const imgPath = path.join(productsDir, img.name);
  if (!fs.existsSync(imgPath)) {
    const defaultImgPath = img.fallback ? path.join(productsDir, img.fallback) : null;
    if (img.fallback && fs.existsSync(defaultImgPath)) {
      fs.copyFileSync(defaultImgPath, imgPath);
      console.log(`Imagen copiada: ${img.name}`);
    } else if (img.url) {
      // Aquí se podría descargar la imagen desde la URL
      // pero para simplificar creamos un archivo vacío
      fs.writeFileSync(imgPath, 'Placeholder image');
      console.log(`Imagen creada: ${img.name}`);
    }
  }
});

// Servir archivos estáticos
app.use('/products', express.static(path.join(__dirname, 'public', 'assets', 'products')));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>MarVera Proxy Server</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #1E3A8A; }
          .card { border: 1px solid #ccc; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
          .success { border-left: 5px solid green; }
          .warning { border-left: 5px solid orange; }
          .endpoint { background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; }
        </style>
      </head>
      <body>
        <h1>🐟 MarVera Proxy Server</h1>
        <div class="card success">
          <h2>✅ Servidor local funcionando</h2>
          <p>Este servidor actúa como un proxy para el servidor remoto en ${REMOTE_SERVER}.</p>
          <p>Cuando el servidor remoto no está disponible, sirve datos locales de fallback.</p>
        </div>
        <div class="card">
          <h2>📡 Endpoints disponibles:</h2>
          <div class="endpoint">GET /api/health - Estado del servidor</div>
          <div class="endpoint">GET /api/products/featured - Productos destacados</div>
          <div class="endpoint">GET /api/products - Todos los productos</div>
        </div>
        <div class="card warning">
          <h2>⚠️ Configuración del Frontend</h2>
          <p>Asegúrate de configurar tu aplicación React para usar este servidor local:</p>
          <div class="endpoint">VITE_API_URL=http://localhost:${LOCAL_PORT}</div>
        </div>
      </body>
    </html>
  `);
});

// Iniciar servidor
app.listen(LOCAL_PORT, () => {
  console.log(`🚀 Servidor proxy de MarVera corriendo en http://localhost:${LOCAL_PORT}`);
  console.log(`🔄 Conectando con el servidor remoto en ${REMOTE_SERVER}`);
  console.log(`🛡️ Datos de fallback disponibles para cuando el servidor remoto no responda`);
});
