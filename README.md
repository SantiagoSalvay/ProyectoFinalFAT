# Demos+ - Plataforma de Solidaridad

## 🌟 Descripción

Demos+ es una plataforma web moderna que conecta personas con organizaciones sin fines de lucro, facilitando donaciones, voluntariado y colaboración social. La aplicación está construida con React y está preparada para integrarse con un backend Express.

## ✨ Características

### 🎨 Diseño y UX
- **Paleta de colores moderna**: Púrpura, verde esmeralda y naranja
- **Tipografía profesional**: Inter + Poppins
- **Diseño responsive**: Mobile-first
- **Animaciones suaves**: Transiciones y efectos visuales

### 👥 Sistema de Roles
- **Personas**: Pueden donar y hacer voluntariado
- **ONGs**: Pueden crear publicaciones y gestionar campañas
- **Registro diferenciado**: Formularios específicos por tipo de usuario

### 💬 Foro Comunitario
- **Publicaciones**: Solo ONGs pueden crear contenido
- **Comentarios**: Usuarios pueden interactuar
- **Filtros avanzados**: Por tipo, ubicación, etiquetas
- **Sistema de notificaciones**: Alertas en tiempo real

### 📊 Dashboard Personalizado
- **Estadísticas**: Métricas relevantes según el rol
- **Actividad reciente**: Historial de acciones
- **Acciones rápidas**: Navegación optimizada

## 🛠️ Tecnologías

### Frontend
- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **Vite** - Bundler y dev server
- **React Router** - Enrutamiento
- **Tailwind CSS** - Estilos y diseño
- **Lucide React** - Iconografía
- **React Hook Form** - Manejo de formularios
- **React Hot Toast** - Notificaciones

### Preparado para Backend
- **Express.js** - Servidor backend
- **Node.js** - Runtime
- **MongoDB/PostgreSQL** - Base de datos
- **JWT** - Autenticación

## 📁 Estructura del Proyecto

```
demoslanding/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── contexts/           # Contextos de React
│   ├── pages/              # Páginas de la aplicación
│   ├── App.tsx             # Componente principal
│   ├── main.tsx            # Punto de entrada
│   └── index.css           # Estilos globales
├── public/                 # Archivos estáticos
├── index.html              # HTML principal
├── package.json            # Dependencias
├── vite.config.ts          # Configuración de Vite
├── tailwind.config.ts      # Configuración de Tailwind
└── tsconfig.json           # Configuración de TypeScript
```

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación Completa

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/demoslanding.git
cd demoslanding
```

2. **Instalar todas las dependencias (Frontend + Backend)**
```bash
npm run install:all
```

3. **Ejecutar el proyecto completo (Frontend + Backend)**
```bash
npm run dev:full
```

4. **Abrir en el navegador**
```
Frontend: http://localhost:3000
Backend API: http://localhost:5000
```

### Instalación por Separado

**Solo Frontend:**
```bash
npm install
npm run dev
```

**Solo Backend:**
```bash
cd server
npm install
npm run dev
```

### Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Linting del código
```

## 🎯 Funcionalidades Principales

### 🏠 Página Principal
- Hero section con llamadas a la acción
- Sección de características
- Estadísticas de impacto
- Navegación intuitiva

### 👤 Registro y Login
- Formularios modernos con validación
- Selección de rol (Persona/ONG)
- Campos específicos por tipo de usuario
- Experiencia de usuario optimizada

### 📋 Dashboard
- Métricas personalizadas según rol
- Actividad reciente
- Acciones rápidas
- Información de perfil

### 💬 Foro
- Publicaciones con imágenes y etiquetas
- Sistema de comentarios
- Filtros por categoría
- Búsqueda avanzada

### 📖 Página de Misión
- Explicación clara del propósito
- Valores y principios
- Impacto medible
- Llamadas a la acción

## 🔧 Configuración

### Variables de Entorno
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Demos+
```

### Personalización
- **Colores**: Editar variables CSS en `src/index.css`
- **Tipografía**: Cambiar fuentes en `index.html`
- **Configuración**: Modificar `vite.config.ts`

## 📱 Responsive Design

La aplicación está optimizada para:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Pantallas grandes (1440px+)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- LinkedIn: [Tu LinkedIn](https://linkedin.com/in/tu-perfil)

## 🙏 Agradecimientos

- [React](https://reactjs.org/) - Framework de UI
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Framework de CSS
- [Lucide](https://lucide.dev/) - Iconos

---

⭐ **Si te gusta este proyecto, dale una estrella en GitHub!** 