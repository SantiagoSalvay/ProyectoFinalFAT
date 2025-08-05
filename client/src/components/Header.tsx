import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { Bell, Menu, X, Heart } from 'lucide-react'
import UserDropdown from './UserDropdown'

export default function Header() {
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
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
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
          </nav>
          {/* Right side - Auth & Notifications */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <UserDropdown user={user!} onLogout={logout} />
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
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
              className="md:hidden p-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-purple-600'
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {!isAuthenticated && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
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