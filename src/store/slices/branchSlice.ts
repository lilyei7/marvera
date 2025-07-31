import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Branch {
  id: number;
  name: string;
  address?: string | null;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isActive: boolean;
  openingHours?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface BranchState {
  branches: Branch[];
  loading: boolean;
  error: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';

// Async thunks
export const fetchBranches = createAsyncThunk(
  'branches/fetchBranches',
  async (_, { rejectWithValue }) => {
    try {
      // Intentar con endpoint autenticado primero
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('🔍 No hay token, usando endpoint público');
        // Si no hay token, usar endpoint público
        const response = await fetch(`${API_BASE_URL}/api/branches/public`);
        const data = await response.json();
        if (response.ok) {
          return data.branches || data || [];
        }
      }

      console.log('🔍 Obteniendo sucursales desde:', `${API_BASE_URL}/api/branches`);
      console.log('🔑 Usando token:', token ? token.substring(0, 20) + '...' : 'No token');
      
      // Intentar endpoint autenticado
      let response = await fetch(`${API_BASE_URL}/api/branches`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Si falla la autenticación, intentar endpoint de debug
      if (response.status === 401 || response.status === 403) {
        console.log('🔄 Error de autenticación, intentando endpoint de debug...');
        response = await fetch(`${API_BASE_URL}/api/branches/debug`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error obteniendo sucursales');
      }

      console.log('✅ Datos recibidos de sucursales:', data);
      return data.branches || [];
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
      const response = await fetch(`${API_BASE_URL}/api/branches`, {
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

      return data.branch;
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
      const response = await fetch(`${API_BASE_URL}/api/branches/${branchData.id}`, {
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

      return data.branch;
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
      const response = await fetch(`${API_BASE_URL}/api/branches/${id}`, {
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
        state.branches = action.payload;
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
