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
  // PESCADOS 🐟
  {
    id: '1',
    name: 'Salmón Atlántico Premium',
    description: 'Salmón fresco del Atlántico Norte, ideal para sashimi y preparaciones gourmet',
    price: 89.99,
    category: 'pescados',
    imageUrl: '🐟',
    inStock: true,
    origin: 'Noruega',
    freshness: 'Ultra Fresh',
    weight: 1,
    unit: 'kg',
    isFeatured: true,
  },
  {
    id: '2',
    name: 'Atún Rojo Bluefin',
    description: 'Atún rojo de primera calidad, perfecto para tataki y sashimi',
    price: 159.99,
    category: 'pescados',
    imageUrl: '🐟',
    inStock: true,
    origin: 'Japón',
    freshness: 'Ultra Fresh',
    weight: 0.8,
    unit: 'kg',
    isFeatured: true,
  },
  {
    id: '3',
    name: 'Robalo del Pacífico',
    description: 'Robalo fresco, excelente para ceviche y preparaciones al vapor',
    price: 45.50,
    category: 'pescados',
    imageUrl: '🐟',
    inStock: true,
    origin: 'México',
    freshness: 'Fresh',
    weight: 1.2,
    unit: 'kg',
  },
  {
    id: '4',
    name: 'Mero Rojo',
    description: 'Mero rojo del Golfo de México, ideal para guisos y filetes',
    price: 67.80,
    category: 'pescados',
    imageUrl: '🐟',
    inStock: true,
    origin: 'México',
    freshness: 'Fresh',
    weight: 1.5,
    unit: 'kg',
  },

  // CAMARONES 🦐
  {
    id: '5',
    name: 'Camarones Jumbo del Pacífico',
    description: 'Camarones gigantes del Pacífico, perfectos para parrilla y coctel',
    price: 85.50,
    category: 'camarones',
    imageUrl: '🦐',
    inStock: true,
    origin: 'Ecuador',
    freshness: 'Fresh',
    weight: 0.5,
    unit: 'kg',
    isFeatured: true,
  },
  {
    id: '6',
    name: 'Camarones Tiger Premium',
    description: 'Camarones tiger rayados, ideales para tempura y curry',
    price: 95.00,
    category: 'camarones',
    imageUrl: '🦐',
    inStock: true,
    origin: 'Tailandia',
    freshness: 'Ultra Fresh',
    weight: 0.5,
    unit: 'kg',
  },
  {
    id: '7',
    name: 'Camarones Blancos del Golfo',
    description: 'Camarones blancos frescos del Golfo de México',
    price: 72.30,
    category: 'camarones',
    imageUrl: '🦐',
    inStock: true,
    origin: 'México',
    freshness: 'Fresh',
    weight: 0.5,
    unit: 'kg',
  },

  // OSTRAS 🦪
  {
    id: '8',
    name: 'Ostras Blue Point',
    description: 'Ostras premium de la costa este americana, sabor salino intenso',
    price: 45.00,
    category: 'ostras',
    imageUrl: '🦪',
    inStock: true,
    origin: 'Estados Unidos',
    freshness: 'Ultra Fresh',
    weight: 12,
    unit: 'piezas',
  },
  {
    id: '9',
    name: 'Ostras Kumamoto',
    description: 'Ostras japonesas de sabor dulce y cremoso, muy valoradas',
    price: 78.00,
    category: 'ostras',
    imageUrl: '🦪',
    inStock: true,
    origin: 'Japón',
    freshness: 'Ultra Fresh',
    weight: 12,
    unit: 'piezas',
    isFeatured: true,
  },
  {
    id: '10',
    name: 'Ostras Francesas Belon',
    description: 'Ostras planas francesas con sabor metálico característico',
    price: 89.50,
    category: 'ostras',
    imageUrl: '🦪',
    inStock: true,
    origin: 'Francia',
    freshness: 'Ultra Fresh',
    weight: 12,
    unit: 'piezas',
  },

  // LANGOSTAS 🦞
  {
    id: '11',
    name: 'Langosta Roja del Maine',
    description: 'Langosta americana premium con carne dulce y firme',
    price: 189.99,
    category: 'langostas',
    imageUrl: '🦞',
    inStock: true,
    origin: 'Estados Unidos',
    freshness: 'Ultra Fresh',
    weight: 0.6,
    unit: 'kg',
    isFeatured: true,
  },
  {
    id: '12',
    name: 'Langosta Espinosa del Caribe',
    description: 'Langosta espinosa sin pinzas, carne delicada y sabrosa',
    price: 145.80,
    category: 'langostas',
    imageUrl: '🦞',
    inStock: true,
    origin: 'México',
    freshness: 'Fresh',
    weight: 0.8,
    unit: 'kg',
  },
  {
    id: '13',
    name: 'Langosta Australiana',
    description: 'Langosta gigante australiana, la más grande del mundo',
    price: 256.00,
    category: 'langostas',
    imageUrl: '🦞',
    inStock: true,
    origin: 'Australia',
    freshness: 'Ultra Fresh',
    weight: 1.2,
    unit: 'kg',
  },

  // CANGREJOS 🦀
  {
    id: '14',
    name: 'Cangrejo Real de Alaska',
    description: 'Cangrejo rey de Alaska con patas gigantes y carne exquisita',
    price: 234.50,
    category: 'cangrejos',
    imageUrl: '🦀',
    inStock: true,
    origin: 'Alaska',
    freshness: 'Ultra Fresh',
    weight: 1.5,
    unit: 'kg',
    isFeatured: true,
  },
  {
    id: '15',
    name: 'Cangrejo Azul del Atlántico',
    description: 'Cangrejo azul americano, perfecto para sopas y bisques',
    price: 67.80,
    category: 'cangrejos',
    imageUrl: '🦀',
    inStock: true,
    origin: 'Estados Unidos',
    freshness: 'Fresh',
    weight: 0.5,
    unit: 'kg',
  },
  {
    id: '16',
    name: 'Cangrejo Dungeness',
    description: 'Cangrejo Dungeness del Pacífico, carne dulce y abundante',
    price: 89.90,
    category: 'cangrejos',
    imageUrl: '🦀',
    inStock: true,
    origin: 'Estados Unidos',
    freshness: 'Fresh',
    weight: 0.7,
    unit: 'kg',
  },

  // MOLUSCOS 🐚
  {
    id: '17',
    name: 'Vieiras Gigantes',
    description: 'Vieiras del Atlántico de tamaño premium, ideales para sear',
    price: 125.00,
    category: 'moluscos',
    imageUrl: '🐚',
    inStock: true,
    origin: 'Francia',
    freshness: 'Ultra Fresh',
    weight: 0.5,
    unit: 'kg',
    isFeatured: true,
  },
  {
    id: '18',
    name: 'Mejillones Verdes',
    description: 'Mejillones de Nueva Zelanda de gran tamaño y sabor intenso',
    price: 35.60,
    category: 'moluscos',
    imageUrl: '🐚',
    inStock: true,
    origin: 'Nueva Zelanda',
    freshness: 'Fresh',
    weight: 1,
    unit: 'kg',
  },
  {
    id: '19',
    name: 'Almejas Manila',
    description: 'Almejas pequeñas y tiernas, perfectas para pasta y paella',
    price: 42.30,
    category: 'moluscos',
    imageUrl: '🐚',
    inStock: true,
    origin: 'España',
    freshness: 'Fresh',
    weight: 0.5,
    unit: 'kg',
  },
  {
    id: '20',
    name: 'Pulpo del Mediterráneo',
    description: 'Pulpo fresco del Mediterráneo, ideal para carpaccio y guisos',
    price: 78.90,
    category: 'moluscos',
    imageUrl: '🐙',
    inStock: true,
    origin: 'España',
    freshness: 'Fresh',
    weight: 1,
    unit: 'kg',
  },

  // OTROS PRODUCTOS ESPECIALES 🌊
  {
    id: '21',
    name: 'Carne de Ballena Minke',
    description: 'Carne de ballena Minke de pesca sostenible (simulación)',
    price: 299.99,
    category: 'otros',
    imageUrl: '🐋',
    inStock: true,
    origin: 'Islandia',
    freshness: 'Ultra Fresh',
    weight: 0.5,
    unit: 'kg',
    isFeatured: true,
  },
  {
    id: '22',
    name: 'Calamar Gigante del Pacífico',
    description: 'Tentáculos de calamar gigante, una delicia única',
    price: 156.70,
    category: 'otros',
    imageUrl: '🦑',
    inStock: true,
    origin: 'Chile',
    freshness: 'Fresh',
    weight: 1,
    unit: 'kg',
  },
  {
    id: '23',
    name: 'Anguila de Río Premium',
    description: 'Anguila fresca ideal para preparaciones asiáticas tradicionales',
    price: 89.50,
    category: 'otros',
    imageUrl: '🐍',
    inStock: true,
    origin: 'Japón',
    freshness: 'Fresh',
    weight: 0.5,
    unit: 'kg',
  },
  {
    id: '24',
    name: 'Tiburón Martillo Fileteado',
    description: 'Filetes de tiburón martillo, carne firme y sabrosa',
    price: 134.80,
    category: 'otros',
    imageUrl: '🦈',
    inStock: true,
    origin: 'México',
    freshness: 'Fresh',
    weight: 0.8,
    unit: 'kg',
  },
  {
    id: '25',
    name: 'Medusas Comestibles',
    description: 'Medusas preparadas al estilo asiático, textura única',
    price: 67.40,
    category: 'otros',
    imageUrl: '🪼',
    inStock: true,
    origin: 'China',
    freshness: 'Fresh',
    weight: 0.3,
    unit: 'kg',
  },
  {
    id: '26',
    name: 'Caviar de Beluga',
    description: 'Caviar de beluga auténtico, el más exclusivo del mundo',
    price: 899.99,
    category: 'otros',
    imageUrl: '🥚',
    inStock: true,
    origin: 'Rusia',
    freshness: 'Ultra Fresh',
    weight: 0.1,
    unit: 'kg',
    isFeatured: true,
  }
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
