import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { CheckCircle } from 'lucide-react'

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [authStatus, setAuthStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [userInfo, setUserInfo] = useState<any>(null)
  const [token, setToken] = useState<string>('')

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const tokenParam = searchParams.get('token')
      const provider = searchParams.get('provider')
      const error = searchParams.get('error')

      if (error) {
        setAuthStatus('error')
        toast.error('Error en la autenticación. Inténtalo de nuevo.')
        setTimeout(() => navigate('/login'), 3000)
        return
      }

      if (!tokenParam) {
        setAuthStatus('error')
        toast.error('Token de autenticación no encontrado.')
        setTimeout(() => navigate('/login'), 3000)
        return
      }

      try {
        // Guardar token en localStorage
        localStorage.setItem('token', tokenParam)
        setToken(tokenParam)

        // Obtener información del usuario
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${tokenParam}`
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Error del servidor:', errorData)
          throw new Error(`Error del servidor: ${errorData.error || 'Error desconocido'}`)
        }

        const { user } = await response.json()
        console.log('Usuario recibido del servidor:', user)

        // Verificar que el usuario tenga los datos necesarios
        if (!user || !user.correo) {
          throw new Error('Usuario no válido: faltan datos esenciales')
        }

        // Actualizar contexto de autenticación
        setUser(user)
        setUserInfo(user)
        setAuthStatus('success')

        // Mostrar mensaje de éxito
        toast.success(`¡Bienvenido! Iniciaste sesión con ${provider}`)

        // Redirigir a la página principal después de 5 segundos
        setTimeout(() => {
          navigate('/')
        }, 5000)

      } catch (error) {
        console.error('Error en callback OAuth:', error)
        setAuthStatus('error')
        toast.error(`Error al procesar la autenticación: ${error.message}`)
        setTimeout(() => navigate('/login'), 3000)
      }
    }

    handleOAuthCallback()
  }, [searchParams, navigate, setUser])


  const goToHome = () => {
    navigate('/')
  }

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Procesando autenticación...
          </h2>
          <p className="text-gray-600">
            Por favor espera mientras completamos tu inicio de sesión.
          </p>
        </div>
      </div>
    )
  }

  if (authStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error de Autenticación</h2>
          <p className="text-gray-600 mb-6">
            Hubo un problema al procesar tu inicio de sesión. Serás redirigido al login en unos segundos.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Volver al Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Header de éxito */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            ¡Inicio de Sesión Exitoso!
          </h2>
          <p className="text-gray-600 text-lg">
            Te has autenticado correctamente con Google
          </p>
        </div>

        {/* Información del usuario */}
        {userInfo && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-gray-700">
              Bienvenido, <span className="font-semibold">{userInfo.nombre} {userInfo.apellido}</span>
            </p>
          </div>
        )}

        {/* Botón de acción */}
        <div className="space-y-3">
          <button
            onClick={goToHome}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Ir a la Página Principal
          </button>
          <p className="text-sm text-gray-500">
            Serás redirigido automáticamente en 5 segundos...
          </p>
        </div>
      </div>
    </div>
  )
}
