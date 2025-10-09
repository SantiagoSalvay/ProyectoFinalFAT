import React, { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Si es admin, forzar a usar la página distinta de admin
  const role = (user as any)?.tipo_usuario ?? (user as any)?.id_tipo_usuario ?? 0
  if (role >= 3 && location.pathname !== '/admin') {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
} 