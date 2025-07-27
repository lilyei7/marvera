# 🚀 MarVera - Guía de Despliegue en Servidor Linux

## Configuración para Acceso Público en IP: 187.33.155.127

### 📋 Requisitos Previos
- Servidor Linux con acceso SSH
- Node.js 18+ instalado
- Git instalado
- Puertos 3001 y 5173 disponibles

---

## 🔧 Configuración Automática

### Opción 1: Script Automático (Recomendado)

```bash
# En el servidor Linux
git clone https://github.com/lilyei7/marvera.git
cd marvera

# Ejecutar configuración automática
chmod +x deploy-server.sh
bash deploy-server.sh
```

---

## ⚙️ Configuración Manual

### Paso 1: Clonar y Preparar

```bash
# Clonar repositorio
git clone https://github.com/lilyei7/marvera.git
cd marvera
```

### Paso 2: Configurar Firewall

```bash
# Abrir puertos necesarios
sudo ufw allow 5173/tcp  # Frontend (Vite)
sudo ufw allow 3001/tcp  # Backend (Express)

# Verificar configuración
sudo ufw status
```

### Paso 3: Configurar Variables de Entorno

```bash
# Editar archivo .env
nano .env
```

**Contenido del archivo `.env`:**
```env
VITE_API_URL=http://187.33.155.127:3001
VITE_MAPBOX_TOKEN=pk.test.placeholder
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
VITE_SOCKET_URL=http://187.33.155.127:3001
```

### Paso 4: Instalar Dependencias

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

---

## 🚀 Ejecutar la Aplicación

### Opción A: Usando Screen/Tmux (Recomendado para producción)

```bash
# Instalar screen si no está disponible
sudo apt install screen

# Crear sesión para backend
screen -S marvera-backend
cd backend && npm run dev
# Presionar Ctrl+A, luego D para separar

# Crear sesión para frontend
screen -S marvera-frontend
npm run dev
# Presionar Ctrl+A, luego D para separar

# Ver sesiones activas
screen -ls

# Reconectarse a una sesión
screen -r marvera-backend
screen -r marvera-frontend
```

### Opción B: Terminales Separadas

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

## 🌐 Acceso a la Aplicación

Una vez que ambos servidores estén corriendo:

- **🎨 Frontend (App Principal):** http://187.33.155.127:5173/
- **📊 API Backend:** http://187.33.155.127:3001/api/health
- **👑 Panel de Admin:** http://187.33.155.127:5173/admin
- **🛍️ Catálogo de Productos:** http://187.33.155.127:5173/products

---

## 🔍 Verificación y Troubleshooting

### Verificar Puertos Activos

```bash
# Verificar que los puertos estén escuchando
ss -tuln | grep 5173  # Frontend
ss -tuln | grep 3001  # Backend

# Debe mostrar algo como:
# tcp   LISTEN 0    511    0.0.0.0:5173    0.0.0.0:*
# tcp   LISTEN 0    511    0.0.0.0:3001    0.0.0.0:*
```

### Verificar Configuración de Firewall

```bash
sudo ufw status verbose
```

### Ver Logs en Tiempo Real

```bash
# Logs del backend
cd backend && npm run dev

# Logs del frontend
npm run dev
```

### Solución de Problemas Comunes

#### Problema: "Puerto en uso"
```bash
# Encontrar proceso usando el puerto
sudo lsof -i :5173
sudo lsof -i :3001

# Matar proceso si es necesario
sudo kill -9 <PID>
```

#### Problema: "Conexión rechazada"
1. Verificar que el firewall permita los puertos
2. Confirmar que el servidor esté escuchando en 0.0.0.0
3. Verificar que no haya un proxy/balanceador bloqueando

#### Problema: "CORS Error"
- Verificar que el archivo `.env` tenga la IP correcta
- Reiniciar ambos servidores después de cambiar variables de entorno

---

## 👤 Credenciales de Admin

**Para acceder al panel de administración:**
- **URL:** http://187.33.155.127:5173/admin
- **Email:** admin@marvera.com
- **Contraseña:** admin123

---

## 🔄 Actualizar Código

```bash
# Detener servidores (Ctrl+C en cada terminal)

# Actualizar código
git pull origin main

# Reinstalar dependencias si es necesario
npm install
cd backend && npm install && cd ..

# Reiniciar servidores
```

---

## 📝 Notas Importantes

1. **Seguridad:** Cambiar las credenciales de admin en producción
2. **SSL:** Para producción, configurar HTTPS con certificados SSL
3. **Base de datos:** El proyecto usa SQLite, los datos se guardan en `backend/database.sqlite`
4. **Archivos subidos:** Se almacenan en `backend/uploads/`
5. **Logs:** Revisar logs regularmente para detectar problemas

---

## 🆘 Soporte

Si encuentras problemas durante el despliegue:

1. Verificar los logs de ambos servidores
2. Confirmar que todos los puertos estén abiertos
3. Verificar la configuración del archivo `.env`
4. Comprobar que Node.js esté actualizado (v18+)

**Estado esperado del servidor:**
- ✅ Puerto 5173 escuchando (Frontend)
- ✅ Puerto 3001 escuchando (Backend)
- ✅ Firewall configurado
- ✅ Variables de entorno actualizadas
- ✅ Aplicación accesible desde IP pública
