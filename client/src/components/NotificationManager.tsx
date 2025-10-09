import { useUserNotifications } from '../hooks/useUserNotifications'

/**
 * Componente que gestiona las notificaciones automáticas del usuario
 * Se integra en App.tsx para funcionar globalmente
 */
export default function NotificationManager() {
  useUserNotifications()
  return null
}

