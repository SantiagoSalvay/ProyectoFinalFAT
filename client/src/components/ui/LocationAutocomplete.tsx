import React, { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../../config/api";
import { MapPin } from "lucide-react";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onSelect?: (location: string) => void;
}

interface LocationSuggestion {
  display: string;
  full: string;
  type: "api" | "manual";
}

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Ingresa una dirección en Córdoba",
  className = "",
  disabled = false,
  onSelect,
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ghostText, setGhostText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const LOCATIONIQ_API_KEY = (import.meta as any).env?.VITE_LOCATIONIQ_API_KEY;

  // Debounce para las sugerencias
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!value || value.length < 3) {
        setSuggestions([]);
        setGhostText("");
        setShowSuggestions(false);
        return;
      }

      if (!LOCATIONIQ_API_KEY) {
        console.error("VITE_LOCATIONIQ_API_KEY no está configurada");
        // Crear solo sugerencia manual
        createManualSuggestion();
        return;
      }

      setIsLoading(true);
      setShowSuggestions(true);

      // Parsear la dirección escrita por el usuario
      const addressParts = value.split(",").map((part) => part.trim());
      let searchQuery = value;

      // Construir query optimizada para Córdoba Capital
      if (addressParts.length > 1) {
        searchQuery = `${addressParts[0]}, ${addressParts[1]}, Córdoba Capital, Córdoba, Argentina`;
      } else {
        searchQuery = `${value}, Córdoba Capital, Córdoba, Argentina`;
      }

      fetch(
        `${API_BASE_URL}/api/location/autocomplete?q=${encodeURIComponent(searchQuery)}&limit=15&countrycodes=ar&dedupe=0&addressdetails=1&normalizeaddress=1&viewbox=-64.3,-31.3,-64.0,-31.5&bounded=1`,
      )
        .then(async (res) => {
          if (!res.ok) {
            createManualSuggestion();
            return [];
          }
          return res.json();
        })
        .then((data) => {
          if (!Array.isArray(data)) {
            createManualSuggestion();
            return;
          }

          // Filtrar resultados de Córdoba (más permisivo)
          const filtered = data.filter((item: any) => {
            if (!item.address) return false;

            const displayName = (item.display_name || "").toLowerCase();

            // Debe contener "córdoba" en alguna parte
            const hasCórdoba =
              displayName.includes("córdoba") ||
              displayName.includes("cordoba");

            // Excluir otras provincias explícitamente
            const isOtherProvince =
              displayName.includes("misiones") ||
              displayName.includes("buenos aires") ||
              displayName.includes("santa fe") ||
              displayName.includes("mendoza") ||
              displayName.includes("salta") ||
              displayName.includes("tucumán");

            return hasCórdoba && !isOtherProvince;
          });

          // Formatear sugerencias
          const formatted = filtered.map((item: any) => {
            const road = item.address?.road || item.address?.street || "";
            const houseNumber = item.address?.house_number || "";
            const neighbourhood =
              item.address?.neighbourhood ||
              item.address?.suburb ||
              item.address?.quarter ||
              "";
            const city =
              item.address?.city ||
              item.address?.town ||
              item.address?.municipality ||
              "Córdoba";
            const postcode = item.address?.postcode || "";

            let display = "";
            let full = "";

            // Construir dirección detallada
            const parts: string[] = [];

            // 1. Calle y número
            if (road && houseNumber) {
              parts.push(`${road} ${houseNumber}`);
              display = `${road} ${houseNumber}`;
            } else if (road) {
              parts.push(road);
              display = road;
            }

            // 2. Barrio/Vecindario
            if (neighbourhood && neighbourhood !== city) {
              parts.push(neighbourhood);
              if (!display) display = neighbourhood;
            }

            // 3. Ciudad
            if (city && city !== neighbourhood) {
              parts.push(city);
            }

            // 4. Código postal
            if (postcode) {
              parts.push(`CP ${postcode}`);
            }

            // 5. Provincia
            parts.push("Córdoba");

            // 6. País
            parts.push("Argentina");

            full = parts.join(", ");

            // Si no hay display, usar el primer elemento
            if (!display && parts.length > 0) {
              display = parts[0];
            }

            // Fallback
            if (!full || full === "Córdoba, Argentina") {
              full = item.display_name;
              display = item.display_name.split(",")[0];
            }

            return { display, full, type: "api" as const };
          });

          // Crear versión manual de la dirección del usuario
          const manualSuggestion = createManualSuggestionObject();

          // SIEMPRE poner la versión manual PRIMERO
          const allSuggestions: LocationSuggestion[] = [manualSuggestion];

          // Agregar sugerencias de la API que NO sean duplicados de la manual
          formatted.forEach((suggestion) => {
            const isDuplicate =
              suggestion.full.toLowerCase() ===
              manualSuggestion.full.toLowerCase();
            if (!isDuplicate) {
              allSuggestions.push(suggestion);
            }
          });

          setSuggestions(allSuggestions);

          // Actualizar ghost text con la primera sugerencia (la manual)
          if (!isTyping && allSuggestions.length > 0) {
            const firstSuggestion = allSuggestions[0];
            if (
              firstSuggestion.full.toLowerCase().startsWith(value.toLowerCase())
            ) {
              setGhostText(firstSuggestion.full);
            } else {
              setGhostText("");
            }
          } else {
            setGhostText("");
          }
        })
        .catch(() => {
          createManualSuggestion();
        })
        .finally(() => setIsLoading(false));
    }, 300);

    return () => clearTimeout(handler);
  }, [value, LOCATIONIQ_API_KEY]);

  // Función helper para crear la sugerencia manual
  const createManualSuggestionObject = (): LocationSuggestion => {
    const userParts = value.split(",").map((p) => p.trim());
    let manualAddress = "";

    if (userParts.length >= 3) {
      // Usuario escribió "Calle Número, Barrio, Ciudad" o más
      manualAddress = userParts.join(", ");
      if (!manualAddress.toLowerCase().includes("córdoba")) {
        manualAddress += ", Córdoba, Argentina";
      } else if (!manualAddress.toLowerCase().includes("argentina")) {
        manualAddress += ", Argentina";
      }
    } else if (userParts.length === 2) {
      // Usuario escribió "Calle Número, Barrio"
      manualAddress = `${userParts[0]}, ${userParts[1]}, Córdoba, CP X5020, Argentina`;
    } else {
      // Usuario escribió solo "Calle Número"
      manualAddress = `${value}, Córdoba, CP X5000, Argentina`;
    }

    return {
      display: value,
      full: manualAddress,
      type: "manual",
    };
  };

  const createManualSuggestion = () => {
    const manualSuggestion = createManualSuggestionObject();
    setSuggestions([manualSuggestion]);
    setShowSuggestions(true);
    setGhostText(manualSuggestion.full);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter: aceptar la primera sugerencia o la dirección actual
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      } else if (value.length >= 3) {
        // Crear y aceptar dirección manual
        const manualSuggestion = createManualSuggestionObject();
        onChange(manualSuggestion.full);
        setShowSuggestions(false);
        setSuggestions([]);
        setGhostText("");
        if (onSelect) {
          onSelect(manualSuggestion.full);
        }
      }
    }
    // Tab o flecha derecha: aceptar ghost text
    else if (
      (e.key === "Tab" || e.key === "ArrowRight") &&
      ghostText &&
      ghostText !== value
    ) {
      e.preventDefault();
      onChange(ghostText);
      setShowSuggestions(false);
      setSuggestions([]);
      setGhostText("");
      if (onSelect) {
        onSelect(ghostText);
      }
    }
    // Escape: cerrar sugerencias
    else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSuggestions([]);
      setGhostText("");
    }
    // Flecha abajo: navegar sugerencias (implementación futura)
    else if (e.key === "ArrowDown" && suggestions.length > 0) {
      e.preventDefault();
      // TODO: implementar navegación con teclado
    }
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    onChange(suggestion.full);
    setShowSuggestions(false);
    setSuggestions([]);
    setGhostText("");
    setIsTyping(false);
    if (onSelect) {
      onSelect(suggestion.full);
    }
    inputRef.current?.blur();
  };

  const handleChange = (newValue: string) => {
    onChange(newValue);
    setShowSuggestions(true);

    // Marcar que el usuario está escribiendo
    setIsTyping(true);
    setGhostText("");

    // Limpiar el timer anterior
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    // Después de 500ms sin escribir, permitir ghost text nuevamente
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 500);
  };

  const handleFocus = () => {
    if (value.length >= 3 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // Retrasar el cierre para permitir clicks en sugerencias
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="relative w-full">
      {/* Container para el input y el ghost text */}
      <div className="relative">
        {/* Ghost text (autocompletado en gris) */}
        {ghostText && ghostText !== value && value.length > 0 && !isTyping && (
          <div
            className="absolute inset-0 pointer-events-none flex items-center px-3"
            style={{
              color: "transparent",
              whiteSpace: "pre",
              overflow: "hidden",
            }}
          >
            <span style={{ color: "transparent" }}>{value}</span>
            <span style={{ color: "#9CA3AF", fontSize: "inherit" }}>
              {ghostText.slice(value.length)}
            </span>
          </div>
        )}

        {/* Input principal */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${className}`}
          autoComplete="off"
          style={{
            position: "relative",
            zIndex: 1,
            backgroundColor: "transparent",
          }}
        />

        {/* Icono de loading */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
          </div>
        )}
      </div>

      {/* Lista de sugerencias desplegable */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => {
            const isManual = suggestion.type === "manual";
            const isFirst = index === 0;

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className={`w-full px-4 py-3 text-left hover:bg-purple-50 focus:bg-purple-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors ${
                  isFirst ? "bg-purple-50 border-l-4 border-l-purple-500" : ""
                }`}
              >
                <div className="flex items-start">
                  <MapPin
                    className={`w-4 h-4 mr-3 mt-0.5 flex-shrink-0 ${
                      isFirst ? "text-purple-600" : "text-gray-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm break-words ${
                        isFirst
                          ? "font-semibold text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      {suggestion.full}
                    </div>
                    {isFirst && (
                      <div className="text-xs text-purple-600 mt-1 font-medium">
                        ✓ Presiona ENTER o haz clic para usar esta dirección
                      </div>
                    )}
                    {isManual && !isFirst && (
                      <div className="text-xs text-blue-600 mt-1">
                        Usar dirección exacta como la escribiste
                      </div>
                    )}
                    {!isManual && !isFirst && (
                      <div className="text-xs text-gray-500 mt-1">
                        Sugerencia de LocationIQ
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Hint text mejorado */}
      {value.length > 0 && value.length < 3 && (
        <div className="text-xs text-gray-500 mt-1">
          Escribe al menos 3 caracteres para ver sugerencias
        </div>
      )}

      {value.length >= 3 && suggestions.length === 0 && !isLoading && (
        <div className="text-xs text-orange-600 mt-1">
          💡 Escribe tu dirección completa: "Calle Número, Barrio" y presiona
          ENTER
        </div>
      )}

      {value.length >= 3 && suggestions.length > 0 && !showSuggestions && (
        <div className="text-xs text-green-600 mt-1">
          ✓ Dirección guardada. Haz clic para editar.
        </div>
      )}

      {value.length >= 3 && suggestions.length > 0 && showSuggestions && (
        <div className="text-xs text-blue-600 mt-1">
          ↑↓ Navega | ENTER para seleccionar | ESC para cerrar
        </div>
      )}
    </div>
  );
}
