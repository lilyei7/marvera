import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product, ProductCategory } from '../../types';

interface ProductsState {
  items: Product[];
  filteredItems: Product[];
  loading: boolean;
  error: string | null;
  categories: ProductCategory[];
  selectedCategory: ProductCategory | 'all';
  searchQuery: string;
  priceRange: {
    min: number;
    max: number;
  };
}

const initialState: ProductsState = {
  items: [],
  filteredItems: [],
  loading: false,
  error: null,
  categories: ['pescados', 'camarones', 'ostras', 'langostas', 'cangrejos', 'moluscos', 'otros'],
  selectedCategory: 'all',
  searchQuery: '',
  priceRange: {
    min: 0,
    max: 1000,
  },
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      // Solo intentar conectar si no es localhost development
      if (API_BASE_URL === 'http://localhost:3001') {
        console.log('🏠 Modo desarrollo - usando datos locales de productos');
        return []; // Retornar array vacío para datos locales
      }

      const response = await fetch(`${API_BASE_URL}/api/products`, {
        signal: AbortSignal.timeout(5000) // 5 segundos timeout
      });
      
      if (!response.ok) {
        throw new Error('API no disponible');
      }
      
      const data = await response.json();
      
      // Convertir productos del backend al formato del frontend
      const products: Product[] = data.products.map((product: any) => ({
        id: product.id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        category: getCategorySlug(product.categoryName),
        imageUrl: getProductImage(product),
        inStock: product.stock > 0,
        origin: 'MarVera',
        freshness: 'Fresh',
        weight: 1,
        unit: product.unit || 'kg',
        isFeatured: product.isFeatured === 1,
        images: product.images || [],
        stock: product.stock,
        categoryName: product.categoryName
      }));
      
      return products;
    } catch (error) {
      // Silenciosamente usar datos locales
      console.log('🏠 Modo desarrollo - usando datos locales de productos');
      return [];
    }
  }
);

// Función helper para convertir nombres de categoría a slugs
function getCategorySlug(categoryName: string): ProductCategory {
  const categoryMap: { [key: string]: ProductCategory } = {
    'Pescados Frescos': 'pescados',
    'Pescados': 'pescados',
    'Mariscos': 'camarones',
    'Crustáceos': 'langostas',
    'Moluscos': 'ostras',
    'Productos Premium': 'otros',
    'Productos Procesados': 'otros'
  };
  
  return categoryMap[categoryName] || 'otros';
}

// Función helper para obtener imagen del producto
function getProductImage(product: any): string {
  // Si tiene imagen propia, usarla
  if (product.image && product.image.trim() !== '') {
    return product.image;
  }
  
  // Si tiene imágenes múltiples, usar la primera
  if (product.images && product.images.length > 0) {
    return product.images[0];
  }
  
  // Imagen por defecto basada en categoría
  const categoryImages: { [key: string]: string } = {
    'pescados': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop&crop=center',
    'camarones': 'https://images.unsplash.com/photo-1553611892-7ba35ad6f0dd?w=400&h=300&fit=crop&crop=center',
    'ostras': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop&crop=center',
    'langostas': 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&h=300&fit=crop&crop=center',
    'cangrejos': 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop&crop=center',
    'moluscos': 'https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=400&h=300&fit=crop&crop=center'
  };
  
  const category = getCategorySlug(product.categoryName);
  return categoryImages[category] || categoryImages['pescados'];
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<ProductCategory | 'all'>) => {
      state.selectedCategory = action.payload;
      productsSlice.caseReducers.applyFilters(state);
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      productsSlice.caseReducers.applyFilters(state);
    },
    
    setPriceRange: (state, action: PayloadAction<{ min: number; max: number }>) => {
      state.priceRange = action.payload;
      productsSlice.caseReducers.applyFilters(state);
    },
    
    applyFilters: (state) => {
      let filtered = [...state.items];
      
      // Category filter
      if (state.selectedCategory !== 'all') {
        filtered = filtered.filter(product => product.category === state.selectedCategory);
      }
      
      // Search filter
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(query) ||
          (product.description && product.description.toLowerCase().includes(query))
        );
      }
      
      // Price filter
      filtered = filtered.filter(product =>
        product.price >= state.priceRange.min && product.price <= state.priceRange.max
      );
      
      state.filteredItems = filtered;
    },
    
    addProduct: (state, action: PayloadAction<Product>) => {
      state.items.push(action.payload);
      productsSlice.caseReducers.applyFilters(state);
    },
    
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex(product => product.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
        productsSlice.caseReducers.applyFilters(state);
      }
    },
    
    deleteProduct: (state, action: PayloadAction<string | number>) => {
      state.items = state.items.filter(product => product.id !== action.payload);
      productsSlice.caseReducers.applyFilters(state);
    },
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.filteredItems = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar productos';
      });
  },
});

export const {
  setSelectedCategory,
  setSearchQuery,
  setPriceRange,
  applyFilters,
  addProduct,
  updateProduct,
  deleteProduct,
} = productsSlice.actions;

export default productsSlice.reducer;
