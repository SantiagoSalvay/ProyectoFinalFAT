import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { 
  User, 
  Building, 
  MapPin, 
  Mail, 
  Calendar, 
  Edit, 
  Save, 
  X,
  Heart,
  Users,
  Award
} from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: user?.location || '',
    bio: user?.bio || '',
    organization: user?.organization || ''
  })

  const isONG = user?.role === 'ong'

  const handleSave = () => {
    // Aquí se guardaría en el backend
    toast.success('Perfil actualizado exitosamente')
    setIsEditing(false)
  }

  const handleCancel = () => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      location: user?.location || '',
      bio: user?.bio || '',
      organization: user?.organization || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">
            Gestiona tu información personal y preferencias
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Información Personal
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center text-purple-600 hover:text-purple-700"
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isONG ? 'Nombre de la Organización' : 'Nombre Completo'}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{profileData.name}</span>
                    </div>
                  )}
                </div>

                {/* Organization (only for ONG) */}
                {isONG && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Legal
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.organization}
                        onChange={(e) => setProfileData(prev => ({ ...prev, organization: e.target.value }))}
                        className="input-field"
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Building className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-900">{profileData.organization}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{profileData.email}</span>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      className="input-field"
                      placeholder="Ciudad, País"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{profileData.location || 'No especificada'}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biografía
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      className="input-field"
                      rows={4}
                      placeholder={isONG ? "Describe tu organización y misión..." : "Cuéntanos sobre ti..."}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">
                        {profileData.bio || 'No hay biografía disponible'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Member Since */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Miembro desde
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Fecha no disponible'}
                    </span>
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={handleSave}
                      className="btn-primary flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Role Badge */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Cuenta</h3>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
                  {isONG ? <Building className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">
                    {isONG ? 'Organización' : 'Persona'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isONG ? 'Puedes crear publicaciones' : 'Puedes donar y hacer voluntariado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart className="w-5 h-5 text-red-500 mr-3" />
                    <span className="text-gray-700">
                      {isONG ? 'Donaciones Recibidas' : 'Donaciones Realizadas'}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">24</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-blue-500 mr-3" />
                    <span className="text-gray-700">
                      {isONG ? 'Voluntarios' : 'Horas de Voluntariado'}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {isONG ? '156' : '48h'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-yellow-500 mr-3" />
                    <span className="text-gray-700">Logros</span>
                  </div>
                  <span className="font-semibold text-gray-900">12</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <button className="w-full btn-primary text-sm">
                  {isONG ? 'Crear Campaña' : 'Buscar ONGs'}
                </button>
                <button className="w-full btn-secondary text-sm">
                  {isONG ? 'Gestionar Voluntarios' : 'Ver Oportunidades'}
                </button>
                <button className="w-full btn-accent text-sm">
                  Ver Historial
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 