// 🎪 SERVICIO API PARA SLIDESHOW
import { apiClient } from './client';
import type { ApiResponse } from './client';
import { API_CONFIG } from '../config/api';

// Tipos de slideshow
export interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl?: string;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
  order: number;
}

export interface SlideshowResponse {
  data: Slide[];
}

// Servicio de slideshow
export class SlideshowService {
  // Obtener todas las slides activas
  static async getActive(): Promise<ApiResponse<SlideshowResponse>> {
    return await apiClient.get<SlideshowResponse>(API_CONFIG.ENDPOINTS.SLIDESHOW);
  }

  // Obtener slide por ID
  static async getById(id: number): Promise<ApiResponse<Slide>> {
    return await apiClient.get<Slide>(`${API_CONFIG.ENDPOINTS.SLIDESHOW}/${id}`);
  }

  // Crear slide (admin)
  static async create(slide: Partial<Slide>): Promise<ApiResponse<Slide>> {
    return await apiClient.post<Slide>('/api/admin/slideshow', slide);
  }

  // Actualizar slide (admin)
  static async update(id: number, slide: Partial<Slide>): Promise<ApiResponse<Slide>> {
    return await apiClient.put<Slide>(`/api/admin/slideshow/${id}`, slide);
  }

  // Eliminar slide (admin)
  static async delete(id: number): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>(`/api/admin/slideshow/${id}`);
  }

  // Reordenar slides (admin)
  static async reorder(slides: { id: number; order: number }[]): Promise<ApiResponse<void>> {
    return await apiClient.put<void>('/api/admin/slideshow/reorder', { slides });
  }
}
