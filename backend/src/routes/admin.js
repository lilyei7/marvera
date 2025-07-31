const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware para verificar autenticación y roles de admin
const requireAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// GET /api/admin/users - Obtener todos los usuarios
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (role && role !== 'all') {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          businessName: true,
          businessType: true,
          isActive: true,
          isVerified: true,
          lastLogin: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/admin/users - Crear nuevo usuario
router.post('/users', [
  requireAdmin,
  body('email').isEmail().withMessage('Email válido requerido'),
  body('firstName').trim().isLength({ min: 2 }).withMessage('Nombre debe tener al menos 2 caracteres'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Apellido debe tener al menos 2 caracteres'),
  body('password').isLength({ min: 8 }).withMessage('Password debe tener al menos 8 caracteres'),
  body('role').isIn(['ADMIN', 'MANAGER', 'EMPLOYEE', 'CUSTOMER', 'RESTAURANT', 'WHOLESALE', 'DRIVER'])
    .withMessage('Rol inválido'),
  body('phone').optional().isMobilePhone('es-MX').withMessage('Teléfono debe ser válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email,
      firstName,
      lastName,
      password,
      phone,
      role,
      businessName,
      businessType,
      taxId,
      address,
      city,
      state,
      postalCode
    } = req.body;

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Este email ya está registrado' });
    }

    // Encriptar password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        phone,
        role,
        businessName,
        businessType,
        taxId,
        address,
        city,
        state,
        postalCode,
        isVerified: true, // Los usuarios creados por admin están verificados
        createdBy: req.user.id
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        businessName: true,
        businessType: true,
        isActive: true,
        createdAt: true
      }
    });

    res.status(201).json({ user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/admin/users/:id - Actualizar usuario
router.put('/users/:id', [
  requireAdmin,
  body('email').optional().isEmail().withMessage('Email válido requerido'),
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('Nombre debe tener al menos 2 caracteres'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Apellido debe tener al menos 2 caracteres'),
  body('role').optional().isIn(['ADMIN', 'MANAGER', 'EMPLOYEE', 'CUSTOMER', 'RESTAURANT', 'WHOLESALE', 'DRIVER'])
    .withMessage('Rol inválido'),
  body('phone').optional().isMobilePhone('es-MX').withMessage('Teléfono debe ser válido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remover campos que no se deben actualizar
    delete updateData.password;
    delete updateData.createdAt;
    delete updateData.id;

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        businessName: true,
        businessType: true,
        isActive: true,
        isVerified: true,
        createdAt: true
      }
    });

    res.json({ user: updatedUser });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/admin/users/:id - Desactivar usuario
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir que un admin se desactive a sí mismo
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta' });
    }

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });

    res.json({ message: 'Usuario desactivado exitosamente' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    console.error('Error deactivating user:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/admin/users/:id/activate - Activar usuario
router.post('/users/:id/activate', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true
      }
    });

    res.json({ user, message: 'Usuario activado exitosamente' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    console.error('Error activating user:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/admin/users/:id/reset-password - Reset password de usuario
router.post('/users/:id/reset-password', [
  requireAdmin,
  body('newPassword').isLength({ min: 8 }).withMessage('Password debe tener al menos 8 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password actualizado exitosamente' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/admin/users/stats - Estadísticas de usuarios
router.get('/users/stats', requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      usersByRole,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
          }
        }
      })
    ]);

    const roleStats = usersByRole.reduce((acc, stat) => {
      acc[stat.role] = stat._count.role;
      return acc;
    }, {});

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      recentUsers,
      roleStats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
