# DEMOS+ Platform 🌟

## 🎯 Objetivo del Proyecto

DEMOS+ es una plataforma innovadora diseñada para conectar ONGs con donantes y voluntarios, facilitando la gestión de donaciones y el seguimiento de actividades benéficas. Nuestro objetivo es crear un ecosistema digital que promueva la transparencia y eficiencia en el sector social.

## ✨ Funcionalidades Principales

- 🏢 **Registro y Gestión de ONGs**
  - Perfil detallado de organizaciones
  - Verificación de documentación
  - Panel de control personalizado

- 👥 **Sistema de Usuarios**
  - Registro con verificación de email
  - Autenticación segura
  - Perfiles personalizados
  - Sistema de roles y permisos

- 💰 **Gestión de Donaciones**
  - Integración con MercadoPago
  - Seguimiento de donaciones
  - Historial de transacciones
  - Generación de comprobantes

- 📍 **Mapa Interactivo**
  - Visualización de ONGs cercanas
  - Filtros por categoría y ubicación
  - Información detallada de cada punto

- 📊 **Sistema de Ranking**
  - Puntuación por actividades
  - Reconocimientos y badges
  - Tabla de posiciones

- 💬 **Foro de Comunidad**
  - Creación de discusiones
  - Comentarios y respuestas
  - Moderación de contenido

## 🛠️ Especificaciones Técnicas

### Frontend
- React + Vite
- TypeScript
- Tailwind CSS
- Context API para gestión de estado
- React Router para navegación

### Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT para autenticación
- Nodemailer para emails

### Integraciones
- MercadoPago API
- Google Maps API
- Cloudinary para almacenamiento de imágenes

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
