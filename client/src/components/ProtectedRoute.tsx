import React, { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { showErrorToast } from '../utils/toastHelper'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
  requireONG?: boolean
  allowedRoles?: number[]
}

/**
 * Componente para proteger rutas que requieren autenticación
 * 
 * Props:
 * - requireAdmin: Si true, solo permite acceso a administradores (tipo_usuario >= 3)
 * - requireONG: Si true, solo permite acceso a ONGs (tipo_usuario >= 2)
 * - allowedRoles: Array de roles permitidos (tipo_usuario)
 */
export default function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireONG = false,
  allowedRoles 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Guardar la ruta a la que intentaba acceder para redirigir después del login
    showErrorToast('Debes iniciar sesión para acceder a esta página')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Validar que el usuario exista
  if (!user) {
    console.error('❌ Usuario autenticado pero sin datos de usuario')
    showErrorToast('Error de autenticación. Por favor, inicia sesión nuevamente.')
    return <Navigate to="/login" replace />
  }

  // Obtener el rol del usuario
  const userRole = (user as any)?.tipo_usuario ?? (user as any)?.id_tipo_usuario ?? 0

  // Validar roles específicos
  if (requireAdmin && userRole < 3) {
    showErrorToast('No tienes permisos para acceder a esta página')
    return <Navigate to="/dashboard" replace />
  }

  if (requireONG && userRole < 2) {
    showErrorToast('Esta función está disponible solo para organizaciones')
    return <Navigate to="/dashboard" replace />
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    showErrorToast('No tienes permisos para acceder a esta página')
    return <Navigate to="/dashboard" replace />
  }

  // Si es admin, forzar a usar la página de admin
  if (userRole >= 3 && !location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin" replace />
  }

  // Prevenir que no-admins accedan a rutas de admin
  if (location.pathname.startsWith('/admin') && userRole < 3) {
    showErrorToast('Acceso denegado: se requieren privilegios de administrador')
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
