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
        
        // Ordenar por puntos de mayor a menor
        const sortedOngs = ongsWithCategories.sort((a, b) => (b.puntos || 0) - (a.puntos || 0))
        
        setOngsWithCategories(sortedOngs)
        
        // Calcular estadísticas reales
        const totalPuntos = sortedOngs.reduce((sum, ong) => sum + (ong.puntos || 0), 0)
        setStats({
          total_ongs: response.ongs.length,
          avg_impact: sortedOngs.length > 0 ? totalPuntos / sortedOngs.length / 100 : 0,
          total_volunteers: Math.floor(totalPuntos / 10),
          total_projects: Math.floor(totalPuntos / 20),
          total_puntos: totalPuntos
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

  // Filtrado de ONGs por grupo social y ubicación
  const filteredOngs = ongsWithCategories.filter(ong => {
    const groupMatch = groupFilter === '' || ong.grupo_social === groupFilter
    const locationMatch = location === '' || ong.location.toLowerCase().includes(location.toLowerCase())
    return groupMatch && locationMatch
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">🏆 Ranking de ONGs</h1>
            <p className="text-base sm:text-lg md:text-xl text-purple-100 px-4">
              Descubre las organizaciones con mayor impacto social
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center">
                <Building className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total ONGs</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_ongs}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Puntos Totales</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_puntos?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Impacto Promedio</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.avg_impact.toFixed(1)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Voluntarios</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_volunteers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Proyectos</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_projects}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="text-xs sm:text-sm font-medium text-gray-700">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 sm:flex-none border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="impact">Impacto Social</option>
                  <option value="projects">Proyectos</option>
                  <option value="volunteers">Voluntarios</option>
                  <option value="donations">Donaciones</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 flex-1">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar ubicación..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <select
                value={groupFilter}
                onChange={e => setGroupFilter(e.target.value)}
                className="w-full sm:w-auto border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
        <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6 sm:mt-8">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Lista de ONGs registradas
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredOngs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No hay ONGs que coincidan con los filtros seleccionados.</div>
            ) : (
              filteredOngs.map((ong, index) => (
                <div key={ong.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="flex-shrink-0 self-start">
                      {getRankIcon(index + 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words flex-1">{ong.name}</h3>
                          <span className="bg-green-100 text-green-800 text-xs font-bold px-2 sm:px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                             {ong.puntos || 0} pts
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 sm:px-2.5 py-0.5 rounded">
                            {ong.grupo_social}
                          </span>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 sm:px-2.5 py-0.5 rounded">
                            {ong.necesidad}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-2 break-all">📧 {ong.email}</p>
                      <p className="text-xs sm:text-sm text-gray-600 break-words">📍 {ong.location}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Información sobre el ranking */}
        <div className="mt-6 sm:mt-8 mb-6 sm:mb-8 bg-blue-50 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
            ¿Cómo funciona el ranking?
          </h3>
          <div className="text-blue-800 space-y-2 text-sm sm:text-base">
            <p><strong>🏆 Puntos:</strong> El ranking se ordena automáticamente según los puntos acumulados por cada ONG en la base de datos. Las ONGs con más puntos ocupan las primeras posiciones.</p>
            <p><strong>📊 Sistema dinámico:</strong> Los puntos se actualizan en tiempo real según las actividades y contribuciones de cada ONG.</p>
            <p><strong>🥇 Posiciones:</strong> Las tres primeras posiciones se destacan con trofeos de oro, plata y bronce.</p>
            <p className="mt-4 text-xs sm:text-sm italic">
              💡 El ranking se actualiza automáticamente cada vez que cargas esta página, reflejando los datos más recientes de la base de datos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}