# 🔧 MARVERA - CONFIGURACIÓN API UNIFICADA ✅

## ✅ **Cambios Realizados:**

### 🎯 **1. Archivo Principal: `src/config/api.ts`**
- **Base URL Unificada**: `https://marvera.mx` (sin www para consistencia)
- **Configuración centralizada** con todos los endpoints
- **Funciones helper** para construir URLs
- **Validación automática** de configuración

### 📋 **2. Endpoints Disponibles:**

#### **🌐 PÚBLICOS (Sin autenticación)**
```typescript
HEALTH: '/api/health'
PRODUCTS: '/api/products'
PRODUCTS_FEATURED: '/api/products/featured'
CATEGORIES: '/api/categories'
OFFERS: '/api/offers'
OFFERS_FEATURED: '/api/offers/featured'
SLIDESHOW: '/api/slideshow'
SLIDESHOW_ALL: '/api/slideshow/all'
BRANCHES: '/api/branches/public'
WHOLESALE_PRODUCTS: '/api/wholesale-products'
```

#### **🔐 ADMIN (Requieren autenticación)**
```typescript
// Autenticación
AUTH_LOGIN: '/api/auth/login'
AUTH_REGISTER: '/api/auth/register'
AUTH_VERIFY: '/api/auth/verify'
AUTH_LOGOUT: '/api/auth/logout'

// Admin - Productos
ADMIN_PRODUCTS: '/api/admin/products'
ADMIN_PRODUCTS_CREATE: '/api/admin/products'
ADMIN_PRODUCTS_UPDATE: (id) => `/api/admin/products/${id}`
ADMIN_PRODUCTS_DELETE: (id) => `/api/admin/products/${id}`

// Admin - Sucursales
ADMIN_BRANCHES: '/api/branches'
ADMIN_BRANCHES_CREATE: '/api/branches'
ADMIN_BRANCHES_UPDATE: (id) => `/api/branches/${id}`
ADMIN_BRANCHES_DELETE: (id) => `/api/branches/${id}`
ADMIN_BRANCHES_UPLOAD: '/api/branches/upload-image'

// Admin - Usuarios
ADMIN_USERS: '/api/admin/users'
ADMIN_USERS_STATS: '/api/admin/users/stats'

// Admin - Ofertas
ADMIN_OFFERS: '/api/admin/offers'
ADMIN_OFFERS_CREATE: '/api/admin/offers'
ADMIN_OFFERS_UPDATE: (id) => `/api/admin/offers/${id}`
ADMIN_OFFERS_DELETE: (id) => `/api/admin/offers/${id}`
```

### 📁 **3. Archivos Actualizados:**

#### ✅ **Redux Slices Unificados:**
- `authSlice.ts` - Usa `getApiUrl(API_CONFIG.ENDPOINTS.AUTH_LOGIN)`
- `branchSlice.ts` - Usa `getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_BRANCHES)`
- `offersSlice.ts` - Usa `getApiUrl(API_CONFIG.ENDPOINTS.OFFERS_FEATURED)`
- `productsSlice.ts` - Usa `getApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS)`
- `featuredProductsSlice.ts` - Usa configuración unificada

#### ✅ **Servicios Actualizados:**
- `adminProductsApi.ts` - Usa `API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS`

### 🛠️ **4. Funciones Helper:**

```typescript
// Función principal para construir URLs
getApiUrl(endpoint: string): string

// Función para endpoints predefinidos
getEndpointUrl(endpointKey): string

// Función para assets
getAssetUrl(path: string): string
```

### ⚙️ **5. Configuración Adicional:**

```typescript
API_SETTINGS = {
  TIMEOUT: 10000,
  HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  MULTIPART_HEADERS: {
    'Accept': 'application/json'
  }
}
```

## 🎯 **Cómo Usar:**

### **En componentes React:**
```typescript
import { getApiUrl, API_CONFIG } from '../config/api';

// Para endpoints fijos
const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS));

// Para endpoints con parámetros
const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_PRODUCTS_UPDATE('123')));
```

### **En Redux slices:**
```typescript
import { getApiUrl, API_CONFIG } from '../../config/api';

const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH_LOGIN), {
  method: 'POST',
  headers: API_SETTINGS.HEADERS,
  body: JSON.stringify(credentials)
});
```

## ✅ **Estado Final:**
- ✅ **Configuración unificada** - Un solo archivo de fuente de verdad
- ✅ **Consistencia** - Todas las URLs usan https://marvera.mx
- ✅ **Flexibilidad** - Endpoints parametrizables con funciones
- ✅ **Validación** - Verificación automática de configuración
- ✅ **Compatibilidad** - Mantiene la función getApiUrl() existente

## 🔄 **Próximos Pasos:**
1. Construir y desplegar el frontend actualizado
2. Verificar que todos los endpoints funcionen correctamente
3. Probar tanto panel admin como interfaz cliente
4. Eliminar archivos de configuración obsoletos
