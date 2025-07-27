export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  comparePrice?: number;
  category_id: number;
  categoryName?: string;
  stock: number;
  unit: string;
  images?: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt?: Date;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  unit: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  isOpen: boolean;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'admin' | 'driver';
  isActive: boolean;
  createdAt?: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  user_id: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress?: string;
  deliveryDate?: Date;
  driver_id?: number;
  trackingCode?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  productName?: string;
  quantity: number;
  price: number;
}

export interface Driver {
  id: number;
  name: string;
  phone: string;
  vehicle: string;
  rating: number;
  location?: {
    lat: number;
    lng: number;
  };
}

export type ProductCategory = 'all' | 'pescados-frescos' | 'mariscos' | 'crustaceos' | 'moluscos' | 'premium' | 'procesados';
