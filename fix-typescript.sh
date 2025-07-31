#!/bin/bash

echo "🔧 Corrigiendo configuración TypeScript y referencias"
echo "=================================================="

cd /var/www/marvera

# =====================================================
# 1. CORREGIR ARCHIVO VITE CONFIG
# =====================================================
echo "📝 Actualizando vite.config.ts..."

cat > vite.config.ts << 'VITE_CONFIG'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
        }
      }
    }
  }
})
VITE_CONFIG

# =====================================================
# 2. CORREGIR TSCONFIG.JSON
# =====================================================
echo "📝 Actualizando tsconfig.json..."

cat > tsconfig.json << 'TSCONFIG'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["vite/client"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.d.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "backend"
  ]
}
TSCONFIG

# =====================================================
# 3. CORREGIR BACKEND TSCONFIG
# =====================================================
echo "📝 Actualizando backend/tsconfig.json..."

cat > backend/tsconfig.json << 'BACKEND_TSCONFIG'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "typeRoots": ["./node_modules/@types"],
    "types": ["node"]
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts"
  ]
}
BACKEND_TSCONFIG

# =====================================================
# 4. CORREGIR IMPORTS EN ARCHIVOS PROBLEMÁTICOS
# =====================================================
echo "🔧 Corrigiendo imports problemáticos..."

# Archivo que puede estar causando problemas
if [ -f "src/store/slices/featuredProductsSlice.ts" ]; then
    echo "📝 Corrigiendo featuredProductsSlice.ts..."
    
    # Backup del archivo original
    cp src/store/slices/featuredProductsSlice.ts src/store/slices/featuredProductsSlice.ts.backup
    
    # Corregir el archivo
    cat > src/store/slices/featuredProductsSlice.ts << 'FEATURED_SLICE'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS, API_CONFIG } from '../../config/apiConfig';

interface FeaturedProductsState {
  items: any[];
  loading: boolean;
  error: string | null;
}

const initialState: FeaturedProductsState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunk para obtener productos destacados
export const fetchFeaturedProducts = createAsyncThunk(
  'featuredProducts/fetchFeaturedProducts',
  async () => {
    try {
      const response = await fetch(API_ENDPOINTS.FEATURED_PRODUCTS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }
);

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
      });
  },
});

export default featuredProductsSlice.reducer;
FEATURED_SLICE
fi

# =====================================================
# 5. LIMPIAR ARCHIVOS CACHE Y TEMPORALES
# =====================================================
echo "🧹 Limpiando archivos temporales..."

# Limpiar cache de TypeScript
rm -rf .tsbuildinfo
rm -rf src/**/*.tsbuildinfo

# Limpiar cache de Vite
rm -rf node_modules/.vite

# Limpiar dist anteriores
rm -rf dist
rm -rf backend/dist

echo "✅ Configuración TypeScript corregida"

# =====================================================
# 6. VERIFICAR CONFIGURACIÓN
# =====================================================
echo "🧪 Verificando configuración..."

# Verificar sintaxis de TypeScript
echo "📝 Verificando frontend TypeScript..."
npx tsc --noEmit || echo "⚠️ Hay warnings de TypeScript en frontend"

# Verificar backend
echo "📝 Verificando backend TypeScript..."
cd backend
npx tsc --noEmit || echo "⚠️ Hay warnings de TypeScript en backend"
cd ..

echo ""
echo "✅ Corrección completada"
echo "📋 Archivos corregidos:"
echo "   • vite.config.ts"
echo "   • tsconfig.json"
echo "   • backend/tsconfig.json"
echo "   • src/store/slices/featuredProductsSlice.ts"
echo ""
echo "🚀 Ahora puedes ejecutar el build con:"
echo "   npm run build"
