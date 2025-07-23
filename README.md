# 🚀 Demos+ Platform

Una plataforma completa para conectar ONGs con la comunidad, facilitando donaciones, voluntariado y colaboración social.

## ✨ Características Principales

### 🌍 **Mapa Interactivo**
- Visualización de ONGs en un mapa interactivo
- Filtros por ubicación y tipo de organización
- Información detallada de cada ONG

### 📊 **Sistema de Ranking**
- Ranking de ONGs por impacto social
- Filtros por tipo (pública/privada) y ubicación
- Estadísticas de proyectos y voluntarios

### 🏢 **Directorio de ONGs**
- Lista completa de organizaciones
- Búsqueda y filtros avanzados
- Sistema de calificaciones y comentarios
- Información detallada de cada ONG

### 💬 **Foro Comunitario**
- **Visible sin sesión** - Todos pueden ver las publicaciones
- **Interacción requiere autenticación** - Comentar y dar me gusta
- Publicaciones de ONGs sobre campañas y eventos
- Sistema de etiquetas y filtros

### 🔐 **Sistema de Autenticación**
- Registro de usuarios (personas y ONGs)
- Inicio de sesión seguro
- Perfiles personalizados
- Rutas protegidas

### 📱 **Diseño Responsivo**
- Interfaz moderna y accesible
- Optimizado para móviles y desktop
- Diseño intuitivo y fácil de usar

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router DOM** - Enrutamiento
- **Tailwind CSS** - Framework de estilos
- **React Hook Form** - Manejo de formularios
- **React Hot Toast** - Notificaciones
- **Lucide React** - Iconos
- **Leaflet** - Mapas interactivos

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **SQLite** - Base de datos
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **CORS** - Cross-origin resource sharing
- **Helmet** - Seguridad

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o pnpm

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/demos-platform.git
cd demos-platform
```

### 2. Instalar dependencias
```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd server
npm install
cd ..
```

### 3. Configurar variables de entorno (opcional)
Crear archivo `.env` en la raíz del proyecto:
```env
JWT_SECRET=tu_jwt_secret_aqui
PORT=5000
```

### 4. Ejecutar el proyecto
```bash
# Ejecutar frontend y backend simultáneamente
npm run dev:full

# O ejecutar por separado:
# Frontend
npm run dev

# Backend
npm run server
```

### 5. Acceder a la aplicación
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

## 📁 Estructura del Proyecto

```
demoslanding/
├── src/                    # Frontend React
│   ├── components/         # Componentes reutilizables
│   ├── contexts/          # Contextos de React
│   ├── pages/             # Páginas de la aplicación
│   ├── services/          # Servicios de API
│   └── ...
├── server/                # Backend Express
│   ├── src/
│   │   ├── database/      # Configuración de base de datos
│   │   ├── routes/        # Rutas de la API
│   │   └── index.js       # Servidor principal
│   └── ...
├── public/                # Archivos estáticos
└── ...
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Solo frontend
npm run server           # Solo backend
npm run dev:full         # Frontend + Backend

# Producción
npm run build            # Build del frontend
npm start                # Iniciar servidor de producción
```

## 🗄️ Base de Datos

La aplicación utiliza SQLite con las siguientes tablas principales:

- **users** - Usuarios y ONGs registradas
- **ongs** - Información de organizaciones
- **forum_posts** - Publicaciones del foro
- **comments** - Comentarios en posts y ONGs
- **ratings** - Calificaciones de ONGs

Los datos de ejemplo se insertan automáticamente al iniciar el servidor.

## 🔐 Autenticación

### Tipos de Usuario
- **Persona**: Puede ver contenido, comentar, calificar y hacer voluntariado
- **ONG**: Puede crear publicaciones, gestionar perfil y recibir donaciones

### Endpoints de Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/profile` - Actualizar perfil

## 🗺️ API Endpoints

### ONGs
- `GET /api/ongs` - Listar ONGs con filtros
- `GET /api/ongs/:id` - Obtener ONG específica
- `POST /api/ongs/:id/rate` - Calificar ONG
- `POST /api/ongs/:id/comment` - Comentar ONG

### Foro
- `GET /api/forum/posts` - Listar publicaciones
- `POST /api/forum/posts` - Crear publicación
- `POST /api/forum/posts/:id/comment` - Comentar publicación
- `POST /api/forum/posts/:id/like` - Dar me gusta

### Ranking
- `GET /api/ranking` - Ranking de ONGs
- `GET /api/ranking/stats` - Estadísticas generales

## 🎨 Características del Foro

### Visibilidad Pública
- ✅ Ver todas las publicaciones sin sesión
- ✅ Buscar y filtrar contenido
- ✅ Ver información de ONGs

### Interacción Requiere Autenticación
- 🔒 Comentar publicaciones
- 🔒 Dar me gusta
- 🔒 Crear publicaciones (solo ONGs)

### Modal de Autenticación
Cuando un usuario sin sesión intenta interactuar, aparece un modal con:
- Opción de iniciar sesión
- Opción de registrarse
- Opción de continuar sin sesión

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial* - [TuUsuario](https://github.com/TuUsuario)

## 🙏 Agradecimientos

- Comunidad de React y Node.js
- Contribuidores de las librerías utilizadas
- ONGs que inspiran este proyecto

---

**Demos+ Platform** - Conectando ONGs con la comunidad para un mundo mejor 🌟 