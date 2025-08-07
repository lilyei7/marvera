import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl, API_CONFIG } from '../../config/api';
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
      
      const url = getApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS);
      
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
      
      console.log('📊 DATOS PRODUCTOS v3.0:', data);
      console.log('📊 TIPO:', typeof data);
      console.log('📊 SUCCESS:', data.success);
      console.log('📊 DATA FIELD:', data.data);
      console.log('📊 IS DATA ARRAY:', Array.isArray(data.data));
      
      // La API devuelve: {success: true, data: [...], count: 5}
      let productsArray = [];
      
      if (data && data.success && data.data && Array.isArray(data.data)) {
        productsArray = data.data;
        console.log('✅ PRODUCTOS OBTENIDOS:', productsArray.length);
      } else if (data.data && Array.isArray(data.data)) {
        productsArray = data.data;
        console.log('✅ DATOS DIRECTOS:', productsArray.length);
      } else if (data.products && Array.isArray(data.products)) {
        productsArray = data.products;
        console.log('✅ PRODUCTS FIELD:', productsArray.length);
      } else if (Array.isArray(data)) {
        productsArray = data;
        console.log('✅ ARRAY DIRECTO:', productsArray.length);
      } else {
        console.error('❌ ESTRUCTURA NO RECONOCIDA:', data);
        productsArray = [];
      }
      
      console.log('📊 ARRAY FINAL v3.0:', productsArray);
      console.log('📊 LONGITUD:', productsArray?.length || 0);
      
      if (!Array.isArray(productsArray)) {
        console.error('❌ NO ES ARRAY:', productsArray);
        throw new Error('La respuesta no contiene un array de productos válido');
      }
      
      // Convertir productos del backend al formato del frontend
      const products: Product[] = productsArray.map((product: any) => ({
        id: product.id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        category: getCategorySlug(product.category || product.categoryName),
        imageUrl: product.imageUrl || product.image || (product.images && product.images.length > 0 ? product.images[0] : ''),
        inStock: product.stock > 0,
        origin: product.origin || 'MarVera',
        freshness: product.freshness || 'Fresh',
        weight: product.weight || 1,
        unit: product.unit || 'kg',
        isFeatured: product.isFeatured === true || product.isFeatured === 1,
        images: product.images || [],
        stock: product.stock,
        categoryName: product.category || product.categoryName
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
      console.log('🔍 Aplicando filtros. State.items:', state.items);
      console.log('🔍 Es array state.items?', Array.isArray(state.items));
      console.log('🔍 State.items length:', state.items?.length);
      
      let filtered = [...(state.items || [])];
      
      // Verificar que items sea un array válido
      if (!Array.isArray(state.items)) {
        console.error('❌ state.items no es un array:', state.items);
        state.filteredItems = [];
        return;
      }
      
      console.log('🔍 Filtered inicial length:', filtered.length);
      
      // Category filter
      if (state.selectedCategory !== 'all') {
        filtered = filtered.filter(product => product?.category === state.selectedCategory);
        console.log('🔍 Después de filtro categoría:', filtered.length);
      }
      
      // Search filter
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(product =>
          product?.name?.toLowerCase().includes(query) ||
          (product?.description && product.description.toLowerCase().includes(query))
        );
        console.log('🔍 Después de filtro búsqueda:', filtered.length);
      }
      
      // Price filter
      filtered = filtered.filter(product =>
        product?.price >= state.priceRange.min && product?.price <= state.priceRange.max
      );
      
      console.log('✅ Filtros aplicados. Productos filtrados:', filtered.length);
      console.log('✅ Filtered final es array?', Array.isArray(filtered));
      console.log('✅ Filtered final:', filtered);
      
      // EXTRA SAFETY: Asegurar que sea un array válido
      if (Array.isArray(filtered)) {
        state.filteredItems = filtered;
      } else {
        console.error('❌ Filtered no es array!', filtered);
        state.filteredItems = [];
      }
      
      console.log('✅ State.filteredItems final:', state.filteredItems);
      console.log('✅ State.filteredItems es array?', Array.isArray(state.filteredItems));
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
        console.log('🔄 fetchProducts.pending - Iniciando carga...');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        console.log('✅ fetchProducts.fulfilled - payload recibido:', action.payload);
        console.log('✅ Payload es array?', Array.isArray(action.payload));
        console.log('✅ Payload length:', action.payload?.length);
        console.log('✅ Primer producto:', action.payload?.[0]);
        
        state.loading = false;
        
        // Verificar que la respuesta sea un array válido
        if (Array.isArray(action.payload)) {
          state.items = action.payload;
          state.filteredItems = action.payload;
          console.log('✅ State.items establecido. Length:', state.items.length);
          console.log('✅ State.filteredItems establecido. Length:', state.filteredItems.length);
          console.log('✅ State.items es array?', Array.isArray(state.items));
          console.log('✅ State.filteredItems es array?', Array.isArray(state.filteredItems));
        } else {
          console.error('❌ La respuesta no es un array válido:', action.payload);
          state.items = [];
          state.filteredItems = [];
          state.error = 'Datos de productos inválidos';
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        console.error('❌ fetchProducts.rejected:', action.error);
        console.error('❌ Error message:', action.error.message);
        console.error('❌ Error payload:', action.payload);
        
        state.loading = false;
        state.error = action.error.message || 'Error al cargar productos';
        state.items = [];
        state.filteredItems = [];
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

