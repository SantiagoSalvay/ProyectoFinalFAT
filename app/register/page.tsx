"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import HeartPin from "@/components/HeartPin"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    dni: "",
    fechaNacimiento: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombreCompleto.trim()) {
      newErrors.nombreCompleto = "El nombre completo es requerido"
    }

    if (!formData.dni.trim()) {
      newErrors.dni = "El DNI es requerido"
    }

    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = "La fecha de nacimiento es requerida"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formErrors = validateForm()
    setErrors(formErrors)

    if (Object.keys(formErrors).length === 0) {
      // Simulación de registro exitoso
      setTimeout(() => {
        alert("¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.")
        router.push("/login")
      }, 1000)
    } else {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      })
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
            <polygon points="100,300 200,200 300,280 250,300" fill="#73e4fd" opacity="0.6" />
            <polygon points="400,300 500,180 600,260 550,300" fill="#2b555f" opacity="0.5" />
            <polygon points="200,300 350,220 450,290 300,300" fill="#00445d" opacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-6 py-8">
        <div className="w-full max-w-md">
          {/* Register Form Container */}
          <div className="bg-[#73e4fd] bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white border-opacity-30">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre Completo */}
              <div>
                <input
                  type="text"
                  name="nombreCompleto"
                  placeholder="Nombre completo"
                  value={formData.nombreCompleto}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-white border-opacity-50 bg-white bg-opacity-80 placeholder-gray-500 text-[#2b555f] focus:outline-none focus:border-[#2b555f] focus:bg-white transition-all"
                />
                {errors.nombreCompleto && <p className="text-red-600 text-sm mt-1">{errors.nombreCompleto}</p>}
              </div>

              {/* DNI */}
              <div>
                <input
                  type="text"
                  name="dni"
                  placeholder="DNI"
                  value={formData.dni}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-white border-opacity-50 bg-white bg-opacity-80 placeholder-gray-500 text-[#2b555f] focus:outline-none focus:border-[#2b555f] focus:bg-white transition-all"
                />
                {errors.dni && <p className="text-red-600 text-sm mt-1">{errors.dni}</p>}
              </div>

              {/* Fecha de Nacimiento */}
              <div className="relative">
                <input
                  type="date"
                  name="fechaNacimiento"
                  placeholder="fecha de nacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-white border-opacity-50 bg-white bg-opacity-80 placeholder-gray-500 text-[#2b555f] focus:outline-none focus:border-[#2b555f] focus:bg-white transition-all"
                />
                {errors.fechaNacimiento && <p className="text-red-600 text-sm mt-1">{errors.fechaNacimiento}</p>}
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Mail"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-white border-opacity-50 bg-white bg-opacity-80 placeholder-gray-500 text-[#2b555f] focus:outline-none focus:border-[#2b555f] focus:bg-white transition-all"
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Contraseña */}
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-white border-opacity-50 bg-white bg-opacity-80 placeholder-gray-500 text-[#2b555f] focus:outline-none focus:border-[#2b555f] focus:bg-white transition-all"
                />
                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Repetir Contraseña */}
              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="repetir contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-white border-opacity-50 bg-white bg-opacity-80 placeholder-gray-500 text-[#2b555f] focus:outline-none focus:border-[#2b555f] focus:bg-white transition-all"
                />
                {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2b555f] text-white py-3 rounded-lg font-semibold hover:bg-[#00445d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? "Creando cuenta..." : "Crear una cuenta"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
