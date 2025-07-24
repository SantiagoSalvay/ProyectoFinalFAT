import { useState, useEffect } from 'react'
import { api, ONG } from '../services/api'
import { Search, Filter, MapPin, Building, Users, Star, Heart, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function ONGsPage() {
  const [ongs, setOngs] = useState<ONG[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'public' | 'private'>('all')
  const [locationFilter, setLocationFilter] = useState('')
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    loadONGs()
  }, [typeFilter, locationFilter])

  const loadONGs = async () => {
    try {
      setLoading(true)
      const filters: any = {}
      
      if (typeFilter !== 'all') {
        filters.type = typeFilter
      }
      
      if (locationFilter) {
        filters.location = locationFilter
      }
      
      const { ongs } = await api.getONGs(filters)
      setOngs(ongs)
    } catch (error) {
      console.error('Error loading ONGs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredONGs = ongs.filter(ong => {
    const matchesSearch = ong.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ong.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleRateONG = async (ongId: number, rating: number, comment: string) => {
    try {
      await api.rateONG(ongId, rating, comment)
      // Recargar ONGs para actualizar calificaciones
      loadONGs()
    } catch (error) {
      console.error('Error rating ONG:', error)
    }
  }

  const handleCommentONG = async (ongId: number, content: string) => {
    try {
      await api.commentONG(ongId, content)
      // Recargar ONGs para actualizar comentarios
      loadONGs()
    } catch (error) {
      console.error('Error commenting ONG:', error)
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Organizaciones Sin Fines de Lucro</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre y conecta con organizaciones que están haciendo la diferencia en nuestra comunidad
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar ONGs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | 'public' | 'private')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="all">Todos los tipos</option>
                <option value="public">Públicas</option>
                <option value="private">Privadas</option>
              </select>
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Ubicación..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total ONGs</p>
                <p className="text-2xl font-bold text-gray-900">{ongs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Públicas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ongs.filter(ong => ong.type === 'public').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Privadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ongs.filter(ong => ong.type === 'private').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Voluntarios</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ongs.reduce((sum, ong) => sum + ong.volunteers_count, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de ONGs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredONGs.map((ong) => (
            <ONGCard
              key={ong.id}
              ong={ong}
              isAuthenticated={isAuthenticated}
              onRate={handleRateONG}
              onComment={handleCommentONG}
            />
          ))}
        </div>

        {filteredONGs.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron ONGs</h3>
            <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface ONGCardProps {
  ong: ONG
  isAuthenticated: boolean
  onRate: (ongId: number, rating: number, comment: string) => void
  onComment: (ongId: number, content: string) => void
}

function ONGCard({ ong, isAuthenticated, onRate, onComment }: ONGCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [showRatingForm, setShowRatingForm] = useState(false)

  const handleRate = () => {
    if (rating > 0) {
      onRate(ong.id, rating, comment)
      setRating(0)
      setComment('')
      setShowRatingForm(false)
    }
  }

  const handleComment = () => {
    if (comment.trim()) {
      onComment(ong.id, comment.trim())
      setComment('')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{ong.name}</h3>
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{ong.location}</span>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              ong.type === 'public' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {ong.type === 'public' ? 'Pública' : 'Privada'}
            </span>
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-400 hover:text-gray-600"
          >
            {showDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <p className="text-gray-700 mb-4 line-clamp-3">
          {ong.description}
        </p>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="ml-1 font-semibold">{ong.rating.toFixed(1)}</span>
            </div>
            <p className="text-xs text-gray-500">Calificación</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="ml-1 font-semibold">{ong.volunteers_count}</span>
            </div>
            <p className="text-xs text-gray-500">Voluntarios</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="ml-1 font-semibold">{ong.projects_count}</span>
            </div>
            <p className="text-xs text-gray-500">Proyectos</p>
          </div>
        </div>

        <div className="flex space-x-2 mb-4">
          <a
            href={ong.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg text-center hover:bg-purple-700 transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4 inline mr-1" />
            Sitio web
          </a>
          
          {isAuthenticated && (
            <button
              onClick={() => setShowRatingForm(!showRatingForm)}
              className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Calificar
            </button>
          )}
        </div>

        {/* Detalles expandidos */}
        {showDetails && (
          <div className="border-t pt-4 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Información de contacto</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>📧 {ong.email}</p>
                <p>📞 {ong.phone}</p>
              </div>
            </div>

            {isAuthenticated && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Comentar</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Escribe un comentario..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleComment}
                    disabled={!comment.trim()}
                    className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            )}

            {/* Formulario de calificación */}
            {showRatingForm && isAuthenticated && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Calificar ONG</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`w-6 h-6 ${
                          star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                        }`}
                      >
                        <Star className="w-full h-full" />
                      </button>
                    ))}
                  </div>
                  
                  <textarea
                    placeholder="Comentario opcional..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={2}
                  />
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handleRate}
                      disabled={rating === 0}
                      className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      Enviar calificación
                    </button>
                    <button
                      onClick={() => setShowRatingForm(false)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 