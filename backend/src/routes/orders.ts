import express from 'express';
import { OrderService } from '../services/orderService';
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Crear una nueva orden
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const orderData = req.body;
    
    // Asignar el usuario autenticado
    orderData.user_id = req.user.id;

    // Validación básica
    if (!orderData.items || orderData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La orden debe contener al menos un producto'
      });
    }

    if (!orderData.total || orderData.total <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El total de la orden debe ser mayor a 0'
      });
    }

    const order = await OrderService.createOrder(orderData);
    
    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Error creando la orden'
      });
    }

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creando orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener órdenes del usuario autenticado
router.get('/my-orders', authenticateToken, async (req: any, res) => {
  try {
    const orders = await OrderService.getOrdersByUserId(req.user.id);
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error obteniendo órdenes del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener todas las órdenes (solo admin)
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const orders = await OrderService.getAllOrders();
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error obteniendo todas las órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener orden por ID
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de orden inválido'
      });
    }

    const order = await OrderService.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Verificar que el usuario puede acceder a esta orden
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para acceder a esta orden'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error obteniendo orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Actualizar estado de orden (solo admin)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de orden inválido'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado de orden inválido'
      });
    }

    const order = await OrderService.updateOrderStatus(orderId, status);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error actualizando estado de orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Asignar conductor a orden (solo admin)
router.patch('/:id/assign-driver', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de orden inválido'
      });
    }

    if (!driverId || isNaN(parseInt(driverId))) {
      return res.status(400).json({
        success: false,
        message: 'ID de conductor inválido'
      });
    }

    const order = await OrderService.assignDriver(orderId, parseInt(driverId));
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error asignando conductor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

export default router;
