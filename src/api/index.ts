// 🌐 SERVICIOS API CENTRALIZADOS MARVERA

// Exportar cliente base
export { apiClient } from './client';
export type { ApiResponse } from './client';

// Exportar servicios
export { ProductService } from './products';
export type { Product, ProductsResponse } from './products';

export { SlideshowService } from './slideshow';
export type { Slide, SlideshowResponse } from './slideshow';

export { BranchService } from './branches';
export type { Branch, BranchesResponse } from './branches';

// Configuración
export { API_CONFIG, getApiUrl } from '../config/api';
