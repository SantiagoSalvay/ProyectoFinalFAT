import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import { api, ONG } from '../services/api'
import { Heart, MapPin, Building, Users, Star, ExternalLink } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Fix para los iconos de Leaflet
delete (Icon.Default.prototype as any)._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Componente para centrar el mapa
function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 6)
  }, [center, map])
  return null
}

export default function MapPage() {
  const [ongs, setOngs] = useState<ONG[]>([])
  const [selectedONG, setSelectedONG] = useState<ONG | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all')

  // Centro del mapa (Argentina)
  const mapCenter: [number, number] = [-34.6037, -58.3816]

  useEffect(() => {
    loadONGs()
  }, [filter])

  const loadONGs = async () => {
    try {
      setLoading(true)
      const filters = filter !== 'all' ? { type: filter } : undefined
      const { ongs } = await api.getONGs(filters)
      setOngs(ongs)
    } catch (error) {
      console.error('Error loading ONGs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMarkerIcon = (type: 'public' | 'private') => {
    return new Icon({
      iconUrl: type === 'public' 
        ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
        : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-purple-600 shadow-sm border-b">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Mapa de ONGs</h1>
        <p className="text-purple-100">Explora organizaciones cerca de ti</p>
      </div>
      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-white">Filtrar:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'public' | 'private')}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
          >
            <option value="all">Todas</option>
            <option value="public">Públicas</option>
            <option value="private">Privadas</option>
          </select>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-white">Públicas</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-white">Privadas</span>
          </div>
        </div>
      </div>
    </div>
  </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Mapa */}
        <div className="flex-1">
          <MapContainer
            center={mapCenter}
            zoom={6}
            className="h-full w-full"
            style={{ height: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            <MapCenter center={mapCenter} />
            
            {ongs.map((ong) => (
              <Marker
                key={ong.id}
                position={[ong.latitude, ong.longitude]}
                icon={getMarkerIcon(ong.type)}
                eventHandlers={{
                  click: () => setSelectedONG(ong),
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-900">{ong.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{ong.location}</p>
                    <div className="flex items-center mt-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm ml-1">{ong.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Panel lateral */}
        <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ONGs en el mapa ({ongs.length})
            </h2>
            
            <div className="space-y-4">
              {ongs.map((ong) => (
                <div
                  key={ong.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedONG?.id === ong.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedONG(ong)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{ong.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{ong.location}</p>
                      
                      <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="ml-1">{ong.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4" />
                          <span className="ml-1">{ong.volunteers_count}</span>
                        </div>
                        <div className="flex items-center">
                          <Building className="w-4 h-4" />
                          <span className="ml-1">{ong.type}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`w-3 h-3 rounded-full ${
                      ong.type === 'public' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalles de ONG */}
      {selectedONG && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedONG.name}</h2>
                  <p className="text-gray-600">{selectedONG.location}</p>
                </div>
                <button
                  onClick={() => setSelectedONG(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="ml-2 font-semibold">{selectedONG.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Calificación</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span className="ml-2 font-semibold">{selectedONG.volunteers_count}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Voluntarios</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="ml-2 font-semibold">{selectedONG.projects_count}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Proyectos</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Building className="w-5 h-5 text-green-500" />
                    <span className="ml-2 font-semibold capitalize">{selectedONG.type}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Tipo</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-700">{selectedONG.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Información de contacto</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">{selectedONG.location}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">{selectedONG.email}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-700">{selectedONG.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <a
                  href={selectedONG.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg text-center hover:bg-purple-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 inline mr-2" />
                  Visitar sitio web
                </a>
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                  Ver más detalles
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 