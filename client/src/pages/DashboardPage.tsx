import { useAuth } from '../contexts/AuthContext'
import { Heart, Users, DollarSign, Calendar, TrendingUp, Award, MapPin, Building } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()

  const isONG = user?.role === 'ong'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido, {user?.name}
          </h1>
          <p className="text-gray-600">
            {isONG ? 'Panel de control de tu organización' : 'Tu centro de actividades'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isONG ? 'Donaciones Recibidas' : 'Donaciones Realizadas'}
                </p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isONG ? 'Voluntarios Activos' : 'Horas de Voluntariado'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isONG ? '156' : '48h'}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isONG ? 'Total Recaudado' : 'Total Donado'}
                </p>
                <p className="text-2xl font-bold text-gray-900">$12,450</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Impacto</p>
                <p className="text-2xl font-bold text-gray-900">+15%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Actividad Reciente
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {isONG ? 'Nueva donación recibida' : 'Donación realizada'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isONG ? 'María García donó $50' : 'Donaste $50 a Fundación Ayuda'}
                    </p>
                    <p className="text-xs text-gray-500">Hace 2 horas</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {isONG ? 'Nuevo voluntario registrado' : 'Sesión de voluntariado completada'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isONG ? 'Juan Pérez se unió como voluntario' : 'Completaste 4 horas de voluntariado'}
                    </p>
                    <p className="text-xs text-gray-500">Hace 1 día</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {isONG ? 'Meta alcanzada' : 'Logro desbloqueado'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isONG ? 'Alcanzaste tu meta mensual de donaciones' : 'Completaste 10 donaciones'}
                    </p>
                    <p className="text-xs text-gray-500">Hace 3 días</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Acciones Rápidas
              </h3>
              
              <div className="space-y-3">
                <button className="w-full btn-primary text-sm">
                  {isONG ? 'Crear Nueva Campaña' : 'Buscar Organizaciones'}
                </button>
                <button className="w-full btn-secondary text-sm">
                  {isONG ? 'Gestionar Voluntarios' : 'Ver Oportunidades de Voluntariado'}
                </button>
                <button className="w-full btn-accent text-sm">
                  {isONG ? 'Ver Reportes' : 'Ver Mi Historial'}
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información de Perfil
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
                    {isONG ? <Building className="w-4 h-4 text-white" /> : <Users className="w-4 h-4 text-white" />}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">
                      {isONG ? 'Organización' : 'Persona'}
                    </p>
                  </div>
                </div>
                
                {user?.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {user.location}
                  </div>
                )}
                
                {isONG && user?.organization && (
                  <div className="text-sm text-gray-600">
                    <strong>Organización:</strong> {user.organization}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Próximos Eventos
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Campaña de Donación</p>
                    <p className="text-xs text-gray-600">15 de Diciembre</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-emerald-50 rounded-lg">
                  <Users className="w-5 h-5 text-emerald-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Sesión de Voluntariado</p>
                    <p className="text-xs text-gray-600">20 de Diciembre</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 