# 🚀 Railway Deploy - Guía Rápida

## ⚡ Deploy en 5 Pasos

### 1️⃣ Push a GitHub
```bash
git add .
git commit -m "Preparar para Railway deploy"
git push origin main
```

### 2️⃣ Crear Proyecto en Railway
1. Ve a [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Selecciona tu repositorio

### 3️⃣ Agregar PostgreSQL
1. En tu proyecto, click **"+ New"**
2. Selecciona **"Database" → "PostgreSQL"**
3. Copia el `DATABASE_URL` generado

### 4️⃣ Configurar Variables de Entorno
En **Variables**, agrega las siguientes (mínimo requerido):

```env
DATABASE_URL=<copiado del paso anterior>
JWT_SECRET=un-secreto-super-seguro-y-aleatorio
SESSION_SECRET=otro-secreto-super-seguro-y-aleatorio
FRONTEND_URL=https://tu-app.up.railway.app
NODE_ENV=production

# Email (para verificación y recuperación de contraseña)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion-gmail
EMAIL_FROM=noreply@demos.com
EMAIL_SERVICE=gmail
```

### 5️⃣ Deploy Automático
Railway detectará los archivos de configuración y hará el deploy automáticamente.

## ✅ Verificación

Una vez desplegado, prueba estos endpoints:

```bash
# API funcionando
https://tu-app.up.railway.app/

# Base de datos conectada
https://tu-app.up.railway.app/health/db
```

## 🔑 Variables de Entorno Opcionales

```env
# OAuth Google
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_CALLBACK_URL=https://tu-app.up.railway.app/api/auth/google/callback

# OAuth Twitter
TWITTER_CONSUMER_KEY=tu-consumer-key
TWITTER_CONSUMER_SECRET=tu-consumer-secret
TWITTER_CALLBACK_URL=https://tu-app.up.railway.app/api/auth/twitter/callback

# MercadoPago
MP_ACCESS_TOKEN=tu-access-token
MP_PUBLIC_KEY=tu-public-key
```

## 🐛 Problemas Comunes

### "packages field missing or empty"
✅ **Ya solucionado** - El archivo `pnpm-workspace.yaml` ya está configurado.

### "frozen-lockfile" error
✅ **Ya solucionado** - El `pnpm-lock.yaml` está sincronizado.

### Base de datos no conecta
1. Verifica que `DATABASE_URL` esté correctamente configurada
2. Espera unos minutos - Railway puede tardar en inicializar PostgreSQL
3. Revisa logs en el dashboard

### Build falla
1. Revisa los logs en Railway
2. Verifica que todas las dependencias estén en `package.json`
3. Asegúrate de que las versiones de Prisma coincidan

## 📱 Acceder a tu App

Railway te dará una URL pública automáticamente:
```
https://tu-proyecto-production.up.railway.app
```

## 🔄 Actualizaciones

Cada vez que hagas push a `main`, Railway desplegará automáticamente:
```bash
git add .
git commit -m "Nueva funcionalidad"
git push origin main
```

## 📚 Documentación Completa

Para más detalles, consulta [DEPLOY.md](./DEPLOY.md)

---

**¿Problemas?** Revisa los logs en Railway Dashboard → Tu Servicio → Logs

