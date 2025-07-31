/**
 * Servidor de desarrollo local para MarVera
 * 
 * Este servidor simula completamente el backend de MarVera para desarrollo local.
 * Proporciona datos simulados para todos los endpoints y maneja autenticación básica.
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configuración
const PORT = process.env.PORT || 3001;
const REMOTE_SERVER = 'http://187.33.155.127:3001';
const DEBUG = true;

// Crear la aplicación Express
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
const logger = (req, res, next) => {
  if (DEBUG) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (Object.keys(req.body).length > 0) {
      console.log(`Body: ${JSON.stringify(req.body)}`);
    }
  }
  next();
};
app.use(logger);

// =============== DATOS SIMULADOS ===============

// Productos
const products = [
  {
    id: "1",
    name: "Salmón Azul Premium",
    description: "Salmón fresco de Alaska, corte premium",
    price: 179.99,
    image: "/assets/products/salmon.webp",
    category: "pescados",
    emoji: "🐟",
    tag: "Premium",
    tagColor: "bg-amber-500",
    inStock: true,
    unit: "kg",
    stock: 50
  },
  {
    id: "2",
    name: "Camarones Jumbo",
    description: "Camarones grandes ideales para parrilla",
    price: 249.99,
    image: "/assets/products/camarones.webp",
    category: "mariscos",
    emoji: "🦐",
    tag: "Fresco",
    tagColor: "bg-green-500",
    inStock: true,
    unit: "kg",
    stock: 30
  },
  {
    id: "3",
    name: "Filete de Atún",
    description: "Atún fresco cortado en filetes",
    price: 199.99,
    image: "/assets/products/atun.webp",
    category: "pescados",
    emoji: "🐟",
    tag: "Popular",
    tagColor: "bg-blue-500",
    inStock: true,
    unit: "kg",
    stock: 45
  },
  {
    id: "4",
    name: "Ostras Francesas",
    description: "Ostras importadas de Francia",
    price: 299.99,
    image: "/assets/products/ostras.webp",
    category: "moluscos",
    emoji: "🦪",
    tag: "Importado",
    tagColor: "bg-purple-500",
    inStock: true,
    unit: "docena",
    stock: 20
  },
  {
    id: "5",
    name: "Langosta Caribeña",
    description: "Langosta fresca del Caribe",
    price: 349.99,
    image: "/assets/products/langosta.webp",
    category: "crustaceos",
    emoji: "🦞",
    tag: "Gourmet",
    tagColor: "bg-red-500",
    inStock: true,
    unit: "kg",
    stock: 15
  }
];

// Categorías
const categories = [
  { id: 1, name: "pescados", description: "Pescados frescos y congelados", emoji: "🐟" },
  { id: 2, name: "mariscos", description: "Mariscos variados", emoji: "🦐" },
  { id: 3, name: "moluscos", description: "Moluscos frescos", emoji: "🦪" },
  { id: 4, name: "crustaceos", description: "Crustáceos seleccionados", emoji: "🦀" },
  { id: 5, name: "conservas", description: "Productos enlatados", emoji: "🥫" }
];

// Usuarios
const users = [
  {
    id: "1",
    name: "Admin",
    email: "admin@marvera.com",
    password: "admin123456",
    role: "admin"
  },
  {
    id: "2",
    name: "Cliente Ejemplo",
    email: "cliente@ejemplo.com",
    password: "password123",
    role: "customer"
  }
];

// Tokens (simulado)
const tokens = {};

// Sucursales
const branches = [
  {
    id: "1",
    name: "MarVera Centro",
    address: "Av. Corrientes 1234, Buenos Aires",
    phone: "+54 11 1234-5678",
    email: "centro@marvera.com",
    schedule: "Lun-Vie: 9:00 - 18:00, Sáb: 9:00 - 13:00",
    location: { lat: -34.603722, lng: -58.381592 }
  },
  {
    id: "2",
    name: "MarVera Norte",
    address: "Av. Cabildo 3456, Buenos Aires",
    phone: "+54 11 5678-1234",
    email: "norte@marvera.com",
    schedule: "Lun-Vie: 9:00 - 19:00, Sáb: 10:00 - 14:00",
    location: { lat: -34.551847, lng: -58.463137 }
  },
  {
    id: "3",
    name: "MarVera Sur",
    address: "Av. Rivadavia 5678, Buenos Aires",
    phone: "+54 11 4321-8765",
    email: "sur@marvera.com",
    schedule: "Lun-Sáb: 8:00 - 20:00",
    location: { lat: -34.632554, lng: -58.484387 }
  }
];

// Pedidos
const orders = [];

// =============== ENDPOINTS ===============

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'MarVera Local Development Server',
    timestamp: new Date().toISOString(),
    environment: 'development',
    version: '1.0.0'
  });
});

// PRODUCTOS

// Listar todos los productos
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Obtener productos destacados
app.get('/api/products/featured', (req, res) => {
  // Los 3 primeros productos son los destacados
  res.json(products.slice(0, 3));
});

// Obtener un producto por ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({
      error: 'Producto no encontrado'
    });
  }
  
  res.json(product);
});

// Buscar productos
app.get('/api/products/search/:query', (req, res) => {
  const query = req.params.query.toLowerCase();
  const results = products.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.description.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  );
  
  res.json(results);
});

// CATEGORÍAS

// Listar todas las categorías
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

// Obtener productos por categoría
app.get('/api/categories/:name/products', (req, res) => {
  const categoryName = req.params.name.toLowerCase();
  const categoryProducts = products.filter(p => p.category.toLowerCase() === categoryName);
  
  res.json(categoryProducts);
});

// AUTENTICACIÓN

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({
      error: 'Credenciales inválidas'
    });
  }
  
  // Generar token simulado
  const token = `marvera-${uuidv4()}`;
  const expiresIn = 24 * 60 * 60 * 1000; // 24 horas
  
  tokens[token] = {
    userId: user.id,
    expires: Date.now() + expiresIn
  };
  
  res.json({
    token,
    expiresIn,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// Verificar token
app.get('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token || !tokens[token] || tokens[token].expires < Date.now()) {
    return res.status(401).json({
      error: 'Token inválido o expirado'
    });
  }
  
  const userId = tokens[token].userId;
  const user = users.find(u => u.id === userId);
  
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// Registro
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  // Verificar si el usuario ya existe
  if (users.some(u => u.email === email)) {
    return res.status(400).json({
      error: 'El correo electrónico ya está registrado'
    });
  }
  
  // Crear nuevo usuario
  const newUser = {
    id: uuidv4(),
    name,
    email,
    password,
    role: 'customer'
  };
  
  users.push(newUser);
  
  // Generar token simulado
  const token = `marvera-${uuidv4()}`;
  const expiresIn = 24 * 60 * 60 * 1000; // 24 horas
  
  tokens[token] = {
    userId: newUser.id,
    expires: Date.now() + expiresIn
  };
  
  res.status(201).json({
    token,
    expiresIn,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  });
});

// SUCURSALES

// Listar todas las sucursales
app.get('/api/branches', (req, res) => {
  res.json(branches);
});

// Obtener una sucursal por ID
app.get('/api/branches/:id', (req, res) => {
  const branch = branches.find(b => b.id === req.params.id);
  
  if (!branch) {
    return res.status(404).json({
      error: 'Sucursal no encontrada'
    });
  }
  
  res.json(branch);
});

// PEDIDOS

// Crear un nuevo pedido
app.post('/api/orders', (req, res) => {
  const { items, address, paymentMethod, totalAmount } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token || !tokens[token] || tokens[token].expires < Date.now()) {
    return res.status(401).json({
      error: 'Token inválido o expirado'
    });
  }
  
  const userId = tokens[token].userId;
  
  const newOrder = {
    id: uuidv4(),
    userId,
    items,
    address,
    paymentMethod,
    totalAmount,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  
  res.status(201).json(newOrder);
});

// Listar pedidos del usuario actual
app.get('/api/orders', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token || !tokens[token] || tokens[token].expires < Date.now()) {
    return res.status(401).json({
      error: 'Token inválido o expirado'
    });
  }
  
  const userId = tokens[token].userId;
  const userOrders = orders.filter(o => o.userId === userId);
  
  res.json(userOrders);
});

// Obtener un pedido por ID
app.get('/api/orders/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token || !tokens[token] || tokens[token].expires < Date.now()) {
    return res.status(401).json({
      error: 'Token inválido o expirado'
    });
  }
  
  const userId = tokens[token].userId;
  const order = orders.find(o => o.id === req.params.id);
  
  if (!order) {
    return res.status(404).json({
      error: 'Pedido no encontrado'
    });
  }
  
  // Solo el propietario o un admin puede ver el pedido
  const user = users.find(u => u.id === userId);
  if (order.userId !== userId && user.role !== 'admin') {
    return res.status(403).json({
      error: 'No tienes permiso para ver este pedido'
    });
  }
  
  res.json(order);
});

// SERVIR ARCHIVOS ESTÁTICOS

// Asegurarnos de que el directorio de assets existe
const productsDir = path.join(__dirname, 'public', 'assets', 'products');
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

// Crear imágenes de ejemplo si no existen
const sampleImages = [
  'salmon.webp', 'camarones.webp', 'atun.webp', 'ostras.webp', 
  'langosta.webp', 'default.webp'
];

sampleImages.forEach(imgName => {
  const imgPath = path.join(productsDir, imgName);
  if (!fs.existsSync(imgPath)) {
    // Crear un archivo de imagen de ejemplo
    fs.writeFileSync(imgPath, 'Placeholder image');
    console.log(`Imagen de ejemplo creada: ${imgName}`);
  }
});

// Servir archivos estáticos
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));

// Página principal
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>MarVera API Server (Local)</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #1E3A8A; }
          .card { border: 1px solid #ccc; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
          .endpoint { background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; }
          table { width: 100%; border-collapse: collapse; }
          th, td { text-align: left; padding: 8px; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          th { background-color: #1E3A8A; color: white; }
        </style>
      </head>
      <body>
        <h1>🐟 MarVera API Server (Local)</h1>
        <div class="card">
          <h2>Estado del servidor</h2>
          <p>El servidor local de MarVera está funcionando correctamente.</p>
          <p>Este servidor simula todos los endpoints del backend para desarrollo.</p>
        </div>
        
        <div class="card">
          <h2>Endpoints disponibles</h2>
          <h3>Productos</h3>
          <div class="endpoint">GET /api/products - Listar todos los productos</div>
          <div class="endpoint">GET /api/products/featured - Obtener productos destacados</div>
          <div class="endpoint">GET /api/products/:id - Obtener un producto por ID</div>
          <div class="endpoint">GET /api/products/search/:query - Buscar productos</div>
          
          <h3>Categorías</h3>
          <div class="endpoint">GET /api/categories - Listar todas las categorías</div>
          <div class="endpoint">GET /api/categories/:name/products - Obtener productos por categoría</div>
          
          <h3>Autenticación</h3>
          <div class="endpoint">POST /api/auth/login - Iniciar sesión</div>
          <div class="endpoint">GET /api/auth/verify - Verificar token</div>
          <div class="endpoint">POST /api/auth/register - Registrar nuevo usuario</div>
          
          <h3>Sucursales</h3>
          <div class="endpoint">GET /api/branches - Listar todas las sucursales</div>
          <div class="endpoint">GET /api/branches/:id - Obtener una sucursal por ID</div>
          
          <h3>Pedidos</h3>
          <div class="endpoint">POST /api/orders - Crear un nuevo pedido</div>
          <div class="endpoint">GET /api/orders - Listar pedidos del usuario actual</div>
          <div class="endpoint">GET /api/orders/:id - Obtener un pedido por ID</div>
          
          <h3>Otros</h3>
          <div class="endpoint">GET /api/health - Verificar estado del servidor</div>
        </div>
        
        <div class="card">
          <h2>Usuarios de prueba</h2>
          <table>
            <tr>
              <th>Email</th>
              <th>Contraseña</th>
              <th>Rol</th>
            </tr>
            <tr>
              <td>admin@marvera.com</td>
              <td>admin123456</td>
              <td>admin</td>
            </tr>
            <tr>
              <td>cliente@ejemplo.com</td>
              <td>password123</td>
              <td>customer</td>
            </tr>
          </table>
        </div>
      </body>
    </html>
  `);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor MarVera corriendo en http://localhost:${PORT}`);
  console.log(`📊 Endpoints disponibles en http://localhost:${PORT}/api`);
});
