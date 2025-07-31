const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  weight: {
    type: Number,
    min: 0
  },
  specifications: {
    size: String,
    preparation: String,
    notes: String
  }
});

const addressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'México'
  },
  instructions: String
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  notes: String,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['retail', 'wholesale'],
    default: 'retail'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'preparing', 'ready', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    enum: ['MXN', 'USD'],
    default: 'MXN'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer', 'paypal', 'stripe'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partial'],
    default: 'pending'
  },
  paymentId: String,
  shippingAddress: {
    type: addressSchema,
    required: true
  },
  billingAddress: addressSchema,
  deliveryMethod: {
    type: String,
    enum: ['delivery', 'pickup', 'shipping'],
    default: 'delivery'
  },
  preferredDeliveryDate: Date,
  preferredDeliveryTime: {
    start: String,
    end: String
  },
  estimatedDelivery: Date,
  actualDelivery: Date,
  trackingNumber: String,
  courierService: String,
  specialInstructions: String,
  notes: String,
  customerNotes: String,
  internalNotes: String,
  statusHistory: [statusHistorySchema],
  isWholesale: {
    type: Boolean,
    default: false
  },
  wholesaleDetails: {
    businessName: String,
    taxId: String,
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  loyaltyPointsUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  loyaltyPointsEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    ratedAt: Date
  },
  cancelledAt: Date,
  cancelReason: String,
  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  refundReason: String,
  refundedAt: Date
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Índices para optimización
orderSchema.index({ userId: 1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ type: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ estimatedDelivery: 1 });

// Middleware para generar número de orden
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Contar órdenes del día para generar número secuencial
    const today = new Date(year, date.getMonth(), date.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    const sequence = String(count + 1).padStart(3, '0');
    this.orderNumber = `MV-${year}${month}${day}-${sequence}`;
  }
  
  // Actualizar historial de estado si el estado cambió
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      notes: `Estado actualizado a ${this.status}`
    });
  }
  
  next();
});

// Método para calcular total
orderSchema.methods.calculateTotal = function() {
  this.subtotal = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  this.totalAmount = this.subtotal + this.tax + this.shippingCost - this.discount;
  return this.totalAmount;
};

// Método para actualizar estado
orderSchema.methods.updateStatus = function(newStatus, notes = '', updatedBy = null) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    notes,
    updatedBy
  });
  
  // Actualizar fechas específicas según el estado
  switch (newStatus) {
    case 'delivered':
      this.actualDelivery = new Date();
      break;
    case 'cancelled':
      this.cancelledAt = new Date();
      break;
    case 'shipped':
      if (!this.estimatedDelivery) {
        // Estimar 3-5 días para entrega
        const estimate = new Date();
        estimate.setDate(estimate.getDate() + 4);
        this.estimatedDelivery = estimate;
      }
      break;
  }
  
  return this.save();
};

// Método para agregar calificación
orderSchema.methods.addRating = function(score, comment = '') {
  this.rating = {
    score,
    comment,
    ratedAt: new Date()
  };
  return this.save();
};

// Método estático para estadísticas
orderSchema.statics.getStats = function(dateRange = {}) {
  const matchStage = {};
  
  if (dateRange.start && dateRange.end) {
    matchStage.createdAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        processingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        retailOrders: {
          $sum: { $cond: [{ $eq: ['$type', 'retail'] }, 1, 0] }
        },
        wholesaleOrders: {
          $sum: { $cond: [{ $eq: ['$type', 'wholesale'] }, 1, 0] }
        }
      }
    }
  ]);
};

// Método estático para órdenes por día
orderSchema.statics.getOrdersByDay = function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 },
        revenue: { $sum: '$totalAmount' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);
