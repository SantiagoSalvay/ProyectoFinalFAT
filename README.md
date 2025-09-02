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
  - ✅ **Flujo de activación de cuenta por email** (IMPLEMENTADO)
  - ✅ **Sistema completo de recuperación de contraseña** (IMPLEMENTADO)
  - ✅ **Autenticación JWT segura** (IMPLEMENTADO)
  - ✅ **Perfiles personalizados con edición en tiempo real** (ACTUALIZADO)
  - ✅ **Edición de información personal (nombre, ubicación)** (NUEVO)
  - ✅ **Sistema de roles y permisos** (IMPLEMENTADO)
  - ✅ **Inicio de sesión automático tras verificación** (IMPLEMENTADO)

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

- 📧 **Sistema de Emails Completo** (ACTUALIZADO)
  - ✅ **Verificación de email con diseño personalizado** (IMPLEMENTADO)
  - ✅ **Recuperación de contraseña con URLs protegidas UUID** (NUEVO)
  - ✅ **Plantillas HTML profesionales y responsivas** (IMPLEMENTADO)
  - ✅ **Servicio de email dedicado para cada funcionalidad** (NUEVO)
  - ✅ **Validaciones de seguridad y expiración de tokens** (NUEVO)

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
- ✅ **Sistema completo de recuperación de contraseña segura**
- ✅ **Tokens UUID únicos con expiración (1 hora para reset, 24h para verificación)**
- ✅ **Hashing de contraseñas con bcrypt**
- ✅ **JWT con expiración de 7 días**
- ✅ **Validación de contraseñas complejas (8+ caracteres, mayúscula, minúscula, número)**
- ✅ **URLs protegidas con tokens únicos no reutilizables**
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

## 🔄 Sistema de Autenticación y Perfiles Completo

### 📧 Flujo de Verificación de Email

#### Para Usuarios Nuevos:
1. **Registro** → El usuario llena el formulario de registro
2. **Mensaje de verificación** → Se muestra "¡Revisa tu correo!" con diseño elegante
3. **Email enviado** → Se envía un email con diseño profesional y botón de verificación
4. **Verificación** → Al hacer clic en el enlace:
   - Se muestra pantalla de "Verificando email..." 
   - Se registra la cuenta en la base de datos
   - Se inicia sesión automáticamente
   - Se redirige al dashboard del usuario

### 👤 Sistema de Gestión de Perfiles (NUEVO)

#### Funcionalidades de Edición de Perfil:
1. **Visualización de Información** → Página de perfil con datos del usuario
2. **Modo de Edición** → Al hacer clic en "Editar":
   - Campos editables para nombre completo y ubicación
   - Interfaz intuitiva con botones "Guardar" y "Cancelar"
3. **Guardado en Tiempo Real** → Al presionar "Guardar":
   - Validación de datos en frontend
   - Separación automática de nombre y apellido
   - Actualización segura en base de datos
   - Feedback inmediato al usuario
4. **Persistencia de Datos** → Los cambios se guardan permanentemente
   - Actualización automática de la interfaz
   - Sincronización con el contexto de autenticación

#### Características Técnicas del Sistema de Perfiles:
- ✅ **Validación de Campos**: Nombre obligatorio, validaciones en tiempo real
- ✅ **Separación Inteligente**: Nombre completo se divide automáticamente en nombre y apellido
- ✅ **Autenticación Segura**: Verificación JWT en cada actualización
- ✅ **Manejo de Errores**: Mensajes informativos para el usuario
- ✅ **Logging Detallado**: Para debugging y monitoreo de cambios
- ✅ **Interfaz Responsiva**: Funciona en dispositivos móviles y desktop

### 🔐 Sistema de Recuperación de Contraseña (NUEVO)

#### Flujo Completo de Recuperación:
1. **"Olvidé mi contraseña"** → Usuario hace clic en el enlace desde la página de login
2. **Página de recuperación** → Ingresa su email en un formulario dedicado
3. **Email de recuperación** → Recibe email con:
   - Diseño profesional y responsivo
   - Botón destacado "🔑 Recuperar mi contraseña"
   - URL alternativa para copiar/pegar
   - Advertencias de seguridad claras
4. **Página de nueva contraseña** → Al hacer clic en el enlace:
   - Formulario con validación en tiempo real
   - Indicadores visuales de requisitos de seguridad
   - Confirmación de contraseña
5. **Animación de éxito** → Al completar exitosamente:
   - Animación con check verde ✅
   - Mensaje de confirmación
   - Redirección automática al login

