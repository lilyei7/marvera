const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware de validación de errores
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array()
    });
  }
  next();
};

// @route   GET /api/user/profile
// @desc    Obtener perfil del usuario
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        businessName: true,
        businessType: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        isActive: true,
        createdAt: true,
        lastLogin: true
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Actualizar perfil del usuario
// @access  Private
router.put('/profile', [
  authMiddleware,
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('Nombre debe tener al menos 2 caracteres'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Apellido debe tener al menos 2 caracteres'),
  body('phone').optional().isMobilePhone('es-MX').withMessage('Teléfono debe ser válido'),
  body('email').optional().isEmail().withMessage('Email debe ser válido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { firstName, lastName, phone, email, address, city, state, postalCode, businessName } = req.body;
    
    // Si se está actualizando el email, verificar que no esté en uso
    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Este email ya está en uso'
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(email && { email }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state && { state }),
        ...(postalCode && { postalCode }),
        ...(businessName && { businessName })
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
        address: true,
        city: true,
        state: true,
        postalCode: true,
        isActive: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/user/password
// @desc    Cambiar contraseña del usuario
// @access  Private
router.put('/password', [
  authMiddleware,
  body('currentPassword').notEmpty().withMessage('Contraseña actual es requerida'),
  body('newPassword').isLength({ min: 8 }).withMessage('Nueva contraseña debe tener al menos 8 caracteres'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Obtener usuario con contraseña
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/user/orders
// @desc    Obtener pedidos del usuario
// @access  Private
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      userId: req.user.id
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  unit: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/user/orders/:id
// @desc    Obtener detalle de un pedido específico
// @access  Private
router.get('/orders/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                unit: true,
                description: true
              }
            }
          }
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            vehicle: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/user/wholesale-orders
// @desc    Obtener pedidos de mayoreo del usuario
// @access  Private
router.get('/wholesale-orders', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    // Solo usuarios con roles de negocio pueden ver pedidos de mayoreo
    if (!['RESTAURANT', 'WHOLESALE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo usuarios de negocio pueden ver pedidos de mayoreo.'
      });
    }

    const where = {
      userId: req.user.id
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.wholesaleOrder.findMany({
        where,
        include: {
          wholesaleOrderItems: {
            include: {
              wholesaleProduct: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  unitType: true,
                  unitsPerBox: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.wholesaleOrder.count({ where })
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching wholesale orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/user/dashboard
// @desc    Obtener datos del dashboard del usuario
// @access  Private
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Estadísticas básicas
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      totalSpent,
      recentOrders
    ] = await Promise.all([
      prisma.order.count({
        where: { userId }
      }),
      prisma.order.count({
        where: { 
          userId,
          status: { in: ['pending', 'confirmed', 'preparing', 'in_transit'] }
        }
      }),
      prisma.order.count({
        where: { 
          userId,
          status: 'delivered'
        }
      }),
      prisma.order.aggregate({
        where: { 
          userId,
          status: 'delivered'
        },
        _sum: {
          total: true
        }
      }),
      prisma.order.findMany({
        where: { userId },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  images: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Para usuarios de negocio, incluir estadísticas de mayoreo
    let wholesaleStats = null;
    if (['RESTAURANT', 'WHOLESALE'].includes(req.user.role)) {
      const [totalWholesaleOrders, totalWholesaleSpent] = await Promise.all([
        prisma.wholesaleOrder.count({
          where: { userId }
        }),
        prisma.wholesaleOrder.aggregate({
          where: { 
            userId,
            status: 'delivered'
          },
          _sum: {
            total: true
          }
        })
      ]);

      wholesaleStats = {
        totalOrders: totalWholesaleOrders,
        totalSpent: totalWholesaleSpent._sum.total || 0
      };
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          pendingOrders,
          completedOrders,
          totalSpent: totalSpent._sum.total || 0,
          wholesaleStats
        },
        recentOrders
      }
    });
  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
