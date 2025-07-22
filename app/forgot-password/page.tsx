"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import HeartPin from "@/components/HeartPin"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulación de envío de email de recuperación
    setTimeout(() => {
      setMessage("Se ha enviado un enlace de recuperación a tu email.")
      setIsLoading(false)
    }, 1000)
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
      <div className="absolute inset-0 pointer-events-none">
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
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-6 py-16">
        <div className="w-full max-w-md">
          <div className="bg-[#73e4fd] bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white border-opacity-30">
            <h1 className="text-2xl font-bold text-[#2b555f] text-center mb-6">Recuperar Contraseña</h1>

            {message ? (
              <div className="text-center">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
                  <p>{message}</p>
                </div>
                <Link href="/login" className="text-[#00445d] hover:text-[#2b555f] font-semibold underline">
                  Volver al login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <p className="text-[#2b555f] text-sm mb-4 text-center">
                    Ingresa tu email y te enviaremos un enlace para recuperar tu contraseña.
                  </p>
                  <input
                    type="email"
                    placeholder="Tu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-white border-opacity-50 bg-white bg-opacity-80 placeholder-gray-500 text-[#2b555f] focus:outline-none focus:border-[#2b555f] focus:bg-white transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#2b555f] text-white py-3 rounded-lg font-semibold hover:bg-[#00445d] transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                </button>

                <div className="text-center">
                  <Link href="/login" className="text-[#00445d] hover:text-[#2b555f] font-semibold text-sm underline">
                    Volver al login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
