"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import HeartPin from "../../../components/HeartPin"

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    // Validar longitud mínima y complejidad
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      setIsLoading(false)
      return
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError("La contraseña debe contener al menos una mayúscula, una minúscula y un número")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/auth/reset-password/${params.token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nuevaContrasena: password }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Contraseña actualizada exitosamente")
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(data.error || 'Ocurrió un error al actualizar la contraseña')
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Header */}
      <header className="bg-[#73e4fd] px-6 py-4 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-4xl md:text-5xl font-bold text-[#2b555f]">
            DEMOS+
          </Link>
          <Link
            href="/login"
            className="border-2 border-[#2b555f] text-[#2b555f] px-6 py-2 rounded-lg font-semibold hover:bg-[#2b555f] hover:text-white transition-colors"
          >
            VOLVER
          </Link>
        </div>
      </header>

      {/* Background decorative elements */}
      <div className="absolute top-32 left-1/4">
        <HeartPin color="#00445d" size="lg" className="opacity-80" />
      </div>
      <div className="absolute top-20 right-1/4">
        <HeartPin color="#73e4fd" size="md" className="opacity-80" />
      </div>
      <div className="absolute bottom-0 left-0 w-full h-96 opacity-40">
        <svg viewBox="0 0 800 300" className="w-full h-full">
          <polygon points="100,300 200,200 300,280 250,300" fill="#73e4fd" opacity="0.6" />
          <polygon points="400,300 500,180 600,260 550,300" fill="#2b555f" opacity="0.5" />
        </svg>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-6 py-16">
        <div className="w-full max-w-md">
          <div className="bg-[#73e4fd] bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white border-opacity-30">
            <h1 className="text-2xl font-bold text-[#2b555f] text-center mb-6">Crear Nueva Contraseña</h1>

            {message ? (
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-10 h-10 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-[#2b555f] mb-4">¡Contraseña actualizada!</h2>
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
                  <p>{message}</p>
                </div>
                <p className="text-[#2b555f] text-sm">Redirigiendo al login en unos segundos...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <p className="text-[#2b555f] text-sm mb-4 text-center">
                    Ingresa tu nueva contraseña.
                  </p>
                  <input
                    type="password"
                    placeholder="Nueva contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-white border-opacity-50 bg-white bg-opacity-80 placeholder-gray-500 text-[#2b555f] focus:outline-none focus:border-[#2b555f] focus:bg-white transition-all mb-4"
                  />
                  <input
                    type="password"
                    placeholder="Confirmar nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-white border-opacity-50 bg-white bg-opacity-80 placeholder-gray-500 text-[#2b555f] focus:outline-none focus:border-[#2b555f] focus:bg-white transition-all"
                  />
                </div>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    <p>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#2b555f] text-white py-3 rounded-lg font-semibold hover:bg-[#00445d] transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Actualizando..." : "Actualizar contraseña"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 