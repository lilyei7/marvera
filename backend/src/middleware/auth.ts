import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acceso requerido' 
      });
    }

    const decoded = AuthService.verifyToken(token);
    
    if (!decoded) {
      return res.status(403).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }

    // Obtener información completa del usuario
    const user = await AuthService.getUserById(decoded.userId);
    
    if (!user || !user.isActive) {
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
