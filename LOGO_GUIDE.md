# 🎨 Guía de Ubicación del Logo - MarVera

## 📍 **Lugares Principales para Colocar el Logo:**

### 1. **Navigation.tsx - Logo Principal** ✅ **YA IMPLEMENTADO**
**Ubicación**: Barra de navegación superior
**Archivo**: `src/components/Navigation.tsx` (línea ~38)
```tsx
<img 
  src="/logo.png" 
  alt="MarVera Logo" 
  className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 object-contain transition-transform duration-300 group-hover:scale-110"
/>
```

### 2. **HomePage.tsx - Hero Section**
**Ubicación**: Sección principal de la página de inicio
**Archivo**: `src/pages/HomePage.tsx` (línea ~35)
```tsx
{/* En el hero section, reemplazar el texto */}
<img 
  src="/logo-hero.png" 
  alt="MarVera" 
  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 object-contain mx-auto mb-4"
/>
```

### 3. **AuthModal.tsx - Modal de Login**
**Ubicación**: Parte superior del modal de autenticación
**Archivo**: `src/components/AuthModal.tsx` (línea ~82)
```tsx
{/* Añadir antes del título */}
<div className="text-center mb-4">
  <img 
    src="/logo.png" 
    alt="MarVera Logo" 
    className="h-12 w-12 mx-auto mb-2"
  />
</div>
```

### 4. **AdminPanel.tsx - Panel de Administración**
**Ubicación**: Header del panel admin
**Archivo**: `src/components/AdminPanel.tsx` (línea ~137)
```tsx
{/* Reemplazar el emoji 👨‍💼 */}
<img 
  src="/logo-admin.png" 
  alt="MarVera Admin" 
  className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 object-contain"
/>
```

### 5. **CheckoutModal.tsx - Header del Checkout**
**Ubicación**: Header del modal de checkout
**Archivo**: `src/components/CheckoutModal.tsx` (línea ~104)
```tsx
{/* Añadir junto al título */}
<div className="flex items-center space-x-3">
  <img 
    src="/logo.png" 
    alt="MarVera Logo" 
    className="h-8 w-8 object-contain"
  />
  <div>
    <h2 className="text-2xl font-bold">Finalizar Compra</h2>
    <p className="text-light">Paso {step} de 3</p>
  </div>
</div>
```

## 📁 **Dónde Colocar las Imágenes del Logo:**

### **Opción 1: Carpeta Public (RECOMENDADO)**
```
marvera/
├── public/
│   ├── logo.png           # Logo principal
│   ├── logo-hero.png      # Logo para hero section (más grande)
│   ├── logo-admin.png     # Logo para admin panel
│   └── favicon.ico        # Icono del navegador
```

### **Opción 2: Carpeta Assets**
```
marvera/
├── src/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── logo.png
│   │   │   ├── logo-hero.png
│   │   │   └── logo-admin.png
```

## 🎯 **Formatos y Tamaños Recomendados:**

### **Logo Principal (Navigation)**
- **Formato**: PNG con fondo transparente
- **Tamaño**: 120x120px o 200x200px
- **Ratio**: Cuadrado o rectangular (2:1)

### **Logo Hero (HomePage)**
- **Formato**: PNG/SVG
- **Tamaño**: 400x400px o más grande
- **Ratio**: Cuadrado preferible

### **Favicon**
- **Formato**: ICO, PNG
- **Tamaño**: 32x32px, 64x64px
- **Ubicación**: `public/favicon.ico`

## 🔧 **Cómo Implementar:**

### **Paso 1: Añadir tu logo**
1. Guarda tu archivo de logo como `logo.png` en la carpeta `public/`
2. Si usas la carpeta `src/assets/`, importa la imagen:
```tsx
import logo from '../assets/images/logo.png';
```

### **Paso 2: Actualizar el código**
- **Para public/**: usa `src="/logo.png"`
- **Para assets/**: usa `src={logo}`

### **Paso 3: Estilos responsivos**
```tsx
className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 object-contain"
```

## 🌊 **Ejemplo de Implementación Completa:**

```tsx
// Navegación con logo responsivo
<Link to="/" className="flex items-center space-x-2 group">
  <img 
    src="/logo.png" 
    alt="MarVera - Premium Seafood" 
    className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 object-contain transition-transform duration-300 group-hover:scale-110"
  />
  <span className="hidden sm:block text-xl font-bold text-primary">
    MarVera
  </span>
</Link>
```

## 💡 **Tips Adicionales:**

1. **Fallback**: Siempre incluye texto alternativo
2. **Performance**: Optimiza las imágenes (usa WebP si es posible)
3. **Accesibilidad**: Incluye `alt` descriptivo
4. **Responsive**: Usa clases Tailwind para diferentes tamaños
5. **Hover Effects**: Añade `group-hover:scale-110` para interactividad

---

### 🎨 **El logo ya está implementado en Navigation.tsx**
Simplemente coloca tu archivo `logo.png` en la carpeta `public/` y se mostrará automáticamente.
