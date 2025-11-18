import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polygon,
  OverlayView,
} from "@react-google-maps/api";
import { api, ONG } from "../services/api";
const GOOGLE_MAPS_API_KEY = "AIzaSyC33z7pXbXF16KbIDIXX-ZhBOLRNWqVAoo";
import {
  Heart,
  MapPin,
  Building,
  Users,
  ExternalLink,
  X,
  Mail,
  Phone,
} from "lucide-react";
import {
  getSocialMediaIcon,
  getSocialMediaColor,
} from "../utils/socialMediaDetector";

// Interfaz para ONG con datos del mapa
interface ONGWithLocation {
  id: number;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  group: string;
  need: string;
  rating?: number;
  volunteers_count?: number;
  projects_count?: number;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  socialMedia?: { type: string; url: string; displayName?: string }[];
  categories?: Array<{
    id_categoria: number;
    nombre: string;
    descripcion?: string;
    color?: string;
    icono?: string;
  }>;
  profileImageUrl?: string;
}

// Configuración del mapa
const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

// Centro en Córdoba (punto medio de la provincia)
const center = {
  lat: -31.5,
  lng: -63.8,
};

// Límites aproximados de la provincia de Córdoba
const cordobaBoundary = [
  { lat: -29.5, lng: -65.5 },
  { lat: -29.5, lng: -62.0 },
  { lat: -34.0, lng: -62.0 },
  { lat: -34.0, lng: -65.5 },
  { lat: -29.5, lng: -65.5 },
];

