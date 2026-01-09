# Guía Post-Deploy - Después de hacer Git Pull

Después de ejecutar `git pull` en tu servidor AlmaLinux 9, sigue estos pasos en orden:

## 1. Instalar Dependencias (si hay nuevas)

```bash
pnpm install
```

**¿Por qué?** Verifica si hay nuevos paquetes en `package.json` y los instala.

## 2. Ejecutar Migraciones de Base de Datos

```bash
pnpm db:push
```

**¿Por qué?** Actualiza el esquema de la base de datos si hay cambios en `drizzle/schema.ts`.

## 3. Compilar el Proyecto

```bash
pnpm run build
```

**¿Por qué?** Genera los archivos optimizados para producción en la carpeta `dist/`.

## 4. Reiniciar la Aplicación

Si usas **PM2**:
```bash
pm2 restart la-hora-dropshipping
```

Si usas **systemd**:
```bash
sudo systemctl restart la-hora-dropshipping
```

Si ejecutas en **desarrollo** (Ctrl+C y luego):
```bash
pnpm run dev
```

---

## Resumen Rápido (Copiar y Pegar)

```bash
# Actualizar código
git pull

# Instalar dependencias
pnpm install

# Actualizar base de datos
pnpm db:push

# Compilar
pnpm run build

# Reiniciar (elige uno según tu setup)
pm2 restart la-hora-dropshipping
# O
sudo systemctl restart la-hora-dropshipping
```

---

## Verificar que Todo Funciona

Después de reiniciar, verifica que la aplicación esté funcionando:

```bash
# Ver logs de PM2
pm2 logs la-hora-dropshipping

# O ver logs de systemd
sudo journalctl -u la-hora-dropshipping -f

# O hacer una petición HTTP
curl http://localhost:3000
```

---

## Troubleshooting

### Error: "Port already in use"
```bash
# Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9
```

### Error: "Database connection failed"
Verifica que MySQL esté corriendo:
```bash
sudo systemctl status mysql
sudo systemctl start mysql
```

### Error: "Module not found"
Reinstala dependencias:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Error: "Build failed"
Limpia cache de build:
```bash
rm -rf dist .vite
pnpm run build
```

---

## Configurar Reinicio Automático (Opcional)

Si usas PM2, guarda la configuración para que se reinicie automáticamente al rebootear el servidor:

```bash
pm2 save
pm2 startup
```

---

## Monitoreo Continuo

Para monitorear la aplicación en tiempo real:

```bash
# Ver estado de PM2
pm2 status

# Ver logs en vivo
pm2 logs la-hora-dropshipping --lines 100

# Ver métricas
pm2 monit
```
