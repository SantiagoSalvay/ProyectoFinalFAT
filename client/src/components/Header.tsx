import React, { useState, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { Bell, Menu, X, Heart, Moon, Sun } from 'lucide-react'
import UserDropdown from './UserDropdown'
import { useTheme } from '../contexts/ThemeContext'

export default function Header() {
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const { notifications, unreadCount, markAsRead, removeNotification } = useNotifications()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const bellRef = useRef<HTMLButtonElement>(null)
  const { theme, toggleTheme } = useTheme()

  // Navegación para usuarios NO registrados
  const unauthenticatedNavigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Misión', href: '/mission' },
    { name: 'ONGs', href: '/ongs' },
  ]

  // Navegación para usuarios registrados
  const authenticatedNavigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Donaciones', href: '/donaciones' },
    { name: 'Mapa', href: '/map' },
    { name: 'Ranking', href: '/ranking' },
    { name: 'Foro', href: '/forum' },
    { name: 'Dashboard', href: '/dashboard' },
  ]

  // Seleccionar navegación según el estado de autenticación
  const navigation = isAuthenticated ? authenticatedNavigation : unauthenticatedNavigation

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b shadow-sm" style={{ backgroundColor: 'color-mix(in oklab, var(--color-bg) 92%, transparent)', borderColor: 'var(--color-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div>
              <img src="../../../public/images/logo.png" alt="Logo" className="w-8 h-8" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
              Demos+
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 text-sm font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-purple-400 border-b-2 border-purple-500'
                    : 'text-gray-600 hover:text-purple-400'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side - Theme, Auth & Notifications */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border transition-colors"
              aria-label="Cambiar tema"
              title="Cambiar tema"
              style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-fg)', borderColor: 'var(--color-border)' }}>
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button
                  ref={bellRef}
                  className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors"
                  onClick={() => setShowNotifications(v => !v)}>
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div
                    style={{
                      position: 'fixed',
                      right: '32px',
                      top: '64px',
                      width: '320px',
                      zIndex: 1000,
                      backgroundColor: 'var(--color-card)',
                      color: 'var(--color-fg)',
                      borderColor: 'var(--color-border)'
                    }}
                    className="rounded-lg shadow-lg border"
                  >
                    <div
                      className="p-4 border-b font-bold"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-fg)' }}
                    >
                      Notificaciones
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center" style={{ color: 'var(--color-muted)' }}>
                        No tienes notificaciones nuevas.
                      </div>
                    ) : (
                      <ul className="max-h-96 overflow-y-auto">
                        {notifications.map(n => (
                          <li
                            key={n.id}
                            className="px-4 py-3 border-b flex items-start gap-2"
                            style={{
                              borderColor: 'var(--color-border)',
                              background:
                                n.read
                                  ? 'var(--color-card)'
                                  : 'color-mix(in oklab, var(--accent) 12%, var(--color-card))',
                              boxShadow: n.read ? undefined : 'inset 4px 0 0 0 var(--accent)'
                            }}
                          >
                            <div className="flex-1">
                              <div className="font-semibold text-base" style={{ color: 'var(--color-fg)' }}>{n.title}</div>
                              <div className="text-sm mb-1" style={{ color: 'var(--color-muted)' }}>{n.message}</div>
                              {n.link && (
                                <Link
                                  to={n.link}
                                  className="hover:underline font-medium text-xs"
                                  style={{ color: 'var(--link)' }}
                                  onClick={() => setShowNotifications(false)}
                                >
                                  Acceder
                                </Link>
                              )}
                              <div className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                                {typeof n.timestamp === 'string' ? n.timestamp : n.timestamp.toLocaleString()}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {!n.read && (
                                <button
                                  onClick={() => markAsRead(n.id)}
                                  className="text-xs px-2 py-1 rounded"
                                  style={{
                                    background: 'var(--accent)',
                                    color: 'var(--accent-contrast)'
                                  }}
                                >
                                  Leída
                                </button>
                              )}
                              <button
                                onClick={() => removeNotification(n.id)}
                                className="text-xs px-2 py-1 rounded"
                                style={{
                                  background: 'color-mix(in oklab, var(--color-fg) 10%, transparent)',
                                  color: 'var(--color-fg)'
                                }}
                              >
                                Eliminar
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* User Dropdown */}
                <UserDropdown user={user!} onLogout={logout} />
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-medium transition-colors"
                  style={{ color: 'var(--color-fg)' }}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 transition-colors"
              style={{ color: 'var(--color-fg)' }}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-purple-400'
                      : ''
                  }`}
                  style={{ color: 'var(--color-fg)' }}
                >
                  {item.name}
                </Link>
              ))}

              {!isAuthenticated && (
                <div className="flex flex-col space-y-2 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm font-medium transition-colors"
                    style={{ color: 'var(--color-fg)' }}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-primary text-sm text-center"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 