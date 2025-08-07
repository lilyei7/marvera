# 🏗️ ESTRUCTURA UNIFICADA MARVERA

## 🌐 CONFIGURACIÓN DE PUERTOS (DEFINITIVA)

### DESARROLLO:
- **Frontend**: `http://localhost:5173` (Vite)
- **Backend**: `http://localhost:3001` (Express + TypeScript)
- **Base de datos**: SQLite local

### PRODUCCIÓN:
- **Frontend**: `https://marvera.mx` (Nginx)
- **Backend**: `https://marvera.mx/api` (Nginx proxy -> localhost:3001)
- **Base de datos**: SQLite producción

## 📡 API ENDPOINTS UNIFICADOS

### DESARROLLO:
```typescript
const API_BASE = 'http://localhost:3001/api'
```

### PRODUCCIÓN:
```typescript
const API_BASE = 'https://marvera.mx/api'
```

## 🗂️ ESTRUCTURA DE CARPETAS

```
marvera/
├── frontend/
│   ├── src/
│   │   ├── api/           # 🆕 Servicios API centralizados
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas principales
│   │   ├── config/        # 🔄 Configuración unificada
│   │   └── utils/         # Utilidades
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── routes/        # 🔄 Rutas API organizadas
│   │   ├── controllers/   # 🆕 Controladores lógica
│   │   ├── services/      # Servicios de negocio
│   │   ├── models/        # 🆕 Tipos y interfaces
│   │   ├── lib/          # Prisma y utilidades
│   │   └── index.ts      # Servidor principal
│   ├── prisma/           # Base de datos
│   └── package.json
└── shared/               # 🆕 Tipos compartidos
```

## 🔧 DEPENDENCIAS REQUERIDAS

### Frontend:
- React 19 + TypeScript
- Vite + Tailwind CSS
- Redux Toolkit (estado)
- React Router (navegación)

### Backend:
- Express + TypeScript
- Prisma ORM + SQLite
- CORS + Helmet (seguridad)
- Socket.IO (tiempo real)

### Librerías API:
- Axios (HTTP cliente)
- Zod (validación)
- React Query (cache)
