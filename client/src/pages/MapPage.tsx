import React, { useState, useEffect, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { api, User } from '../services/api'
const GOOGLE_MAPS_API_KEY = 'AIzaSyC33z7pXbXF16KbIDIXX-ZhBOLRNWqVAoo'
import { Heart, MapPin, Building, Users, Star, ExternalLink } from 'lucide-react'

// Interfaz para ONG
interface ONG {
  id: number
  name: string
  location: string
  latitude?: number
  longitude?: number
  group: string
  rating: number
  volunteers_count: number
  projects_count: number
  description: string
  email: string
  phone: string
  website: string
}

// Configuración del mapa
const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

const center = {
  lat: -34.6037,
  lng: -58.3816
}

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
}

export default function MapPage() {
  const [geoError, setGeoError] = useState<string | null>(null);
  // Manejo de error de tiles
  const handleTileError = (e: any) => {
    // e.target.status puede ser 401, 429, 404, etc.
    // Pero Leaflet no expone status, así que revisamos el mensaje
    setGeoError('No se pudo cargar el mapa. Verifica tu API key de LocationIQ o espera unos minutos si excediste el límite de peticiones.');
  };
  // Estados y hooks primero
  const [ongs, setOngs] = useState<ONG[]>([])
  const [geoLoading, setGeoLoading] = useState(false)
  const [selectedONG, setSelectedONG] = useState<ONG | null>(null)
  const [loading, setLoading] = useState(true)
  const [needFilter, setNeedFilter] = useState('')
  const [groupFilter, setGroupFilter] = useState('')
  const [map, setMap] = useState<google.maps.Map | null>(null)

  // Cargar Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  })

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Colores por grupo social
  const groupColors: Record<string, string> = {
    'Niños': '#2196f3', // celeste/azul
    'Gente mayor': '#8bc34a', // verde claro
    'Mujeres': '#e040fb', // rosa/morado
    'Animales': '#ff9800', // naranja
    'Personas con discapacidad': '#e6f208ff', // amarillo
    'Familias': '#009688', // turquesa
    'Otros': '#f44336', // rojo
  };

  // Filtrado de ONGs por necesidad y grupo social
  const filteredOngs = ongs.filter(ong => {
    const needMatch = needFilter === '' || ong.description.toLowerCase().includes(needFilter.toLowerCase())
    const groupMatch = groupFilter === '' || ong.group === groupFilter
    return needMatch && groupMatch
  })

  useEffect(() => {
    if (isLoaded) {
    loadONGs()
    }
  }, [needFilter, groupFilter, isLoaded])

  // Función para geocodificar usando Google Maps API
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    if (!isLoaded) return null;
    
    const geocoder = new google.maps.Geocoder();
    
    return new Promise((resolve) => {
      geocoder.geocode(
        { 
          address: `${address}, Argentina`,
          region: 'AR'
        },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            resolve({
              lat: location.lat(),
              lng: location.lng()
            });
          } else {
            console.error('Error geocodificando:', address, status);
            resolve(null);
          }
        }
      );
    });
  };

  const loadONGs = async () => {
  console.log('Cargando ONGs...')
    setLoading(true)
    setGeoLoading(true)
    try {
      const users = await api.getONGs()
      const grupos = [
        'Niños',
        'Gente mayor',
        'Mujeres',
        'Animales',
        'Personas con discapacidad',
        'Familias',
        'Otros'
      ];
      
      // Geocodificar cada ubicación usando Google Maps
      const geocodePromises = users.map(async (user) => {
  console.log('Geocodificando:', user.ubicacion)
        let latitude: number | undefined = undefined;
        let longitude: number | undefined = undefined;
        
        if (user.ubicacion) {
          try {
            const coordinates = await geocodeAddress(user.ubicacion);
            if (coordinates) {
              latitude = coordinates.lat;
              longitude = coordinates.lng;
            }
          } catch (err: any) {
            console.error('Error geocodificando ubicación:', user.ubicacion, err);
          }
        }
        
        // Asignar grupo social aleatorio
        const group = grupos[Math.floor(Math.random() * grupos.length)];
        return {
          id: user.id_usuario,
          name: user.nombre || user.usuario,
          location: user.ubicacion || 'Ubicación no especificada',
          latitude,
          longitude,
          group,
          rating: 3.5 + Math.random() * 1.5,
          volunteers_count: Math.floor(Math.random() * 100) + 10,
          projects_count: Math.floor(Math.random() * 20) + 1,
          description: `ONG dedicada a ayudar a la comunidad. ${user.ubicacion ? `Ubicada en ${user.ubicacion}.` : ''}`,
          email: user.correo,
          phone: '+54 11 1234-5678',
          website: `https://${user.usuario}.org`
        }
      });
      
      const ongsWithLocation = await Promise.all(geocodePromises);
  console.log('ONGs con coordenadas:', ongsWithLocation)
      setOngs(ongsWithLocation)
    } catch (error) {
      console.error('Error loading ONGs:', error)
    } finally {
      setLoading(false)
      setGeoLoading(false)
    }
  }

  return (
    <div className="bg-purple-600 shadow-sm border-b">
      {geoError && (
        <div className="bg-red-100 text-red-700 p-4 text-center font-semibold">
          {geoError}
        </div>
      )}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Mapa de ONGs</h1>
        <p className="text-purple-100">Explora organizaciones cerca de ti</p>
      </div>
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4">
  {/* (Eliminado filtro tipo ONG) */}
        {/* Filtro por necesidad */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-white">Necesidad:</span>
          <select
            value={needFilter}
            onChange={e => setNeedFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
          >
            <option value="">Todas</option>
            <option value="dinero">Dinero</option>
            <option value="ropa">Ropa</option>
            <option value="juguetes">Juguetes</option>
            <option value="comida">Comida</option>
            <option value="muebles">Muebles</option>
            <option value="otros">Otros</option>
          </select>
        </div>
        {/* Filtro por grupo social */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-white">Grupo:</span>
          <select
            value={groupFilter}
            onChange={e => setGroupFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
          >
            <option value="">Todos</option>
            <option value="Niños">Niños</option>
            <option value="Gente mayor">Gente mayor</option>
            <option value="Mujeres">Mujeres</option>
            <option value="Animales">Animales</option>
            <option value="Personas con discapacidad">Personas con discapacidad</option>
            <option value="Familias">Familias</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
        {/* Leyenda por grupo social */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {Object.entries(groupColors).map(([group, color]) => (
            <div key={group} className="flex items-center space-x-1 mr-2">
              <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: color }}></div>
              <span className="text-white capitalize">{group}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Mapa */}
        <div className="flex-1">
          {!isLoaded ? (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando mapa...</p>
              </div>
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
            zoom={6}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={options}
            >
              {filteredOngs.map((ong) => (
              ong.latitude !== undefined && ong.longitude !== undefined ? (
                <Marker
                  key={ong.id}
                    position={{ lat: ong.latitude, lng: ong.longitude }}
                    onClick={() => setSelectedONG(ong)}
                    icon={{
                      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="16" cy="16" r="12" fill="${groupColors[ong.group] || '#f44336'}" stroke="white" stroke-width="2"/>
                          <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${ong.group.charAt(0)}</text>
                        </svg>
                      `)}`,
                      scaledSize: new google.maps.Size(32, 32),
                      anchor: new google.maps.Point(16, 16)
                    }}
                  >
                    {selectedONG?.id === ong.id && (
                      <InfoWindow onCloseClick={() => setSelectedONG(null)}>
                    <div className="p-2">
                      <h3 className="font-semibold text-gray-900">{ong.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{ong.location}</p>
                      <div className="flex items-center mt-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm ml-1">{ong.rating.toFixed(1)}</span>
                      </div>
                    </div>
                      </InfoWindow>
                    )}
                </Marker>
              ) : null
            ))}
            </GoogleMap>
          )}
        </div>

        {/* Panel lateral */}
        <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ONGs en el mapa ({filteredOngs.length})
            </h2>
            {filteredOngs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No hay ONGs registradas con los filtros seleccionados.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOngs.map((ong) => (
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
                            <Building className="w-4 h-4" style={{ color: groupColors[ong.group] || '#f44336' }} />
                            <span className="ml-1 capitalize">{ong.group}</span>
                          </div>
                        </div>
                      </div>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: groupColors[ong.group] || 'gray' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de detalles de ONG */}
      {selectedONG && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 1000 }}
        >
          {/* Overlay oscuro para bloquear interacción */}
          <div
            className="absolute inset-0 bg-black bg-opacity-60"
            style={{ zIndex: 1000, pointerEvents: 'auto' }}
            onClick={() => setSelectedONG(null)}
          />
          {/* Modal */}
          <div
            className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            style={{ zIndex: 1010 }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedONG.name}</h2>
                  <p className="text-gray-600">{selectedONG.location}</p>
                </div>
                <button
                  onClick={() => setSelectedONG(null)}
                  className="text-gray-400 hover:text-gray-600"
                  style={{ zIndex: 1020 }}
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
                    <Building className="w-5 h-5" style={{ color: groupColors[selectedONG.group] || 'gray' }} />
                    <span className="ml-2 font-semibold capitalize">{selectedONG.group}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Grupo social</p>
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