#### Características de Seguridad:
- ✅ **URLs protegidas con UUID** únicos e irrepetibles
- ✅ **Tokens con expiración** de 1 hora para máxima seguridad
- ✅ **Validación de contraseñas complejas**:
  - Mínimo 8 caracteres
  - Al menos una mayúscula
  - Al menos una minúscula  
  - Al menos un número
- ✅ **Indicadores visuales** de progreso en tiempo real
- ✅ **Limpieza automática** de tokens después del uso
- ✅ **No revelación** de existencia de emails (por seguridad)

### 🛡️ Características del Sistema de Autenticación:
- ✅ **Tokens seguros** con expiración variable (24h verificación, 1h reset)
- ✅ **Emails con diseño profesional** HTML responsivo
- ✅ **Múltiples servicios de email** especializados
- ✅ **Inicio de sesión automático** tras verificación
- ✅ **Animaciones de feedback** para mejor UX
- ✅ **Validaciones de seguridad** en frontend y backend
- ✅ **Logs detallados** para debugging y monitoreo

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

#### Error: Emails no llegan (Verificación o Recuperación)
1. **Configuración SMTP**: Verifica las credenciales de `SMTP_USER` y `SMTP_PASS` en .env
2. **Contraseña de aplicación**: Asegúrate de usar una **contraseña de aplicación** de Gmail, no tu contraseña normal
3. **URL de la aplicación**: Confirma que `APP_URL` está correctamente configurada
4. **Carpeta de spam**: Revisa la carpeta de spam/correo no deseado
5. **Logs del servidor**: Verifica los logs para errores SMTP específicos
6. **Servicios de email**: El sistema usa servicios separados para verificación y recuperación

#### Error: "ECONNRESET" en recuperación de contraseña
1. **Servidor Express**: Asegúrate de que el servidor backend esté corriendo en puerto 3001
2. **Proxy de Vite**: Verifica que el proxy esté configurado correctamente en `vite.config.ts`
3. **Puertos**: Confirma que no hay conflictos de puertos (3000 frontend, 3001 backend)
4. **Firewall**: Verifica que el firewall no esté bloqueando las conexiones locales

#### Error: "HTTP error! status: 404" en edición de perfil
1. **Ruta faltante**: Asegúrate de que la ruta PUT `/auth/profile` esté implementada
2. **Archivo de rutas**: Verifica que `server/src/routes/auth.js` contenga la ruta de actualización
3. **Reinicio del servidor**: Reinicia el servidor backend después de cambios en las rutas
4. **Campo bio**: El campo `bio` no existe en el modelo Usuario, solo usar `nombre`, `apellido`, `ubicacion`

#### Error: "Unknown field `bio` for select statement on model Usuario"
1. **Esquema de BD**: El modelo Usuario no incluye el campo `bio`
2. **Campos válidos**: Usar solo `nombre`, `apellido`, `ubicacion`, `correo`, `usuario`
3. **Prisma generate**: Ejecutar `pnpm prisma generate` después de cambios en el esquema
4. **Validación de datos**: Asegurarse de no enviar campos inexistentes al backend

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
│   │   │   ├── ProfilePage.tsx       # Gestión de perfiles (NUEVO)
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
│   │   ├── email-service.js # Servicio de emails para verificación
│   │   └── password-reset-service.js # Servicio dedicado para recuperación
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
- **Usuario** - Datos del usuario con verificación de email y tokens de recuperación
- **RegistroPendiente** - Usuarios pendientes de verificación
- **TipoUsuario** - Roles y permisos
- **Foro** - Discusiones de la comunidad
- **Donacion** - Gestión de donaciones
- **Ranking** - Sistema de puntuaciones

### Campos de Seguridad en Usuario:
- `reset_token` - Token UUID para recuperación de contraseña
- `reset_token_expiry` - Fecha de expiración del token (1 hora)
- `verification_token` - Token UUID para verificación de email
- `verification_token_expiry` - Fecha de expiración del token (24 horas)
- `email_verified` - Estado de verificación del email

## 🆕 Actualizaciones Recientes

### Version 2.1.0 - Sistema de Gestión de Perfiles (Diciembre 2024)
- ✅ **Edición de Perfiles en Tiempo Real** - Los usuarios pueden editar su información personal
- ✅ **Validaciones Avanzadas** - Validación de campos obligatorios y formatos
- ✅ **Separación Inteligente de Nombres** - División automática de nombre completo
- ✅ **Sincronización de Estado** - Actualización automática del contexto de autenticación
- ✅ **Manejo de Errores Robusto** - Mensajes informativos y logging detallado
- ✅ **Corrección de Arquitectura** - Unificación de rutas de API en archivo correcto
- ✅ **Compatibilidad con Esquema** - Eliminación de campos inexistentes (bio) del modelo

