import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { toast } from 'react-hot-toast'

/**
 * Hook para gestionar notificaciones específicas por tipo de usuario
 */
export function useUserNotifications() {
  const { user, isAuthenticated } = useAuth()
  const { addNotification } = useNotifications()

  useEffect(() => {
    if (!isAuthenticated || !user) return

    const isONG = user.tipo_usuario === 2
    const hasShownWelcome = sessionStorage.getItem(`welcome_${user.id_usuario}`)
    const hasShownMissingData = sessionStorage.getItem(`missing_data_${user.id_usuario}`)

    // Notificación de bienvenida (una vez por sesión)
    if (!hasShownWelcome) {
      setTimeout(() => {
        if (isONG) {
          toast.success(`¡Bienvenida ${user.nombre}!`, {
            duration: 4000,
            icon: '🎉',
          })
        } else {
          toast.success(`¡Bienvenido ${user.nombre}!`, {
            duration: 4000,
            icon: '👋',
          })
        }
        sessionStorage.setItem(`welcome_${user.id_usuario}`, 'true')
      }, 1000)
    }

    // Notificaciones específicas para usuarios comunes
    if (!isONG) {
      // Si se registró con Google y falta información
      const isGoogleUser = (user as any).auth_provider === 'google'
      if (isGoogleUser && !hasShownMissingData) {
        const missingFields = []
        if (!user.ubicacion) missingFields.push('ubicación')
        if (!user.biografia) missingFields.push('biografía')
        
        if (missingFields.length > 0) {
          setTimeout(() => {
            toast.info(`Completa tu perfil: falta ${missingFields.join(', ')}`, {
              duration: 6000,
              icon: 'ℹ️',
            })
            sessionStorage.setItem(`missing_data_${user.id_usuario}`, 'true')
          }, 2000)
        }
      }
    }

    // Notificaciones específicas para ONGs
    if (isONG && !hasShownMissingData) {
      const missingFields = []
      if (!user.biografia) missingFields.push('descripción de la organización')
      if (!user.ubicacion) missingFields.push('ubicación')
      if (!(user as any).telefono) missingFields.push('teléfono de contacto')
      
      if (missingFields.length > 0) {
        setTimeout(() => {
          toast.warning(`Tu perfil está incompleto. Falta: ${missingFields.join(', ')}`, {
            duration: 7000,
            icon: '⚠️',
          })
          sessionStorage.setItem(`missing_data_${user.id_usuario}`, 'true')
        }, 2500)
      }
    }
  }, [isAuthenticated, user])

  return null
}

