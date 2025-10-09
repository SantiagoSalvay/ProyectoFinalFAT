import React, { createContext, useContext, useState, ReactNode } from 'react'

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
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

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
    clearCategory
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