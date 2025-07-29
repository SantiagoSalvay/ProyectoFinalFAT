"use client"

import React, { useState, useEffect } from "react"
import { User, Mail, MapPin, Calendar, Edit } from "lucide-react"
import { api } from "../../client/src/services/api"
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
    createdAt: null as Date | null,
  })

  const loadUserProfile = async () => {
    try {
      setIsLoading(true)
      const response = await api.getProfile()
      console.log('Respuesta completa del perfil:', response)
      
      if (response?.user) {
        const userData = response.user
        console.log('Datos del usuario a cargar:', userData)
        
        // Actualizar el estado inmediatamente
        const newUserInfo = {
          nombre: userData.nombre || "",
          apellido: userData.apellido || "",
          correo: userData.correo || "",
          telefono: userData.telefono || "",
          ubicacion: userData.ubicacion || "",
          bio: userData.bio || "",
          createdAt: userData.createdAt || null,
        }
        console.log('Actualizando estado con:', newUserInfo)
        setUserInfo(newUserInfo)
      } else {
        console.error('No se recibieron datos del usuario')
        toast.error("No se pudieron cargar los datos del usuario")
      }
    } catch (error) {
      console.error("Error detallado al cargar perfil:", error)
      toast.error("Error al cargar la información del perfil")
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    loadUserProfile()
  }, [])

  // Efecto para mostrar los datos actualizados
  useEffect(() => {
    console.log('Estado de userInfo actualizado:', userInfo)
  }, [userInfo])

  const handleSave = async () => {
    try {
      const response = await api.updateProfile(userInfo)
      console.log('Respuesta de actualización:', response)
      if (response?.user) {
        setUserInfo(prev => ({
          ...prev,
          ...response.user
        }))
      }
      setIsEditing(false)
      toast.success("Perfil actualizado exitosamente")
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      toast.error("Error al actualizar el perfil")
    }
  }

  const handleCancel = () => {
    loadUserProfile()
    setIsEditing(false)
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
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Información</h1>
        
        <pre className="mb-4 p-4 bg-gray-100 rounded">
          {JSON.stringify(userInfo, null, 2)}
        </pre>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </button>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Guardar
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Nombre completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo
              </label>
              {isEditing ? (
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={userInfo.nombre}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, nombre: e.target.value }))}
                    className="flex-1 rounded-md border border-gray-300 p-2"
                    placeholder="Nombre"
                  />
                  <input
                    type="text"
                    value={userInfo.apellido}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, apellido: e.target.value }))}
                    className="flex-1 rounded-md border border-gray-300 p-2"
                    placeholder="Apellido"
                  />
                </div>
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <span>
                    {userInfo.nombre || userInfo.apellido 
                      ? `${userInfo.nombre} ${userInfo.apellido}`.trim()
                      : "No especificado"}
                  </span>
                </div>
              )}
            </div>

            {/* Correo electrónico - No editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <span>{userInfo.correo || "No especificado"}</span>
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={userInfo.ubicacion}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, ubicacion: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 p-2"
                  placeholder="Tu ubicación"
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <span>{userInfo.ubicacion || "No especificada"}</span>
                </div>
              )}
            </div>

            {/* Miembro desde - No editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Miembro desde
              </label>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <span>
                  {userInfo.createdAt 
                    ? new Date(userInfo.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })
                    : "Fecha no disponible"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
