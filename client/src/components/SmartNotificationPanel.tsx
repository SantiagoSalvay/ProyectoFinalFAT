import React from 'react'
import { useNotifications } from '../contexts/NotificationContext'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  X,
  Check,
  CheckCheck,
  AlertCircle,
  Info,
  AlertTriangle,
  User,
  Activity,
  Users,
  Settings
} from 'lucide-react'

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'success':
      return <Check className="w-5 h-5 text-green-600" />
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-600" />
    default:
      return <Info className="w-5 h-5 text-blue-600" />
  }
}

const CategoryIcon = ({ category }: { category?: string }) => {
  switch (category) {
    case 'profile':
      return <User className="w-4 h-4 text-purple-600" />
    case 'activity':
      return <Activity className="w-4 h-4 text-green-600" />
    case 'social':
      return <Users className="w-4 h-4 text-blue-600" />
    case 'system':
      return <Settings className="w-4 h-4 text-gray-600" />
    default:
      return <Bell className="w-4 h-4 text-gray-600" />
  }
}

const NotificationItem = ({ notification, onMarkAsRead, onRemove }: {
  notification: any,
  onMarkAsRead: (id: string) => void,
  onRemove: (id: string) => void
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (notification.link) {
      navigate(notification.link)
    }
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
  }

  return (
    <div
      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.read ? 'bg-blue-50/50' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <NotificationIcon type={notification.type} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <CategoryIcon category={notification.category} />
              <p className="text-sm font-medium text-gray-900">
                {notification.title}
              </p>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {new Date(notification.timestamp).toLocaleDateString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(notification.id)
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-1">
            {notification.message}
          </p>

          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              notification.priority === 'high'
                ? 'bg-red-100 text-red-800'
                : notification.priority === 'medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {notification.priority === 'high' ? 'Alta prioridad' :
               notification.priority === 'medium' ? 'Media prioridad' : 'Baja prioridad'}
            </span>

            {!notification.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkAsRead(notification.id)
                }}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <Check className="w-3 h-3" />
                <span>Marcar como leída</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SmartNotificationPanel() {
  const { notifications, markAsRead, markAllAsRead, removeNotification, unreadCount, clearCategory } = useNotifications()
  const [isOpen, setIsOpen] = React.useState(false)
  const [filter, setFilter] = React.useState<'all' | 'unread' | 'profile' | 'activity' | 'social' | 'system'>('all')

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read
      case 'profile':
        return notification.category === 'profile'
      case 'activity':
        return notification.category === 'activity'
      case 'social':
        return notification.category === 'social'
      case 'system':
        return notification.category === 'system'
      default:
        return true
    }
  })

  const getFilterLabel = () => {
    switch (filter) {
      case 'unread':
        return `No leídas (${unreadCount})`
      case 'profile':
        return 'Perfil'
      case 'activity':
        return 'Actividad'
      case 'social':
        return 'Social'
      case 'system':
        return 'Sistema'
      default:
        return `Todas (${notifications.length})`
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Marcar todas como leídas</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1 mt-3">
              {[
                { key: 'all', label: 'Todas' },
                { key: 'unread', label: 'No leídas' },
                { key: 'profile', label: 'Perfil' },
                { key: 'activity', label: 'Actividad' },
                { key: 'social', label: 'Social' },
                { key: 'system', label: 'Sistema' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    filter === key
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {key === 'unread' ? `No leídas (${unreadCount})` : label}
                </button>
              ))}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No hay notificaciones</p>
                <p className="text-sm text-gray-400 mt-1">
                  {filter === 'all' ? '¡Todo está al día!' : `No hay notificaciones en ${getFilterLabel().toLowerCase()}`}
                </p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onRemove={removeNotification}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {filteredNotifications.length} notificación{filteredNotifications.length !== 1 ? 'es' : ''}
                </span>
                {filter !== 'all' && (
                  <button
                    onClick={() => clearCategory(filter === 'all' ? undefined : filter)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Limpiar categoría
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