### Correcciones Técnicas Importantes:
- 🔧 **Ruta PUT /auth/profile** - Implementada correctamente en `server/src/routes/auth.js`
- 🔧 **Validación de Esquema** - Eliminados campos `bio` que no existen en la BD
- 🔧 **Filtrado de Datos** - Solo se envían campos válidos al backend
- 🔧 **Logging Mejorado** - Debugging detallado para monitoreo y solución de problemas

## 🚀 Funcionalidades Próximas

- [ ] **Sistema de Notificaciones Push**
- [ ] **Chat en tiempo real** entre usuarios y ONGs
- [ ] **Sistema de Reviews** para ONGs
- [ ] **Integración con Google Maps API**
- [ ] **App móvil** (React Native)
- [ ] **Dashboard de analytics** para ONGs
- [ ] **Sistema de badges** y gamificación
- [ ] **Edición de Biografía** - Agregar campo bio al modelo Usuario
- [ ] **Foto de Perfil** - Sistema de carga y gestión de imágenes

## 🧪 Testing y Calidad

### Testing del Sistema de Verificación de Email:
1. **Registra un usuario** en http://localhost:3000/register
2. **Verifica** que aparece el mensaje "¡Revisa tu correo!"
3. **Revisa** tu email para el mensaje de verificación
4. **Haz clic** en "Verificar mi correo electrónico"
5. **Confirma** que se muestra la pantalla de éxito
6. **Verifica** que se redirige automáticamente al dashboard

### Testing del Sistema de Recuperación de Contraseña:
1. **Ve al login** en http://localhost:3000/login
2. **Haz clic** en "¿Olvidaste tu contraseña?"
3. **Ingresa tu email** en el formulario de recuperación
4. **Revisa tu email** para el mensaje de recuperación
5. **Haz clic** en "🔑 Recuperar mi contraseña"
6. **Crea una nueva contraseña** (mínimo 8 caracteres, mayúscula, minúscula, número)
7. **Verifica la animación** de éxito con check verde ✅
8. **Confirma** que te redirige al login
9. **Inicia sesión** con la nueva contraseña

### Testing del Sistema de Edición de Perfil (NUEVO):
1. **Inicia sesión** en tu cuenta verificada
2. **Ve a tu perfil** desde el menú de usuario
3. **Verifica** que se muestran tus datos actuales (nombre, email, ubicación)
4. **Haz clic en "Editar"** para activar el modo de edición
5. **Modifica** tu nombre completo y/o ubicación
6. **Haz clic en "Guardar"** para aplicar los cambios
7. **Verifica** que aparece el mensaje "Perfil actualizado exitosamente"
8. **Confirma** que los datos se actualizaron en la interfaz
9. **Recarga la página** para verificar que los cambios persisten
10. **Prueba "Cancelar"** para verificar que revierte los cambios no guardados

### Casos de Prueba de Seguridad:
- ✅ **Token expirado**: Intentar usar un enlace después de 1 hora
- ✅ **Token reutilizado**: Intentar usar el mismo enlace dos veces
- ✅ **Contraseña débil**: Probar contraseñas que no cumplan los requisitos
- ✅ **Email inexistente**: Solicitar recuperación con email no registrado
- ✅ **Edición sin autenticación**: Intentar editar perfil sin estar logueado
- ✅ **Token JWT inválido**: Probar con token manipulado o expirado
- ✅ **Campos vacíos**: Intentar guardar perfil con nombre vacío
- ✅ **Datos maliciosos**: Probar con caracteres especiales y scripts

## 🤝 Contribución

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 👨‍💻 Desarrolladores

### Sistemas Implementados:
- **✅ Sistema de Verificación de Email** - Implementado completamente
- **✅ Sistema de Recuperación de Contraseña** - Implementado con máxima seguridad
- **✅ Sistema de Gestión de Perfiles** - Edición en tiempo real con validaciones (NUEVO)
- **✅ Interfaz de Usuario** - Diseño moderno, responsivo con animaciones
- **✅ Backend API** - RESTful con validaciones de seguridad robustas
- **✅ Base de Datos** - Optimizada con Prisma ORM y campos de seguridad
- **✅ Servicios de Email** - Múltiples servicios especializados y redundantes

### Arquitectura del Sistema de Autenticación:
```
Frontend (React/Vite) ↔ Proxy (Vite) ↔ Backend (Express/Node.js)
     ↓                                           ↓
Context API                                 Prisma ORM
     ↓                                           ↓
LocalStorage                               PostgreSQL
                                               ↓
                                        Gmail SMTP (Nodemailer)
```

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**DEMOS+** - Conectando corazones, transformando vidas 💙 
