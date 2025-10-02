# Loading Hooks Documentation

Este directorio contiene hooks personalizados para manejar estados de carga en la aplicación.

## 📚 Índice de Hooks

1. [useLoading](#useloading-hook) - Hook local para estados de carga
2. [useAuthLoading](#useauthloading-hook) - Hook especializado para autenticación
3. [useLoginLoading](#useloginloading-hook) - Hook simplificado para login
4. [useRegisterLoading](#useregisterloading-hook) - Hook simplificado para registro
5. [useFormLoading](#useformloading-hook) - Hook para formularios con progreso
6. [LoadingContext](#loadingcontext) - Contexto global de carga

---

## useLoading Hook

Hook local para manejar estados de carga en componentes específicos.

### Uso básico:

```tsx
import { useLoading } from '../hooks/useLoading'

function MyComponent() {
  const { isLoading, setIsLoading, withLoading, LoadingSpinner, LoadingOverlay } = useLoading()

  // Usando withLoading para envolver funciones asíncronas
  const handleSubmit = withLoading(async (data) => {
    await api.submitData(data)
  })

  return (
    <div>
      <button onClick={() => handleSubmit(formData)} disabled={isLoading}>
        Enviar
      </button>
      
      <LoadingSpinner size={24}>
        Cargando...
      </LoadingSpinner>
    </div>
  )
}
```

### Propiedades del hook:

- `isLoading`: Estado booleano de carga
- `setIsLoading`: Función para cambiar el estado de carga
- `withLoading`: Función que envuelve funciones asíncronas y maneja automáticamente el estado de carga
- `LoadingSpinner`: Componente que muestra un spinner cuando isLoading es true
- `LoadingOverlay`: Componente que muestra un overlay de carga sobre el contenido

## LoadingContext

Contexto global para manejar estados de carga en toda la aplicación.

### Configuración:

El `LoadingProvider` debe envolver tu aplicación en `App.tsx`:

```tsx
import { LoadingProvider } from './contexts/LoadingContext'

function App() {
  return (
    <LoadingProvider>
      {/* Tu aplicación aquí */}
    </LoadingProvider>
  )
}
```

### Uso:

```tsx
import { useLoadingContext } from '../contexts/LoadingContext'

function MyComponent() {
  const { 
    globalLoading, 
    loadingMessage, 
    startGlobalLoading, 
    stopGlobalLoading, 
    withGlobalLoading 
  } = useLoadingContext()

  // Usando withGlobalLoading
  const handleGlobalAction = withGlobalLoading(async () => {
    await api.performAction()
  }, 'Procesando acción...')

  return (
    <button onClick={handleGlobalAction}>
      Realizar acción
    </button>
  )
}
```

## Componentes de Loading

### GlobalLoading

Componente de overlay global que se muestra sobre toda la aplicación.

```tsx
import { GlobalLoading } from '../components/GlobalLoading'

<GlobalLoading isLoading={true} message="Cargando aplicación..." />
```

### SectionLoading

Componente para mostrar loading en secciones específicas.

```tsx
import { SectionLoading } from '../components/GlobalLoading'

<SectionLoading isLoading={isLoading} message="Cargando datos..." />
```

### ButtonLoading

Componente para mostrar loading en botones.

```tsx
import { ButtonLoading } from '../components/GlobalLoading'

<ButtonLoading isLoading={isLoading}>
  Enviar formulario
</ButtonLoading>
```

## Ejemplos de Uso

### 1. Loading en formularios:

```tsx
function LoginForm() {
  const { isLoading, withLoading } = useLoading()
  const { login } = useAuth()

  const handleSubmit = withLoading(async (formData) => {
    await login(formData.email, formData.password)
  })

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={isLoading}>
        <ButtonLoading isLoading={isLoading}>
          Iniciar sesión
        </ButtonLoading>
      </button>
    </form>
  )
}
```

### 2. Loading en páginas:

```tsx
function DashboardPage() {
  const { isLoading, withLoading } = useLoading()
  const [data, setData] = useState(null)

  const loadData = withLoading(async () => {
    const result = await api.getDashboardData()
    setData(result)
  })

  useEffect(() => {
    loadData()
  }, [])

  if (isLoading) {
    return <SectionLoading isLoading={true} message="Cargando dashboard..." />
  }

  return <div>{/* Contenido del dashboard */}</div>
}
```

### 3. Loading global para acciones importantes:

```tsx
function ProfilePage() {
  const { withGlobalLoading } = useLoadingContext()

  const handleUpdateProfile = withGlobalLoading(async (profileData) => {
    await api.updateProfile(profileData)
    toast.success('Perfil actualizado')
  }, 'Actualizando perfil...')

  return (
    <button onClick={() => handleUpdateProfile(data)}>
      Guardar cambios
    </button>
  )
}
```

---

## useAuthLoading Hook

Hook especializado para operaciones de autenticación con mensajes específicos para cada operación.

### Tipos de operaciones soportadas:

- `login` - Inicio de sesión
- `register` - Registro de usuario
- `logout` - Cierre de sesión
- `verify` - Verificación de email
- `reset-password` - Restablecimiento de contraseña
- `forgot-password` - Recuperación de contraseña

### Uso básico:

```tsx
import { useAuthLoading } from '../hooks/useAuthLoading'

function LoginComponent() {
  const { isLoading, operation, message, withAuthLoading } = useAuthLoading()

  const handleLogin = withAuthLoading('login', async (email, password) => {
    await authService.login(email, password)
  }, {
    loadingMessage: 'Iniciando sesión...',
    successMessage: '¡Bienvenido de vuelta!',
    errorMessage: 'Error al iniciar sesión',
    showSuccessToast: true,
    showErrorToast: true
  })

  return (
    <button onClick={() => handleLogin(email, password)} disabled={isLoading}>
      {isLoading ? message : 'Iniciar sesión'}
    </button>
  )
}
```

### Propiedades:

- `isLoading`: Estado booleano de carga
- `operation`: Tipo de operación actual ('login', 'register', etc.)
- `message`: Mensaje de carga actual
- `startLoading`: Función para iniciar carga manualmente
- `stopLoading`: Función para detener carga manualmente
- `withAuthLoading`: Función que envuelve operaciones de autenticación

---

## useLoginLoading Hook

Hook simplificado específico para operaciones de login.

### Uso:

```tsx
import { useLoginLoading } from '../hooks/useAuthLoading'

function LoginPage() {
  const { isLoading, message, withLoginLoading } = useLoginLoading()

  const onSubmit = withLoginLoading(async (data) => {
    await login(data.email, data.password)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <button type="submit" disabled={isLoading}>
        {isLoading ? message : 'Iniciar sesión'}
      </button>
    </form>
  )
}
```

---

## useRegisterLoading Hook

Hook simplificado específico para operaciones de registro.

### Uso:

```tsx
import { useRegisterLoading } from '../hooks/useAuthLoading'

function RegisterPage() {
  const { isLoading, message, withRegisterLoading } = useRegisterLoading()

  const onSubmit = withRegisterLoading(async (data) => {
    await register(data)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <button type="submit" disabled={isLoading}>
        {isLoading ? message : 'Crear cuenta'}
      </button>
    </form>
  )
}
```

---

## useFormLoading Hook

Hook especializado para formularios con seguimiento de progreso y validación.

### Uso básico:

```tsx
import { useFormLoading } from '../hooks/useFormLoading'

function ComplexForm() {
  const {
    isSubmitting,
    isValidating,
    submitProgress,
    withFormSubmit
  } = useFormLoading()

  const handleSubmit = withFormSubmit(async (formData) => {
    await api.submitForm(formData)
  }, {
    simulateProgress: true,
    progressDuration: 2000,
    onProgress: (progress) => console.log(`Progress: ${progress}%`)
  })

  return (
    <form onSubmit={handleSubmit}>
      {isSubmitting && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${submitProgress}%` }}
          />
        </div>
      )}
      <button type="submit" disabled={isSubmitting || isValidating}>
        Enviar
      </button>
    </form>
  )
}
```

### Propiedades:

- `isSubmitting`: Estado de envío del formulario
- `isValidating`: Estado de validación
- `submitProgress`: Progreso del envío (0-100)
- `startSubmitting`: Iniciar envío manualmente
- `stopSubmitting`: Detener envío manualmente
- `startValidating`: Iniciar validación
- `stopValidating`: Detener validación
- `setProgress`: Establecer progreso manualmente
- `withFormSubmit`: Función que envuelve el envío del formulario

---

## useAuthFormLoading Hook

Hook combinado que junta `useAuthLoading` con `useFormLoading` para formularios de autenticación complejos.

### Uso:

```tsx
import { useAuthFormLoading } from '../hooks/useFormLoading'

