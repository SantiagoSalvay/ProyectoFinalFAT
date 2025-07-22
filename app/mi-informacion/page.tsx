"use client"

import { useState } from "react"
import Link from "next/link"
import { User, Mail, Phone, MapPin, Calendar, Edit } from "lucide-react"

export default function MiInformacionPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [userInfo, setUserInfo] = useState({
    nombre: "Juan Pérez",
    email: "demo@demos.com",
    telefono: "+54 11 1234-5678",
    ubicacion: "Buenos Aires, Argentina",
    fechaNacimiento: "1990-05-15",
    descripcion: "Voluntario activo en causas sociales y ambientales.",
  })

  const handleSave = () => {
    setIsEditing(false)
    // Aquí iría la lógica para guardar los cambios
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#73e4fd] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/main-dashboard" className="text-4xl md:text-5xl font-bold text-[#2b555f]">
            DEMOS+
          </Link>
          <Link
            href="/main-dashboard"
            className="border-2 border-[#2b555f] text-[#2b555f] px-6 py-2 rounded-lg font-semibold hover:bg-[#2b555f] hover:text-white transition-colors"
          >
            VOLVER
          </Link>
        </div>
      </header>

      <main className="px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border-2 border-[#2b555f] rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-[#2b555f]">Mi Información</h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 bg-[#73e4fd] text-[#2b555f] px-4 py-2 rounded-lg hover:bg-[#2b555f] hover:text-white transition-colors"
              >
                <Edit className="w-4 h-4" />
                {isEditing ? "Cancelar" : "Editar"}
              </button>
            </div>

            <div className="space-y-6">
              {/* Nombre */}
              <div className="flex items-center gap-4">
                <User className="w-5 h-5 text-[#2b555f]" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#2b555f] mb-1">Nombre completo</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userInfo.nombre}
                      onChange={(e) => setUserInfo({ ...userInfo, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
                    />
                  ) : (
                    <p className="text-[#2b555f] font-medium">{userInfo.nombre}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-[#2b555f]" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#2b555f] mb-1">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                      className="w-full px-3 py-2 border border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
                    />
                  ) : (
                    <p className="text-[#2b555f] font-medium">{userInfo.email}</p>
                  )}
                </div>
              </div>

              {/* Teléfono */}
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-[#2b555f]" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#2b555f] mb-1">Teléfono</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={userInfo.telefono}
                      onChange={(e) => setUserInfo({ ...userInfo, telefono: e.target.value })}
                      className="w-full px-3 py-2 border border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
                    />
                  ) : (
                    <p className="text-[#2b555f] font-medium">{userInfo.telefono}</p>
                  )}
                </div>
              </div>

              {/* Ubicación */}
              <div className="flex items-center gap-4">
                <MapPin className="w-5 h-5 text-[#2b555f]" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#2b555f] mb-1">Ubicación</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userInfo.ubicacion}
                      onChange={(e) => setUserInfo({ ...userInfo, ubicacion: e.target.value })}
                      className="w-full px-3 py-2 border border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
                    />
                  ) : (
                    <p className="text-[#2b555f] font-medium">{userInfo.ubicacion}</p>
                  )}
                </div>
              </div>

              {/* Fecha de nacimiento */}
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-[#2b555f]" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#2b555f] mb-1">Fecha de nacimiento</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={userInfo.fechaNacimiento}
                      onChange={(e) => setUserInfo({ ...userInfo, fechaNacimiento: e.target.value })}
                      className="w-full px-3 py-2 border border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
                    />
                  ) : (
                    <p className="text-[#2b555f] font-medium">{userInfo.fechaNacimiento}</p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-[#2b555f] mb-1">Descripción</label>
                {isEditing ? (
                  <textarea
                    value={userInfo.descripcion}
                    onChange={(e) => setUserInfo({ ...userInfo, descripcion: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
                  />
                ) : (
                  <p className="text-[#2b555f] font-medium">{userInfo.descripcion}</p>
                )}
              </div>

              {isEditing && (
                <button
                  onClick={handleSave}
                  className="w-full bg-[#00445d] text-white py-3 rounded-lg font-semibold hover:bg-[#2b555f] transition-colors"
                >
                  Guardar cambios
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
