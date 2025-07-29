import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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
export const getEmojiForCategory = (category: string): string => {
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
  return categoryMap[category?.toLowerCase()] || '🐟';
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

// Datos de ejemplo para desarrollo local con URLs aún más confiables
const SAMPLE_FEATURED_PRODUCTS: FeaturedProduct[] = [
  {
    id: "1",
    name: "Salmón Atlántico Premium",
    description: "Salmón fresco del Atlántico, rico en omega-3 y de calidad premium para las mejores preparaciones.",
    price: 89.99,
    image: `https://cdn.pixabay.com/photo/2017/05/11/19/44/fresh-salmon-2305456_960_720.jpg`,
    category: "pescados",
    emoji: "🐟",
    tag: "Destacado",
    tagColor: "bg-blue-500",
    inStock: true,
    unit: "kg"
  },
  {
    id: "2", 
    name: "Camarones Jumbo",
    description: "Camarones jumbo frescos, perfectos para paellas y preparaciones gourmet. Tamaño extra grande.",
    price: 125.50,
    image: `https://cdn.pixabay.com/photo/2015/11/19/10/38/food-1050813_960_720.jpg`,
    category: "mariscos",
    emoji: "🦐",
    tag: "Popular",
    tagColor: "bg-orange-500",
    inStock: true,
    unit: "kg"
  },
  {
    id: "3",
    name: "Ostras Francesas",
    description: "Ostras frescas importadas de Francia. Sabor intenso del mar y textura perfecta para degustar.",
    price: 156.00,
    image: `https://cdn.pixabay.com/photo/2018/04/17/13/42/oysters-3327835_960_720.jpg`,
    category: "moluscos",
    emoji: "🦪",
    tag: "Premium",
    tagColor: "bg-purple-500",
    inStock: true,
    unit: "docena"
  }
];

// Thunk simplificado - siempre usa datos locales con carga inmediata
export const fetchFeaturedProducts = createAsyncThunk(
  'featuredProducts/fetchFeaturedProducts',
  async () => {
    // Simular una pequeña demora SOLO para mostrar loading
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('🏠 Modo desarrollo local - usando datos de ejemplo');
    
    // Pre-cargar todas las imágenes
    const imagePromises = SAMPLE_FEATURED_PRODUCTS.map(product => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(product);
        img.onerror = () => resolve(product); // Continuar aunque falle
        img.src = product.image;
      });
    });
    
    // Esperar a que todas las imágenes se intenten cargar
    await Promise.all(imagePromises);
    
    return SAMPLE_FEATURED_PRODUCTS;
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
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar productos destacados';
        // Usar datos de ejemplo como fallback
        state.items = SAMPLE_FEATURED_PRODUCTS;
      });
  },
});

export default featuredProductsSlice.reducer;
