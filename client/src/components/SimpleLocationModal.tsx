import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { X, MapPin, Search, Loader2, Check } from 'lucide-react';

interface SimpleLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: {
    address: string;
    coordinates: [number, number];
  }) => void;
  initialLocation?: string;
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

export default function SimpleLocationModal({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation = ''
}: SimpleLocationModalProps) {
  const [searchQuery, setSearchQuery] = useState(initialLocation);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<LocationSuggestion | null>(null);

  const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

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
      if (searchQuery !== initialLocation) {
        searchLocations(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Manejar selección de sugerencia
  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    setSelectedSuggestion(suggestion);
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);
  };

  // Manejar confirmación de ubicación
  const handleConfirmLocation = () => {
    if (selectedSuggestion) {
      const lat = parseFloat(selectedSuggestion.lat);
      const lon = parseFloat(selectedSuggestion.lon);
      
      onLocationSelect({
        address: selectedSuggestion.display_name,
        coordinates: [lat, lon]
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Seleccionar Ubicación</h2>
              <p className="text-sm text-gray-600">Busca tu dirección en Córdoba, Argentina</p>
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
        <div className="p-6">
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
                autoFocus
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
              )}
            </div>

            {/* Selected Location */}
            {selectedSuggestion && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">Ubicación seleccionada:</h3>
                    <p className="text-sm text-green-800">{selectedSuggestion.display_name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Sugerencias:</h3>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedSuggestion === suggestion
                          ? 'bg-purple-50 border-purple-300'
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
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
                <li>• Escribe al menos 3 caracteres para buscar</li>
                <li>• Selecciona una dirección de la lista</li>
                <li>• Confirma tu selección</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedSuggestion ? 'Ubicación seleccionada ✓' : 'Selecciona una ubicación de la lista'}
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
              disabled={!selectedSuggestion}
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
