import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Product } from '../types';

const API_BASE_URL = '/api';

interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  category: string;
  unit?: string;
  inStock?: boolean;
  origin?: string;
  freshness?: string;
  weight?: number;
  isFeatured?: boolean;
  imageFile?: File;
}

export const adminProductsApi = createApi({
  reducerPath: 'adminProductsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/admin/products`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['AdminProduct'],
  endpoints: (builder) => ({
    // Obtener todos los productos (admin)
    getAdminProducts: builder.query<Product[], void>({
      query: () => '',
      providesTags: ['AdminProduct'],
    }),

    // Crear nuevo producto con imagen
    createProduct: builder.mutation<Product, CreateProductRequest>({
      query: (productData) => {
        const formData = new FormData();
        
        // Agregar campos del producto al FormData
        Object.entries(productData).forEach(([key, value]) => {
          if (key === 'imageFile' && value instanceof File) {
            formData.append('image', value);
          } else if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });

        return {
          url: '',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['AdminProduct'],
    }),

    // Actualizar producto
    updateProduct: builder.mutation<Product, { id: number; data: Partial<CreateProductRequest> }>({
      query: ({ id, data }) => {
        const formData = new FormData();
        
        // Agregar campos del producto al FormData
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'imageFile' && value instanceof File) {
            formData.append('image', value);
          } else if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });

        return {
          url: `/${id}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: ['AdminProduct'],
    }),

    // Eliminar producto
    deleteProduct: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminProduct'],
    }),
  }),
});

export const {
  useGetAdminProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = adminProductsApi;
