"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import HeartPin from "@/components/HeartPin"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulación de validación de login
    // En una aplicación real, aquí harías la llamada a tu API
    setTimeout(() => {
      if (formData.email === "demo@demos.com" && formData.password === "123456") {
        // Login exitoso
        router.push("/main-dashboard")
      } else {
        // Error de credenciales
        setError("Email o contraseña incorrectos. Por favor, verifica tus datos.")
      }
      setIsLoading(false)
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
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
            href="/"
            className="border-2 border-[#2b555f] text-[#2b555f] px-6 py-2 rounded-lg font-semibold hover:bg-[#2b555f] hover:text-white transition-colors"
          >
            VOLVER
          </Link>
        </div>
      </header>

      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Heart location pins */}
        <div className="absolute top-32 left-1/4">
          <HeartPin color="#00445d" size="lg" className="opacity-80" />
        </div>

        <div className="absolute top-20 right-1/4">
          <HeartPin color="#73e4fd" size="md" className="opacity-80" />
        </div>

        <div className="absolute top-40 right-1/3 w-20 h-20 bg-[#00445d] rounded-full opacity-60"></div>

        {/* Abstract geometric shapes */}
        <div className="absolute bottom-0 left-0 w-full h-96 opacity-40">
          <svg viewBox="0 0 800 300" className="w-full h-full">
            {/* Main geometric shapes */}
            <polygon points="100,300 200,200 300,280 250,300" fill="#73e4fd" opacity="0.6" />
            <polygon points="400,300 500,180 600,260 550,300" fill="#2b555f" opacity="0.5" />
            <polygon points="200,300 350,220 450,290 300,300" fill="#00445d" opacity="0.4" />

            {/* Heart pins on the geometric shapes */}
            <circle cx="180" cy="240" r="15" fill="#ff6b6b" />
            <circle cx="480" cy="220" r="12" fill="#ffd93d" />
            <circle cx="380" cy="260" r="10" fill="#73e4fd" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-6 py-16">
        <div className="w-full max-w-md">
          {/* Login Form Container */}
          <div className="bg-[#73e4fd] bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white border-opacity-30">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <input
                  type="text"
                  name="email"
                  placeholder="Mail o Nombre de Usuario"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-white border-opacity-50 bg-white bg-opacity-80 placeholder-gray-500 text-[#2b555f] focus:outline-none focus:border-[#2b555f] focus:bg-white transition-all"
                />
              </div>

              {/* Password Field */}
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-white border-opacity-50 bg-white bg-opacity-80 placeholder-gray-500 text-[#2b555f] focus:outline-none focus:border-[#2b555f] focus:bg-white transition-all"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  <p className="text-sm">{error}</p>
                  <Link
                    href="/forgot-password"
                    className="text-red-800 hover:text-red-900 underline text-sm font-medium mt-1 inline-block"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2b555f] text-white py-3 rounded-lg font-semibold hover:bg-[#00445d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar sesion"}
              </button>

              {/* Register Link */}
              <div className="text-center">
                <span className="text-[#2b555f] text-sm">no tenes cuenta? </span>
                <Link
                  href="/register"
                  className="text-[#00445d] hover:text-[#2b555f] font-semibold text-sm underline transition-colors"
                >
                  registrarse gratis
                </Link>
              </div>
            </form>
          </div>

          {/* Demo Credentials */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-600 bg-white bg-opacity-80 rounded-lg p-2">
              <strong>Demo:</strong> email: demo@demos.com | contraseña: 123456
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
