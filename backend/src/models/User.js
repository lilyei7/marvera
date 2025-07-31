const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  lastName: {
    type: String,
    required: [true, 'El apellido es requerido'],
    trim: true,
    minlength: [2, 'El apellido debe tener al menos 2 caracteres'],
    maxlength: [50, 'El apellido no puede tener más de 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  phone: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    unique: true,
    trim: true,
    minlength: [10, 'El teléfono debe tener al menos 10 caracteres']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'manager'],
    default: 'customer'
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'La dirección no puede tener más de 200 caracteres']
  },
  city: {
    type: String,
    trim: true,
    maxlength: [100, 'La ciudad no puede tener más de 100 caracteres']
  },
  postalCode: {
    type: String,
    trim: true,
    maxlength: [10, 'El código postal no puede tener más de 10 caracteres']
  },
  dateOfBirth: {
    type: Date
  },
  profileImage: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  lastLogin: {
    type: Date
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      promotions: {
        type: Boolean,
        default: true
      }
    },
    language: {
      type: String,
      enum: ['es', 'en'],
      default: 'es'
    },
    currency: {
      type: String,
      enum: ['MXN', 'USD'],
      default: 'MXN'
    }
  },
  loyaltyPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  totalOrders: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  favoriteProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  shippingAddresses: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    postalCode: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  notes: {
    type: String,
    maxlength: [500, 'Las notas no pueden tener más de 500 caracteres']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      return ret;
    }
  }
});

// Índices para optimización
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Middleware para actualizar el updatedAt automáticamente
userSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

// Método para obtener el nombre completo
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Método para verificar si es admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin' || this.role === 'manager';
};

// Método para agregar puntos de lealtad
userSchema.methods.addLoyaltyPoints = function(points) {
  this.loyaltyPoints += points;
  return this.save();
};

// Método para agregar productos favoritos
userSchema.methods.addFavoriteProduct = function(productId) {
  if (!this.favoriteProducts.includes(productId)) {
    this.favoriteProducts.push(productId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Método para remover productos favoritos
userSchema.methods.removeFavoriteProduct = function(productId) {
  this.favoriteProducts = this.favoriteProducts.filter(
    id => !id.equals(productId)
  );
  return this.save();
};

// Método estático para encontrar usuarios activos
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Método estático para estadísticas de usuarios
userSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        totalCustomers: {
          $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] }
        },
        totalAdmins: {
          $sum: { $cond: [{ $in: ['$role', ['admin', 'manager']] }, 1, 0] }
        },
        avgLoyaltyPoints: { $avg: '$loyaltyPoints' },
        totalLoyaltyPoints: { $sum: '$loyaltyPoints' },
        totalSpent: { $sum: '$totalSpent' }
      }
    }
  ]);
};

module.exports = mongoose.model('User', userSchema);
