const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Middleware de autenticación principal
const authMiddleware = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Token no proporcionado.'
      });
    }

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido.'
      });
    }

    // Verificar que el usuario existe y está activo
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta desactivada.'
      });
    }

    // Agregar información del usuario al request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor.'
    });
  }
};

// Middleware para verificar roles de admin
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. Usuario no autenticado.'
    });
  }

  const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'];
  if (!adminRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Permisos insuficientes.'
    });
  }

  next();
};

// Middleware de autenticación legacy (para compatibilidad)
const authenticateToken = async (req, res, next) => {
  console.log('Authenticating token...');
  
  // Para desarrollo, permitir bypass con usuario mock admin
  if (process.env.NODE_ENV === 'development') {
    console.log('Authentication bypassed for development');
    req.user = {
      id: 1,
      userId: 1,
      email: 'admin@marvera.com',
      firstName: 'Admin',
      lastName: 'MarVera',
      role: 'SUPER_ADMIN'
    };
    return next();
  }
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(403).json({ message: 'Invalid token or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

// Middleware opcional de autenticación (no falla si no hay token)
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });
    
    if (user && user.isActive) {
      req.user = user;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Middleware para requerir admin (legacy)
const requireAdmin = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Admin check bypassed for development');
    return next();
  }
  
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'];
  if (!adminRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  optionalAuthMiddleware,
  authenticateToken,
  requireAdmin
};
