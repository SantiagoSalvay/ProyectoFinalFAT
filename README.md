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

1. **Inicia el servidor backend** (desde la carpeta `server`):
```bash
cd server
npm run dev
# O con pnpm: pnpm dev
```
> El servidor se ejecutará en: http://localhost:3001

2. **En otra terminal, inicia el cliente frontend** (desde la carpeta raíz):
```bash
npm run dev
# O con pnpm: pnpm dev
```
> La aplicación se ejecutará en: http://localhost:3000

## 🔄 Flujo de Verificación de Email (NUEVO)

### Para Usuarios Nuevos:

1. **Registro** → El usuario llena el formulario de registro
2. **Mensaje de verificación** → Se muestra "¡Revisa tu correo!" con fondo blanco elegante
3. **Email enviado** → Se envía un email con diseño profesional y botón de verificación
4. **Verificación** → Al hacer clic en el enlace:
   - Se muestra pantalla de "Verificando email..." 
   - Se registra la cuenta en la base de datos
   - Se inicia sesión automáticamente
   - Se redirige al dashboard del usuario

### Características del Sistema:
- ✅ **Tokens seguros** con expiración de 24 horas
- ✅ **Emails con diseño profesional** (HTML)
- ✅ **Inicio de sesión automático** tras verificación
- ✅ **Interfaz elegante** sin fondos celestes
- ✅ **Validaciones de seguridad** completas
- ✅ **Logs detallados** para debugging

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
1. Verifica que `JWT_SECRET` está correctamente configurado en .env
2. Limpia el localStorage del navegador (F12 → Application → Local Storage)
3. Cierra sesión y vuelve a iniciar

#### Error: Verificación de email no llega
1. Verifica las credenciales de `SMTP_USER` y `SMTP_PASS` en .env
2. Asegúrate de usar una **contraseña de aplicación** de Gmail, no tu contraseña normal
3. Confirma que `APP_URL` está correctamente configurada
4. Revisa la carpeta de spam del email
5. Verifica los logs del servidor para errores SMTP

#### Error: "The table `public.RegistroPendiente` does not exist"
```bash
cd server
# Detener procesos que puedan estar interfiriendo
taskkill /f /im node.exe  # En Windows
# pkill node              # En Linux/Mac

# Regenerar cliente y sincronizar BD
pnpm prisma generate
pnpm prisma db push
```

## 📁 Estructura del Proyecto

```
/
├── client/                    # 🎨 Frontend React
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   │   ├── AuthenticatedOnlyRoute.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── Layout.tsx
│   │   ├── contexts/         # Context API (Estado global)
│   │   │   ├── AuthContext.tsx
│   │   │   └── NotificationContext.tsx
│   │   ├── pages/           # Páginas de la aplicación
│   │   │   ├── RegisterPage.tsx      # Registro con verificación
│   │   │   ├── VerifyEmailPage.tsx   # Verificación de email
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   └── MapPage.tsx
│   │   ├── services/        # Servicios de API
│   │   │   └── api.ts
│   │   └── App.tsx          # Router principal
├── server/                   # 🔧 Backend Node.js
│   ├── src/
│   │   └── routes/          # Rutas de la API
│   │       └── auth.js      # Autenticación y verificación
│   ├── lib/                 # Librerías y servicios
│   │   └── email-service.js # Servicio de emails SMTP
│   ├── prisma/              # Configuración de base de datos
│   │   ├── schema.prisma    # Esquema de BD
│   │   └── migrations/      # Migraciones
│   └── package.json
├── app/                     # 📱 Páginas adicionales Next.js (opcional)
├── prisma/                  # 🗄️ Esquema principal de BD
├── package.json             # Dependencias del frontend
└── README.md                # Este archivo
```

## 🗃️ Modelos de Base de Datos

### Principales:
- **Usuario** - Datos del usuario con verificación de email
- **RegistroPendiente** - Usuarios pendientes de verificación (NUEVO)
- **TipoUsuario** - Roles y permisos
- **Foro** - Discusiones de la comunidad
- **Donacion** - Gestión de donaciones
- **Ranking** - Sistema de puntuaciones

## 🤝 Contribución

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles. 
