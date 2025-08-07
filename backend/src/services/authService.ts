import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'marvera-jwt-secret-key-2025';
const JWT_EXPIRES_IN = '7d';

export class AuthService {
  
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        return {
          success: false,
          message: 'El email ya está registrado'
        };
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Crear usuario
      const newUser = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone || null,
          address: userData.address || null,
          role: 'CUSTOMER'
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          address: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      });

      // Generar token
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        success: true,
        token,
        user: newUser
      };

    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  static async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      // Buscar usuario
      const user = await prisma.user.findFirst({
        where: {
          email: loginData.email,
          isActive: true
        }
      });

      if (!user) {
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(loginData.password, user.password);
      
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }

      // Generar token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Remover password del response
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        token,
        user: userWithoutPassword
      };

    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  static verifyToken(token: string): any {
    try {
      console.log('🔐 AuthService.verifyToken - Token a verificar:', token.substring(0, 20) + '...');
      console.log('🔐 AuthService.verifyToken - JWT_SECRET:', JWT_SECRET ? 'Secret presente' : 'Secret faltante');
      
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('🔐 AuthService.verifyToken - Token válido, decoded:', decoded);
      return decoded;
    } catch (error) {
      console.error('🔐 AuthService.verifyToken - Error:', error);
      return null;
    }
  }

  static async getUserById(userId: number): Promise<any | null> {
    try {
      console.log('🔐 AuthService.getUserById - Buscando usuario ID:', userId);
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      });

      console.log('🔐 AuthService.getUserById - Usuario encontrado:', user ? `ID ${user.id}, role: ${user.role}, active: ${user.isActive}` : 'No encontrado');
      return user;
    } catch (error) {
      console.error('🔐 AuthService.getUserById - Error:', error);
      return null;
    }
  }

  static async createAdminUser(): Promise<void> {
    try {
      // Eliminar cualquier usuario admin existente (tanto 'admin' como 'admin@marvera.com')
      await prisma.user.deleteMany({
        where: {
          OR: [
            { email: 'admin' },
            { email: 'admin@marvera.com' }
          ],
          role: 'ADMIN'
        }
      });
      console.log('🗑️ Usuarios admin anteriores eliminados');

      // Crear usuario admin con las nuevas credenciales
      console.log('🔨 Creando usuario admin...');
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await prisma.user.create({
        data: {
          email: 'admin@marvera.com',
          password: hashedPassword,
          firstName: 'Administrador',
          lastName: 'MarVera',
          role: 'ADMIN',
          isActive: true
        }
      });

      console.log('✅ Usuario admin creado - email: admin@marvera.com, password: admin123');
    } catch (error) {
      console.error('❌ Error creando usuario admin:', error);
    }
  }
}
