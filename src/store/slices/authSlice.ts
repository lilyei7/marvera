import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const API_BASE_URL = import.meta.env.DEV ? 'https://marvera.mx' : 'https://marvera.mx';

import type { AuthState, LoginRequest, RegisterRequest } from '../../types';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error en el login');
      }

      // Guardar token en localStorage
      if (data.token) {
        console.log('💾 Guardando token en localStorage:', data.token.substring(0, 20) + '...');
        localStorage.setItem('token', data.token);
      }

      console.log('✅ Login exitoso, usuario:', data.user);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de conexión');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Error en el registro');
      }

      // Guardar token en localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de conexión');
    }
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verify',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 [verifyToken] Iniciando verificación...');
      
      if (!token) {
        console.log('❌ [verifyToken] No hay token');
        return rejectWithValue('No hay token');
      }

      console.log('📡 [verifyToken] Enviando request a API...');
      
      // Crear AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ [verifyToken] Timeout - cancelando request');
        controller.abort();
      }, 10000); // 10 segundos timeout

      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('📡 [verifyToken] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        console.error('❌ [verifyToken] Response error:', errorData);
        localStorage.removeItem('token');
        return rejectWithValue(errorData.message || 'Token inválido');
      }

      const data = await response.json();
      console.log('✅ [verifyToken] Verificación exitosa:', data.user?.email);

      return {
        user: data.user,
        token: token
      };
    } catch (error: any) {
      console.error('❌ [verifyToken] Error caught:', error.message);
      
      if (error.name === 'AbortError') {
        console.log('⏰ [verifyToken] Request cancelado por timeout');
        return rejectWithValue('Timeout en verificación');
      }
      
      localStorage.removeItem('token');
      return rejectWithValue(error.message || 'Error de conexión');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      localStorage.removeItem('token');
      return {};
    } catch (error: any) {
      localStorage.removeItem('token');
      return {};
    }
  }
);

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Verify token
    builder
      .addCase(verifyToken.pending, (state) => {
        console.log('🔄 [Redux] verifyToken.pending');
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        console.log('✅ [Redux] verifyToken.fulfilled:', action.payload.user?.email);
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token || state.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        console.log('❌ [Redux] verifyToken.rejected:', action.payload);
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer;

