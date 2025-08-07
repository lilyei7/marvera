// 🏢 SERVICIO API PARA SUCURSALES
import { apiClient } from './client';
import type { ApiResponse } from './client';
import { API_CONFIG } from '../config/api';

// Tipos de sucursal
export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  email?: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  imageUrl?: string;
  hours?: string;
}

export interface BranchesResponse {
  data: Branch[];
}

// Servicio de sucursales
export class BranchService {
  // Obtener sucursales públicas
  static async getPublic(): Promise<ApiResponse<BranchesResponse>> {
    return await apiClient.get<BranchesResponse>(API_CONFIG.ENDPOINTS.BRANCHES);
  }

  // Obtener todas las sucursales (admin)
  static async getAll(): Promise<ApiResponse<BranchesResponse>> {
    return await apiClient.get<BranchesResponse>('/api/branches');
  }

  // Obtener sucursal por ID
  static async getById(id: number): Promise<ApiResponse<Branch>> {
    return await apiClient.get<Branch>(`/api/branches/${id}`);
  }

  // Crear sucursal (admin)
  static async create(branch: Partial<Branch>): Promise<ApiResponse<Branch>> {
    return await apiClient.post<Branch>('/api/branches', branch);
  }

  // Actualizar sucursal (admin)
  static async update(id: number, branch: Partial<Branch>): Promise<ApiResponse<Branch>> {
    return await apiClient.put<Branch>(`/api/branches/${id}`, branch);
  }

  // Eliminar sucursal (admin)
  static async delete(id: number): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>(`/api/branches/${id}`);
  }
}
