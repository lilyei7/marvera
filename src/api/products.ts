// 🛍️ SERVICIO API PARA PRODUCTOS
import { apiClient } from './client';
import type { ApiResponse } from './client';
import { API_CONFIG } from '../config/api';

// Tipos de producto
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: {
    id: number;
    name: string;
  };
  isActive: boolean;
  isFeatured: boolean;
}

export interface ProductsResponse {
  products: Product[];
}

// Servicio de productos
export class ProductService {
  // Obtener todos los productos
  static async getAll(): Promise<ApiResponse<ProductsResponse>> {
    return await apiClient.get<ProductsResponse>(API_CONFIG.ENDPOINTS.PRODUCTS);
  }

  // Obtener productos destacados
  static async getFeatured(): Promise<ApiResponse<ProductsResponse>> {
    return await apiClient.get<ProductsResponse>(API_CONFIG.ENDPOINTS.PRODUCTS_FEATURED);
  }

  // Obtener producto por ID
  static async getById(id: number): Promise<ApiResponse<Product>> {
    return await apiClient.get<Product>(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`);
  }

  // Crear producto (admin)
  static async create(product: Partial<Product>): Promise<ApiResponse<Product>> {
    return await apiClient.post<Product>(API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS, product);
  }

  // Actualizar producto (admin)
  static async update(id: number, product: Partial<Product>): Promise<ApiResponse<Product>> {
    return await apiClient.put<Product>(`${API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS}/${id}`, product);
  }

  // Eliminar producto (admin)
  static async delete(id: number): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>(`${API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS}/${id}`);
  }
}
