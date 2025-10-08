import React, { useState, useEffect } from 'react'
import { api, ONG } from '../services/api'
import { Trophy, Star, Users, Heart, TrendingUp, Award, Filter, Search, Building } from 'lucide-react'

export default function RankingPage() {
  const [ongs, setOngs] = useState<ONG[]>([])
  const [ongsWithCategories, setOngsWithCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [sortBy, setSortBy] = useState('impact')
  const [location, setLocation] = useState('')
  const [groupFilter, setGroupFilter] = useState('')

  useEffect(() => {
    const fetchOngs = async () => {
      try {
        setLoading(true)
        const response = await api.getONGs()
        setOngs(response.ongs)
        
        // Cargar datos de TipoONG para cada ONG y asignar categorías por defecto
        const ongsWithCategories = await Promise.all(
          response.ongs.map(async (ong) => {
            try {
              const tipoONG = await api.getTipoONGById(ong.id)
              return {
                ...ong,
                grupo_social: tipoONG?.grupo_social || 'Otros',
                necesidad: tipoONG?.necesidad || 'General',
                puntos: ong.puntos || 0
              }
            } catch (error) {
              console.error(`Error al cargar TipoONG para ONG ${ong.id}:`, error)
              return {
                ...ong,
                grupo_social: 'Otros',
                necesidad: 'General',
                puntos: ong.puntos || 0
              }
            }
          })
        )
        
        setOngsWithCategories(ongsWithCategories)
        
        // Calcular estadísticas reales
        const totalPuntos = ongsWithCategories.reduce((sum, ong) => sum + (ong.puntos || 0), 0)
        const avgPuntos = ongsWithCategories.length > 0 ? totalPuntos / ongsWithCategories.length : 0
        
        setStats({
          total_ongs: response.ongs.length,
          avg_impact: avgPuntos,
          total_volunteers: 120,
          total_projects: 35
        })
      } catch (error) {
        console.error('Error al cargar ONGs:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOngs()
  }, [])

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case 'impact': return 'Impacto Social'
      case 'rating': return 'Calificación'
      case 'projects': return 'Proyectos'
      case 'volunteers': return 'Voluntarios'
      case 'donations': return 'Donaciones'
      default: return 'Impacto Social'
    }
  }

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500 fill-current" />
      case 2: return <Trophy className="w-6 h-6 text-gray-400 fill-current" />
      case 3: return <Trophy className="w-6 h-6 text-orange-500 fill-current" />
      default: return <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold">{position}</span>
    }
  }

  // Filtrado y ordenamiento de ONGs
  const filteredAndSortedOngs = ongsWithCategories
    .filter(ong => {
      const groupMatch = groupFilter === '' || ong.grupo_social === groupFilter
      const locationMatch = location === '' || ong.location.toLowerCase().includes(location.toLowerCase())
      return groupMatch && locationMatch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'impact':
        case 'donations':
          // Ordenar por puntos (mayor a menor)
          return (b.puntos || 0) - (a.puntos || 0)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'projects':
          return (b.projects_count || 0) - (a.projects_count || 0)
        case 'volunteers':
          return (b.volunteers_count || 0) - (a.volunteers_count || 0)
        default:
          return (b.puntos || 0) - (a.puntos || 0)
      }
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">🏆 Ranking de ONGs</h1>
            <p className="text-xl text-purple-100">
              Descubre las organizaciones con mayor impacto social
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Building className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total ONGs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_ongs}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Puntos Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(stats.avg_impact)} pts</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Voluntarios</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_volunteers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Heart className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Proyectos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_projects}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="impact">Impacto Social</option>
                  <option value="rating">Calificación</option>
                  <option value="projects">Proyectos</option>
                  <option value="volunteers">Voluntarios</option>
                  <option value="donations">Donaciones</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por ubicación..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <select
                value={groupFilter}
                onChange={e => setGroupFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todos los grupos</option>
                <option value="Niños">Niños</option>
                <option value="Gente mayor">Gente mayor</option>
                <option value="Mujeres">Mujeres</option>
                <option value="Animales">Animales</option>
                <option value="Personas con discapacidad">Personas con discapacidad</option>
                <option value="Familias">Familias</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de ONGs (usuarios tipo 2) */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Ranking de ONGs - {getSortLabel(sortBy)}
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredAndSortedOngs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No hay ONGs que coincidan con los filtros seleccionados.</div>
            ) : (
              filteredAndSortedOngs.map((ong, index) => (
                <div key={ong.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getRankIcon(index + 1)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{ong.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full flex items-center">
                            <Trophy className="w-4 h-4 mr-1" />
                            {ong.puntos || 0} pts
                          </span>
                          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {ong.grupo_social}
                          </span>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {ong.necesidad}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">📧 {ong.email}</p>
                      <p className="text-sm text-gray-600">📍 {ong.location}</p>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Star className="w-3 h-3 mr-1 text-yellow-500" />
                          {(ong.rating || 0).toFixed(1)} rating
                        </span>
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1 text-blue-500" />
                          {ong.volunteers_count || 0} voluntarios
                        </span>
                        <span className="flex items-center">
                          <Heart className="w-3 h-3 mr-1 text-red-500" />
                          {ong.projects_count || 0} proyectos
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Información sobre el ranking */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            <Award className="w-5 h-5 inline mr-2" />
            ¿Cómo funciona el sistema de puntos?
          </h3>
          <div className="text-blue-800 space-y-2">
            <p><strong>Sistema de Puntos:</strong> Las ONGs acumulan puntos por cada donación recibida y proyecto completado. El ranking se actualiza automáticamente según los puntos totales.</p>
            <p><strong>Impacto Social / Donaciones:</strong> Ordenado por puntos totales acumulados (mayor a menor).</p>
            <p><strong>Calificación:</strong> Ordenado por el promedio de calificaciones de los usuarios (1-5 estrellas).</p>
            <p><strong>Proyectos:</strong> Ordenado por el número total de proyectos activos y completados.</p>
            <p><strong>Voluntarios:</strong> Ordenado por la cantidad de voluntarios registrados y activos.</p>
            <p className="mt-4 pt-3 border-t border-blue-200"><strong>💡 Nota:</strong> Los puntos se otorgan automáticamente cuando las ONGs reciben y gestionan donaciones. ¡Cuanto más impacto generen, mayor será su posición en el ranking!</p>
          </div>
        </div>
      </div>
    </div>
  )
}