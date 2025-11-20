# 🚀 DEPLOYMENT CHECKLIST - Sistema de Donaciones

## ✅ Pre-Despliegue

### 1. **Validaciones Locales**

- [ ] Backend compila sin errores
  ```bash
  cd server && npm run build  # o pnpm build
  ```

- [ ] Frontend compila sin errores
  ```bash
  cd client && npm run build  # o pnpm build
  ```

- [ ] Tests unitarios pasan
  ```bash
  npm run test
  ```

- [ ] Linting sin errores
  ```bash
  npm run lint
  ```

### 2. **Base de Datos**

- [ ] Migrations ejecutadas en BD local
  ```bash
  cd server && npx prisma migrate deploy
  ```

- [ ] Tables existen:
  ```bash
  \dt "public"."Pedido*"
  \dt "public"."TipoDonacion"
  \dt "public"."DetalleUsuario"
  ```

- [ ] Tipos de donación están creados (6 registros):
  ```sql
  SELECT id_tipo_donacion, tipo_donacion FROM "TipoDonacion";
  -- Debe haber: Dinero, Ropa, Juguetes, Comida, Muebles, Otros
  ```

- [ ] Schema Prisma actualizado
  ```bash
  cd server && npx prisma generate
  ```

### 3. **Archivos Código**

- [ ] Verificar sintaxis:
  ```bash
  node --check server/src/routes/donations.js
  node --check server/src/routes/payments.js
  node --check server/src/index.js
  ```

- [ ] Imports correctos:
  ```bash
  grep -r "import donationsRoutes" server/src/index.js
  ```

- [ ] No hay `console.log` de debug (opcional, para producción):
  ```bash
  grep -r "console.log" server/src/routes/donations.js
  ```

### 4. **Variables de Entorno**

- [ ] `.env` en server contiene:
  ```
  DATABASE_URL=postgresql://...
  JWT_SECRET=...
  SMTP_HOST=...
  SMTP_USER=...
  SMTP_PASS=...
  FRONTEND_BASE_URL=https://tudominio.com
  API_BASE_URL=https://api.tudominio.com
  MP_ACCESS_TOKEN=... (si requiere, por ONG)
  ```

- [ ] `.env.local` en client contiene:
  ```
  VITE_API_BASE_URL=https://api.tudominio.com
  VITE_JWT_STORAGE_KEY=auth_token
  ```

- [ ] No hay `.env` en git:
  ```bash
  git check-ignore .env
  ```

### 5. **Documentación**

- [ ] README.md actualizado ✅
- [ ] TESTING_GUIDE.md presente ✅
- [ ] IMPLEMENTACION_DONACIONES.md presente ✅
- [ ] QUICK_START.md presente ✅
- [ ] ARQUITECTURA_DONACIONES.md presente ✅

---

## 🔧 Despliegue en Producción

### **Opción A: Railway + Vercel (Recomendado)**

#### Paso 1: Backend (Railway)

1. **Conectar repositorio a Railway**
   ```bash
   # En Railway dashboard:
   # New Project → GitHub → Seleccionar repo
   ```

2. **Variables de entorno en Railway**
   ```
   DATABASE_URL = (copiar de PostgreSQL service)
   JWT_SECRET = (generar string aleatorio fuerte)
   SMTP_HOST = smtp.gmail.com
   SMTP_USER = tu-email@gmail.com
   SMTP_PASS = (app password de Google)
   FRONTEND_BASE_URL = https://tu-frontend.vercel.app
   API_BASE_URL = https://tu-api.railway.app
   NODE_ENV = production
   ```

3. **Deploy comando (Railway)**
   ```bash
   # Automático al push a main si está configurado
   # O manual: railway deploy
   ```

4. **Verificar backend online**
   ```bash
   curl https://tu-api.railway.app/api/ranking
   # Debe responder con JSON
   ```

#### Paso 2: Database (PostgreSQL en Railway)

1. **Crear servicio PostgreSQL en Railway**
   - New Service → Database → PostgreSQL

2. **Conectar a proyecto**
   - DATABASE_URL se genera automáticamente

3. **Ejecutar migrations en producción**
   ```bash
   cd server
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   npx prisma seed  # Si tienes script de seed
   ```

4. **Verificar datos**
   ```bash
   # Conectar a DB en Railway:
   psql postgresql://user:pass@host:port/dbname
   SELECT * FROM "TipoDonacion";
   ```

#### Paso 3: Frontend (Vercel)

1. **Conectar repo a Vercel**
   - vercel.com → New Project → GitHub → Seleccionar repo

2. **Configurar variables de entorno**
   ```
   VITE_API_BASE_URL = https://tu-api.railway.app
   ```

3. **Deploy automático**
   - Automático al push a main

4. **Verificar frontend online**
   - https://tu-frontend.vercel.app debe cargar

---

### **Opción B: Heroku + GitHub Pages (Legacy)**

> ⚠️ Heroku es de pago. Usar Railway es más económico.

```bash
# Backend
heroku login
heroku create tu-app-backend
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main

# Migrations
heroku run "npm run prisma migrate deploy" -a tu-app-backend

# Frontend (GitHub Pages)
npm run build
git add . && git commit -m "build" && git push
```

---

