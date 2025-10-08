import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()
  const { setUserFromVerification } = useAuth()
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [userData, setUserData] = useState<any>(null)
  const [userEmail, setUserEmail] = useState('')
  const [isTokenExpired, setIsTokenExpired] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const hasVerified = useRef(false) // Para evitar múltiples ejecuciones
  const [secondsLeft, setSecondsLeft] = useState<number>(5)

  console.log('VerifyEmailPage cargado en React Router')
  console.log('Token:', token)

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!token) {
          console.error('No hay token disponible')
          setVerificationStatus('error')
          setErrorMessage('Token de verificación no válido')
          return
        }

        console.log('🔍 Iniciando verificación con token:', token)
        
        // Hacer petición al servidor para verificar el token
        const response = await fetch(`/auth/verify-email/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        console.log('📡 Respuesta del servidor - Status:', response.status)
        
        const data = await response.json()
        console.log('📦 Datos recibidos:', data)

        if (response.ok && data.verified) {
          console.log('✅ Verificación exitosa!')
          setVerificationStatus('success')
          setUserData(data.user)
          
          // Establecer usuario y token en el contexto de autenticación
          if (data.token && data.user) {
            console.log('🔑 Estableciendo sesión automáticamente...')
            setUserFromVerification(data.user, data.token)
          }
          
          // Redirigir con contador
          console.log('🚀 Redirigiendo a la cuenta...')
          setSecondsLeft(5)
          const intervalId = setInterval(() => {
            setSecondsLeft(prev => {
              if (prev <= 1) {
                clearInterval(intervalId)
                navigate('/dashboard')
                return 0
              }
              return prev - 1
            })
          }, 1000)
        } else {
          console.error('❌ Error en la verificación:', data.error)
          setVerificationStatus('error')
          setErrorMessage(data.error || 'Error al verificar el email')
          
          // Verificar si el token expiró
          if (data.tokenExpired) {
            setIsTokenExpired(true)
            setUserEmail(data.email || '')
          }
          
          // Verificar si el usuario ya fue verificado
          if (data.alreadyVerified) {
            setErrorMessage('Este enlace ya fue utilizado. Tu cuenta ya está activa.')
          }
          
          toast.error(data.error || 'Error al verificar el email')
        }
      } catch (error) {
        console.error('💥 Error de conexión:', error)
        setVerificationStatus('error')
        setErrorMessage('Error de conexión. Por favor, intenta nuevamente.')
        toast.error('Error de conexión')
      }
    }

    // Solo ejecutar una vez cuando el componente se monta
    if (verificationStatus === 'loading' && !hasVerified.current) {
      hasVerified.current = true
      verifyEmail()
    }
  }, [token]) // Removido navigate y setUserFromVerification para evitar re-ejecuciones

  const handleResendVerification = async () => {
    if (!userEmail) {
      toast.error('No se pudo identificar el correo asociado')
      return
    }

    setIsResending(true)
    try {
      const response = await fetch('/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo: userEmail })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Email de verificación reenviado exitosamente')
        setVerificationStatus('success')
        setErrorMessage('')
        // Mostrar mensaje especial para indicar que se reenvió
        setUserData({ reenvio: true })
      } else {
        toast.error(data.error || 'Error al reenviar el email')
      }
    } catch (error) {
      console.error('Error al reenviar verificación:', error)
      toast.error('Error de conexión. Por favor, intenta nuevamente.')
    } finally {
      setIsResending(false)
    }
  }

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-200 text-center max-w-md w-full mx-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificando tu email...</h2>
          <p className="text-gray-600 text-sm">Por favor espera mientras confirmamos tu cuenta.</p>
        </div>
      </div>
    )
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-lg px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="text-4xl md:text-5xl font-bold text-purple-600">
              DEMOS+
            </Link>
            <Link to="/login" className="border-2 border-purple-600 text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition-colors">
              INICIAR SESIÓN
            </Link>
          </div>
        </header>

        <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-6 py-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-200 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error de verificación</h2>
                <p className="text-red-600 text-sm">{errorMessage}</p>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4 mb-6">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {isTokenExpired 
                    ? 'Este enlace de verificación no es válido.'
                    : 'Es posible que el enlace sea incorrecto o ya haya sido utilizado.'}
                </p>
                {isTokenExpired && userEmail && (
                  <p className="text-gray-700 text-sm mt-2">
                    Correo asociado: <strong>{userEmail}</strong>
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {isTokenExpired && userEmail ? (
                  <>
                    <button
                      onClick={handleResendVerification}
                      disabled={isResending}
                      className="block w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isResending ? 'Reenviando...' : 'Reenviar email de verificación'}
                    </button>
                    <Link 
                      to="/login"
                      className="block w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition-colors text-center"
                    >
                      Ir a iniciar sesión
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/register"
                      className="block w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center shadow-lg"
                    >
                      Volver a registrarse
                    </Link>
                    <Link 
                      to="/login"
                      className="block w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition-colors text-center"
                    >
                      Ir a iniciar sesión
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // verificationStatus === 'success'
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-lg px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-4xl md:text-5xl font-bold text-purple-600">
            DEMOS+
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-6 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-200 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {userData?.reenvio ? '¡Email de verificación reenviado!' : '¡Email verificado exitosamente!'}
              </h2>
              <p className="text-green-600 text-sm">
                {userData?.reenvio 
                  ? 'Se ha enviado un nuevo enlace de verificación a tu correo.'
                  : 'Tu cuenta ha sido activada correctamente.'}
              </p>
            </div>
            
            {userData?.reenvio ? (
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <p className="text-gray-700 text-sm leading-relaxed">
                  Por favor, revisa tu bandeja de entrada. El enlace de verificación permanecerá válido hasta que lo uses.
                </p>
                <p className="text-gray-700 text-sm leading-relaxed mt-2">
                  Si no recibes el correo, revisa tu carpeta de spam o correo no deseado.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 rounded-lg p-6 mb-6">
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  ¡Bienvenido a DEMOS+, <strong className="text-purple-600">{userData?.nombre} {userData?.apellido}</strong>!
                </p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Tu sesión se ha iniciado automáticamente. Serás redirigido a tu cuenta en {secondsLeft} segundos...
                </p>
              </div>
            )}

            <div className="space-y-3">
              {userData?.reenvio ? (
                <>
                  <Link 
                    to="/login"
                    className="block w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center shadow-lg"
                  >
                    Ir a iniciar sesión
                  </Link>
                  <Link 
                    to="/"
                    className="block w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition-colors text-center"
                  >
                    Volver al inicio
                  </Link>
                </>
              ) : (
                <button 
                  onClick={() => {
                    console.log('🚀 Navegando inmediatamente a la cuenta')
                    navigate('/dashboard')
                  }}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg"
                >
                  Ir a mi cuenta ahora
                </button>
              )}
            </div>

            {!userData?.reenvio && (
              <div className="mt-4">
                <div className="flex items-center justify-center">
                  <div className="w-6 h-1 bg-purple-600 rounded-full animate-pulse mr-1"></div>
                  <div className="w-6 h-1 bg-purple-600 rounded-full animate-pulse mr-1" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-6 h-1 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">Redirigiendo automáticamente...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}