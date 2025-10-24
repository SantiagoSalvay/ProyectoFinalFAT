import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

/**
 * Hook personalizado para proteger la navegación
 * Detecta intentos de manipulación de URL y acceso no autorizado
 */
export const useSecureNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()
  const lastPathRef = useRef<string>('')
  const hasShownErrorRef = useRef<boolean>(false)

  useEffect(() => {
    // Evitar ejecutar múltiples veces para la misma ruta
    if (lastPathRef.current === location.pathname) {
      return
    }
    lastPathRef.current = location.pathname
    hasShownErrorRef.current = false
    // Detectar intentos de path traversal en la URL
    if (location.pathname.includes('..') || location.pathname.includes('//')) {
      console.warn('⚠️ Intento de path traversal detectado:', location.pathname)
      toast.error('Acceso no autorizado')
      navigate('/dashboard', { replace: true })
      return
    }

    // Detectar caracteres peligrosos en la URL
    const dangerousPatterns = [
      /<script/gi,
      /javascript:/gi,
      /%3Cscript/gi,
      /eval\(/gi,
      /expression\(/gi,
    ]

    const fullURL = location.pathname + location.search + location.hash
    if (dangerousPatterns.some(pattern => pattern.test(fullURL))) {
      console.warn('⚠️ Caracteres peligrosos detectados en URL:', fullURL)
      toast.error('URL inválida detectada')
      navigate('/dashboard', { replace: true })
      return
    }

    // Validar IDs numéricos en la URL
    const idMatch = location.pathname.match(/\/(\d+)/)
    if (idMatch) {
      const id = parseInt(idMatch[1], 10)
      if (isNaN(id) || id <= 0 || id > Number.MAX_SAFE_INTEGER) {
        console.warn('⚠️ ID inválido en URL:', id)
        toast.error('ID inválido')
        navigate(-1)
        return
      }
    }

    // Prevenir acceso a rutas de admin sin permisos
    if (location.pathname.startsWith('/admin')) {
      const userRole = (user as any)?.tipo_usuario ?? (user as any)?.id_tipo_usuario ?? 0
      if (userRole < 3) {
        console.warn('⚠️ Intento de acceso no autorizado a admin:', user)
        toast.error('Acceso denegado: se requieren privilegios de administrador')
        navigate('/dashboard', { replace: true })
        return
      }
    }

    // Prevenir acceso a rutas protegidas sin autenticación
    const protectedRoutes = [
      '/dashboard',
      '/profile',
      '/forum',
      '/acciones',
      '/pagos',
      '/complete-data'
    ]

    const isProtectedRoute = protectedRoutes.some(route => 
      location.pathname.startsWith(route)
    )

    if (isProtectedRoute && !isAuthenticated && !hasShownErrorRef.current) {
      console.warn('⚠️ Intento de acceso a ruta protegida sin autenticación')
      hasShownErrorRef.current = true
      // No mostrar toast aquí, el ProtectedRoute ya lo hace
      navigate('/login', { state: { from: location }, replace: true })
      return
    }
  }, [location, isAuthenticated, user, navigate])

  return {
    navigateSafely: (path: string) => {
      // Validar el path antes de navegar
      if (path.includes('..') || path.includes('//')) {
        console.warn('⚠️ Intento de navegación insegura:', path)
        toast.error('Ruta inválida')
        return
      }
      navigate(path)
    }
  }
}

/**
 * Hook para detectar manipulación del localStorage
 */
export const useStorageProtection = () => {
  const hasShownErrorRef = useRef(false)
  
  useEffect(() => {
    const checkStorage = () => {
      const token = localStorage.getItem('token')
      
      if (token) {
        try {
          // Validar formato básico del JWT
          const parts = token.split('.')
          if (parts.length !== 3) {
            console.warn('⚠️ Token manipulado detectado en localStorage')
            localStorage.removeItem('token')
            if (!hasShownErrorRef.current) {
              hasShownErrorRef.current = true
              toast.error('Tu sesión ha sido comprometida. Por favor, inicia sesión nuevamente.')
              setTimeout(() => {
                window.location.href = '/login'
              }, 1000)
            }
            return
          }

          // Decodificar payload (no verifica firma, solo valida formato)
          try {
            const payload = JSON.parse(atob(parts[1]))
            
            // Verificar que tenga los campos esperados
            if (!payload.userId || !payload.email) {
              console.warn('⚠️ Token con payload inválido')
              localStorage.removeItem('token')
              if (!hasShownErrorRef.current) {
                hasShownErrorRef.current = true
                toast.error('Sesión inválida. Por favor, inicia sesión nuevamente.')
                setTimeout(() => {
                  window.location.href = '/login'
                }, 1000)
              }
              return
            }

            // Verificar expiración
            if (payload.exp && payload.exp * 1000 < Date.now()) {
              console.warn('⚠️ Token expirado')
              localStorage.removeItem('token')
              if (!hasShownErrorRef.current) {
                hasShownErrorRef.current = true
                toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
                setTimeout(() => {
                  window.location.href = '/login'
                }, 1000)
              }
              return
            }
          } catch (decodeError) {
            console.warn('⚠️ Error al decodificar token:', decodeError)
            localStorage.removeItem('token')
            if (!hasShownErrorRef.current) {
              hasShownErrorRef.current = true
              toast.error('Token inválido. Por favor, inicia sesión nuevamente.')
              setTimeout(() => {
                window.location.href = '/login'
              }, 1000)
            }
          }
        } catch (error) {
          console.error('Error validando token:', error)
        }
      }
    }

    // Verificar al montar (solo una vez)
    let hasChecked = false
    if (!hasChecked) {
      hasChecked = true
      checkStorage()
    }

    // Verificar periódicamente cada 60 segundos (reducido de 30)
    const interval = setInterval(checkStorage, 60000)

    // Escuchar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkStorage()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])
}

/**
 * Hook para prevenir clickjacking
 */
export const useClickjackingProtection = () => {
  useEffect(() => {
    // Prevenir que la aplicación sea embebida en un iframe
    if (window.self !== window.top) {
      console.warn('⚠️ Aplicación embebida en iframe detectada')
      
      // Intentar escapar del iframe
      try {
        window.top!.location = window.self.location
      } catch (error) {
        // Si falla, ocultar el contenido
        document.body.innerHTML = 'Por razones de seguridad, esta aplicación no puede ser embebida en un iframe.'
      }
    }
  }, [])
}

/**
 * Hook combinado de seguridad
 */
export const useSecurity = () => {
  useSecureNavigation()
  useStorageProtection()
  useClickjackingProtection()
}

