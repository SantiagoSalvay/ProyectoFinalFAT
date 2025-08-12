"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { useAuth } from "../../../client/src/contexts/AuthContext"

export default function VerifyEmailPage() {
  const router = useRouter()
  const params = useParams()
  const { setUserFromVerification } = useAuth()
  const token = params.token as string
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [userData, setUserData] = useState<any>(null)

  console.log('VerifyEmailPage cargado')
  console.log('Params:', params)
  console.log('Token:', token)

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!token) {
          setVerificationStatus('error')
          setErrorMessage('Token de verificación no válido')
          return
        }

        console.log('Verificando token:', token)
        
        // Hacer petición al servidor para verificar el token
        const response = await fetch(`http://localhost:3001/auth/verify-email/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()
        console.log('Respuesta de verificación:', data)

        if (response.ok && data.verified) {
          setVerificationStatus('success')
          setUserData(data.user)
          
          // Establecer usuario y token en el contexto de autenticación
          if (data.token && data.user) {
            setUserFromVerification(data.user, data.token)
          }
          
          console.log('Verificación exitosa, redirigiendo en 3 segundos...')
          
          // Redirigir después de 3 segundos
          setTimeout(() => {
            router.push('/mapa')
          }, 3000)
        } else {
          setVerificationStatus('error')
          setErrorMessage(data.error || 'Error al verificar el email')
          toast.error(data.error || 'Error al verificar el email')
        }
      } catch (error) {
        console.error('Error al verificar email:', error)
        setVerificationStatus('error')
        setErrorMessage('Error de conexión. Por favor, intenta nuevamente.')
        toast.error('Error de conexión')
      }
    }

    verifyEmail()
  }, [token, router])

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#73e4fd] flex items-center justify-center">
        <div className="bg-[#73e4fd] bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white border-opacity-30 text-center max-w-md w-full mx-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2b555f] mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-[#2b555f] mb-2">Verificando tu email...</h2>
          <p className="text-[#2b555f] text-sm">Por favor espera mientras confirmamos tu cuenta.</p>
        </div>
      </div>
    )
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-[#73e4fd]">
        <header className="bg-[#73e4fd] px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-4xl md:text-5xl font-bold text-[#2b555f]">
              DEMOS+
            </Link>
            <Link href="/login" className="border-2 border-[#2b555f] text-[#2b555f] px-6 py-2 rounded-lg font-semibold hover:bg-[#2b555f] hover:text-white transition-colors">
              INICIAR SESIÓN
            </Link>
          </div>
        </header>

        <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-6 py-8">
          <div className="w-full max-w-md">
            <div className="bg-[#73e4fd] bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white border-opacity-30 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#2b555f] mb-2">Error de verificación</h2>
                <p className="text-red-600 text-sm">{errorMessage}</p>
              </div>
              
              <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-6">
                <p className="text-[#2b555f] text-sm leading-relaxed">
                  Es posible que el enlace haya expirado o ya haya sido utilizado. 
                  Puedes intentar registrarte nuevamente si es necesario.
                </p>
              </div>

              <div className="space-y-3">
                <Link 
                  href="/register"
                  className="block w-full bg-[#2b555f] text-white py-3 rounded-lg font-semibold hover:bg-[#00445d] transition-colors text-center"
                >
                  Volver a registrarse
                </Link>
                <Link 
                  href="/login"
                  className="block w-full border-2 border-[#2b555f] text-[#2b555f] py-3 rounded-lg font-semibold hover:bg-[#2b555f] hover:text-white transition-colors text-center"
                >
                  Ir a iniciar sesión
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // verificationStatus === 'success'
  return (
    <div className="min-h-screen bg-[#73e4fd]">
      <header className="bg-[#73e4fd] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-4xl md:text-5xl font-bold text-[#2b555f]">
            DEMOS+
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-6 py-8">
        <div className="w-full max-w-md">
          <div className="bg-[#73e4fd] bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white border-opacity-30 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#2b555f] mb-2">¡Email verificado exitosamente!</h2>
              <p className="text-green-700 text-sm">
                Tu cuenta ha sido activada correctamente.
              </p>
            </div>
            
            <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-6">
              <p className="text-[#2b555f] text-sm leading-relaxed mb-3">
                ¡Bienvenido a DEMOS+, <strong>{userData?.nombre} {userData?.apellido}</strong>!
              </p>
              <p className="text-[#2b555f] text-sm leading-relaxed">
                En unos segundos serás redirigido automáticamente a tu cuenta.
                Tu sesión se ha iniciado automáticamente.
              </p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => {
                  console.log('Navegando inmediatamente a /mapa')
                  router.push('/mapa')
                }}
                className="w-full bg-[#2b555f] text-white py-3 rounded-lg font-semibold hover:bg-[#00445d] transition-colors"
              >
                Ir a mi cuenta ahora
              </button>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-center">
                <div className="w-6 h-1 bg-[#2b555f] rounded-full animate-pulse mr-1"></div>
                <div className="w-6 h-1 bg-[#2b555f] rounded-full animate-pulse mr-1" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-6 h-1 bg-[#2b555f] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-xs text-[#2b555f] mt-2">Redirigiendo automáticamente...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}