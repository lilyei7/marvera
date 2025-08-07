export type ProductCategory = 'pescados' | 'camarones' | 'ostras' | 'langostas' | 'cangrejos' | 'moluscos' | 'otros';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: ProductCategory;
  imageUrl?: string;
  images?: string[]; // Array of image URLs
  inStock: boolean;
  origin?: string;
  freshness?: string;
  weight?: number;
  unit: string;
  isFeatured?: boolean;
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
  id: string;
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
  id: string;
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
  deliveryAddress?: Address;
  deliveryDate?: Date;
  driver_id?: number;
  trackingCode?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  items?: OrderItem[];
  deliveryTracker?: DeliveryTracker;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
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

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  lat?: number;
  lng?: number;
}

export interface DeliveryTracker {
  orderId: string;
  driver: Driver;
  estimatedDelivery: Date;
  currentLocation: {
    lat: number;
    lng: number;
  };
  route: {
    lat: number;
    lng: number;
  }[];
  status: 'picking_up' | 'on_the_way' | 'delivered';
}
