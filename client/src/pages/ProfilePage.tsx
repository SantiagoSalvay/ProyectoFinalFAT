import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";
import SocialMediaManager from "../components/SocialMediaManager";
import CookieSettings from "../components/CookieSettings";
import { useAuth } from "../contexts/AuthContext";
import { useONGNotifications } from "../hooks/useONGNotifications";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { SocialMediaLink } from "../utils/socialMediaDetector";
import {
  User,
  Building,
  MapPin,
  Mail,
  Calendar,
  Edit,
  Save,
  X,
  Heart,
  Users,
  Award,
  Upload,
  Image,
  Trash2,
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { clearMissingDataNotification } = useONGNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    location: "",
    bio: "",
    telefono: "",
  });

  // Estado para manejar la imagen de la ONG
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  // Estado para redes sociales
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>(
    [],
  );
  const [savingSocialMedia, setSavingSocialMedia] = useState(false);

  // Estado para categorías
  const [availableCategories, setAvailableCategories] = useState<
    Array<{
      id_categoria: number;
      nombre: string;
      descripcion?: string;
      color?: string;
      icono?: string;
    }>
  >([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Autocompletado de ubicación con LocationIQ
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationInput, setLocationInput] = useState("");

  // Usar la variable de entorno VITE_LOCATIONIQ_API_KEY
  const LOCATIONIQ_API_KEY = (import.meta as any).env?.VITE_LOCATIONIQ_API_KEY;

  // Debounce para evitar rate limit
  useEffect(() => {
    if (!isEditing) return;
    const handler = setTimeout(() => {
      if (!locationInput || locationInput.length < 3) {
        setLocationSuggestions([]);
        return;
      }
      if (!LOCATIONIQ_API_KEY) {
        setLocationSuggestions([]);
        return;
      }
      setLocationLoading(true);
      fetch(
        `${API_BASE_URL}/api/location/autocomplete?q=${encodeURIComponent(locationInput)}&limit=8&countrycodes=ar&dedupe=1`,
      )
        .then(async (res) => {
          if (!res.ok) {
            setLocationSuggestions([]);
            return [];
          }
          return res.json();
        })
        .then((data) => {
          if (!Array.isArray(data)) {
            setLocationSuggestions([]);
            return;
          }
          const filtered = data.filter((item: any) => {
            return (
              item.address &&
              ((item.address.city &&
                item.address.city.toLowerCase().includes("córdoba")) ||
                (item.address.state &&
                  item.address.state.toLowerCase().includes("córdoba")) ||
                (item.display_name &&
                  item.display_name.toLowerCase().includes("córdoba")))
            );
          });
          setLocationSuggestions(
            filtered.map((item: any) => {
              const road = item.address?.road || item.address?.name || "";
              const houseNumber = item.address?.house_number || "";
              if (road && houseNumber) {
                return `${road} ${houseNumber}, Córdoba`;
              }
              if (road) {
                return `${road}, Córdoba`;
              }
              return item.display_name;
            }),
          );
        })
        .catch(() => {
          setLocationSuggestions([]);
        })
        .finally(() => setLocationLoading(false));
    }, 600);
    return () => clearTimeout(handler);
  }, [locationInput, isEditing]);

  // Detectar si el usuario es ONG (tipo_usuario === 2)
  const isONG = user?.tipo_usuario === 2;

  // Actualizar profileData cuando el usuario cambie
  useEffect(() => {
    if (user) {
      console.log("🔍 [DEBUG] Datos del usuario recibidos:", user);
      console.log("🔍 [DEBUG] Campo createdAt:", user.createdAt);
      console.log("🔍 [DEBUG] Tipo de createdAt:", typeof user.createdAt);

      let fullName = "";
      if (isONG) {
        // Para ONG, mostrar nombre completo si hay nombre y apellido
        if (user.nombre && user.apellido) {
          fullName = `${user.nombre} ${user.apellido}`.trim();
        } else {
          fullName = user.nombre || user.apellido || "";
        }
      } else {
        fullName =
          user.nombre && user.apellido
            ? `${user.nombre} ${user.apellido}`.trim()
            : user.nombre || user.apellido || "";
      }

      setProfileData({
        name: fullName,
        email: user.email || "",
        location: user.ubicacion || "",
        bio: user.biografia || "",
        telefono: (user as any).telefono || "",
      });

      // Cargar imagen desde el servidor si es ONG
      if (isONG && user.id_usuario) {
        api
          .getONGProfileImage(user.id_usuario)
          .then(async (response) => {
            if (response.imageUrl) {
              // Construir URL completa del servidor
              const { API_BASE_URL } = await import('../config/api');
              setCurrentImageUrl(`${API_BASE_URL}${response.imageUrl}`);
            }
          })
          .catch((error) => {
            console.error("Error al cargar imagen de perfil:", error);
          });
      }

      // Cargar redes sociales si es ONG y tiene datos
      if (isONG && (user as any).redes_sociales) {
        try {
          console.log(
            "🔍 Redes sociales del usuario:",
            (user as any).redes_sociales,
          );
          console.log("🔍 Tipo:", typeof (user as any).redes_sociales);

          const parsed =
            typeof (user as any).redes_sociales === "string"
              ? JSON.parse((user as any).redes_sociales)
              : (user as any).redes_sociales;

          console.log("✅ Redes sociales parseadas:", parsed);
          setSocialMediaLinks(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error("❌ Error al parsear redes sociales:", e);
          setSocialMediaLinks([]);
        }
      } else if (isONG) {
        console.log("⚠️ ONG sin redes sociales");
        setSocialMediaLinks([]);
      }
    }
  }, [user, isONG]);

  // Cargar categorías disponibles y categorías de la ONG
  useEffect(() => {
    if (isONG && user?.id_usuario) {
      loadCategories();
    }
  }, [isONG, user?.id_usuario]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      console.log("📥 Cargando categorías para ONG ID:", user?.id_usuario);

      // Cargar categorías disponibles
      const categoriesResponse = (await api.getCategories()) as any;
      console.log("📥 Categorías disponibles:", categoriesResponse);
      setAvailableCategories(categoriesResponse.categorias || []);

      // Cargar categorías de la ONG
      const ongCategoriesResponse = (await api.getONGCategories(
        user!.id_usuario,
      )) as any;
      console.log("📥 Categorías de la ONG:", ongCategoriesResponse);
      const ongCategoryIds = (ongCategoriesResponse.categorias || []).map(
        (cat: any) => cat.id_categoria,
      );
      console.log("📥 IDs de categorías seleccionadas:", ongCategoryIds);
      setSelectedCategories(ongCategoryIds);
    } catch (error) {
      console.error("❌ Error al cargar categorías:", error);
      toast.error("Error al cargar las categorías");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSave = async () => {
    try {
      console.log("🔄 Iniciando guardado de perfil...");
      console.log("📋 Datos actuales del perfil:", profileData);

      // Validar que hay datos para guardar
      if (!profileData.name.trim()) {
        toast.error("El nombre no puede estar vacío");
        return;
      }

      // Separar el nombre completo en nombre y apellido
      const nameParts = profileData.name.trim().split(" ");
      const nombre = nameParts[0] || "";
      const apellido = nameParts.slice(1).join(" ") || "";

      // Preparar los datos para enviar al backend
      const updateData = {
        nombre,
        apellido,
        ubicacion: profileData.location || "",
        bio: profileData.bio || "",
        telefono: profileData.telefono || "",
      };

      console.log("📤 Datos a enviar al backend:", updateData);
      console.log("👤 Usuario actual:", user);

      // Llamar a la función updateProfile del contexto
      await updateProfile(updateData);

      // Guardar categorías si es ONG
      if (isONG && user?.id_usuario) {
        try {
          console.log("📂 Guardando categorías...");
          console.log("📂 ID de usuario:", user.id_usuario);
          console.log("📂 Categorías seleccionadas:", selectedCategories);
          const result = await api.updateONGCategories(
            user.id_usuario,
            selectedCategories,
          );
          console.log("✅ Categorías guardadas exitosamente:", result);
          toast.success("Categorías actualizadas exitosamente");
        } catch (error) {
          console.error("❌ Error al guardar categorías:", error);
          console.error(
            "❌ Detalles completos del error:",
            JSON.stringify(error, null, 2),
          );
          toast.error("Error al guardar las categorías");
          // No lanzar el error para que el perfil se guarde de todos modos
        }
      }

      // Limpiar notificación de datos faltantes si se completó la biografía
      if (updateData.bio && updateData.bio.trim() !== "") {
        clearMissingDataNotification();
      }

      console.log("✅ Perfil guardado exitosamente");
      setIsEditing(false);
    } catch (error) {
      console.error("❌ Error detallado al guardar perfil:", error);
      console.error("❌ Tipo de error:", typeof error);
      console.error("❌ Error objeto:", error);

      // Mostrar error más específico si está disponible
      if (error?.response?.data?.error) {
        toast.error(`Error: ${error.response.data.error}`);
      } else if (error?.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Error al guardar los cambios");
      }
    }
  };

  const handleCancel = () => {
    if (user) {
      const fullName =
        user.nombre && user.apellido
          ? `${user.nombre} ${user.apellido}`.trim()
          : user.nombre || user.apellido || "";

      setProfileData({
        name: fullName,
        email: user.email || "",
        location: user.ubicacion || "",
        bio: user.biografia || "",
        telefono: (user as any).telefono || "",
      });
    }
    setIsEditing(false);
  };

  // Función para manejar la selección de imagen
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor selecciona un archivo de imagen válido");
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen debe ser menor a 5MB");
        return;
      }

      setSelectedImage(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para subir la imagen
  const handleImageUpload = async () => {
    if (!selectedImage || !user?.id_usuario) {
      toast.error("Por favor selecciona una imagen");
      return;
    }

    setIsUploadingImage(true);
    try {
      // Subir imagen al servidor
      const response = await api.uploadONGProfileImage(selectedImage);

      // Actualizar el estado local con la nueva URL del servidor
      const { API_BASE_URL } = await import('../config/api');
      setCurrentImageUrl(`${API_BASE_URL}${response.imageUrl}`);

      toast.success("Imagen guardada exitosamente en el servidor");
      setSelectedImage(null);
      setImagePreview(null);

      console.log("✅ Imagen guardada en el servidor:", response.imageUrl);
    } catch (error) {
      console.error("Error al subir imagen al servidor:", error);
      toast.error(
        "Error al guardar la imagen en el servidor. Inténtalo de nuevo.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Función para cancelar la subida de imagen
  const handleImageCancel = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Función para guardar redes sociales
  const handleSaveSocialMedia = async (links: SocialMediaLink[]) => {
    try {
      setSavingSocialMedia(true);

      console.log("🔵 Guardando redes sociales:", links);
      console.log("🔵 Tipo de links:", typeof links);
      console.log("🔵 Es array?:", Array.isArray(links));

      // Usar el método updateProfile del contexto
      await updateProfile({
        redes_sociales: links,
      });

      console.log("✅ Redes sociales enviadas al backend");

      // Actualizar el estado local inmediatamente
      setSocialMediaLinks(links);

      toast.success("Redes sociales guardadas exitosamente");
    } catch (error) {
      console.error("❌ Error al guardar redes sociales:", error);
      toast.error("Error al guardar las redes sociales");
      throw error;
    } finally {
      setSavingSocialMedia(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">
            Gestiona tu información personal y preferencias
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Información Personal
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center text-purple-600 hover:text-purple-700"
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isONG ? "Nombre de la Organización" : "Nombre Completo"}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="input-field"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">
                        {profileData.name || "No especificado"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {profileData.email || "No especificado"}
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={locationInput}
                          onChange={(e) => {
                            setLocationInput(e.target.value);
                            setProfileData((prev) => ({
                              ...prev,
                              location: e.target.value,
                            }));
                          }}
                          onKeyDown={(e) => {
                            if (
                              e.key === "Tab" &&
                              locationSuggestions.length > 0
                            ) {
                              e.preventDefault();
                              const firstSuggestion = locationSuggestions[0];
                              setLocationInput(firstSuggestion);
                              setProfileData((prev) => ({
                                ...prev,
                                location: firstSuggestion,
                              }));
                              setLocationSuggestions([]);
                            }
                          }}
                          className="input-field flex-1"
                          placeholder="Calle y numeración en Córdoba (presiona TAB para autocompletar)"
                          autoComplete="off"
                        />
                      </div>
                      {/* Sugerencias de autocompletado - Primera en negrita */}
                      {locationSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                          <div className="max-h-36 overflow-y-auto">
                            {locationSuggestions
                              .slice(0, 3)
                              .map((suggestion, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  className={`w-full px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors ${
                                    index === 0 ? "bg-purple-50" : ""
                                  }`}
                                  onClick={() => {
                                    setLocationInput(suggestion);
                                    setProfileData((prev) => ({
                                      ...prev,
                                      location: suggestion,
                                    }));
                                    setLocationSuggestions([]);
                                  }}
                                >
                                  <div className="flex items-center">
                                    <svg
                                      className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                    </svg>
                                    <span
                                      className={`text-sm ${index === 0 ? "font-bold text-gray-900" : "text-gray-700"}`}
                                    >
                                      {suggestion}
                                    </span>
                                    {index === 0 && (
                                      <span className="ml-auto text-xs text-purple-600">
                                        Presiona TAB
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            {locationSuggestions.length > 3 && (
                              <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
                                +{locationSuggestions.length - 3} sugerencias
                                más disponibles
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">
                        {profileData.location || "No especificada. ej: "}
                      </span>
                    </div>
                  )}
                </div>

                {/* Teléfono - Solo para ONGs */}
                {isONG && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono de Contacto
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.telefono}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            telefono: e.target.value,
                          }))
                        }
                        className="input-field"
                        placeholder="Ej: +54 9 351 123 4567"
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">
                          {profileData.telefono || "No especificado"}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isONG ? "Descripción de la Organización" : "Biografía"}
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      className="input-field min-h-[100px] resize-y"
                      placeholder={
                        isONG
                          ? "Describe tu organización, misión y objetivos..."
                          : "Cuéntanos sobre ti..."
                      }
                      rows={4}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900 whitespace-pre-wrap">
                        {profileData.bio ||
                          (isONG
                            ? "No hay descripción de la organización"
                            : "No hay biografía disponible")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Categories - Solo para ONGs */}
                {isONG && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categorías de la Organización
                    </label>
                    {isEditing ? (
                      <div>
                        {loadingCategories ? (
                          <div className="p-3 bg-gray-50 rounded-lg text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                            <span className="text-gray-600">
                              Cargando categorías...
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600">
                              Selecciona una o más categorías que mejor
                              describan tu organización:
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {availableCategories.map((category) => (
                                <label
                                  key={category.id_categoria}
                                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                    selectedCategories.includes(
                                      category.id_categoria,
                                    )
                                      ? "border-purple-500 bg-purple-50"
                                      : "border-gray-200 hover:border-gray-300"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(
                                      category.id_categoria,
                                    )}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedCategories((prev) => [
                                          ...prev,
                                          category.id_categoria,
                                        ]);
                                      } else {
                                        setSelectedCategories((prev) =>
                                          prev.filter(
                                            (id) =>
                                              id !== category.id_categoria,
                                          ),
                                        );
                                      }
                                    }}
                                    className="sr-only"
                                  />
                                  <div className="flex items-center">
                                    {category.color && (
                                      <div
                                        className="w-4 h-4 rounded-full mr-2"
                                        style={{
                                          backgroundColor: category.color,
                                        }}
                                      ></div>
                                    )}
                                    <span className="text-sm font-medium text-gray-900">
                                      {category.icono && (
                                        <span className="mr-1">
                                          {category.icono}
                                        </span>
                                      )}
                                      {category.nombre}
                                    </span>
                                  </div>
                                </label>
                              ))}
                            </div>
                            {availableCategories.length === 0 && (
                              <p className="text-sm text-gray-500 text-center py-4">
                                No hay categorías disponibles
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {selectedCategories.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedCategories.map((categoryId) => {
                              const category = availableCategories.find(
                                (c) => c.id_categoria === categoryId,
                              );
                              return category ? (
                                <span
                                  key={categoryId}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                                  style={{
                                    backgroundColor:
                                      category.color || "#6B7280",
                                  }}
                                >
                                  {category.icono && (
                                    <span className="mr-1">
                                      {category.icono}
                                    </span>
                                  )}
                                  {category.nombre}
                                </span>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-500">
                            No hay categorías seleccionadas
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Redes Sociales - Solo para ONGs */}
                {isONG && (
                  <div className="border-t pt-6">
                    <SocialMediaManager
                      initialLinks={socialMediaLinks}
                      onSave={handleSaveSocialMedia}
                      saving={savingSocialMedia}
                    />
                  </div>
                )}

                {/* Member Since */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Miembro desde
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Fecha no disponible"}
                    </span>
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={handleSave}
                      className="btn-primary flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sección de Imagen de ONG - Solo visible para usuarios ONG */}
            {isONG && (
              <div className="card p-6 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Imagen de la Organización
                  </h2>
                  {/* Botón para eliminar imagen del servidor */}
                  {currentImageUrl && !imagePreview && (
                    <button
                      onClick={async () => {
                        try {
                          await api.deleteONGProfileImage();
                          setCurrentImageUrl(null);
                          toast.success("Imagen eliminada exitosamente");
                        } catch (error) {
                          console.error("Error al eliminar imagen:", error);
                          toast.error("Error al eliminar la imagen");
                        }
                      }}
                      className="text-xs text-red-600 hover:text-red-800 flex items-center"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Eliminar imagen
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Vista previa de la imagen actual */}
                  {currentImageUrl && !imagePreview && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Imagen Actual
                      </label>
                      <div className="relative inline-block">
                        <img
                          src={currentImageUrl}
                          alt="Imagen de la organización"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    </div>
                  )}

                  {/* Vista previa de la nueva imagen */}
                  {imagePreview && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vista Previa
                      </label>
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Vista previa"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    </div>
                  )}

                  {/* Botón para seleccionar imagen */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {imagePreview
                        ? "Cambiar Imagen"
                        : currentImageUrl
                          ? "Actualizar Imagen"
                          : "Subir Imagen"}
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Image className="w-4 h-4 mr-2" />
                        Seleccionar Archivo
                      </label>

                      {imagePreview && (
                        <>
                          <button
                            onClick={handleImageUpload}
                            disabled={isUploadingImage}
                            className="btn-primary flex items-center disabled:opacity-50"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {isUploadingImage ? "Subiendo..." : "Subir Imagen"}
                          </button>
                          <button
                            onClick={handleImageCancel}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Role Badge */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tipo de Cuenta
              </h3>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
                  {isONG ? (
                    <Building className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">
                    {isONG ? "Organización" : "Persona"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isONG
                      ? "Puedes crear publicaciones"
                      : "Puedes donar y hacer voluntariado"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración de Cookies */}
          <div className="mt-6">
            <CookieSettings />
          </div>
        </div>
      </div>
    </div>
  );
}
