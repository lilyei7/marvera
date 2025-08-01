export interface User {
  id?: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  address?: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'CUSTOMER' | 'RESTAURANT' | 'WHOLESALE' | 'DRIVER';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  id?: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string;
  isActive: boolean;
  createdAt?: Date;
}

export interface Product {
  id?: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  comparePrice?: number | null;
  category_id: number;
  categoryName?: string;
  stock: number;
  unit: string;
  images?: string | string[]; // Puede ser string (JSON) o array
  isActive: boolean;
  isFeatured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Order {
  id?: number;
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
  id?: number;
  order_id: number;
  product_id: number;
  productName?: string;
  quantity: number;
  price: number;
}

export interface Driver {
  id?: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  vehicleType?: string;
  plateNumber?: string;
  isActive: boolean;
  currentLat?: number;
  currentLng?: number;
  isAvailable: boolean;
  createdAt?: Date;
}

export interface DeliveryTracking {
  id?: number;
  order_id: number;
  driver_id: number;
  status: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  timestamp?: Date;
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

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: Omit<User, 'password'>;
  message?: string;
}
