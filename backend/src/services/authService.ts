import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbManager } from '../database/database';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'marvera-jwt-secret-key-2025';
const JWT_EXPIRES_IN = '7d';

export class AuthService {
  
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const db = dbManager.getDb();
      
      // Verificar si el usuario ya existe
      const existingUser = await new Promise<User | null>((resolve, reject) => {
        db.get(
          'SELECT * FROM users WHERE email = ?',
          [userData.email],
          (err, row: User) => {
            if (err) reject(err);
            else resolve(row || null);
          }
        );
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
      const userId = await new Promise<number>((resolve, reject) => {
        db.run(
          `INSERT INTO users (email, password, firstName, lastName, phone, address, role) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [userData.email, hashedPassword, userData.firstName, userData.lastName, 
           userData.phone || null, userData.address || null, 'customer'],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      // Obtener usuario creado
      const newUser = await new Promise<User>((resolve, reject) => {
        db.get(
          'SELECT id, email, firstName, lastName, phone, address, role, isActive, createdAt FROM users WHERE id = ?',
          [userId],
          (err, row: User) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
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
      const db = dbManager.getDb();

      // Buscar usuario
      const user = await new Promise<User | null>((resolve, reject) => {
        db.get(
          'SELECT * FROM users WHERE email = ? AND isActive = 1',
          [loginData.email],
          (err, row: User) => {
            if (err) reject(err);
            else resolve(row || null);
          }
        );
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
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  static async getUserById(userId: number): Promise<User | null> {
    try {
      const db = dbManager.getDb();
      
      return new Promise<User | null>((resolve, reject) => {
        db.get(
          'SELECT id, email, firstName, lastName, phone, address, role, isActive, createdAt FROM users WHERE id = ?',
          [userId],
          (err, row: User) => {
            if (err) reject(err);
            else resolve(row || null);
          }
        );
      });
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  }
}
