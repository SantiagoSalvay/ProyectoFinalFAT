import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Loader2, Check } from 'lucide-react';

interface ClickableMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: {
    address: string;
    coordinates: [number, number];
  }) => void;
  initialLocation?: string;
}

export default function ClickableMapModal({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation = ''
}: ClickableMapModalProps) {
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [currentAddress, setCurrentAddress] = useState(initialLocation);
  const [editableAddress, setEditableAddress] = useState(initialLocation);
  const [addressDetails, setAddressDetails] = useState<any>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

  // Función para obtener dirección desde coordenadas
  const fetchAddressFromCoordinates = async (lat: number, lon: number) => {
    if (!LOCATIONIQ_API_KEY) {
      console.error('VITE_LOCATIONIQ_API_KEY no está configurada');
      return `Coordenadas: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }

    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://api.locationiq.com/v1/reverse?key=${LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&format=json&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data && data.address) {
        const { address } = data;
        
        // Guardar detalles de la dirección
        setAddressDetails(address);
        
        const road = address.road || address.pedestrian || address.footway || '';
        const houseNumber = address.house_number || '';
        const suburb = address.suburb || address.neighbourhood || address.quarter || '';
        const city = address.city || address.town || address.village || '';
        const state = address.state || '';
        
        // Formatear dirección de manera más legible
        let formattedAddress = '';
        
        if (road && houseNumber) {
          // Si tenemos calle y número: "Av. Colón 1234"
          formattedAddress = `${road} ${houseNumber}`;
        } else if (road) {
          // Si solo tenemos calle: "Av. Colón"
          formattedAddress = road;
        } else {
          // Si no tenemos calle, usar coordenadas
          setAddressDetails(null);
          return `Coordenadas: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
        }
        
        // Agregar información adicional si está disponible
        if (suburb) {
          formattedAddress += `, ${suburb}`;
        }
        if (city && city.toLowerCase().includes('córdoba')) {
          formattedAddress += `, ${city}`;
        } else if (state && state.toLowerCase().includes('córdoba')) {
          formattedAddress += `, Córdoba`;
        }
        
        return formattedAddress;
      }
      return `Coordenadas: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    } catch (error) {
      console.error('Error al obtener dirección:', error);
      return `Coordenadas: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Función para manejar clic en el mapa
  const handleMapClick = async (lat: number, lon: number) => {
    setSelectedPosition([lat, lon]);
    const address = await fetchAddressFromCoordinates(lat, lon);
    setCurrentAddress(address);
    setEditableAddress(address); // Actualizar también el campo editable
  };

  // Función para manejar confirmación de ubicación
  const handleConfirmLocation = () => {
    if (selectedPosition && editableAddress.trim()) {
      onLocationSelect({
        address: editableAddress.trim(),
        coordinates: selectedPosition
      });
      onClose();
    }
  };

  // Cargar mapa cuando el modal se abre
  useEffect(() => {
    if (isOpen && !mapLoaded) {
      // Cargar Leaflet dinámicamente
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

            // Crear mapa
            const map = (window as any).L.map(mapRef.current).setView([-31.4201, -64.1888], 13);
            
            // Agregar tiles
            (window as any).L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Agregar marcador inicial
            let marker = (window as any).L.marker([-31.4201, -64.1888]).addTo(map);

            // Manejar clics en el mapa
            map.on('click', (e: any) => {
              const { lat, lng } = e.latlng;
              
              // Mover marcador
              marker.setLatLng([lat, lng]);
              
              // Obtener dirección
              handleMapClick(lat, lng);
            });

            setMapLoaded(true);
          };
          document.head.appendChild(script);
        } catch (error) {
          console.error('Error al cargar Leaflet:', error);
        }
      };

      loadLeaflet();
    }
  }, [isOpen, mapLoaded]);

  // Cerrar modal al presionar Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Seleccionar Ubicación en el Mapa</h2>
              <p className="text-sm text-gray-600">Haz clic en el mapa para elegir tu ubicación</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row h-[600px]">
          {/* Map */}
          <div className="w-full lg:w-2/3 relative">
            <div 
              ref={mapRef}
              className="h-full w-full bg-gray-100"
              style={{ minHeight: '400px' }}
            />
            
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
                  <p className="text-gray-600">Cargando mapa...</p>
                </div>
              </div>
            )}
            
            {isLoadingAddress && (
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span className="text-sm text-gray-700">Obteniendo dirección...</span>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="w-full lg:w-1/3 p-6 border-l border-gray-200 bg-gray-50">
            <div className="space-y-4">
              {/* Selected Location */}
              {selectedPosition && currentAddress ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">Ubicación seleccionada:</h3>
                  </div>
                  
                  {/* Campo editable de dirección */}
                  <div className="mb-3">
                    <label className="text-sm font-medium text-green-900 mb-1 block">
                      Dirección (puedes editarla):
                    </label>
                    <textarea
                      value={editableAddress}
                      onChange={(e) => setEditableAddress(e.target.value)}
                      className="w-full text-sm text-gray-800 bg-white p-2 rounded border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Escribe o edita la dirección aquí..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Puedes editar la dirección si no es exacta
                    </p>
                  </div>
                  
                  {/* Detalles de la dirección si están disponibles */}
                  {addressDetails && (
                    <div className="mb-3 p-2 bg-white rounded border text-xs">
                      <p className="font-medium text-green-900 mb-1">Detalles del mapa:</p>
                      <div className="space-y-1 text-green-700">
                        {addressDetails.road && (
                          <p>🛣️ Calle: {addressDetails.road}</p>
                        )}
                        {addressDetails.house_number && (
                          <p>🏠 Número: {addressDetails.house_number}</p>
                        )}
                        {addressDetails.suburb && (
                          <p>🏘️ Barrio: {addressDetails.suburb}</p>
                        )}
                        {addressDetails.city && (
                          <p>🏙️ Ciudad: {addressDetails.city}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Información adicional */}
                  <div className="text-xs text-green-600 space-y-1">
                    <p>📍 Coordenadas: {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}</p>
                    <p>✅ Lista para confirmar</p>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={handleConfirmLocation}
                      disabled={!editableAddress.trim()}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      ✅ Aceptar esta ubicación
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPosition(null);
                        setCurrentAddress('');
                        setEditableAddress('');
                        setAddressDetails(null);
                      }}
                      className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      🔄 Seleccionar otra ubicación
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Instrucciones:</h3>
                  </div>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Haz clic en el mapa para seleccionar tu ubicación</li>
                    <li>• El marcador se moverá a donde hagas clic</li>
                    <li>• La dirección se obtendrá automáticamente</li>
                    <li>• Confirma cuando estés satisfecho con la ubicación</li>
                  </ul>
                </div>
              )}

              {/* Map Info */}
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Información del mapa:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Zoom:</strong> Usa la rueda del mouse o los controles + y -</li>
                  <li>• <strong>Mover:</strong> Arrastra el mapa para navegar</li>
                  <li>• <strong>Seleccionar:</strong> Haz clic en cualquier punto</li>
                </ul>
              </div>

              {/* Current Status */}
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Estado actual:</h4>
                <div className="text-sm text-gray-700">
                  {!mapLoaded ? (
                    <span className="text-orange-600">⏳ Cargando mapa...</span>
                  ) : !selectedPosition ? (
                    <span className="text-blue-600">📍 Haz clic en el mapa para seleccionar</span>
                  ) : isLoadingAddress ? (
                    <span className="text-purple-600">🔄 Obteniendo dirección...</span>
                  ) : (
                    <span className="text-green-600">✅ Ubicación lista para confirmar</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedPosition && currentAddress ? 'Ubicación seleccionada ✓' : 'Haz clic en el mapa para seleccionar una ubicación'}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
