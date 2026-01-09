# Guía de Instalación - La Hora de las Compras

Esta guía te ayudará a desplegar la plataforma de dropshipping en un servidor AlmaLinux 9 de forma rápida y sencilla.

## Requisitos Previos

- Node.js 22+ instalado
- MySQL 8.0+ o compatible
- Git instalado
- Un servidor AlmaLinux 9 (o similar)

## Pasos de Instalación

### 1. Clonar el Repositorio

```bash
git clone <tu-repositorio-github> la-hora-dropshipping
cd la-hora-dropshipping
```

### 2. Instalar Dependencias

```bash
pnpm install
```

Si no tienes `pnpm` instalado:
```bash
npm install -g pnpm
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores:

```env
# Base de Datos
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/la_hora_dropshipping"

# JWT
JWT_SECRET="tu-clave-secreta-muy-larga-y-aleatoria-cambiar-en-produccion"

# Email (Nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-contraseña-app"
SMTP_FROM="noreply@lahoracompras.com"

# URLs
VITE_APP_TITLE="La Hora de las Compras"
VITE_APP_LOGO="/logo.svg"
```

### 4. Crear Base de Datos

```bash
mysql -u root -p -e "CREATE DATABASE la_hora_dropshipping CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 5. Ejecutar Migraciones

```bash
pnpm db:push
```

### 6. Compilar el Proyecto

```bash
pnpm run build
```

### 7. Iniciar el Servidor

**Desarrollo:**
```bash
pnpm run dev
```

**Producción (con PM2):**
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar la aplicación
pm2 start dist/index.js --name "la-hora-dropshipping"

# Guardar configuración de PM2
pm2 save

# Habilitar inicio automático
pm2 startup
```

## Configuración de Nginx (Producción)

Crea `/etc/nginx/sites-available/la-hora-dropshipping`:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Habilitar el sitio:
```bash
sudo ln -s /etc/nginx/sites-available/la-hora-dropshipping /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Autenticación Local

La plataforma ahora usa **autenticación local** con email/password:

- **Registro:** Los nuevos usuarios se registran en `/login` con email y contraseña
- **Inicio de Sesión:** Email + contraseña de 6+ caracteres
- **Tokens:** JWT con expiración de 7 días
- **Sin dependencias externas:** No requiere OAuth de Manus.ai

## Primeros Pasos

1. Accede a `http://tu-servidor:3000`
2. Haz clic en "Iniciar Sesión" o "Crear Cuenta"
3. Registra tu primer usuario (será un dropshipper)
4. Para crear un usuario administrador, ejecuta:

```bash
mysql la_hora_dropshipping -e "UPDATE users SET role='admin' WHERE email='tu-email@example.com';"
```

5. Accede al panel de administración en `/admin`

## Troubleshooting

### Error: "Field 'email' doesn't have a default value"

Asegúrate de que la base de datos está actualizada:
```bash
pnpm db:push
```

### Error: "Cannot find module"

Reinstala las dependencias:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Puerto 3000 en uso

Cambia el puerto en el archivo de inicio:
```bash
PORT=3001 pnpm run dev
```

## Características Principales

✅ **Autenticación Local:** Email/password sin OAuth externo
✅ **Panel de Dropshipper:** Dashboard con métricas y billetera virtual
✅ **Catálogo de Productos:** Precios mayoristas y márgenes de ganancia
✅ **Sistema de Órdenes:** Seguimiento completo de ventas
✅ **Notificaciones por Email:** Confirmaciones automáticas
✅ **Soporte WhatsApp:** Botón flotante integrado
✅ **Panel de Administración:** Gestión completa de usuarios y productos
✅ **RBAC:** Control de acceso basado en roles

## Soporte

Para soporte técnico, contacta a través de:
- WhatsApp: +595 994715200
- Email: soporte@lahoracompras.com

## Licencia

Todos los derechos reservados © 2024 La Hora de las Compras