function AdvancedLoginForm() {
  const {
    isLoading,
    isSubmitting,
    isValidating,
    submitProgress,
    withFormSubmit
  } = useAuthFormLoading()

  // ... implementación
}
```

---

## Componentes de Animación

### LoadingDots

Animación de puntos de carga:

```tsx
import { LoadingDots } from '../components/LoadingDots'

<LoadingDots size="sm" color="#7c3aed" />
```

### LoadingText

Texto con animación de puntos:

```tsx
import { LoadingText } from '../components/LoadingDots'

<LoadingText text="Procesando" showDots={true} />
```

### PulseLoader

Loader con animación de pulso:

```tsx
import { PulseLoader } from '../components/LoadingDots'

<PulseLoader size={40} color="#7c3aed" />
```

### Spinner

Spinner circular personalizado:

```tsx
import { Spinner } from '../components/LoadingDots'

<Spinner size={24} color="#7c3aed" thickness={3} />
```

### ProgressBar

Barra de progreso:

```tsx
import { ProgressBar } from '../components/LoadingDots'

<ProgressBar 
  progress={75} 
  height={4} 
  showPercentage={true}
  animated={true}
/>
```

### RippleLoader

Loader con efecto de ondas:

```tsx
import { RippleLoader } from '../components/LoadingDots'

