"use client"

import type React from "react"

import { useState } from "react"
import Header from "@/components/Header"
import { useRouter } from "next/navigation"

export default function RegistrarOngPage() {
  const [formData, setFormData] = useState({
    nombreOng: "",
    email: "",
    telefono: "",
    descripcion: "",
    area: "",
    ubicacion: "",
  })

  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para enviar los datos
    setTimeout(() => {
      router.push("/ong-confirmacion")
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-[#2b555f] mb-8 text-center">REGISTRAR UNA ONG</h1>

          <div className="bg-[#73e4fd] bg-opacity-20 rounded-lg p-8 mb-8">
            <p className="text-lg text-[#2b555f] text-center">
              Completa el formulario para registrar tu organización y comenzar a recibir apoyo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nombreOng" className="block text-lg font-semibold text-[#2b555f] mb-2">
                Nombre de la ONG *
              </label>
              <input
                type="text"
                id="nombreOng"
                name="nombreOng"
                required
                value={formData.nombreOng}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-lg font-semibold text-[#2b555f] mb-2">
                Email de contacto *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
              />
            </div>

            <div>
              <label htmlFor="telefono" className="block text-lg font-semibold text-[#2b555f] mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
              />
            </div>

            <div>
              <label htmlFor="area" className="block text-lg font-semibold text-[#2b555f] mb-2">
                Área de trabajo *
              </label>
              <select
                id="area"
                name="area"
                required
                value={formData.area}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
              >
                <option value="">Selecciona un área</option>
                <option value="educacion">Educación</option>
                <option value="salud">Salud</option>
                <option value="medio-ambiente">Medio Ambiente</option>
                <option value="derechos-humanos">Derechos Humanos</option>
                <option value="desarrollo-social">Desarrollo Social</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label htmlFor="ubicacion" className="block text-lg font-semibold text-[#2b555f] mb-2">
                Ubicación *
              </label>
              <input
                type="text"
                id="ubicacion"
                name="ubicacion"
                required
                value={formData.ubicacion}
                onChange={handleChange}
                placeholder="Ciudad, País"
                className="w-full px-4 py-3 border-2 border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
              />
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-lg font-semibold text-[#2b555f] mb-2">
                Descripción de la organización *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                required
                rows={4}
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describe brevemente la misión y actividades de tu ONG"
                className="w-full px-4 py-3 border-2 border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d] resize-vertical"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#00445d] text-white py-4 rounded-lg text-xl font-semibold hover:bg-[#2b555f] transition-colors"
            >
              Registrar ONG
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
