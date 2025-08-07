import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl, API_CONFIG, API_SETTINGS } from '../../config/api';

export interface FeaturedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  emoji: string;
  tag: string;
  tagColor: string;
  inStock: boolean;
  unit: string;
}

interface FeaturedProductsState {
  items: FeaturedProduct[];
  loading: boolean;
  error: string | null;
}

// Helper functions para categorías y emojis
export const getEmojiForCategory = (category: any): string => {
  // Si category es un objeto con name property, usar eso
  let categoryName = '';
  if (typeof category === 'object' && category !== null) {
    categoryName = category.name || category.categoryName || '';
  } else if (typeof category === 'string') {
    categoryName = category;
  } else {
    categoryName = '';
  }

  const categoryMap: Record<string, string> = {
    'pescados': '🐟',
    'mariscos': '🦐',
    'moluscos': '🦪',
    'crustaceos': '🦀',
    'conservas': '🥫',
    'congelados': '❄️',
    'frescos': '🧊',
    'especiales': '⭐',
    'temporada': '🌊'
  };
  return categoryMap[categoryName?.toLowerCase()] || '🐟';
};

// Función para obtener imagen de categoría desde Unsplash
export const getImageIdForCategory = (category: string): string => {
  const imageMap: Record<string, string> = {
    'pescados': '1565299624946-3fb11f5e6747', // Salmón fresco
    'mariscos': '1559181089-95d742d40ba5', // Camarones
    'moluscos': '1572276910090-ae8e0f12d46e', // Ostras
    'crustaceos': '1508533831510-a99a70f34b75', // Cangrejo
    'conservas': '1571091718767-18b5b1457add', // Conservas
    'congelados': '1560885405-8b6db0d97e3a', // Pescado congelado
    'frescos': '1553611892-7ba35ad6f0dd', // Pescados frescos
    'especiales': '1563201515-e2e9b4efabc0', // Surtido especial
    'temporada': '1586190877494-bb04adefb7fc'  // Pescados de temporada
  };
  return imageMap[category?.toLowerCase()] || '1553611892-7ba35ad6f0dd';
};

// Función para procesar los productos recibidos del servidor
const processProducts = (productsArray: any[]): FeaturedProduct[] => {
  return productsArray.map(product => ({
    ...product,
    // Ensure all required properties exist
    id: product.id?.toString() || `temp-${Math.random().toString(36).substr(2, 9)}`,
    name: product.name || 'Producto sin nombre',
    description: product.description || 'Sin descripción disponible',
    price: typeof product.price === 'number' ? product.price : 0,
    image: product.imageUrl || product.image || './assets/products/default.webp',
    category: product.category?.name || product.categoryName || product.category || 'mariscos',
    emoji: product.emoji || getEmojiForCategory(product.category?.name || product.categoryName || product.category || 'mariscos'),
    tag: product.tag || 'Destacado',
    tagColor: product.tagColor || 'bg-primary',
    inStock: typeof product.inStock === 'boolean' ? product.inStock : (product.stock > 0),
    unit: product.unit || 'kg'
  }));
};

// Thunk para obtener productos destacados directamente de la base de datos
export const fetchFeaturedProducts = createAsyncThunk(
  'featuredProducts/fetchFeaturedProducts',
  async (_) => {
    try {
      console.log(`🔍 Intentando conectar al servidor: ${getApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS_FEATURED)}`);
      
      // Crear un AbortController para manejar timeout manualmente
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Timeout alcanzado, usando datos de fallback');
        controller.abort();
      }, API_SETTINGS.TIMEOUT);
      
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS_FEATURED), {
        method: 'GET',
        headers: API_SETTINGS.HEADERS,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Datos recibidos del servidor:', data);
      
      // Si data es un objeto con una propiedad data o products, usar eso
      const productsArray = data.data || data.products || data;
      
      if (Array.isArray(productsArray) && productsArray.length > 0) {
        console.log(`📊 Procesando ${productsArray.length} productos del servidor`);
        return processProducts(productsArray);
      } else {
        throw new Error('No se encontraron productos en el servidor');
      }
      
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
      throw error;
    }
  }
);

const initialState: FeaturedProductsState = {
  items: [],
  loading: false,
  error: null,
};

const featuredProductsSlice = createSlice({
  name: 'featuredProducts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure action.payload is always an array
        state.items = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar productos destacados';
        state.items = []; // No usar datos de ejemplo
      });
  },
});

export default featuredProductsSlice.reducer;
