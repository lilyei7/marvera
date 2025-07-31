import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS, API_CONFIG } from '../../config/apiConfig';

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

// Crear un arreglo de productos destacados de ejemplo (solo para fallback en caso de error)
const exampleFeaturedProducts: FeaturedProduct[] = [
  {
    id: "1",
    name: "Salmón Azul Premium",
    description: "Salmón fresco de Alaska, corte premium",
    price: 179.99,
    image: "./assets/products/salmon.webp",
    category: "pescados",
    emoji: "🐟",
    tag: "Premium",
    tagColor: "bg-amber-500",
    inStock: true,
    unit: "kg"
  },
  {
    id: "2",
    name: "Camarones Jumbo",
    description: "Camarones grandes ideales para parrilla",
    price: 249.99,
    image: "./assets/products/camarones.webp",
    category: "mariscos",
    emoji: "🦐",
    tag: "Fresco",
    tagColor: "bg-green-500",
    inStock: true,
    unit: "kg"
  },
  {
    id: "3",
    name: "Filete de Atún",
    description: "Atún fresco cortado en filetes",
    price: 199.99,
    image: "./assets/products/atun.webp",
    category: "pescados",
    emoji: "🐟",
    tag: "Popular",
    tagColor: "bg-blue-500",
    inStock: true,
    unit: "kg"
  }
];

// Importar configuración centralizada de API
import { API_ENDPOINTS, API_CONFIG, apiRequest } from '../../config/apiConfig';

// Thunk para obtener productos destacados directamente de la base de datos
export const fetchFeaturedProducts = createAsyncThunk(
  'featuredProducts/fetchFeaturedProducts',
  async (_) => {
    // Si no hay servidor disponible, usar datos de ejemplo directamente
    try {
      // Usar la función apiRequest para manejo automático de errores y timeout
      const data = await apiRequest(
        API_ENDPOINTS.FEATURED_PRODUCTS,
        {
          method: 'GET',
          headers: API_CONFIG.COMMON_HEADERS
        },
        exampleFeaturedProducts // Datos fallback
      );
      
      // Make sure data is always an array and has all required properties
      let processedData: FeaturedProduct[] = [];
      
      // Si data es un objeto con una propiedad data, usar data.data
      const productsArray = data.data || data.products || data;
      
      if (Array.isArray(productsArray) && productsArray.length > 0) {
        console.log(`� Procesando ${productsArray.length} productos del servidor`);
        processedData = productsArray.map(product => ({
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
        return processedData;
      } else {
        console.warn('⚠️ No se encontraron productos en el servidor, usando fallback');
        return exampleFeaturedProducts;
      }
    } catch (error) {
      // Si hay cualquier error de conexión, usar productos de ejemplo
      console.log('🔌 Error no controlado, usando datos locales de ejemplo');
      console.log('📦 Mostrando productos destacados de fallback');
      return exampleFeaturedProducts;
    }
  }
);
      
      const response = await fetch(`${API_BASE_URL}/api/products/featured`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'User-Agent': 'MarVera Frontend'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn(`⚠️ Servidor respondió con error: ${response.status}, usando fallback`);
        return exampleFeaturedProducts;
      }
      
      const data = await response.json();
      console.log('✅ Datos recibidos del servidor:', data);
      
      // Make sure data is always an array and has all required properties
      let processedData: FeaturedProduct[] = [];
      
      // Si data es un objeto con una propiedad data, usar data.data
      const productsArray = data.data || data.products || data;
      
      if (Array.isArray(productsArray) && productsArray.length > 0) {
        console.log(`📊 Procesando ${productsArray.length} productos del servidor`);
        processedData = productsArray.map(product => ({
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
        return processedData;
      } else {
        console.warn('⚠️ No se encontraron productos en el servidor, usando fallback');
        return exampleFeaturedProducts;
      }
      
    } catch (error) {
      // Si hay cualquier error de conexión, usar productos de ejemplo
      console.log('🔌 Sin conexión al servidor, usando datos locales de ejemplo');
      console.log('📦 Mostrando productos destacados de fallback');
      return exampleFeaturedProducts;
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
        // Usar datos de ejemplo como fallback
        state.items = exampleFeaturedProducts;
      });
  },
});

export default featuredProductsSlice.reducer;
