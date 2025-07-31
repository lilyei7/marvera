const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../../models/User');
const Order = require('../../models/Order');
const authMiddleware = require('../../middleware/auth');

const router = express.Router();

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
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      ...user.toJSON()
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
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
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('El nombre debe tener al menos 2 caracteres'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('El apellido debe tener al menos 2 caracteres'),
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('El teléfono debe tener al menos 10 caracteres'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La dirección no puede tener más de 200 caracteres'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La ciudad no puede tener más de 100 caracteres')
], handleValidationErrors, async (req, res) => {
  try {
    const { firstName, lastName, phone, address, city, postalCode, dateOfBirth } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar si el teléfono ya existe (si se está cambiando)
    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ phone, _id: { $ne: user._id } });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una cuenta con este teléfono'
        });
      }
    }

    // Actualizar campos
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (phone) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();
    if (city !== undefined) user.city = city.trim();
    if (postalCode !== undefined) user.postalCode = postalCode.trim();
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);

    await user.save();

    const userResponse = user.toJSON();
    
    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      ...userResponse
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/user/orders
// @desc    Obtener órdenes del usuario
// @access  Private
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { userId: req.user.userId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('items.productId', 'name price images')
      .exec();

    const total = await Order.countDocuments(query);

    const ordersResponse = orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      status: order.status,
      total: order.totalAmount,
      items: order.items.length,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      products: order.items.map(item => ({
        id: item.productId._id,
        name: item.productId.name,
        price: item.price,
        quantity: item.quantity,
        image: item.productId.images?.[0]
      }))
    }));

    res.json({
      success: true,
      orders: ordersResponse,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/user/orders/:orderId
// @desc    Obtener detalles de una orden específica
// @access  Private
router.get('/orders/:orderId', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.orderId, 
      userId: req.user.userId 
    }).populate('items.productId', 'name price images description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    const orderResponse = {
      id: order._id,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      status: order.status,
      subtotal: order.subtotal,
      shipping: order.shippingCost,
      tax: order.tax,
      total: order.totalAmount,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      paymentMethod: order.paymentMethod,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      notes: order.notes,
      items: order.items.map(item => ({
        id: item.productId._id,
        name: item.productId.name,
        description: item.productId.description,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        image: item.productId.images?.[0]
      })),
      timeline: order.statusHistory
    };

    res.json({
      success: true,
      order: orderResponse
    });

  } catch (error) {
    console.error('Error al obtener detalles de orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/user/favorites/:productId
// @desc    Agregar producto a favoritos
// @access  Private
router.post('/favorites/:productId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await user.addFavoriteProduct(req.params.productId);

    res.json({
      success: true,
      message: 'Producto agregado a favoritos'
    });

  } catch (error) {
    console.error('Error al agregar favorito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   DELETE /api/user/favorites/:productId
// @desc    Remover producto de favoritos
// @access  Private
router.delete('/favorites/:productId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await user.removeFavoriteProduct(req.params.productId);

    res.json({
      success: true,
      message: 'Producto removido de favoritos'
    });

  } catch (error) {
    console.error('Error al remover favorito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/user/favorites
// @desc    Obtener productos favoritos
// @access  Private
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('favoriteProducts', 'name price images description category isActive');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const favorites = user.favoriteProducts
      .filter(product => product.isActive)
      .map(product => ({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        description: product.description,
        category: product.category
      }));

    res.json({
      success: true,
      favorites
    });

  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/user/preferences
// @desc    Actualizar preferencias del usuario
// @access  Private
router.put('/preferences', [
  authMiddleware,
  body('notifications.email').optional().isBoolean(),
  body('notifications.sms').optional().isBoolean(),
  body('notifications.promotions').optional().isBoolean(),
  body('language').optional().isIn(['es', 'en']),
  body('currency').optional().isIn(['MXN', 'USD'])
], handleValidationErrors, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (req.body.notifications) {
      user.preferences.notifications = {
        ...user.preferences.notifications,
        ...req.body.notifications
      };
    }

    if (req.body.language) {
      user.preferences.language = req.body.language;
    }

    if (req.body.currency) {
      user.preferences.currency = req.body.currency;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Preferencias actualizadas exitosamente',
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Error al actualizar preferencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
