# 🚀 Guía de Deploy en Railway

## 📋 Prerequisitos

1. Cuenta en [Railway.app](https://railway.app/)
2. Proyecto conectado a GitHub
3. Base de datos PostgreSQL configurada en Railway

## 🔧 Configuración Inicial

### 1. Crear un Nuevo Proyecto en Railway

1. Ve a [Railway.app](https://railway.app/) e inicia sesión
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway para acceder a tu repositorio
5. Selecciona el repositorio `ProyectoFinalFAT`

### 2. Agregar Base de Datos PostgreSQL

1. En tu proyecto de Railway, haz clic en **"+ New"**
2. Selecciona **"Database" → "PostgreSQL"**
3. Railway creará automáticamente una base de datos
4. Copia la variable `DATABASE_URL` que se genera automáticamente

### 3. Configurar Variables de Entorno

En el dashboard de Railway, ve a tu servicio → **"Variables"** y agrega las siguientes:

```bash
# Database (se genera automáticamente al agregar PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# JWT y Sesiones
JWT_SECRET=tu-secreto-jwt-super-seguro-aqui
SESSION_SECRET=tu-secreto-sesion-super-seguro-aqui

# Puerto (Railway lo asigna automáticamente)
PORT=3001

# URL del Frontend (actualiza con tu dominio de Railway)
FRONTEND_URL=https://tu-app.up.railway.app

# OAuth - Google
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
GOOGLE_CALLBACK_URL=https://tu-app.up.railway.app/api/auth/google/callback

# OAuth - Twitter (opcional)
TWITTER_CONSUMER_KEY=tu-twitter-consumer-key
TWITTER_CONSUMER_SECRET=tu-twitter-consumer-secret
TWITTER_CALLBACK_URL=https://tu-app.up.railway.app/api/auth/twitter/callback

# Email Service (Nodemailer)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion-gmail
EMAIL_FROM=noreply@demos.com
EMAIL_SERVICE=gmail

# MercadoPago (opcional)
MP_ACCESS_TOKEN=tu-mercadopago-access-token
MP_PUBLIC_KEY=tu-mercadopago-public-key

# Environment
NODE_ENV=production
```

## 📦 Archivos de Configuración

El proyecto ya incluye los archivos necesarios para Railway:

### `railway.toml`
```toml
[build]
builder = "nixpacks"
buildCommand = "cd server && npx prisma generate && cd .. && pnpm run build"

[deploy]
startCommand = "node server/src/index.js"
healthcheckPath = "/health/db"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10
```

### `nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ["nodejs_20", "pnpm"]

[phases.install]
cmds = ["pnpm install --frozen-lockfile --prefer-offline"]

[phases.build]
cmds = [
  "cd server && npx prisma generate && cd ..",
  "pnpm run build"
]

[start]
cmd = "node server/src/index.js"
```

### `pnpm-workspace.yaml`
```yaml
packages:
  - 'server'

onlyBuiltDependencies:
  - '@prisma/client'
  - '@prisma/engines'
  - esbuild
  - prisma
```

## 🚢 Proceso de Deploy

### Deploy Automático

Railway detectará automáticamente los cambios en tu repositorio y realizará el deploy:

1. **Push a GitHub**:
   ```bash
   git add .
   git commit -m "Configurar para Railway"
   git push origin main
   ```

2. **Railway ejecutará**:
   - ✅ Instalación de dependencias con pnpm
   - ✅ Generación del cliente Prisma
   - ✅ Build del frontend con Vite
   - ✅ Aplicación de migraciones de base de datos

3. **Verificación**:
   - Ve al dashboard de Railway
   - Revisa los logs del deploy
   - Railway asignará automáticamente un dominio público

### Deploy Manual

Si prefieres ejecutar el deploy manualmente:

```bash
# 1. Instalar Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Link al proyecto
railway link

# 4. Deploy
railway up
```

## 🗄️ Migraciones de Base de Datos

Railway ejecutará automáticamente las migraciones durante el build. Si necesitas ejecutarlas manualmente:

### Opción 1: Usando Railway CLI
```bash
railway run npx prisma migrate deploy
```

### Opción 2: Desde el Dashboard
1. Ve a tu servicio en Railway
2. Click en **"Shell"** o **"Terminal"**
3. Ejecuta:
   ```bash
   cd server
   npx prisma migrate deploy
   npx prisma generate
   ```

### Sincronizar esquema sin migraciones
Si prefieres usar `db push` (no recomendado en producción):
```bash
railway run npx prisma db push
```

## 🔍 Verificación del Deploy

### 1. Verificar Endpoints

Prueba los siguientes endpoints en tu dominio de Railway:

```bash
# Health check general
https://tu-app.up.railway.app/

# Health check de base de datos
https://tu-app.up.railway.app/health/db

# API de autenticación
https://tu-app.up.railway.app/auth/status
```

### 2. Revisar Logs

En el dashboard de Railway:
1. Selecciona tu servicio
2. Ve a la pestaña **"Logs"**
3. Verifica que no haya errores

### 3. Probar Funcionalidades

- ✅ Registro de usuarios
- ✅ Verificación de email
- ✅ Login/Logout
- ✅ Recuperación de contraseña
- ✅ Edición de perfil
- ✅ Carga de imágenes

## 🐛 Troubleshooting

### Error: "packages field missing or empty"
**Solución**: Asegúrate de que `pnpm-workspace.yaml` contenga:
```yaml
packages:
  - 'server'
```

### Error: "Cannot install with frozen-lockfile"
**Solución**: Actualiza el lockfile localmente:
```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "Update lockfile"
git push
```

### Error: Versiones de Prisma no coinciden
**Solución**: Sincroniza las versiones en `package.json` y `server/package.json`:
```bash
# Actualizar en ambos archivos
"@prisma/client": "^6.18.0"
"prisma": "^6.18.0"

pnpm install
```

### Error: Base de datos no conecta
1. Verifica que `DATABASE_URL` esté correctamente configurada
2. Asegúrate de que la base de datos PostgreSQL está corriendo
3. Revisa que el healthcheck path esté funcionando:
   ```
   https://tu-app.up.railway.app/health/db
   ```

### Error: CORS bloqueando requests
1. Actualiza la variable `FRONTEND_URL` con tu dominio correcto
2. Verifica que el código incluya:
   ```javascript
   const allowedOrigins = [
     "http://localhost:3000",
     process.env.FRONTEND_URL,
   ].filter(Boolean);
   ```

### Error: Emails no se envían
1. Verifica las credenciales de Gmail en las variables de entorno
2. Asegúrate de usar una **contraseña de aplicación** de Google
3. Revisa los logs para errores SMTP específicos

### Build falla en Prisma generate
**Solución**: Asegúrate de que el buildCommand en `railway.toml` incluya:
```toml
buildCommand = "cd server && npx prisma generate && cd .. && pnpm run build"
```

## 🔄 Actualizaciones Posteriores

### Deploy Automático
Cada push a la rama `main` desplegará automáticamente:
```bash
git add .
git commit -m "Nueva funcionalidad"
git push origin main
```

### Rollback a Versión Anterior
En el dashboard de Railway:
1. Ve a **"Deployments"**
2. Selecciona un deploy anterior exitoso
3. Click en **"Rollback"**

## 📊 Monitoreo

### Métricas en Railway
Railway proporciona:
- 📈 **CPU Usage**: Uso de CPU
- 💾 **Memory Usage**: Uso de memoria
- 🌐 **Network**: Tráfico de red
- 📝 **Logs**: Logs en tiempo real

### Configurar Alertas
1. Ve a **"Settings"** → **"Observability"**
2. Configura alertas para:
   - CPU alto (>80%)
   - Memoria alta (>80%)
   - Errores críticos en logs

## 🔒 Seguridad en Producción

### Checklist de Seguridad

- ✅ **Variables de entorno**: Nunca commitear archivos `.env`
- ✅ **JWT_SECRET**: Usar secreto fuerte y único
- ✅ **DATABASE_URL**: Protegida por Railway
- ✅ **CORS**: Configurado solo para dominios específicos
- ✅ **HTTPS**: Railway lo proporciona automáticamente
- ✅ **Rate Limiting**: Considerar implementar para APIs
- ✅ **Validación de inputs**: Frontend y backend
- ✅ **Sanitización**: Prevenir XSS e inyección SQL

### Recomendaciones Adicionales

1. **Backups de Base de Datos**:
   - Railway hace backups automáticos
   - Considera exportar periódicamente con:
     ```bash
     railway run npx prisma db pull
     ```

2. **Monitoreo de Errores**:
   - Integrar Sentry o similar para tracking de errores
   - Configurar logs estructurados

3. **Performance**:
   - Usar Redis para caché (agregar servicio en Railway)
   - Optimizar queries de Prisma con `select` y `include`

## 🌐 Dominios Personalizados

### Agregar Dominio Custom

1. En Railway, ve a **"Settings"** → **"Domains"**
2. Click en **"Add Custom Domain"**
3. Ingresa tu dominio (ej: `demos.tudominio.com`)
4. Configura los DNS records en tu proveedor:
   ```
   CNAME: demos → tu-app.up.railway.app
   ```
5. Railway generará automáticamente el certificado SSL

### Actualizar Variables
Después de agregar dominio personalizado:
```bash
FRONTEND_URL=https://demos.tudominio.com
GOOGLE_CALLBACK_URL=https://demos.tudominio.com/api/auth/google/callback
TWITTER_CALLBACK_URL=https://demos.tudominio.com/api/auth/twitter/callback
```

## 📚 Recursos Adicionales

- [Railway Docs](https://docs.railway.app/)
- [Prisma Deploy Guide](https://www.prisma.io/docs/guides/deployment)
- [Nixpacks Documentation](https://nixpacks.com/)
- [pnpm Workspaces](https://pnpm.io/workspaces)

## 💡 Tips y Mejores Prácticas

1. **Usa branches para features**:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   # Desarrolla y prueba
   git push origin feature/nueva-funcionalidad
   # Crea Pull Request en GitHub
   ```

2. **Preview Deployments**:
   - Railway crea deploys preview automáticamente para PRs
   - Prueba cambios antes de merge a main

3. **Variables por entorno**:
   - Usa diferentes servicios en Railway para staging/production
   - Cada uno con sus propias variables de entorno

4. **Optimiza el bundle**:
   - El build de Vite ya está optimizado con code splitting
   - Verifica el tamaño del bundle en los logs

5. **Database Connection Pooling**:
   - Considera usar Prisma Accelerate para mejor performance
   - O configura connection pooling en PostgreSQL

---

¿Necesitas ayuda? Consulta los [logs en Railway](https://railway.app/) o revisa la [documentación oficial](https://docs.railway.app/).

**¡Feliz Deploy!** 🚀

