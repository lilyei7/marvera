import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl, API_CONFIG } from '../../config/api';

// Tipos
export interface SpecialOffer {
  id: number;
  title: string;
  description: string;
  originalPrice: number;
  discountPrice: number;
  discountPercent?: number;
  imageUrl?: string;
  backgroundColor: string;
  isActive: boolean;
  isFeatured: boolean;
  validFrom: string;
  validUntil?: string;
  productIds?: string;
  maxRedemptions?: number;
  currentRedemptions: number;
  createdAt: string;
  updatedAt: string;
}

interface OffersState {
  featuredOffers: SpecialOffer[];
  allOffers: SpecialOffer[];
  loading: boolean;
  error: string | null;
}

// Thunk para obtener ofertas destacadas
export const fetchFeaturedOffers = createAsyncThunk(
  'offers/fetchFeaturedOffers',
  async () => {
    try {
      console.log(`🔍 Intentando conectar al servidor: ${getApiUrl(API_CONFIG.ENDPOINTS.OFFERS_FEATURED)}`);
      
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.OFFERS_FEATURED), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 API Response:', result);

      if (result.success && Array.isArray(result.data)) {
        console.log(`✅ ${result.data.length} ofertas destacadas obtenidas desde la base de datos`);
        return result.data;
      } else {
        throw new Error('No se encontraron ofertas en el servidor');
      }
      
    } catch (error) {
      console.error('❌ Error al cargar ofertas destacadas:', error);
      throw error;
    }
  }
);

// Thunk para obtener todas las ofertas
export const fetchAllOffers = createAsyncThunk(
  'offers/fetchAllOffers',
  async () => {
    try {
      console.log(`🔍 Intentando conectar al servidor: ${getApiUrl(API_CONFIG.ENDPOINTS.OFFERS)}`);
      
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.OFFERS), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 API Response (all offers):', result);

      if (result.success && Array.isArray(result.data)) {
        console.log(`✅ ${result.data.length} ofertas obtenidas desde la base de datos`);
        return result.data;
      } else {
        throw new Error('No se encontraron ofertas en el servidor');
      }
      
    } catch (error) {
      console.error('❌ Error al cargar ofertas:', error);
      throw error;
    }
  }
);

const initialState: OffersState = {
  featuredOffers: [],
  allOffers: [],
  loading: false,
  error: null,
};

const offersSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Featured offers
      .addCase(fetchFeaturedOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredOffers = action.payload || [];
        state.error = null;
      })
      .addCase(fetchFeaturedOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar ofertas destacadas';
        state.featuredOffers = [];
      })
      // All offers
      .addCase(fetchAllOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.allOffers = action.payload || [];
        state.error = null;
      })
      .addCase(fetchAllOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar ofertas';
        state.allOffers = [];
      });
  },
});

export default offersSlice.reducer;
