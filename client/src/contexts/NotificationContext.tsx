import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { api } from '../services/api'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  link?: string
  priority?: 'low' | 'medium' | 'high'
  category?: 'profile' | 'activity' | 'social' | 'system'
  autoHide?: boolean
  autoHideDelay?: number
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'timestamp' | 'read'> & { id?: string }) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  unreadCount: number
  clearCategory: (category: Notification['category']) => void
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Verificar si el usuario está autenticado
  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  // Cargar notificaciones de la base de datos
  const refreshNotifications = async () => {
    if (!isAuthenticated) return
    
    try {
      const { notifications: dbNotifications } = await api.getNotifications()
      
      // Convertir notificaciones de la BD al formato del contexto
      const formattedNotifications: Notification[] = dbNotifications.map((n: any) => ({
        id: n.id_notificacion.toString(),
        type: getNotificationType(n.tipo_notificacion),
        title: getTitleFromType(n.tipo_notificacion),
        message: n.mensaje,
        timestamp: new Date(n.fecha_creacion),
        read: n.leida,
        priority: 'medium',
        category: 'system',
        autoHide: false
      }))
      
      setNotifications(formattedNotifications)
    } catch (error) {
      // Error silencioso - las notificaciones no son críticas
    }
  }

  // Cargar notificaciones al montar y cada 60 segundos (reducido para evitar recargas)
  useEffect(() => {
    if (!isAuthenticated) return
    
    refreshNotifications()
    
    const interval = setInterval(refreshNotifications, 60000) // 60 segundos
    
    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Función auxiliar para determinar el tipo de notificación
  const getNotificationType = (tipo: string): Notification['type'] => {
    if (tipo === 'ban' || tipo === 'mensaje_borrado') return 'warning'
    if (tipo === 'success') return 'success'
    if (tipo === 'error') return 'error'
    return 'info'
  }

  // Función auxiliar para obtener el título según el tipo
  const getTitleFromType = (tipo: string): string => {
    switch (tipo) {
      case 'ban':
        return 'Cuenta Suspendida'
      case 'mensaje_borrado':
        return 'Mensaje Eliminado'
      default:
        return 'Notificación'
    }
  }

  const addNotification = (notification: Omit<Notification, 'timestamp' | 'read'> & { id?: string }) => {
    const newNotification: Notification = {
      ...notification,
      id: notification.id || Date.now().toString(),
      timestamp: new Date(),
      read: false,
      priority: notification.priority || 'medium',
      category: notification.category || 'system',
      autoHide: notification.autoHide || false,
      autoHideDelay: notification.autoHideDelay || 5000
    }

    setNotifications(prev => [newNotification, ...prev])

    // Auto-hide functionality
    if (newNotification.autoHide) {
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, newNotification.autoHideDelay)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const clearCategory = (category: Notification['category']) => {
    setNotifications(prev => prev.filter(notification => notification.category !== category))
  }

  const unreadCount = notifications.filter(notification => !notification.read).length

  const value = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    unreadCount,
    clearCategory,
    refreshNotifications
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}