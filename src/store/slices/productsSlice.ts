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
  async (_, { rejectWithValue }) => {
    try {
      // Añadir un pequeño retraso para evitar el error "Too Many Requests" (429)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3001' : 'https://marvera.mx';
      const url = `${API_BASE_URL}/api/products`;
      
      console.log(`🔄 Conectando a la API: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(10000) // 10 segundos timeout
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Convertir productos del backend al formato del frontend
      const products: Product[] = data.products.map((product: any) => ({
        id: product.id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        category: getCategorySlug(product.categoryName),
        imageUrl: product.image || (product.images && product.images.length > 0 ? product.images[0] : ''),
        inStock: product.stock > 0,
        origin: product.origin || 'MarVera',
        freshness: product.freshness || 'Fresh',
        weight: product.weight || 1,
        unit: product.unit || 'kg',
        isFeatured: product.isFeatured === 1,
        images: product.images || [],
        stock: product.stock,
        categoryName: product.categoryName
      }));
      
      return products;
    } catch (error) {
      console.error('Error al cargar productos:', error);
      return rejectWithValue('Error al cargar productos');
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
