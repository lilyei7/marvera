# 🌊 MarVera - Sistema de Acceso Administrativo

## 🔐 Acceso al Panel de Administración

### Método 1: Acceso Directo (RECOMENDADO)
Visita la página de acceso directo:
```
http://localhost:5174/admin-access
```

### Método 2: Login desde el sitio web
1. Ve a la página principal: `http://localhost:5174`
2. Haz clic en "Iniciar Sesión" en la navegación
3. Usa las credenciales de admin

### 🔑 Credenciales de Administrador
```
Usuario: admin
Contraseña: admin
```

## 🎯 Funcionalidades del Panel Admin

### ✅ Panel Principal (`/admin`)
- **Dashboard con estadísticas**
  - Ventas totales
  - Productos en inventario
  - Pedidos pendientes
  - Clientes registrados

### ✅ Gestión de Productos
- **Crear nuevos productos**
- **Editar productos existentes**
- **Eliminar productos**
- **Gestión de categorías**
- **Control de inventario**

### ✅ Categorías Disponibles
- 🐟 Pescados
- 🦐 Camarones
- 🦪 Ostras
- 🦞 Langostas
- 🦀 Cangrejos
- 🐚 Moluscos
- 🌊 Otros

## 🌙 Modo Oscuro
- Botón de modo oscuro disponible en la navegación
- Se guarda la preferencia en localStorage
- Transiciones suaves entre temas

## 🛠️ Funcionalidades Implementadas

### ✅ Sistema de Autenticación
- Login/Registro de usuarios
- Verificación de roles (admin/customer)
- Persistencia de sesión con JWT

### ✅ E-commerce Completo
- Carrito de compras con animaciones
- Checkout de 3 pasos
- Gestión de productos por categorías
- Sistema de notificaciones

### ✅ Características Técnicas
- ✅ TypeScript sin errores
- ✅ Build de producción exitoso
- ✅ Modo oscuro completo
- ✅ Animaciones mejoradas (sin rebote molesto)
- ✅ Diseño responsivo
- ✅ Redux Toolkit para gestión de estado

## 🚀 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

## 📱 URLs de Navegación

| Página | URL | Descripción |
|--------|-----|-------------|
| Inicio | `/` | Página principal con productos destacados |
| Productos | `/products` | Catálogo completo con filtros |
| Admin Access | `/admin-access` | **Página de acceso directo al admin** |
| Admin Panel | `/admin` | Panel de administración (requiere login) |

---

### 🎉 ¡Todo Listo!
El sistema está completamente funcional con todas las características solicitadas implementadas.
