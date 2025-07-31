import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('🔐 Middleware auth - Headers:', req.headers);
    console.log('🔐 Middleware auth - Auth header:', authHeader);
    console.log('🔐 Middleware auth - Token recibido:', token ? `${token.substring(0, 20)}...` : 'No token');

    if (!token) {
      console.log('🔐 No hay token en la request');
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acceso requerido' 
      });
    }

    const decoded = AuthService.verifyToken(token);
    console.log('🔐 Token decodificado:', decoded);
    
    if (!decoded) {
      console.log('🔐 Token verification failed');
      return res.status(403).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }

    // Obtener información completa del usuario
    const user = await AuthService.getUserById(decoded.userId);
    console.log('🔐 Usuario obtenido:', user ? `Usuario ${user.id} encontrado` : 'Usuario no encontrado');
    
    if (!user || !user.isActive) {
      console.log('🔐 Usuario inválido o inactivo:', { user: user?.id, isActive: user?.isActive });
      return res.status(403).json({ 
        success: false, 
        message: 'Usuario no válido o inactivo' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para acceder a este recurso' 
      });
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireDriver = requireRole(['driver', 'admin']);
export const requireCustomer = requireRole(['customer', 'admin']);
