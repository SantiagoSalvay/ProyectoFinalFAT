# DEMOS+ Platform 🌟

## 🎯 Objetivo del Proyecto

DEMOS+ es una plataforma innovadora diseñada para conectar ONGs con donantes y voluntarios, facilitando la gestión de donaciones y el seguimiento de actividades benéficas. Nuestro objetivo es crear un ecosistema digital que promueva la transparencia y eficiencia en el sector social.

## ✨ Funcionalidades Principales

- 🏢 **Registro y Gestión de ONGs**
  - Perfil detallado de organizaciones
  - Verificación de documentación
  - Panel de control personalizado

- 👥 **Sistema de Usuarios Avanzado**
  - ✅ **Registro con verificación de email** (IMPLEMENTADO)
  - ✅ **Flujo de activación de cuenta por email** (NUEVO)
  - ✅ **Autenticación JWT segura** (IMPLEMENTADO)
  - ✅ **Perfiles personalizados** (IMPLEMENTADO)
  - ✅ **Sistema de roles y permisos** (IMPLEMENTADO)
  - ✅ **Inicio de sesión automático tras verificación** (NUEVO)

- 💰 **Gestión de Donaciones**
  - Integración con MercadoPago
  - Seguimiento de donaciones
  - Historial de transacciones
  - Generación de comprobantes

- 📍 **Mapa Interactivo**
  - ✅ **Visualización de ONGs cercanas** (IMPLEMENTADO)
  - ✅ **Filtros por categoría y ubicación** (IMPLEMENTADO)
  - ✅ **Información detallada de cada punto** (IMPLEMENTADO)

- 📊 **Sistema de Ranking**
  - Puntuación por actividades
  - Reconocimientos y badges
  - Tabla de posiciones

- 💬 **Foro de Comunidad**
  - Creación de discusiones
  - Comentarios y respuestas
  - Moderación de contenido

- 📧 **Sistema de Emails** (NUEVO)
  - ✅ **Verificación de email con diseño personalizado** (IMPLEMENTADO)
  - ✅ **Recuperación de contraseña** (IMPLEMENTADO)
  - ✅ **Plantillas HTML profesionales** (IMPLEMENTADO)

## 🛠️ Especificaciones Técnicas

### Frontend
- **React 18** + **Vite** (Hot reload y desarrollo rápido)
- **TypeScript** (Tipado estático)
- **Tailwind CSS** (Estilos utilitarios y diseño responsive)
- **React Router v6** (Navegación SPA)
- **Context API** (Gestión de estado global)
- **React Hook Form** (Manejo de formularios)
- **React Hot Toast** (Notificaciones elegantes)

### Backend
- **Node.js** + **Express.js** (Servidor REST API)
- **Prisma ORM** (ORM type-safe para base de datos)
- **PostgreSQL** (Base de datos relacional)
- **JWT** (JSON Web Tokens para autenticación)
- **Nodemailer** (Envío de emails SMTP)
- **bcryptjs** (Hashing de contraseñas)
- **UUID** (Generación de tokens únicos)

### Integraciones y Servicios
- **MercadoPago API** (Procesamiento de pagos)
- **Gmail SMTP** (Envío de emails de verificación)
- **Railway/PostgreSQL** (Base de datos en la nube)

### Seguridad
- ✅ **Verificación de email obligatoria**
- ✅ **Tokens de verificación con expiración**
- ✅ **Hashing de contraseñas con bcrypt**
- ✅ **JWT con expiración de 7 días**
- ✅ **Validación de datos en frontend y backend**

## 📋 Requisitos Previos

- Node.js v18 o superior
- pnpm (recomendado) o npm
- PostgreSQL (la base de datos debe estar creada)

## 🚀 Instalación

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
   # Base de datos
   DATABASE_URL="postgresql://usuario:contraseña@host:puerto/nombre_base_datos"
   
   # Autenticación
   JWT_SECRET="tu_secreto_jwt_super_seguro"
   
   # Configuración SMTP para emails (Gmail)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="465"
   SMTP_USER="tu_email@gmail.com"
   SMTP_PASS="tu_contraseña_de_aplicacion_gmail"
   
   # URL de la aplicación para enlaces de verificación
   APP_URL="http://localhost:3000"
   ```

   > **Nota importante:** Para Gmail, necesitas generar una "Contraseña de aplicación":
   > 1. Ve a tu cuenta de Google → Seguridad
   > 2. Activa la verificación en 2 pasos
   > 3. Genera una contraseña de aplicación
   > 4. Usa esa contraseña en `SMTP_PASS`

5. Configura la base de datos:
```bash
cd server

# Genera el cliente de Prisma
pnpm prisma generate

# Sincroniza el esquema con la base de datos
pnpm prisma db push

# O aplica migraciones (si prefieres usar migraciones)
# pnpm prisma migrate dev
```

## 🏃‍♂️ Ejecución del Proyecto

1. Inicia el servidor (desde la carpeta server):
```bash
pnpm dev
```

2. En otra terminal, inicia el cliente (desde la carpeta raíz):
```bash
pnpm dev
```

## 🔧 Guía de Solución de Problemas

### 📦 Problemas con Dependencias

#### Error: Cannot find package 'express'
```bash
cd server
rm -rf node_modules
pnpm install
```

#### Error: Módulos no encontrados en el cliente
```bash
rm -rf node_modules
pnpm install
```

### 🗄️ Problemas con la Base de Datos

#### Error: Prisma Client no está generado
```bash
cd server
pnpm prisma generate
```

#### Error: Base de datos no sincronizada
```bash
cd server
pnpm prisma migrate reset --force
pnpm prisma generate
```

#### Error: Conexión a la base de datos fallida
1. Verifica que PostgreSQL esté corriendo
2. Confirma las credenciales en el archivo .env
3. Asegúrate de que la base de datos existe:
```sql
CREATE DATABASE nombre_base_datos;
```

### 🔐 Problemas de Autenticación

#### Error: JWT malformado
1. Verifica que JWT_SECRET está correctamente configurado en .env
2. Limpia el localStorage del navegador
3. Cierra sesión y vuelve a iniciar

#### Error: Verificación de email no llega
1. Verifica las credenciales de EMAIL_USER y EMAIL_PASSWORD
2. Confirma que la cuenta de Gmail tiene habilitado el acceso a apps menos seguras
3. Revisa la carpeta de spam

## 📁 Estructura del Proyecto

```
/
├── app/                # Componentes y páginas de Next.js
├── client/            # Código del cliente React
│   ├── src/
│   ├── components/    # Componentes reutilizables
│   └── pages/         # Páginas de la aplicación
├── server/            # Código del servidor Express
│   ├── routes/        # Rutas de la API
│   └── src/           # Lógica del servidor
└── prisma/            # Esquema y migraciones DB
```

## 🤝 Contribución

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles. 
