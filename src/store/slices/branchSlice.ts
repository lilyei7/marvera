import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl, API_CONFIG } from '../../config/api';


export interface Branch {
  id: number;
  name: string;
  address?: string | null;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string | null;
  email?: string;
  manager?: string;
  imageUrl?: string | null;
  images?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  operatingHours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  latitude?: number | null;
  longitude?: number | null;
  isActive?: boolean;
  openingHours?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface BranchState {
  branches: Branch[];
  loading: boolean;
  error: string | null;
}

// Async thunks
export const fetchBranches = createAsyncThunk(
  'branches/fetchBranches',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('🔍 Obteniendo sucursales desde:', getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_BRANCHES));
      console.log('🔑 Usando token:', token ? token.substring(0, 20) + '...' : 'No token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_BRANCHES), {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error obteniendo sucursales');
      }

      console.log('✅ Datos recibidos de sucursales v2.0:', data);
      
      // La API devuelve { success: true, data: [...], message: "..." }
      return data.data || data.branches || [];
    } catch (error) {
      console.error('❌ Error obteniendo sucursales:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

export const createBranch = createAsyncThunk(
  'branches/createBranch',
  async (branchData: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_BRANCHES_CREATE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(branchData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error creando sucursal');
      }

      // La API devuelve { success: true, data: {...}, message: "..." }
      return data.data || data.branch;
    } catch (error) {
      console.error('❌ Error creando sucursal:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

export const updateBranch = createAsyncThunk(
  'branches/updateBranch',
  async (branchData: Partial<Branch> & { id: number }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_BRANCHES_UPDATE(branchData.id.toString())), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(branchData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error actualizando sucursal');
      }

      // La API devuelve { success: true, data: {...}, message: "..." }
      return data.data || data.branch;
    } catch (error) {
      console.error('❌ Error actualizando sucursal:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

export const deleteBranch = createAsyncThunk(
  'branches/deleteBranch',
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_BRANCHES_DELETE(id.toString())), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error eliminando sucursal');
      }

      return id;
    } catch (error) {
      console.error('❌ Error eliminando sucursal:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

const initialState: BranchState = {
  branches: [],
  loading: false,
  error: null,
};

const branchSlice = createSlice({
  name: 'branches',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch branches
      .addCase(fetchBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loading = false;
        console.log('🔄 [branchSlice] fetchBranches.fulfilled - payload:', action.payload);
        console.log('🔄 [branchSlice] payload type:', typeof action.payload);
        console.log('🔄 [branchSlice] is array:', Array.isArray(action.payload));
        state.branches = action.payload;
        console.log('🔄 [branchSlice] state.branches updated to:', state.branches.length, 'items');
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create branch
      .addCase(createBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches.push(action.payload);
      })
      .addCase(createBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update branch
      .addCase(updateBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.branches.findIndex(branch => branch.id === action.payload.id);
        if (index !== -1) {
          state.branches[index] = action.payload;
        }
      })
      .addCase(updateBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete branch
      .addCase(deleteBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = state.branches.filter(branch => branch.id !== action.payload);
      })
      .addCase(deleteBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = branchSlice.actions;
export default branchSlice.reducer;
export type { BranchState };

