import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import prisma from './lib/prisma';
import { AuthService } from './services/authService';

// Importar rutas
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import uploadRoutes from './routes/upload';
import branchRoutes from './routes/api/branches';
import adminProductRoutes from './routes/adminProducts';
const wholesaleProductRoutes = require('../routes/wholesaleProducts');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://187.33.155.127",
      "http://187.33.155.127:8080"
    ],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001; // Server restart

// Middleware de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "blob:", "*"],
    },
  },
}));

// Rate limiting - más permisivo en desarrollo
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto en lugar de 15
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 requests en desarrollo, 100 en producción
  message: {
    success: false,
    message: 'Demasiadas peticiones, intenta de nuevo más tarde'
  },
  skip: (req) => {
    // Saltar rate limiting para desarrollo local
    const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
    const isDevelopment = process.env.NODE_ENV === 'development';
    return isDevelopment || isLocalhost;
  }
});

// Solo aplicar rate limiting en producción
if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
} else {
  console.log('🔓 Rate limiting deshabilitado en desarrollo');
}

// CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://187.33.155.127',
    'http://187.33.155.127:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Body parser - Aumentar límites para uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware para CORS en archivos estáticos
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/wholesale-products', wholesaleProductRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MarVera API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO para tracking en tiempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Unirse a sala de seguimiento de pedido
  socket.on('track-order', (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`Cliente ${socket.id} siguiendo pedido ${orderId}`);
  });

  // Actualización de ubicación del conductor
  socket.on('driver-location-update', (data) => {
    const { orderId, latitude, longitude, driverId } = data;
    
    // Broadcast a todos los clientes siguiendo este pedido
    socket.to(`order-${orderId}`).emit('location-update', {
      latitude,
      longitude,
      driverId,
      timestamp: new Date().toISOString()
    });

    console.log(`Ubicación actualizada para pedido ${orderId}: ${latitude}, ${longitude}`);
  });

  // Actualización de estado del pedido
  socket.on('order-status-update', (data) => {
    const { orderId, status, message } = data;
    
    socket.to(`order-${orderId}`).emit('status-update', {
      status,
      message,
      timestamp: new Date().toISOString()
    });

    console.log(`Estado actualizado para pedido ${orderId}: ${status}`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Simulador de datos de tracking (para demo)
setInterval(() => {
  // Simular actualización de ubicación para demo
  const demoOrderId = 1;
  const demoLat = -12.0464 + (Math.random() - 0.5) * 0.01;
  const demoLng = -77.0428 + (Math.random() - 0.5) * 0.01;
  
  io.to(`order-${demoOrderId}`).emit('location-update', {
    latitude: demoLat,
    longitude: demoLng,
    driverId: 1,
    timestamp: new Date().toISOString()
  });
}, 5000); // Cada 5 segundos

// Manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

server.listen(PORT, async () => {
  console.log(`🚀 Servidor MarVera corriendo en puerto ${PORT} en todas las interfaces`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api`);
  console.log(`🌐 API disponible externamente en http://187.33.155.127:${PORT}/api`);
  console.log(`🔌 Socket.IO habilitado para tracking en tiempo real`);
  console.log(`💾 Prisma conectado a la base de datos SQLite`);
  
  // Verificar conexión con Prisma
  try {
    await prisma.$connect();
    console.log('✅ Conexión a Prisma establecida correctamente');
    
    // Crear usuario admin por defecto
    await AuthService.createAdminUser();
  } catch (error) {
    console.error('❌ Error conectando a Prisma:', error);
  }
});
