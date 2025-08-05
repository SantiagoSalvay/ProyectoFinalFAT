"use client"

import React, { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../client/src/contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('Usuario no autenticado, redirigiendo al login...')
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#73e4fd]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2b555f] mx-auto mb-4"></div>
          <p className="text-[#2b555f] font-semibold">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#73e4fd]">
        <div className="text-center">
          <p className="text-[#2b555f] font-semibold">Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}