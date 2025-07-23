import { useState, useEffect } from 'react'
import { api, ONG, RankingStats } from '../services/api'
import { Trophy, Star, Users, Heart, TrendingUp, Award, Filter, Search, Building } from 'lucide-react'

export default function RankingPage() {
  const [ranking, setRanking] = useState<ONG[]>([])
  const [stats, setStats] = useState<RankingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'impact' | 'rating' | 'projects' | 'volunteers' | 'donations'>('impact')
  const [location, setLocation] = useState('')
  const [type, setType] = useState<'all' | 'public' | 'private'>('all')

  useEffect(() => {
    loadRanking()
    loadStats()
  }, [sortBy, location, type])

  const loadRanking = async () => {
    try {
      setLoading(true)
      let response
      
      if (location) {
        response = await api.getRankingByLocation(location, sortBy)
      } else if (type !== 'all') {
        response = await api.getRankingByType(type, sortBy)
      } else {
        response = await api.getRanking(sortBy, 20)
      }
      
      setRanking(response.ranking)
    } catch (error) {
      console.error('Error loading ranking:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await api.getRankingStats()
      setStats(response.stats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

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
                  <p className="text-sm font-medium text-gray-600">Impacto Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avg_impact.toFixed(1)}</p>
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
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todos los tipos</option>
                <option value="public">Públicas</option>
                <option value="private">Privadas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ranking */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Top {ranking.length} - {getSortLabel(sortBy)}
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {ranking.map((ong, index) => (
              <div key={ong.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{ong.name}</h3>
                        <p className="text-sm text-gray-600">{ong.location}</p>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="flex items-center justify-center">
                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                            <span className="ml-1 font-semibold">{ong.rating.toFixed(1)}</span>
                          </div>
                          <p className="text-xs text-gray-500">Calificación</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-500" />
                            <span className="ml-1 font-semibold">{ong.volunteers_count}</span>
                          </div>
                          <p className="text-xs text-gray-500">Voluntarios</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center">
                            <Heart className="w-5 h-5 text-red-500" />
                            <span className="ml-1 font-semibold">{ong.projects_count}</span>
                          </div>
                          <p className="text-xs text-gray-500">Proyectos</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            <span className="ml-1 font-semibold">{ong.impact_score.toFixed(1)}</span>
                          </div>
                          <p className="text-xs text-gray-500">Impacto</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-gray-700 line-clamp-2">{ong.description}</p>
                    </div>
                    
                    <div className="mt-3 flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ong.type === 'public' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {ong.type === 'public' ? 'Pública' : 'Privada'}
                      </span>
                      
                      <a
                        href={ong.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                      >
                        Visitar sitio web →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Información sobre el ranking */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            <Award className="w-5 h-5 inline mr-2" />
            ¿Cómo se calcula el ranking?
          </h3>
          <div className="text-blue-800 space-y-2">
            <p><strong>Impacto Social:</strong> Basado en el número de proyectos completados, voluntarios activos y donaciones recibidas.</p>
            <p><strong>Calificación:</strong> Promedio de las calificaciones de los usuarios (1-5 estrellas).</p>
            <p><strong>Proyectos:</strong> Número total de proyectos activos y completados.</p>
            <p><strong>Voluntarios:</strong> Cantidad de voluntarios registrados y activos.</p>
            <p><strong>Donaciones:</strong> Monto total de donaciones recibidas en el último año.</p>
          </div>
        </div>
      </div>
    </div>
  )
} 