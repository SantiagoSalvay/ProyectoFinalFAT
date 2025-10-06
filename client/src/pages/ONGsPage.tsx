import React, { useState, useEffect, useRef } from 'react'
import { api, ONG } from '../services/api'
import { Search, Filter, MapPin, Building, Users, Star, Heart, ExternalLink, Eye, EyeOff, RefreshCw, X, Map } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { getAllONGsImages, loadImageDictionary } from '../services/imageDictionary'
import { getSocialMediaIcon, getSocialMediaColor } from '../utils/socialMediaDetector'

export default function ONGsPage() {
  const [ongs, setOngs] = useState<ONG[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'public' | 'private'>('all')
  const [locationFilter, setLocationFilter] = useState('')
  const { isAuthenticated } = useAuth()
  const [showMap, setShowMap] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)

  // Estado para las imágenes de ONGs
  const [ongImages, setOngImages] = useState<Array<{userId: number, imageUrl: string, fileName: string}>>([])

  useEffect(() => {
    loadONGs()
  }, [typeFilter, locationFilter])

  // Cargar imágenes del diccionario local
  useEffect(() => {
    loadImageDictionary().then(() => {
      const images = getAllONGsImages();
      setOngImages(images);
      console.log('🖼️ Imágenes de ONGs cargadas:', images);
    });
  }, [])

  // Cargar mapa cuando hay ONGs con coordenadas
  useEffect(() => {
    if (!showMap || !ongs.length || mapLoaded) return;
    
    const ongsWithCoords = ongs.filter(ong => ong.coordinates);
    if (ongsWithCoords.length === 0) return;

    const loadLeaflet = async () => {
      try {
        // Cargar CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Cargar JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          // Configurar iconos
          delete (window as any).L.Icon.Default.prototype._getIconUrl;
          (window as any).L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          });

          // Crear mapa centrado en Córdoba
          const map = (window as any).L.map(mapRef.current).setView([-31.4201, -64.1888], 12);
          
          // Agregar tiles
          (window as any).L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Agregar marcadores para ONGs con coordenadas
          ongsWithCoords.forEach(ong => {
            if (ong.coordinates) {
              const marker = (window as any).L.marker(ong.coordinates).addTo(map);
              
              // Generar HTML para redes sociales en el mapa
              let socialMediaHTML = '';
              if (ong.socialMedia && ong.socialMedia.length > 0) {
                const socialLinks = ong.socialMedia.map(link => {
                  const color = getSocialMediaColor(link.type);
                  // Usar texto simple por ahora para el mapa
                  return `
                    <a href="${link.url}" target="_blank" rel="noopener noreferrer" 
                       style="display: inline-block; padding: 4px 12px; margin: 2px; 
                              background-color: ${color}; color: white; 
                              border-radius: 4px; text-decoration: none; font-size: 12px;"
                       title="${link.type}">
                      ${link.type.charAt(0).toUpperCase() + link.type.slice(1)}
                    </a>
                  `;
                }).join('');
                
                socialMediaHTML = `
                  <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #6b7280;">Redes Sociales:</p>
                    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 4px;">
                      ${socialLinks}
                    </div>
                  </div>
                `;
              }
              
              marker.bindPopup(`
                <div style="text-align: center; min-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; font-weight: bold;">${ong.name}</h3>
                  <p style="margin: 0 0 8px 0; font-size: 14px;">${ong.location}</p>
                  ${ong.rating > 0 ? `<p style="margin: 0; font-size: 12px;">⭐ ${ong.rating.toFixed(1)} / 5</p>` : ''}
                  ${socialMediaHTML}
                </div>
              `, { maxWidth: 300 });
            }
          });

          setMapLoaded(true);
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error al cargar Leaflet:', error);
      }
    };

    loadLeaflet();
  }, [ongs, showMap, mapLoaded])

  const loadONGs = async () => {
    try {
      setLoading(true)
      setError(null)
      const filters: { type?: string; location?: string } = {}
      
      if (typeFilter !== 'all') {
        filters.type = typeFilter
      }
      
      if (locationFilter) {
        filters.location = locationFilter
      }
      
      console.log('Cargando ONGs con filtros:', filters)
      const response = await api.getONGs(filters)
      console.log('ONGs recibidas:', response.ongs)
      setOngs(response.ongs)
    } catch (error) {
      console.error('Error loading ONGs:', error)
      setError('Error al cargar las ONGs. Por favor, verifica tu conexión e intenta nuevamente.')
      setOngs([])
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener la imagen de una ONG específica
  const getONGImage = (ongId: number): string | null => {
    const imageData = ongImages.find(img => img.userId === ongId);
    return imageData ? imageData.imageUrl : null;
  };

  const filteredONGs = ongs.filter(ong => {
    const matchesSearch = ong.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ong.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleRateONG = async (ongId: number, rating: number, comment: string) => {
    try {
      console.log('Calificando ONG:', { ongId, rating, comment })
      await api.rateONG(ongId, rating, comment)
      console.log('Calificación enviada exitosamente')
      // Recargar ONGs para actualizar calificaciones
      loadONGs()
    } catch (error) {
      console.error('Error rating ONG:', error)
      alert('Error al enviar la calificación. Por favor, intenta nuevamente.')
    }
  }

  const handleCommentONG = async (ongId: number, content: string) => {
    try {
      console.log('Comentando ONG:', { ongId, content })
      await api.commentONG(ongId, content)
      console.log('Comentario enviado exitosamente')
      // Recargar ONGs para actualizar comentarios
      loadONGs()
    } catch (error) {
      console.error('Error commenting ONG:', error)
      alert('Error al enviar el comentario. Por favor, intenta nuevamente.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ONGs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-semibold">Error al cargar las ONGs</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={loadONGs}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filtros y Búsqueda</h2>
            <button
              onClick={loadONGs}
              disabled={loading}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total ONGs Registradas</p>
                <p className="text-2xl font-bold text-gray-900">{ongs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ONGs con Calificación</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ongs.filter(ong => ong.rating > 0).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Proyectos Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {ongs.reduce((sum, ong) => sum + ong.projects_count, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa de ONGs */}
        {ongs.filter(ong => ong.coordinates).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Map className="w-6 h-6 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Mapa de ONGs ({ongs.filter(ong => ong.coordinates).length} con ubicación)
                </h2>
              </div>
              <button
                onClick={() => setShowMap(!showMap)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {showMap ? 'Ocultar' : 'Mostrar'} mapa
              </button>
            </div>
            
            {showMap && (
              <div className="relative">
                <div
                  ref={mapRef}
                  className="w-full h-96 rounded-lg overflow-hidden"
                  style={{ minHeight: '400px' }}
                />
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">Cargando mapa...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Lista de ONGs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredONGs.map((ong) => (
            <ONGCard
              key={ong.id}
              ong={ong}
              isAuthenticated={isAuthenticated}
              onRate={handleRateONG}
              onComment={handleCommentONG}
              getImage={getONGImage}
              socialMedia={ong.socialMedia}
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
  getImage: (ongId: number) => string | null
  socialMedia?: { type: string; url: string }[]
}

function ONGCard({ ong, isAuthenticated, onRate, onComment, getImage, socialMedia }: ONGCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [hasRated, setHasRated] = useState(false)
  const [existingRating, setExistingRating] = useState<{ puntuacion: number; comentario?: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Verificar si el usuario ya calificó esta ONG
  useEffect(() => {
    if (isAuthenticated) {
      checkExistingRating()
    }
  }, [isAuthenticated, ong.id])

  const checkExistingRating = async () => {
    try {
      const response = await api.obtenerMiCalificacion(ong.id)
      if (response.hasRated) {
        setHasRated(true)
        setExistingRating({
          puntuacion: response.puntuacion!,
          comentario: response.comentario
        })
        setRating(response.puntuacion!)
        setComment(response.comentario || '')
      }
    } catch (error) {
      console.error('Error al verificar calificación:', error)
    }
  }

  const handleRate = async () => {
    if (rating === 0) {
      toast.error('Por favor selecciona una calificación')
      return
    }

    try {
      setSubmitting(true)
      const response = await api.calificarONG(ong.id, rating, comment.trim() || undefined)
      toast.success(hasRated ? 'Calificación actualizada exitosamente' : 'Calificación enviada exitosamente')
      setShowRatingModal(false)
      setHasRated(true)
      
      // Recargar la página para actualizar el rating
      window.location.reload()
    } catch (error: any) {
      console.error('Error al calificar:', error)
      toast.error(error?.response?.data?.error || 'Error al enviar la calificación')
    } finally {
      setSubmitting(false)
    }
  }

  const handleComment = () => {
    if (comment.trim()) {
      onComment(ong.id, comment.trim())
      setComment('')
    }
  }

  // Obtener la imagen de la ONG
  const ongImage = getImage(ong.id);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Imagen de la ONG */}
      {ongImage && (
        <div className="relative h-48 w-full">
          <img
            src={ongImage}
            alt={`Imagen de ${ong.name}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              ong.type === 'public' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {ong.type === 'public' ? 'Pública' : 'Privada'}
            </span>
          </div>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{ong.name}</h3>
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{ong.location}</span>
            </div>
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

        {(ong.rating > 0 || ong.volunteers_count > 0 || ong.projects_count > 0) && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            {ong.rating > 0 && (
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="ml-1 font-semibold">{ong.rating.toFixed(1)}</span>
                </div>
                <p className="text-xs text-gray-500">Calificación</p>
              </div>
            )}
            
            {ong.volunteers_count > 0 && (
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="ml-1 font-semibold">{ong.volunteers_count}</span>
                </div>
                <p className="text-xs text-gray-500">Voluntarios</p>
              </div>
            )}
            
            {ong.projects_count > 0 && (
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="ml-1 font-semibold">{ong.projects_count}</span>
                </div>
                <p className="text-xs text-gray-500">Proyectos</p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col space-y-2 mb-4">
          <div className="flex space-x-2">
            {ong.website && (
              <a
                href={ong.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg text-center hover:bg-purple-700 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4 inline mr-1" />
                Sitio web
              </a>
            )}
            
            {isAuthenticated && (
              <button
                onClick={() => setShowRatingModal(true)}
                className={`${ong.website ? '' : 'flex-1'} ${hasRated ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'} py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors text-sm flex items-center justify-center`}
              >
                <Star className={`w-4 h-4 mr-1 ${hasRated ? 'fill-current' : ''}`} />
                {hasRated ? 'Editar calificación' : 'Calificar'}
              </button>
            )}
          </div>
          
          {/* Botón Ver más detalles */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Abriendo modal de detalles...');
              setShowDetailsModal(true);
            }}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm font-medium flex items-center justify-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver más detalles
          </button>
        </div>

        {/* Detalles expandidos */}
        {showDetails && (
          <div className="border-t pt-4 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Información de contacto</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>📧 {ong.email}</p>
                {ong.phone && <p>📞 {ong.phone}</p>}
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

          </div>
        )}
      </div>

      {/* Modal de Detalles */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            {/* Botón cerrar */}
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Imagen de la ONG */}
            {getImage(ong.id) && (
              <div className="relative h-64 w-full mb-6 rounded-lg overflow-hidden">
                <img
                  src={getImage(ong.id)!}
                  alt={`Imagen de ${ong.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Header */}
            <div className="mb-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                {ong.name}
              </h3>
              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{ong.location}</span>
              </div>
              {ong.rating > 0 && (
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 fill-current mr-1" />
                  <span className="font-semibold text-lg">{ong.rating.toFixed(1)}</span>
                  <span className="text-gray-500 ml-1">/ 5</span>
                </div>
              )}
            </div>

            {/* Descripción */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{ong.description}</p>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <Users className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900">{ong.volunteers_count}</p>
                <p className="text-xs text-gray-600">Voluntarios</p>
              </div>
              <div className="text-center">
                <Heart className="w-6 h-6 text-red-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900">{ong.projects_count}</p>
                <p className="text-xs text-gray-600">Proyectos</p>
              </div>
              <div className="text-center">
                <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900">{ong.rating.toFixed(1)}</p>
                <p className="text-xs text-gray-600">Calificación</p>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Información de Contacto</h4>
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center text-gray-700">
                  <Mail className="w-5 h-5 mr-3 text-gray-400" />
                  <span>{ong.email}</span>
                </div>
                {ong.phone && (
                  <div className="flex items-center text-gray-700">
                    <span className="w-5 h-5 mr-3 text-gray-400 text-center">📞</span>
                    <span>{ong.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Redes Sociales */}
            {socialMedia && socialMedia.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">🌐</span> Redes Sociales
                </h4>
                <div className="flex flex-wrap gap-3">
                  {socialMedia.map((link, index) => {
                    const IconComponent = getSocialMediaIcon(link.type);
                    const color = getSocialMediaColor(link.type);
                    
                    return (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ backgroundColor: color }}
                        className="flex items-center space-x-2 text-white px-4 py-3 rounded-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-md"
                      >
                        <IconComponent className="w-6 h-6" />
                        <span className="font-medium">{link.displayName || link.type}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sitio web */}
            {ong.website && (
              <div className="border-t pt-6">
                <a
                  href={ong.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center font-medium"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Visitar Sitio Web
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Calificación */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            {/* Botón cerrar */}
            <button
              onClick={() => setShowRatingModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {hasRated ? 'Editar tu calificación' : 'Calificar ONG'}
              </h3>
              <p className="text-gray-600">{ong.name}</p>
            </div>

            {/* Estrellas */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tu calificación
              </label>
              <div className="flex items-center justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        star <= (hoveredStar || rating)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-sm text-gray-600 mt-2">
                  {rating === 1 && 'Muy mala'}
                  {rating === 2 && 'Mala'}
                  {rating === 3 && 'Regular'}
                  {rating === 4 && 'Buena'}
                  {rating === 5 && 'Excelente'}
                </p>
              )}
            </div>

            {/* Comentario */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentario (opcional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Comparte tu experiencia con esta organización..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            {/* Botones */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleRate}
                disabled={rating === 0 || submitting}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  hasRated ? 'Actualizar calificación' : 'Enviar calificación'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 