import React, { useState, useEffect } from 'react'
import { api, ONG } from '../services/api'
import { Trophy, Star, Users, Heart, TrendingUp, Award, Filter, Search, Building, Medal, Crown } from 'lucide-react'

interface RankingData {
  puesto: number
  usuario: {
    id: number
    nombre: string
    apellido: string
    tipo_usuario: number
  }
  puntos: number
  ultima_actualizacion: string
}

interface RankingResponse {
  tipo: string
  rankings: RankingData[]
}

export default function RankingPage() {
  const [rankings, setRankings] = useState<RankingData[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [tipoRanking, setTipoRanking] = useState('ONGs')
  const [miRanking, setMiRanking] = useState<any>(null)
  const [location, setLocation] = useState('')
  const [groupFilter, setGroupFilter] = useState('')

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true)
        
        // Cargar rankings del tipo seleccionado
        const response = await fetch(`/api/ranking/rankings?tipo=${tipoRanking}&limite=100`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (response.ok) {
          const data: RankingResponse = await response.json()
          setRankings(data.rankings)
          
          // Calcular estadísticas
          const totalPuntos = data.rankings.reduce((sum, r) => sum + r.puntos, 0)
          const ongsCount = data.rankings.filter(r => r.usuario.tipo_usuario === 2).length
          const usuariosCount = data.rankings.filter(r => r.usuario.tipo_usuario === 1).length
          
          setStats({
            total_participantes: data.rankings.length,
            total_ongs: ongsCount,
            total_usuarios: usuariosCount,
            total_puntos: totalPuntos,
            avg_puntos: data.rankings.length > 0 ? totalPuntos / data.rankings.length : 0
          })
        }
        
        // Cargar mi ranking personal
        try {
          const miRankingResponse = await fetch(`/api/ranking/mi-ranking?tipo=${tipoRanking}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
          
          if (miRankingResponse.ok) {
            const miRankingData = await miRankingResponse.json()
            setMiRanking(miRankingData)
          }
        } catch (error) {
          console.log('No se pudo cargar ranking personal (usuario no autenticado)')
        }
        
      } catch (error) {
        console.error('Error al cargar rankings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRankings()
  }, [tipoRanking])

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500 fill-current" />
      case 2: return <Medal className="w-6 h-6 text-gray-400 fill-current" />
      case 3: return <Medal className="w-6 h-6 text-orange-500 fill-current" />
      default: return <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold">{position}</span>
    }
  }

  const getTipoUsuarioLabel = (tipo: number) => {
    switch (tipo) {
      case 1: return 'Usuario'
      case 2: return 'ONG'
      case 3: return 'Admin'
      default: return 'Desconocido'
    }
  }

  const getTipoUsuarioColor = (tipo: number) => {
    switch (tipo) {
      case 1: return 'bg-blue-100 text-blue-800'
      case 2: return 'bg-green-100 text-green-800'
      case 3: return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Filtrado de rankings
  const filteredRankings = rankings.filter(ranking => {
    const groupMatch = groupFilter === '' || getTipoUsuarioLabel(ranking.usuario.tipo_usuario) === groupFilter
    return groupMatch
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">🏆 Sistema de Rankings</h1>
            <p className="text-base sm:text-lg md:text-xl text-purple-100 px-4">
              Descubre quiénes tienen mayor impacto social en la comunidad
            </p>
          </div>
        </div>
      </div>

      {/* Mi Ranking Personal */}
      {miRanking && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">🏆 Tu Posición en el Ranking</h2>
                <div className="flex space-x-6">
                  {Object.entries(miRanking).map(([tipo, data]: [string, any]) => (
                    <div key={tipo} className="text-white">
                      <p className="text-sm opacity-90">{tipo}</p>
                      <p className="text-2xl font-bold">#{data.puesto}</p>
                      <p className="text-sm opacity-90">{data.puntos} puntos</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right text-white">
                <p className="text-sm opacity-90">Última actualización</p>
                <p className="text-sm">{new Date(miRanking.General?.ultima_actualizacion || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Participantes</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_participantes}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center">
                <Building className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">ONGs</p>
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
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Promedio Puntos</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.avg_puntos.toFixed(0)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Usuarios</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_usuarios}</p>
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
                <span className="text-xs sm:text-sm font-medium text-gray-700">Tipo de Ranking:</span>
                <select
                  value={tipoRanking}
                  onChange={(e) => setTipoRanking(e.target.value)}
                  className="flex-1 sm:flex-none border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ONGs">Ranking ONGs</option>
                  <option value="Usuarios">Ranking Usuarios</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <select
                value={groupFilter}
                onChange={e => setGroupFilter(e.target.value)}
                className="w-full sm:w-auto border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todos</option>
                {tipoRanking === 'ONGs' ? (
                  <option value="ONG">ONGs</option>
                ) : (
                  <option value="Usuario">Usuarios</option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Rankings */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6 sm:mt-8">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {tipoRanking === 'ONGs' ? 'Ranking ONGs' : 'Ranking Usuarios'}
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredRankings.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No hay participantes que coincidan con los filtros seleccionados.</div>
            ) : (
              filteredRankings.map((ranking) => (
                <div key={ranking.usuario.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="flex-shrink-0 self-start">
                      {getRankIcon(ranking.puesto)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words flex-1">
                            {ranking.usuario.nombre} {ranking.usuario.apellido}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {tipoRanking === 'ONGs' && (
                              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 sm:px-2.5 py-0.5 rounded">
                                x{(ranking as any).multiplicador ?? 1}
                              </span>
                            )}
                          <span className="bg-green-100 text-green-800 text-xs font-bold px-2 sm:px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                              {ranking.puntos} pts
                          </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Posición #{ranking.puesto}</span>
                          <span>•</span>
                          <span>ID: {ranking.usuario.id}</span>
                          {ranking.ultima_actualizacion && (
                            <>
                              <span>•</span>
                              <span>Actualizado: {new Date(ranking.ultima_actualizacion).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
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
            ¿Cómo funciona el sistema de puntos?
          </h3>
          <div className="text-blue-800 space-y-2 text-sm sm:text-base">
            <p><strong>🏆 Sistema de Puntos:</strong> Los puntos se otorgan basándose en las donaciones realizadas y recibidas. Cada tipo de donación tiene un valor específico en puntos.</p>
            <p><strong>💰 Donaciones Monetarias:</strong> 1 punto por peso argentino donado.</p>
            <p><strong>🍎 Alimentos:</strong> 2 puntos por unidad donada.</p>
            <p><strong>👕 Ropa:</strong> 3 puntos por prenda donada.</p>
            <p><strong>💊 Medicamentos:</strong> 5 puntos por medicamento donado.</p>
            <p><strong>📚 Libros:</strong> 2 puntos por libro donado.</p>
            <p><strong>🧸 Juguetes:</strong> 2 puntos por juguete donado.</p>
            <p><strong>🤝 Voluntariado:</strong> 10 puntos por hora de trabajo voluntario.</p>
            <p><strong>🔧 Servicios:</strong> 15 puntos por hora de servicio profesional.</p>
            <p><strong>💻 Tecnología:</strong> 20 puntos por dispositivo tecnológico.</p>
            <p><strong>🪑 Muebles:</strong> 25 puntos por mueble o electrodoméstico.</p>
            <p className="mt-4 text-xs sm:text-sm italic">
              💡 Los puntos se otorgan tanto al donador como a la ONG receptora cuando una donación es aprobada.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}