<RippleLoader size={64} color="#7c3aed" />
```

### BouncingDots

Múltiples puntos rebotando:

```tsx
import { BouncingDots } from '../components/LoadingDots'

<BouncingDots count={3} size={8} color="#7c3aed" />
```

---

## Componentes de Loading Mejorados

### GlobalLoading

Ahora soporta múltiples variantes de animación:

```tsx
import { GlobalLoading } from '../components/GlobalLoading'

<GlobalLoading 
  isLoading={true} 
  message="Cargando..." 
  variant="pulse" // 'spinner' | 'pulse' | 'ripple' | 'heart'
/>
```

### LoadingOverlay

Overlay de carga sobre contenido:

```tsx
import { LoadingOverlay } from '../components/GlobalLoading'

<LoadingOverlay isLoading={true} message="Procesando..." blur={true}>
  <YourContent />
</LoadingOverlay>
```

### Skeleton

Placeholders animados para contenido:

```tsx
import { Skeleton } from '../components/GlobalLoading'

<Skeleton variant="text" width="100%" height={20} />
<Skeleton variant="circular" width={40} height={40} />
<Skeleton variant="rectangular" width="100%" height={200} />
```

---

## Características

- ✅ Loading local para componentes específicos
- ✅ Loading global para toda la aplicación
- ✅ Hooks especializados para autenticación
- ✅ Hooks para formularios con progreso
- ✅ Componentes de animación variados
- ✅ Múltiples variantes visuales (spinner, pulse, ripple, heart)
- ✅ Soporte para skeleton loaders
- ✅ Componentes reutilizables (Spinner, Overlay, Button, Dots, etc.)
- ✅ Integración automática con funciones asíncronas
- ✅ Mensajes personalizables
- ✅ Toasts automáticos de éxito/error
- ✅ Seguimiento de progreso en formularios
- ✅ Diseño consistente con el tema de la aplicación
- ✅ Animaciones suaves y profesionales
- ✅ Soporte para dark mode
- ✅ Accesibilidad y UX optimizada


