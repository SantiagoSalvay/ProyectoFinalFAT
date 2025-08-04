# DEMOS+ Platform

## Requisitos Previos

- Node.js v18 o superior
- pnpm (recomendado) o npm
- PostgreSQL (la base de datos debe estar creada)

## Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd ProyectoFinalFAT
```

2. Instala las dependencias del proyecto principal:
```bash
pnpm install
```

3. Instala las dependencias del servidor:
```bash
cd server
pnpm install
```

4. Configura las variables de entorno:
   - Crea un archivo `.env` en la carpeta `server` con el siguiente contenido:
   ```env
   DATABASE_URL="postgresql://usuario:contraseña@host:puerto/nombre_base_datos"
   JWT_SECRET="tu_secreto_jwt"
   EMAIL_USER="tu_email@gmail.com"
   EMAIL_PASSWORD="tu_contraseña_de_app"
   FRONTEND_URL="http://localhost:5173"
   ```

5. Genera el cliente de Prisma y aplica las migraciones:
```bash
cd server
pnpm prisma generate
pnpm prisma migrate dev
```

## Ejecución del Proyecto

1. Inicia el servidor (desde la carpeta server):
```bash
pnpm dev
```

2. En otra terminal, inicia el cliente (desde la carpeta raíz):
```bash
pnpm dev
```

## Solución de Problemas Comunes

### Error: Cannot find package 'express'
Si encuentras este error, significa que las dependencias del servidor no están instaladas correctamente. Ejecuta:
```bash
cd server
rm -rf node_modules
pnpm install
```

### Error: Prisma Client no está generado
Si encuentras errores relacionados con Prisma, ejecuta:
```bash
cd server
pnpm prisma generate
```

### Error: Base de datos no sincronizada
Si encuentras errores de sincronización de la base de datos, ejecuta:
```bash
cd server
pnpm prisma migrate reset --force
pnpm prisma generate
```
### Error: error npm
Si encuentras errores con npm dev primero ejecuta:
```bash
cd server
pnpm add express
```
## Estructura del Proyecto

- `/app` - Componentes y páginas de Next.js
- `/client` - Código del cliente React
- `/components` - Componentes compartidos
- `/server` - Código del servidor Express
- `/prisma` - Esquema y migraciones de la base de datos 
