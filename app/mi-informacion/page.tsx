"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { User, Mail, Phone, MapPin, Calendar, Edit } from "lucide-react"
import { api } from "../../src/services/api"
import { toast } from "react-hot-toast"

export default function MiInformacionPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userInfo, setUserInfo] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    ubicacion: "",
    bio: "",
  })

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setIsLoading(true)
      const { user } = await api.getProfile()
      setUserInfo({
        nombre: user.nombre || "",
        apellido: user.apellido || "",
        correo: user.correo || "",
        telefono: user.telefono || "",
        ubicacion: user.ubicacion || "",
        bio: user.bio || "",
      })
    } catch (error) {
      console.error("Error al cargar perfil:", error)
      toast.error("Error al cargar la información del perfil")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await api.updateProfile(userInfo)
      setIsEditing(false)
      toast.success("Perfil actualizado exitosamente")
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      toast.error("Error al actualizar el perfil")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2b555f] mx-auto"></div>
          <p className="mt-4 text-[#2b555f]">Cargando perfil...</p>
        </div>
      </div>
    )
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

      <main className="py-12">
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
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={userInfo.nombre}
                        onChange={(e) => setUserInfo({ ...userInfo, nombre: e.target.value })}
                        placeholder="Nombre"
                        className="w-1/2 px-3 py-2 border border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
                      />
                      <input
                        type="text"
                        value={userInfo.apellido}
                        onChange={(e) => setUserInfo({ ...userInfo, apellido: e.target.value })}
                        placeholder="Apellido"
                        className="w-1/2 px-3 py-2 border border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
                      />
                    </div>
                  ) : (
                    <p className="text-[#2b555f] font-medium">{`${userInfo.nombre} ${userInfo.apellido}`}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-[#2b555f]" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#2b555f] mb-1">Email</label>
                  <p className="text-[#2b555f] font-medium">{userInfo.correo}</p>
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
                    <p className="text-[#2b555f] font-medium">{userInfo.telefono || "No especificado"}</p>
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
                      placeholder="Ciudad, País"
                    />
                  ) : (
                    <p className="text-[#2b555f] font-medium">{userInfo.ubicacion || "No especificada"}</p>
                  )}
                </div>
              </div>

              {/* Biografía */}
              <div>
                <label className="block text-sm font-medium text-[#2b555f] mb-1">Biografía</label>
                {isEditing ? (
                  <textarea
                    value={userInfo.bio}
                    onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
                    placeholder="Cuéntanos sobre ti..."
                  />
                ) : (
                  <p className="text-[#2b555f] font-medium">{userInfo.bio || "No hay biografía disponible"}</p>
                )}
              </div>

              {isEditing && (
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-[#00445d] text-white py-3 rounded-lg font-semibold hover:bg-[#2b555f] transition-colors"
                  >
                    Guardar cambios
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 border border-[#2b555f] rounded-lg text-[#2b555f] hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
