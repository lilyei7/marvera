# 🚀 MarVera - Guía de Despliegue con Nginx

## Configuración para Acceso Público en IP: 187.33.155.127

### 📋 Requisitos Previos
- Servidor Linux con acceso SSH
- Node.js 18+ instalado
- Git instalado
- Nginx (se instalará automáticamente)

---

## 🔧 Configuración Automática con Nginx (RECOMENDADO)

### Instalación Completa de Un Solo Comando

```bash
# En el servidor Linux (187.33.155.127)
git clone https://github.com/lilyei7/marvera.git
cd marvera

# Ejecutar configuración completa con nginx
chmod +x deploy-server.sh
sudo bash deploy-server.sh
```

**¡Esto configurará TODO automáticamente:**
- ✅ Nginx como proxy reverso
- ✅ Firewall (puertos 80, 8080)
- ✅ Variables de entorno
- ✅ Servicios systemd
- ✅ Dependencias

---

## 🌐 Acceso a la Aplicación

Una vez completada la instalación automática:

- **🎨 Frontend (Principal):** http://187.33.155.127/
- **👑 Panel de Admin:** http://187.33.155.127/admin
- **📊 API Health Check:** http://187.33.155.127/api/health
- **🛍️ Catálogo:** http://187.33.155.127/products
- **🔄 Backup (Puerto 8080):** http://187.33.155.127:8080/

---

## ⚙️ Configuración Manual (Si necesitas hacerlo paso a paso)

### Paso 1: Instalar Nginx

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Paso 2: Configurar Nginx

```bash
# Copiar configuración de nginx
sudo cp nginx-marvera.conf /etc/nginx/sites-available/marvera
sudo ln -sf /etc/nginx/sites-available/marvera /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t
sudo systemctl reload nginx
```

### Paso 3: Configurar Firewall

```bash
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 8080/tcp  # Backup
sudo ufw status
```

### Paso 4: Variables de Entorno

```bash
# Archivo .env (ya configurado)
cat > .env << EOF
VITE_API_URL=http://187.33.155.127
VITE_MAPBOX_TOKEN=pk.test.placeholder
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
VITE_SOCKET_URL=http://187.33.155.127
EOF
```

### Paso 5: Instalar y Ejecutar

```bash
# Instalar dependencias
npm install
cd backend && npm install && cd ..

# Crear y ejecutar servicios
sudo bash deploy-server.sh services
```

---

## � Gestión de Servicios

### Ver Estado de Servicios

```bash
# Estado de todos los servicios
sudo systemctl status nginx marvera-backend marvera-frontend

# Ver logs en tiempo real
sudo journalctl -u marvera-backend -f    # Backend
sudo journalctl -u marvera-frontend -f   # Frontend
sudo tail -f /var/log/nginx/marvera_error.log  # Nginx
```

### Reiniciar Servicios

```bash
# Reiniciar individual
sudo systemctl restart marvera-backend
sudo systemctl restart marvera-frontend
sudo systemctl restart nginx

# Reiniciar todo
sudo systemctl restart nginx marvera-backend marvera-frontend
```

### Detener/Iniciar Servicios

```bash
# Detener
sudo systemctl stop marvera-backend marvera-frontend

# Iniciar
sudo systemctl start marvera-backend marvera-frontend
```

---

## 🔍 Verificación y Troubleshooting

### Verificar Que Todo Funciona

```bash
# Verificar puertos
sudo ss -tuln | grep -E "(80|8080|5173|3001)"

# Verificar nginx
sudo nginx -t
curl -I http://187.33.155.127/

# Verificar servicios
bash deploy-server.sh check
```

### Problemas Comunes

#### 1. "502 Bad Gateway"
```bash
# Verificar que backend y frontend estén corriendo
sudo systemctl status marvera-backend marvera-frontend

# Reiniciar servicios
sudo systemctl restart marvera-backend marvera-frontend
```

#### 2. "Connection Refused"
```bash
# Verificar firewall
sudo ufw status

# Verificar nginx
sudo systemctl status nginx
sudo nginx -t
```

#### 3. "CORS Errors"
```bash
# Verificar variables de entorno
cat .env

# Reiniciar todo
sudo systemctl restart nginx marvera-backend marvera-frontend
```

---

## 🔄 Actualizar Código

```bash
# Detener servicios
sudo systemctl stop marvera-backend marvera-frontend

# Actualizar código
git pull origin main
npm install
cd backend && npm install && cd ..

# Reiniciar servicios
sudo systemctl start marvera-backend marvera-frontend
sudo systemctl restart nginx
```

---

## � Credenciales de Admin

- **URL:** http://187.33.155.127/admin
- **Email:** admin@marvera.com
- **Contraseña:** admin123

---

## 🛡️ Arquitectura Final

```
Internet → Puerto 80 → Nginx → Puerto 5173 (Frontend)
                    ├─────→ Puerto 3001 (Backend API)
                    └─────→ WebSocket (Socket.IO)
```

**Ventajas de usar Nginx:**
- ✅ Un solo puerto público (80)
- ✅ Proxy reverso automático
- ✅ Manejo de WebSockets
- ✅ Logs centralizados
- ✅ Mayor estabilidad

---

## 📝 Comandos de Diagnóstico

```bash
# Ver todos los logs
sudo journalctl -u nginx -u marvera-backend -u marvera-frontend -f

# Verificar conectividad completa
curl http://187.33.155.127/api/health

# Estado completo del sistema
bash deploy-server.sh check
```
