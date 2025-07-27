import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { dbManager } from './database/database';
import { AuthService } from './services/authService';

// Importar rutas
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import uploadRoutes from './routes/upload';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por windowMs
  message: {
    success: false,
    message: 'Demasiadas peticiones, intenta de nuevo más tarde'
  }
});
app.use(limiter);

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
  console.log(`🚀 Servidor MarVera corriendo en puerto ${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.IO habilitado para tracking en tiempo real`);
  
  // Crear usuario admin por defecto
  await AuthService.createAdminUser();
});