// Restricción de límites para que solo se vea Córdoba
const cordobaBounds = {
  north: -29.0,
  south: -34.5,
  east: -61.5,
  west: -66.0,
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  clickableIcons: false,
  restriction: {
    latLngBounds: cordobaBounds,
    strictBounds: true,
  },
  minZoom: 6,
  maxZoom: 18,
  styles: [
    // Ocultar todas las demás provincias y países
    {
      featureType: "administrative.country",
      elementType: "all",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "administrative.province",
      elementType: "all",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "administrative.locality",
      elementType: "labels",
      stylers: [{ visibility: "on" }], // Mantener nombres de ciudades
    },
    // Mantener visible solo el mapa base
    {
      featureType: "road",
      elementType: "all",
      stylers: [{ visibility: "simplified" }],
    },
    {
      featureType: "water",
      elementType: "all",
      stylers: [{ visibility: "on" }],
    },
    {
      featureType: "landscape",
      elementType: "all",
      stylers: [{ visibility: "on" }],
    },
  ],
};

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const ongIdFromUrl = searchParams.get('ongId');
  const [geoError, setGeoError] = useState<string | null>(null);
  const [hasOpenedModal, setHasOpenedModal] = useState(false);
  
  // Resetear hasOpenedModal cuando cambia el ongId de la URL
  useEffect(() => {
    setHasOpenedModal(false);
  }, [ongIdFromUrl]);
  // Manejo de error de tiles
  const handleTileError = (e: any) => {
    // e.target.status puede ser 401, 429, 404, etc.
    // Pero Leaflet no expone status, así que revisamos el mensaje
    setGeoError(
      "No se pudo cargar el mapa. Verifica tu API key de LocationIQ o espera unos minutos si excediste el límite de peticiones.",
    );
  };
  // Estados y hooks primero
  const [ongs, setOngs] = useState<ONGWithLocation[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [selectedONG, setSelectedONG] = useState<ONGWithLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [needFilter, setNeedFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number[]>([]);
  const [availableCategories, setAvailableCategories] = useState<
    Array<{
      id_categoria: number;
      nombre: string;
      color?: string;
      icono?: string;
    }>
  >([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Cargar Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);

    // Función para cerrar InfoWindows
    const closeInfoWindows = () => {
      const infoWindows = document.querySelectorAll(".gm-style-iw-c");
      infoWindows.forEach((iw) => {
        const parent = iw.parentElement;
        if (parent) {
          parent.style.display = "none";
        }
      });
    };

    // Cerrar InfoWindows al hacer clic en el mapa
    map.addListener("click", closeInfoWindows);

    // Observer para cerrar InfoWindows que aparezcan dinámicamente
    const observer = new MutationObserver(() => {
      closeInfoWindows();
    });

    // Observar cambios en el contenedor del mapa
    const mapContainer = document.querySelector(".gm-style");
    if (mapContainer) {
      observer.observe(mapContainer, {
        childList: true,
        subtree: true,
      });
    }

    // Cerrar inmediatamente cualquier InfoWindow existente
    closeInfoWindows();
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Colores por grupo social
  const groupColors: Record<string, string> = {
    Niños: "#2196f3", // celeste/azul
    "Gente mayor": "#8bc34a", // verde claro
    Mujeres: "#e040fb", // rosa/morado
    Animales: "#ff9800", // naranja
    "Personas con discapacidad": "#e6f208ff", // amarillo
    Familias: "#009688", // turquesa
    Otros: "#f44336", // rojo
  };

  // Cargar categorías disponibles
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = (await api.getCategories()) as any;
        setAvailableCategories(response.categorias || []);
      } catch (error) {
        console.error("Error cargando categorías:", error);
      }
    };
    loadCategories();
  }, []);

  // Filtrado de ONGs por necesidad, grupo social, categorías y ongId de URL
  const filteredOngs = ongs.filter((ong) => {
    // Si hay un ongId en la URL, solo mostrar esa ONG
    if (ongIdFromUrl) {
      return ong.id === Number(ongIdFromUrl);
    }

    const needMatch =
      needFilter === "" ||
      ong.need.toLowerCase().includes(needFilter.toLowerCase());
    const groupMatch = groupFilter === "" || ong.group === groupFilter;

    // Filtro por categorías
    const categoryMatch =
      categoryFilter.length === 0 ||
      (ong.categories &&
        ong.categories.some((cat) =>
          categoryFilter.includes(cat.id_categoria),
        ));

    return needMatch && groupMatch && categoryMatch;
  });


  useEffect(() => {
    if (isLoaded) {
      loadONGs();
    }
  }, [needFilter, groupFilter, categoryFilter, isLoaded]);

  // Centrar el mapa en la ONG seleccionada cuando se carga desde la URL
  useEffect(() => {
    if (ongIdFromUrl && filteredOngs.length > 0 && map && !loading && !geoLoading && !hasOpenedModal) {
      const selectedOng = filteredOngs[0];
      if (selectedOng.latitude && selectedOng.longitude) {
        map.panTo({ lat: selectedOng.latitude, lng: selectedOng.longitude });
        map.setZoom(15);
        setHasOpenedModal(true);
        setTimeout(() => {
          setSelectedONG(selectedOng);
        }, 300);
      }
    }
  }, [ongIdFromUrl, filteredOngs, map, loading, geoLoading, hasOpenedModal]);

  // Función para geocodificar usando Google Maps API
  const geocodeAddress = async (
    address: string,
  ): Promise<{ lat: number; lng: number } | null> => {
    if (!isLoaded) return null;

    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode(
        {
          address: `${address}, Argentina`,
          region: "AR",
        },
        (results, status) => {
          if (status === "OK" && results && results[0]) {
            const location = results[0].geometry.location;
            resolve({
              lat: location.lat(),
              lng: location.lng(),
            });
          } else {
            console.error("Error geocodificando:", address, status);
            resolve(null);
          }
        },
      );
    });
  };

  const loadONGs = async () => {
    console.log("Cargando ONGs...");
    setLoading(true);
    setGeoLoading(true);
    try {
      const response = await api.getONGs();
      const grupos = [
        "Niños",
        "Gente mayor",
        "Mujeres",
        "Animales",
        "Personas con discapacidad",
        "Familias",
        "Otros",
      ];

      // Geocodificar cada ubicación usando Google Maps y obtener grupo/necesidad reales
      const geocodePromises = response.ongs.map(async (ong) => {
        let latitude: number | undefined = undefined;
        let longitude: number | undefined = undefined;
        if (ong.location) {
          try {
            const coordinates = await geocodeAddress(ong.location);
            if (coordinates) {
              latitude = coordinates.lat;
              longitude = coordinates.lng;
            }
          } catch (err: any) {
            console.error("Error geocodificando ubicación:", ong.location, err);
          }
        }
        // Obtener grupo_social y necesidad desde la base de datos
        let group = "Otros";
        let need = "Otros";
        try {
          const tipoONG = await api.getTipoONGById(ong.id);
          if (tipoONG?.grupo_social) group = tipoONG.grupo_social;
          if (tipoONG?.necesidad) need = tipoONG.necesidad;
        } catch {}

        // Obtener categorías de la ONG
        let categories: Array<{
          id_categoria: number;
          nombre: string;
          descripcion?: string;
          color?: string;
          icono?: string;
        }> = [];
        try {
          const categoriesResponse = (await api.getONGCategories(
            ong.id,
          )) as any;
          categories = categoriesResponse.categorias || [];
        } catch (err) {
          console.error("Error cargando categorías para ONG:", ong.id, err);
        }

        // Obtener imagen de perfil de la ONG
        let profileImageUrl: string | undefined = undefined;
        try {
          const { API_BASE_URL } = await import('../config/api');
          const imageResponse = await api.getONGProfileImage(ong.id);
          if (imageResponse.imageUrl) {
            profileImageUrl = `${API_BASE_URL}${imageResponse.imageUrl}`;
          }
        } catch (err) {
          console.error(
            "Error cargando imagen de perfil para ONG:",
            ong.id,
            err,
          );
        }

        return {
          id: ong.id,
          name: ong.name,
          location: ong.location || "Ubicación no especificada",
          latitude,
          longitude,
          group,
          need,
          rating: ong.rating,
          volunteers_count: ong.volunteers_count,
          projects_count: ong.projects_count,
          description: ong.description,
          email: ong.email,
          phone: ong.phone,
          website: ong.website,
          socialMedia: ong.socialMedia || [],
          categories,
          profileImageUrl,
        };
      });
      const ongsWithLocation = await Promise.all(geocodePromises);
      setOngs(ongsWithLocation);
    } catch (error) {
      console.error("Error loading ONGs:", error);
    } finally {
      setLoading(false);
      setGeoLoading(false);
    }
  };

  // Mostrar pantalla de carga solo cuando hay ongId en URL y se está cargando
  if (ongIdFromUrl && (loading || geoLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-purple-600 mx-auto mb-6"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <svg className="w-10 h-10 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-purple-900 mb-2">Cargando ubicación...</h2>
          <p className="text-purple-700 mb-4">
            Buscando la ONG seleccionada en el mapa...
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-600 shadow-sm border-b">
      {geoError && (
        <div className="bg-red-100 text-red-700 p-4 text-center font-semibold">
          {geoError}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="mb-3 sm:mb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
            Mapa de ONGs - Córdoba
          </h1>
          <p className="text-sm sm:text-base text-purple-100">
            Explora organizaciones en la provincia de Córdoba
          </p>
        </div>

        <div className="space-y-3">
          
          {/* Filtro por categorías */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-white">Categorías:</span>
              <button
                onClick={() => setCategoryFilter([])}
                className="text-xs text-purple-200 hover:text-white underline"
              >
                Limpiar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {[...availableCategories]
                .sort((a, b) => a.id_categoria - b.id_categoria) // 🔹 Ordenar por ID numérico
                .map((category) => {
                  const isSelected = categoryFilter.includes(category.id_categoria);
                  const count = ongs.filter((ong) =>
                    ong.categories?.some(
                      (cat) => cat.id_categoria === category.id_categoria
                    )
                  ).length;
                
                  return (
                    <button
                      key={category.id_categoria}
                      onClick={() => {
                        setCategoryFilter((prev) =>
                          isSelected
                            ? prev.filter((id) => id !== category.id_categoria)
                            : [...prev, category.id_categoria]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center ${
                        isSelected
                          ? "bg-white text-purple-700 shadow-md"
                          : "bg-purple-700 text-white hover:bg-purple-800"
                      }`}
                      style={
                        isSelected
                          ? {}
                          : { backgroundColor: category.color, opacity: 0.9 }
                      }
                    >
                      {category.icono && <span className="mr-1">{category.icono}</span>}
                      {category.nombre}
                      <span className="ml-1.5 opacity-75">({count})</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor Flex: En mobile (vertical), en desktop (horizontal) */}
      <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-200px)]">
        {/* Mapa */}
        <div className="w-full lg:flex-1 h-[400px] sm:h-[500px] lg:h-full">
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
              zoom={6.5}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={options}
              onClick={() => {
                // Prevenir que se abra el InfoWindow predeterminado
              }}
            >
              {/* Polígono de Córdoba resaltado en blanco */}
              <Polygon
                paths={cordobaBoundary}
                options={{
                  fillColor: "#ffffff",
                  fillOpacity: 0.3,
                  strokeColor: "#ffffff",
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                }}
              />

              {/* Marcador de respaldo para debugging cuando hay filtro */}
              {ongIdFromUrl && filteredOngs.length > 0 && filteredOngs[0].latitude && filteredOngs[0].longitude && (
                <Marker
                  position={{ lat: filteredOngs[0].latitude, lng: filteredOngs[0].longitude }}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 20,
                    fillColor: "#FF0000",
                    fillOpacity: 1,
                    strokeColor: "#FFFFFF",
                    strokeWeight: 3,
                  }}
                  onClick={() => setSelectedONG(filteredOngs[0])}
                />
              )}

              {filteredOngs.map((ong) =>
                ong.latitude !== undefined && ong.longitude !== undefined ? (
                  <OverlayView
                    key={ong.id}
                    position={{ lat: ong.latitude, lng: ong.longitude }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedONG(ong);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      style={{
                        position: "absolute",
                        transform: "translate(-50%, -50%)",
                        cursor: "pointer",
                        width: "60px",
                        height: "60px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 100,
                        backgroundColor: ongIdFromUrl ? "rgba(255, 0, 0, 0.2)" : "transparent",
                        borderRadius: "50%",
                      }}
                    >
                      {ong.profileImageUrl ? (
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            border: `3px solid ${groupColors[ong.group] || "#f44336"}`,
                            backgroundColor: "white",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                          }}
                        >
                          <img
                            src={ong.profileImageUrl}
                            alt={ong.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor:
                              groupColors[ong.group] || "#f44336",
                            border: "3px solid white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "16px",
                            fontWeight: "bold",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                          }}
                        >
                          {ong.group.charAt(0)}
                        </div>
                      )}
                    </div>
                  </OverlayView>
                ) : null
              )}
            </GoogleMap>
          )}
        </div>

        {/* Listado de ONGs - Abajo en mobile, al lado en desktop */}
        <div className="w-full lg:w-96 bg-white lg:border-l border-gray-200 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
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
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                      selectedONG?.id === ong.id
                        ? "border-purple-500 bg-purple-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                    onClick={() => setSelectedONG(ong)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base flex-1 pr-2">
                        {ong.name}
                      </h3>
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: groupColors[ong.group] || "gray",
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {ong.location}
                    </p>
                    <div className="text-xs text-gray-600 mb-2 flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      {ong.phone ? (
                        <a href={`tel:${ong.phone}`} className="hover:underline">{ong.phone}</a>
                      ) : (
                        <span className="text-gray-400">No disponible</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
                      <div className="flex items-center">
                        <Users className="w-3 h-3" />
                        <span className="ml-1">
                          {ong.volunteers_count || 0}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Building
                          className="w-3 h-3"
                          style={{ color: groupColors[ong.group] || "#f44336" }}
                        />
                        <span className="ml-1 capitalize">{ong.group}</span>
                      </div>
                    </div>
                    {/* Categorías */}
                    {ong.categories && ong.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {ong.categories.slice(0, 2).map((category) => (
                          <span
                            key={category.id_categoria}
                            className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{
                              backgroundColor: category.color || "#6B7280",
                            }}
                            title={category.descripcion}
                          >
                            {category.icono && (
                              <span className="mr-0.5">{category.icono}</span>
                            )}
                            {category.nombre}
                          </span>
                        ))}
                        {ong.categories.length > 2 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                            +{ong.categories.length - 2}
                          </span>
                        )}
                      </div>
                    )}
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
            style={{ zIndex: 1000, pointerEvents: "auto" }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedONG(null);
            }}
          />
          {/* Modal */}
          <div
            className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            style={{ zIndex: 1010 }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedONG.name}
                  </h2>
                  <p className="text-gray-600">{selectedONG.location}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedONG(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  style={{ zIndex: 1020 }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Descripción
                </h3>
                <p className="text-gray-700">
                  {selectedONG.description || "Sin descripción disponible"}
                </p>
              </div>

              {/* Categorías de la ONG */}
              {selectedONG.categories && selectedONG.categories.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Categorías
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedONG.categories.map((category) => (
                      <span
                        key={category.id_categoria}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: category.color || "#6B7280" }}
                      >
                        {category.icono && (
                          <span className="mr-1">{category.icono}</span>
                        )}
                        {category.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Información de contacto
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">
                      {selectedONG.location}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-700">{selectedONG.email || 'No disponible'}</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <svg
                      className="w-4 h-4 text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {selectedONG.phone ? (
                      <a href={`tel:${selectedONG.phone}`} className="text-gray-700 hover:underline">{selectedONG.phone}</a>
                    ) : (
                      <span className="text-gray-400">No disponible</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                {/* Botón de Google Maps - siempre visible si hay coordenadas */}
                {selectedONG.latitude && selectedONG.longitude && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedONG.latitude},${selectedONG.longitude}&travelmode=driving`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Abrir en Google Maps
                  </a>
                )}
                
                {selectedONG.website && (
                  <a
                    href={selectedONG.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg text-center hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    <ExternalLink className="w-4 h-4 inline mr-2" />
                    Sitio web
                  </a>
                )}
              </div>

              {/* Redes Sociales - Agregado en el modal principal */}
              {selectedONG.socialMedia &&
                selectedONG.socialMedia.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Redes Sociales
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedONG.socialMedia.map((link, index) => {
                        const IconComponent = getSocialMediaIcon(
                          link.type as any,
                        );
                        const color = getSocialMediaColor(link.type as any);
                        return (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ backgroundColor: color }}
                            className="flex items-center justify-center w-10 h-10 rounded-full text-white hover:opacity-90 transition-all transform hover:scale-105 shadow-md"
                            title={link.displayName || link.type}
                          >
                            <IconComponent className="w-5 h-5" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
