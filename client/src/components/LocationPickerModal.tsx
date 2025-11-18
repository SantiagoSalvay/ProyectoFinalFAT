import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { X, MapPin, Search, Loader2, Check } from 'lucide-react';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: {
    address: string;
    coordinates: [number, number];
  }) => void;
  initialLocation?: string;
  initialCoordinates?: [number, number];
}

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    house_number?: string;
    suburb?: string;
    city?: string;
    state?: string;
  };
}

export default function LocationPickerModal({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation = '',
  initialCoordinates = [-31.4201, -64.1888] // Córdoba por defecto
}: LocationPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState(initialLocation);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(initialCoordinates);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(initialLocation);

  const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

  // Función para obtener dirección desde coordenadas
  const fetchAddressFromCoordinates = async (lat: number, lon: number) => {
    if (!LOCATIONIQ_API_KEY) {
      console.error('VITE_LOCATIONIQ_API_KEY no está configurada');
      return;
    }

    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/location/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data && data.address) {
        const { address } = data;
        const road = address.road || '';
        const houseNumber = address.house_number || '';
        const suburb = address.suburb || address.neighbourhood || '';
        const city = address.city || address.town || address.village || '';
        
        let formattedAddress = road;
        if (houseNumber) formattedAddress += ` ${houseNumber}`;
        if (suburb) formattedAddress += `, ${suburb}`;
        if (city) formattedAddress += `, ${city}`;
        
        setCurrentAddress(formattedAddress);
        setSearchQuery(formattedAddress);
      } else {
        setCurrentAddress(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
        setSearchQuery(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Error al obtener dirección:', error);
      setCurrentAddress(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
      setSearchQuery(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Función para buscar ubicaciones
  const searchLocations = async (query: string) => {
    if (!query || query.length < 3 || !LOCATIONIQ_API_KEY) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/location/autocomplete?q=${encodeURIComponent(query)}&limit=8&countrycodes=ar&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Filtrar resultados de Córdoba
        const cordobaResults = data.filter((item: LocationSuggestion) => {
          const address = item.address;
          const displayName = item.display_name.toLowerCase();
          
          return (
            (address?.city && address.city.toLowerCase().includes('córdoba')) ||
            (address?.state && address.state.toLowerCase().includes('córdoba')) ||
            displayName.includes('córdoba')
          );
        });

        setSuggestions(cordobaResults);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error al buscar ubicaciones:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce para la búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== currentAddress) {
        searchLocations(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Manejar selección de sugerencia
  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    const coordinates: [number, number] = [lat, lon];
    
    setSelectedPosition(coordinates);
    setCurrentAddress(suggestion.display_name);
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);
    
    // Forzar re-render del iframe
    setTimeout(() => {
      const iframe = document.querySelector('iframe[title="Mapa de ubicación"]') as HTMLIFrameElement;
      if (iframe) {
        iframe.src = iframe.src;
      }
    }, 100);
  };

  // Manejar confirmación de ubicación
  const handleConfirmLocation = () => {
    if (selectedPosition && currentAddress) {
      onLocationSelect({
        address: currentAddress,
        coordinates: selectedPosition
      });
      onClose();
    }
  };

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
              <h2 className="text-xl font-bold text-gray-900">Seleccionar Ubicación</h2>
              <p className="text-sm text-gray-600">Busca o haz clic en el mapa para elegir tu ubicación</p>
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
          {/* Search Panel */}
          <div className="w-full lg:w-1/3 p-6 border-r border-gray-200 bg-gray-50">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar dirección en Córdoba..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                )}
              </div>

              {/* Current Address */}
              {currentAddress && (
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Ubicación seleccionada:</h3>
                  <p className="text-sm text-gray-700">{currentAddress}</p>
                  {selectedPosition && (
                    <p className="text-xs text-gray-500 mt-1">
                      Coordenadas: {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
                    </p>
                  )}
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Sugerencias:</h3>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="w-full text-left p-3 hover:bg-white rounded-lg border border-gray-200 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {suggestion.address?.road && suggestion.address?.house_number
                            ? `${suggestion.address.road} ${suggestion.address.house_number}`
                            : suggestion.display_name.split(',')[0]}
                        </p>
                        <p className="text-xs text-gray-500">
                          {suggestion.display_name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Instrucciones:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Escribe para buscar direcciones</li>
                  <li>• Haz clic en el mapa para seleccionar</li>
                  <li>• Usa las sugerencias para ubicaciones específicas</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="w-full lg:w-2/3 relative">
            <div className="h-full bg-gray-100 rounded-lg overflow-hidden">
              <iframe
                key={`map-${selectedPosition?.[0]}-${selectedPosition?.[1]}`}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${(selectedPosition?.[1] || initialCoordinates[1]) - 0.01},${(selectedPosition?.[0] || initialCoordinates[0]) - 0.01},${(selectedPosition?.[1] || initialCoordinates[1]) + 0.01},${(selectedPosition?.[0] || initialCoordinates[0]) + 0.01}&layer=mapnik&marker=${selectedPosition?.[0] || initialCoordinates[0]},${selectedPosition?.[1] || initialCoordinates[1]}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                title="Mapa de ubicación"
              />
            </div>
            
            {isLoadingAddress && (
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span className="text-sm text-gray-700">Obteniendo dirección...</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedPosition ? 'Ubicación seleccionada ✓' : 'Haz clic en el mapa para seleccionar una ubicación'}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmLocation}
              disabled={!selectedPosition || !currentAddress}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Confirmar Ubicación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
