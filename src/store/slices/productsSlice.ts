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

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Salmón Atlántico Premium',
    description: 'Salmón fresco del Atlántico Norte, ideal para sashimi',
    price: 89.99,
    category: 'pescados',
    imageUrl: '/images/salmon-atlantico.jpg',
    inStock: true,
    origin: 'Noruega',
    freshness: 'Ultra Fresh',
    weight: 1,
    unit: 'kg',
  },
  {
    id: '2',
    name: 'Camarones Jumbo',
    description: 'Camarones gigantes del Pacífico, perfectos para parrilla',
    price: 65.50,
    category: 'camarones',
    imageUrl: '/images/camarones-jumbo.jpg',
    inStock: true,
    origin: 'Ecuador',
    freshness: 'Fresh',
    weight: 0.5,
    unit: 'kg',
  },
  {
    id: '3',
    name: 'Ostras Blue Point',
    description: 'Ostras premium de la costa este americana',
    price: 45.00,
    category: 'ostras',
    imageUrl: '/images/ostras-blue-point.jpg',
    inStock: true,
    origin: 'Estados Unidos',
    freshness: 'Ultra Fresh',
    weight: 12,
    unit: 'piece',
  },
];

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    // Simulate API call
    return new Promise<Product[]>((resolve) => {
      setTimeout(() => resolve(mockProducts), 1000);
    });
  }
);

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
