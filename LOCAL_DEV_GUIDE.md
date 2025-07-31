# MarVera - Guía de Desarrollo Local

## Introducción

Esta guía explica cómo ejecutar MarVera en modo desarrollo local cuando el servidor remoto no está disponible o hay problemas de conexión.

## Opciones de configuración

Hay dos modos de desarrollo disponibles:

1. **Modo Remoto**: Conecta con el servidor backend real en `187.33.155.127:3001`
2. **Modo Local**: Utiliza un servidor backend local simulado en `localhost:3001`

## Iniciar el servidor local

Para iniciar el servidor backend local:

```bash
# En Windows
start-local.bat

# En terminal (Windows/Linux/Mac)
node server-local.js
```

## Configuración del entorno

El archivo `.env.local` controla la configuración de conexión:

- `VITE_API_URL` - URL base de la API (usa `http://localhost:3001` para modo local)
- `VITE_BACKEND_URL` - URL del servidor backend remoto
- `VITE_ENABLE_FALLBACK` - Si se debe usar datos fallback cuando el servidor no responde
- `VITE_API_TIMEOUT` - Tiempo máximo de espera para peticiones (en ms)

## Datos de prueba

### Usuarios

- **Admin**: admin@marvera.com / admin123456
- **Cliente**: cliente@ejemplo.com / password123

### Productos

El servidor local incluye 5 productos de prueba con todas sus propiedades.

## Endpoints disponibles

### Productos
- `GET /api/products` - Listar todos los productos
- `GET /api/products/featured` - Obtener productos destacados
- `GET /api/products/:id` - Obtener un producto por ID
- `GET /api/products/search/:query` - Buscar productos

### Categorías
- `GET /api/categories` - Listar todas las categorías
- `GET /api/categories/:name/products` - Obtener productos por categoría

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/register` - Registrar nuevo usuario

### Sucursales
- `GET /api/branches` - Listar todas las sucursales
- `GET /api/branches/:id` - Obtener una sucursal por ID

### Pedidos
- `POST /api/orders` - Crear un nuevo pedido
- `GET /api/orders` - Listar pedidos del usuario actual
- `GET /api/orders/:id` - Obtener un pedido por ID

### Otros
- `GET /api/health` - Verificar estado del servidor

## Solución de problemas

Si encuentras errores:

1. Asegúrate de que el servidor local está en ejecución
2. Verifica que `.env.local` esté configurado para usar `http://localhost:3001`
3. Verifica la consola del navegador para ver mensajes de error
4. Reinicia tanto el servidor local como el frontend
