# Loading Hooks Documentation

Este directorio contiene hooks personalizados para manejar estados de carga en la aplicación.

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

## Características

- ✅ Loading local para componentes específicos
- ✅ Loading global para toda la aplicación
- ✅ Componentes reutilizables (Spinner, Overlay, Button)
- ✅ Integración automática con funciones asíncronas
- ✅ Mensajes personalizables
- ✅ Diseño consistente con el tema de la aplicación
- ✅ Accesibilidad y UX optimizada