### **Opción C: Docker + DigitalOcean (Self-hosted)**

#### Paso 1: Crear Dockerfile

```dockerfile
# server/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
```

#### Paso 2: Crear docker-compose.yml

```yaml
version: '3.8'

services:
  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: demosplus
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./server
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@database:5432/demosplus
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - database

  frontend:
    build:
      context: ./client
      args:
        VITE_API_BASE_URL: http://localhost:3000
    ports:
      - "5173:3000"

volumes:
  pgdata:
```

#### Paso 3: Deploy

```bash
docker-compose up -d

# Migrations
docker-compose exec backend npm run prisma migrate deploy
```

---

## 🧪 Post-Despliegue Testing

### Test 1: API Disponible

```bash
# Desde tu máquina local
curl https://tu-api.railway.app/api/ranking
# Debe responder 200 con JSON
```

### Test 2: Autenticación

```bash
# Login
RESPONSE=$(curl -s -X POST https://tu-api.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}')

TOKEN=$(echo $RESPONSE | jq -r '.token')

# Verificar token válido
curl -X GET https://tu-api.railway.app/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

### Test 3: Crear Donación

```bash
curl -X POST https://tu-api.railway.app/api/donations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ongId": 1,
    "donationType": "ropa",
    "itemDescription": "test",
    "cantidad": 5
  }'

# Debe responder 201 Created
```

### Test 4: MP Sandbox

```bash
# Si usas MP
curl -X POST https://tu-api.railway.app/api/payments/mp/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ongId": 1,
    "description": "test donation",
    "amount": 100
  }'

# Debe responder con preference ID
```

### Test 5: Ranking

```bash
curl https://tu-api.railway.app/api/ranking

# Debe responder con lista de usuarios ordenada por puntos
```

---

## 📊 Monitoreo Post-Despliegue

### Logs

```bash
# Railway
railway logs

# Vercel
vercel logs
```

### Metrics

- Uptime: Monitorear con Uptime Robot
- Performance: Usar herramientas como GTmetrix
- Errores: Configurar Sentry o similar

### Database

```bash
# Verificar tamaño
SELECT pg_size_pretty(pg_database_size('demosplus'));

# Ver conexiones activas
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;

# Backup automático
# Railway: automático cada 24h
# DigitalOcean: configurar snapshots
```

---

## 🔒 Seguridad Pre-Despliegue

- [ ] CORS está configurado correctamente
  ```javascript
  // server/src/index.js
  app.use(cors({ origin: process.env.FRONTEND_BASE_URL }));
  ```

- [ ] JWT_SECRET es fuerte (32+ caracteres aleatorios)
  ```bash
  openssl rand -base64 32
  ```

- [ ] Headers de seguridad configurados
  ```javascript
  app.use(helmet());
  ```

- [ ] Rate limiting en endpoints sensibles
  ```javascript
  const rateLimit = require("express-rate-limit");
  app.use("/api/donations", rateLimit({ windowMs: 15*60*1000, max: 100 }));
  ```

- [ ] SQL injection: Usando Prisma (ORM seguro) ✅

- [ ] XSS: React escapa HTML automáticamente ✅

- [ ] CSRF: Vérificar token en forms si es necesario

- [ ] Passwords: Hasheadas con bcrypt ✅

- [ ] MP Token: Encriptado en BD ✅

---

## 📋 Rollback Plan

Si algo falla después del deploy:

### Opción 1: Revert Automático (Railway)
```bash
# En Railway dashboard: Deployments → Seleccionar anterior → Rollback
```

### Opción 2: Revert Manual
```bash
# Git
git revert <commit>
git push

# El pipeline redeploy automáticamente
```

### Opción 3: Hotfix Branch
```bash
git checkout -b hotfix/donation-issue
# Fix el bug
git push origin hotfix/donation-issue
# PR merge a main
# Redeploy automático
```

---

## ✅ Checklist Final

- [ ] Código compilado sin errores
- [ ] Tests pasan en local
- [ ] Variables de entorno configuradas
- [ ] Database migrations ejecutadas
- [ ] Backend disponible en URL
- [ ] Frontend disponible en URL
- [ ] Login funciona
- [ ] Crear donación funciona
- [ ] Ranking actualiza
- [ ] Mercado Pago conectado (si aplica)
- [ ] Emails se envían (si aplica)
- [ ] Logs monitoreados
- [ ] Backup configurado
- [ ] SSL/HTTPS habilitado
- [ ] Documentación actualizada

---

## 🆘 Soporte Post-Despliegue

Si encuentras problemas:

1. **Verificar logs**
   ```bash
   railway logs  # o vercel logs
   ```

2. **Conectar a BD en producción**
   ```bash
   # Railway proporciona connection string
   psql <connection-string>
   SELECT * FROM "PedidoDonacion" LIMIT 5;
   ```

3. **Revisar documentación**
   - TESTING_GUIDE.md (sección Troubleshooting)
   - IMPLEMENTACION_DONACIONES.md (validaciones)

4. **Debug endpoints**
   ```bash
   # Ver qué se guardó
   curl https://api.example.com/api/donations/my-donations \
     -H "Authorization: Bearer $TOKEN"
   ```

---

**Última actualización:** 2024
**Status:** ✅ LISTO PARA DESPLIEGUE
