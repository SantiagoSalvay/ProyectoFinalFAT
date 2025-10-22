import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { toast } from "react-hot-toast";
import { api } from "../services/api";
import InlineComments from "../components/InlineComments";
import { usePostValidation } from "../hooks/useContentModeration";
import LocationAutocomplete from "../components/ui/LocationAutocomplete";
import {
  MessageCircle,
  Heart,
  Share2,
  Search,
  Plus,
  MapPin,
  Tag,
  Calendar,
  User,
  Building,
  LogIn,
  UserPlus,
  Loader2,
  AlertCircle,
  Trash2,
  Image,
  X,
  Edit3,
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    role: "person" | "ong";
    organization?: string;
    avatar?: string;
  };
  id_usuario?: number;
  image?: string;
  imagenes?: string[];
  tags: string[];
  location?: string;
  likes: number;
  comments: number;
  createdAt: Date;
  isLiked?: boolean;
}

interface Categoria {
  id_etiqueta: number;
  etiqueta: string;
}

export default function ForumPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { validatePost, validateTitle, validate } = usePostValidation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingPost, setCreatingPost] = useState(false);
  const [titleError, setTitleError] = useState<string>("");
  const [contentError, setContentError] = useState<string>("");

  // Autocompletado de ubicación
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const LOCATIONIQ_API_KEY = (import.meta as any).env?.VITE_LOCATIONIQ_API_KEY;

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set(),
  );
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Leer filtro desde query param al montar
  useEffect(() => {
    if (categorias.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const filtro = params.get("filtro");

      if (filtro === "voluntariado" || filtro === "volunteering") {
        const voluntariadoCategory = categorias.find(
          (c) => c.etiqueta === "Voluntariado",
        );
        if (voluntariadoCategory) {
          setSelectedCategories([voluntariadoCategory.id_etiqueta]);
        }
      }
      if (filtro === "donaciones" || filtro === "donations") {
        const donacionCategory = categorias.find(
          (c) => c.etiqueta === "Donacion",
        );
        if (donacionCategory) {
          setSelectedCategories([donacionCategory.id_etiqueta]);
        }
      }
    }
  }, [categorias]);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    categorias: [] as number[],
    location: "",
    coordinates: null as [number, number] | null,
    imagenes: [] as string[],
  });

  // Estado separado para las categorías seleccionadas en el modal de creación
  const [modalSelectedCategories, setModalSelectedCategories] = useState<
    number[]
  >([]);

  // Estado para saber si estamos editando un post existente
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Estado individual para cada categoría (como backup)
  const [categoryStates, setCategoryStates] = useState<{
    [key: number]: boolean;
  }>({});

  // Ref para manejar checkboxes directamente
  const checkboxRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // Autocompletado de ubicación con debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!newPost.location || newPost.location.length < 3) {
        setLocationSuggestions([]);
        return;
      }
      if (!LOCATIONIQ_API_KEY) {
        setLocationSuggestions([]);
        return;
      }
      setLocationLoading(true);
      fetch(
        `https://api.locationiq.com/v1/autocomplete?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(newPost.location)}&limit=8&countrycodes=ar&dedupe=1`,
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
  }, [newPost.location, showCreatePost]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [publicacionesData, categoriasData] = await Promise.all([
        api.getPublicaciones(),
        api.getCategorias(),
      ]);

      // Transformar las fechas de string a Date
      const publicacionesFormateadas = publicacionesData.map((post) => ({
        ...post,
        createdAt: new Date(post.createdAt),
      }));

      setPosts(publicacionesFormateadas);
      setCategorias(categoriasData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar las publicaciones");
    } finally {
      setLoading(false);
    }
  };

  // Considera ONG si tipo_usuario === 2 (igual que en ProfilePage y DashboardPage)
  const isONG = user?.tipo_usuario === 2;

  // Log para debugging
  console.log("🔍 [FORUM] Usuario:", user);
  console.log("🔍 [FORUM] tipo_usuario:", user?.tipo_usuario);
  console.log("🔍 [FORUM] isONG:", isONG);

  const handleEliminarPublicacion = async (postId: string) => {
    if (!user) {
      toast.error("Debes iniciar sesión");
      return;
    }

    if (
      !window.confirm("¿Estás seguro de que quieres eliminar esta publicación?")
    ) {
      return;
    }

    try {
      await api.eliminarPublicacion(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      toast.success("Publicación eliminada exitosamente");
    } catch (error: any) {
      console.error("Error al eliminar publicación:", error);
      const errorMsg = error?.response?.data?.error || "Error al eliminar la publicación";
      toast.error(errorMsg);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      // Llamar al API para dar/quitar like
      const response = await api.toggleLike(postId);

      // Actualizar el estado local con la respuesta del servidor
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              likes: response.totalLikes,
              isLiked: response.liked,
            };
          }
          return post;
        }),
      );

      // Mostrar mensaje
      toast.success(
        response.liked
          ? "¡Te gusta esta publicación!"
          : "Ya no te gusta esta publicación",
        {
          duration: 2000,
          icon: response.liked ? "💜" : "🤍",
        },
      );
    } catch (error) {
      console.error("Error al dar me gusta:", error);
      toast.error("Error al actualizar el me gusta");
    }
  };

  const handleToggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleTogglePostExpansion = (postId: string) => {
    setExpandedPost((prev) => (prev === postId ? null : postId));
  };

  // Función simple para manejar categorías
  const toggleCategory = (categoriaId: number) => {
    console.log("🔍 [TOGGLE] Toggle categoría:", categoriaId);
    console.log("🔍 [TOGGLE] Estado actual:", modalSelectedCategories);

    setModalSelectedCategories((prev) => {
      const isSelected = prev.includes(categoriaId);
      let newCategories;

      if (isSelected) {
        // Remover
        newCategories = prev.filter((id) => id !== categoriaId);
        console.log("🔍 [TOGGLE] Removiendo categoría:", categoriaId);
      } else {
        // Agregar
        newCategories = [...prev, categoriaId];
        console.log("🔍 [TOGGLE] Agregando categoría:", categoriaId);
      }

      console.log("🔍 [TOGGLE] Nuevo estado:", newCategories);
      return newCategories;
    });
  };

  // Función alternativa usando estado individual
  const toggleCategoryIndividual = (categoriaId: number) => {
    console.log("🔍 [INDIVIDUAL] Toggle categoría individual:", categoriaId);

    setCategoryStates((prev) => {
      const newState = {
        ...prev,
        [categoriaId]: !prev[categoriaId],
      };
      console.log("🔍 [INDIVIDUAL] Nuevo estado individual:", newState);

      // Actualizar también el array de categorías seleccionadas
      const selectedIds = Object.keys(newState)
        .filter((key) => newState[parseInt(key)])
        .map((key) => parseInt(key));

      console.log("🔍 [INDIVIDUAL] IDs seleccionados:", selectedIds);
      setModalSelectedCategories(selectedIds);

      return newState;
    });
  };

  // Función que maneja checkboxes directamente con DOM
  const handleCheckboxDirect = (
    categoriaId: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const checkbox = event.target;
    const isChecked = checkbox.checked;

    console.log(
      "🔍 [DIRECT] Checkbox directo:",
      categoriaId,
      "Checked:",
      isChecked,
    );
    console.log("🔍 [DIRECT] Estado actual antes:", modalSelectedCategories);

    // Actualizar estado directamente
    setModalSelectedCategories((prev) => {
      let newCategories;
      if (isChecked) {
        // Agregar si no está presente
        newCategories = prev.includes(categoriaId)
          ? prev
          : [...prev, categoriaId];
      } else {
        // Remover
        newCategories = prev.filter((id) => id !== categoriaId);
      }

      console.log("🔍 [DIRECT] Nuevo estado:", newCategories);
      return newCategories;
    });

    // Forzar el estado del checkbox
    setTimeout(() => {
      checkbox.checked = isChecked;
    }, 0);
  };

  // Función ultra simple para manejar categorías
  const handleCategoryClick = (categoriaId: number) => {
    console.log("🔍 [ULTRA-SIMPLE] Click en categoría:", categoriaId);
    console.log("🔍 [ULTRA-SIMPLE] Estado actual:", modalSelectedCategories);

    // Toggle simple
    setModalSelectedCategories((prev) => {
      const isSelected = prev.includes(categoriaId);
      let newCategories;

      if (isSelected) {
        // Remover
        newCategories = prev.filter((id) => id !== categoriaId);
        console.log("🔍 [ULTRA-SIMPLE] Removiendo:", categoriaId);
      } else {
        // Agregar
        newCategories = [...prev, categoriaId];
        console.log("🔍 [ULTRA-SIMPLE] Agregando:", categoriaId);
      }

      console.log("🔍 [ULTRA-SIMPLE] Nuevo estado:", newCategories);
      return newCategories;
    });
  };

  const handleShare = async (postId: string, postTitle: string) => {
    const shareUrl = `${window.location.origin}/forum/${postId}`;

    // Intentar usar la API de Web Share si está disponible (móviles y algunos navegadores modernos)
    if (navigator.share) {
      try {
        await navigator.share({
          title: postTitle,
          text: `Mira esta publicación: ${postTitle}`,
          url: shareUrl,
        });
        toast.success("¡Compartido exitosamente!");
      } catch (error: any) {
        // Si el usuario cancela, no mostramos error
        if (error.name !== "AbortError") {
          console.error("Error al compartir:", error);
        }
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("¡Link copiado al portapapeles!", {
          duration: 3000,
          icon: "🔗",
        });
      } catch (error) {
        console.error("Error al copiar al portapapeles:", error);
        toast.error("No se pudo copiar el link");
      }
    }
  };

  const handlePostClick = (postId: string) => {
    navigate(`/forum/${postId}`);
  };

  const handleEditPost = (post: Post) => {
    // Establecer el ID del post que se está editando
    setEditingPostId(post.id);

    // Llenar el formulario con los datos del post
    setNewPost({
      title: post.title,
      content: post.content,
      categorias: [], // Las categorías se manejan por separado
      location: post.location || "",
      coordinates: null, // TODO: parsear coordenadas si están disponibles
      imagenes: post.imagenes || [],
    });

    // Seleccionar las categorías del post
    const postCategories = categorias
      .filter((cat) => post.tags.includes(cat.etiqueta))
      .map((cat) => cat.id_etiqueta);
    setModalSelectedCategories(postCategories);

    // Abrir el modal de creación/edición
    setShowCreatePost(true);

    toast.success("Post cargado para edición");
  };

  const handleCreatePost = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Validar que el usuario sea ONG
    if (!isONG) {
      toast.error("Solo las ONGs pueden crear publicaciones");
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    if (modalSelectedCategories.length === 0) {
      toast.error("Por favor selecciona al menos una categoría");
      return;
    }

    // Validar el contenido con el sistema de moderación
    const isValid = validatePost(newPost.title.trim(), newPost.content.trim());

    if (!isValid) {
      // Los errores ya fueron mostrados por el hook
      return;
    }

    try {
      setCreatingPost(true);

      const postData = {
        titulo: newPost.title.trim(),
        descripcion: newPost.content.trim(),
        categorias: modalSelectedCategories,
        ubicacion: newPost.location.trim() || undefined,
        coordenadas: newPost.coordinates || undefined,
        imagenes: newPost.imagenes.length > 0 ? newPost.imagenes : undefined,
      };

      console.log("📝 [POST] Datos a enviar:", postData);
      console.log(
        "📝 [POST] Categorías seleccionadas:",
        modalSelectedCategories,
      );
      console.log(
        "📝 [POST] Cantidad de categorías seleccionadas:",
        modalSelectedCategories.length,
      );
      console.log("📝 [POST] Lista de categorías disponibles:", categorias);

      if (editingPostId) {
        // Actualizar publicación existente
        console.log("📝 [UPDATE] Actualizando publicación ID:", editingPostId);
        await api.actualizarPublicacion(editingPostId, postData);
        toast.success("Publicación actualizada exitosamente");
      } else {
        // Crear nueva publicación
        console.log("📝 [CREATE] Creando nueva publicación");
        await api.crearPublicacion(postData);
        toast.success("Publicación creada exitosamente");
      }

      // Limpiar formulario y estados
      setNewPost({
        title: "",
        content: "",
        categorias: [],
        location: "",
        coordinates: null,
        imagenes: [],
      });
      setModalSelectedCategories([]);
      setCategoryStates({});
      setEditingPostId(null);
      setShowCreatePost(false);

      // Recargar las publicaciones
      await loadData();
    } catch (error: any) {
      console.error("Error al crear publicación:", error);

      // Manejar errores específicos de moderación del servidor
      if (error.response?.status === 400) {
        toast.error(
          error.response.data.error ||
            "La publicación contiene contenido no permitido",
        );
      } else {
        toast.error("Error al crear la publicación");
      }
    } finally {
      setCreatingPost(false);
    }
  };

  // Función para comprimir imágenes (versión simplificada para debugging)
  const compressImage = (
    file: File,
    maxWidth: number = 800,
    quality: number = 0.8,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log("🔄 [COMPRESS] Iniciando compresión de:", file.name);

      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = document.createElement("img");

        console.log("🔄 [COMPRESS] Canvas y contexto creados");

        // Manejar errores de carga de imagen
        img.onerror = (error) => {
          console.error("❌ [COMPRESS] Error al cargar la imagen:", error);
          reject(new Error(`No se pudo cargar la imagen ${file.name}`));
        };

        img.onload = () => {
          console.log(
            "🔄 [COMPRESS] Imagen cargada, dimensiones originales:",
            img.width,
            "x",
            img.height,
          );

          try {
            // Verificar que el contexto del canvas esté disponible
            if (!ctx) {
              console.error(
                "❌ [COMPRESS] No se pudo obtener el contexto del canvas",
              );
              reject(new Error("No se pudo obtener el contexto del canvas"));
              return;
            }

            // Calcular nuevas dimensiones manteniendo la proporción
            let { width, height } = img;
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }

            console.log(
              "🔄 [COMPRESS] Dimensiones calculadas:",
              width,
              "x",
              height,
            );

            // Verificar dimensiones válidas
            if (width <= 0 || height <= 0) {
              console.error(
                "❌ [COMPRESS] Dimensiones inválidas:",
                width,
                "x",
                height,
              );
              reject(new Error("Dimensiones de imagen inválidas"));
              return;
            }

            canvas.width = width;
            canvas.height = height;
            console.log("🔄 [COMPRESS] Canvas configurado");

            // Dibujar la imagen redimensionada
            ctx.drawImage(img, 0, 0, width, height);
            console.log("🔄 [COMPRESS] Imagen dibujada en canvas");

            // Convertir a base64 con compresión
            const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
            console.log(
              "🔄 [COMPRESS] Data URL generado, longitud:",
              compressedDataUrl.length,
            );

            // Verificar que se generó el data URL
            if (!compressedDataUrl || compressedDataUrl === "data:,") {
              console.error("❌ [COMPRESS] Data URL vacío o inválido");
              reject(new Error("Error al generar la imagen comprimida"));
              return;
            }

            console.log("✅ [COMPRESS] Compresión exitosa");
            resolve(compressedDataUrl);
          } catch (error) {
            console.error("❌ [COMPRESS] Error en el procesamiento:", error);
            reject(error);
          }
        };

        // Crear URL del objeto y cargar la imagen
        console.log("🔄 [COMPRESS] Creando URL del objeto");
        const objectURL = URL.createObjectURL(file);
        console.log("🔄 [COMPRESS] URL creada:", objectURL);

        img.src = objectURL;
        console.log("🔄 [COMPRESS] Imagen asignada al src");
      } catch (error) {
        console.error("❌ [COMPRESS] Error general:", error);
        reject(error);
      }
    });
  };

  // Función para manejar la subida de imágenes
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files) return;

    const maxImages = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (newPost.imagenes.length + files.length > maxImages) {
      toast.error(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    // Procesar archivos uno por uno
    for (const file of Array.from(files)) {
      console.log(
        "🖼️ Procesando imagen:",
        file.name,
        "Tamaño:",
        file.size,
        "Tipo:",
        file.type,
      );

      // Validar tamaño
      if (file.size > maxSize) {
        toast.error(`La imagen ${file.name} es muy grande. Máximo 5MB`);
        continue;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        toast.error(`El archivo ${file.name} no es una imagen válida`);
        continue;
      }

      // Validar tipos de imagen específicos
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          `El formato ${file.type} no está soportado. Use JPEG, PNG, GIF o WebP`,
        );
        continue;
      }

      try {
        console.log("🔄 Procesando imagen:", file.name);

        // Intentar comprimir primero
        try {
          const compressedImage = await compressImage(file, 800, 0.7);
          console.log("✅ Imagen comprimida exitosamente:", file.name);
          console.log("📏 Tamaño del data URL:", compressedImage.length);

          setNewPost((prev) => ({
            ...prev,
            imagenes: [...prev.imagenes, compressedImage],
          }));

          toast.success(`Imagen ${file.name} procesada exitosamente`);
        } catch (compressError) {
          console.warn(
            "⚠️ Error en compresión, intentando método alternativo:",
            compressError,
          );

          // Método alternativo: usar FileReader sin compresión
          const reader = new FileReader();

          reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
              console.log(
                "✅ Imagen procesada con método alternativo:",
                file.name,
              );
              console.log("📏 Tamaño del data URL:", result.length);

              setNewPost((prev) => ({
                ...prev,
                imagenes: [...prev.imagenes, result],
              }));

              toast.success(
                `Imagen ${file.name} procesada exitosamente (sin compresión)`,
              );
            } else {
              throw new Error("No se pudo leer el archivo");
            }
          };

          reader.onerror = () => {
            throw new Error("Error al leer el archivo");
          };

          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.error("❌ Error al procesar imagen:", error);
        toast.error(
          `Error al procesar la imagen ${file.name}: ${error.message || "Error desconocido"}`,
        );
      }
    }

    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    event.target.value = "";
  };

  // Función para eliminar una imagen
  const handleRemoveImage = (index: number) => {
    setNewPost((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index),
    }));
  };

  // Función para verificar si una publicación requiere ubicación
  const requiresLocation = (categoriasIds: number[]) => {
    const locationRequiredCategories = categoriasIds.filter((catId) => {
      const categoria = categorias.find((c) => c.id_etiqueta === catId);
      return (
        categoria?.etiqueta === "Donacion" ||
        categoria?.etiqueta === "Voluntariado"
      );
    });
    return locationRequiredCategories.length > 0;
  };

  const handleToggleCategory = (categoriaId: number) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoriaId)) {
        return prev.filter((id) => id !== categoriaId);
      } else {
        return [...prev, categoriaId];
      }
    });
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSearchTerm("");
  };

  const filteredPosts = posts.filter((post) => {
    // Filtro de búsqueda
    const matchesSearch =
      searchTerm === "" ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    // Filtro de categorías
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some((catId) => {
        const categoria = categorias.find((c) => c.id_etiqueta === catId);
        return categoria && post.tags.includes(categoria.etiqueta);
      });

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Foro Comunitario
            </h1>
            <p className="text-gray-600">
              Conecta, comparte y colabora con la comunidad
            </p>
          </div>

          {user && isONG && (
            <button
              onClick={() => setShowCreatePost(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nueva Publicación
            </button>
          )}
        </div>

        {/* Filters and Search */}
        <div className="card p-6 mb-8">
          {/* Search Bar */}
          <div className="flex flex-col gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar publicaciones por título, contenido o etiqueta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Category Filters */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Filtrar por categoría
                  {selectedCategories.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {selectedCategories.length}
                    </span>
                  )}
                </h3>
                {(selectedCategories.length > 0 || searchTerm) && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {(showAllCategories ? categorias : categorias.slice(0, 8)).map(
                  (categoria) => {
                    const isSelected = selectedCategories.includes(
                      categoria.id_etiqueta,
                    );
                    const count = posts.filter((post) =>
                      post.tags.includes(categoria.etiqueta),
                    ).length;

                    return (
                      <button
                        key={categoria.id_etiqueta}
                        onClick={() =>
                          handleToggleCategory(categoria.id_etiqueta)
                        }
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-purple-600 text-white shadow-md hover:bg-purple-700"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {categoria.etiqueta}
                        <span
                          className={`ml-1.5 ${isSelected ? "text-purple-200" : "text-gray-500"}`}
                        >
                          ({count})
                        </span>
                      </button>
                    );
                  },
                )}

                {categorias.length > 8 && (
                  <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-300 transition-colors"
                  >
                    {showAllCategories
                      ? "Ver menos"
                      : `Ver todas (${categorias.length})`}
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters */}
            {selectedCategories.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-gray-600">
                  Filtros activos:
                </span>
                {selectedCategories.map((catId) => {
                  const categoria = categorias.find(
                    (c) => c.id_etiqueta === catId,
                  );
                  if (!categoria) return null;

                  return (
                    <span
                      key={catId}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                    >
                      {categoria.etiqueta}
                      <button
                        onClick={() => handleToggleCategory(catId)}
                        className="ml-1.5 hover:text-purple-900"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Results Counter */}
            <div className="text-sm text-gray-600 border-t pt-3">
              Mostrando{" "}
              <span className="font-semibold text-purple-600">
                {filteredPosts.length}
              </span>{" "}
              de {posts.length} publicaciones
              {selectedCategories.length > 0 && (
                <span className="ml-2 text-gray-500">
                  con {selectedCategories.length}{" "}
                  {selectedCategories.length === 1 ? "categoría" : "categorías"}{" "}
                  seleccionada{selectedCategories.length === 1 ? "" : "s"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  No tienes sesión iniciada
                </h2>
                <p className="text-gray-600">
                  Para comentar y dar me gusta, necesitas iniciar sesión o
                  registrarte
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    window.location.href = "/login";
                  }}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Iniciar Sesión
                </button>

                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    window.location.href = "/register";
                  }}
                  className="w-full btn-secondary flex items-center justify-center"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Registrarse
                </button>

                <button
                  onClick={() => setShowAuthModal(false)}
                  className="w-full px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Continuar sin sesión
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Post Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                {/* Close X button top-right */}
                <button
                  onClick={() => {
                    setShowCreatePost(false);
                    setModalSelectedCategories([]);
                    setCategoryStates({});
                    setEditingPostId(null);
                  }}
                  aria-label="Cerrar"
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-800 rounded-full p-1"
                >
                  <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingPostId ? "Editar Publicación" : "Nueva Publicación"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewPost((prev) => ({ ...prev, title: value }));
                      // Validación en tiempo real
                      if (value.length > 0) {
                        const validation = validateTitle(value);
                        if (!validation.isValid) {
                          setTitleError(
                            validation.errors[0] || "Error de validación",
                          );
                        } else {
                          setTitleError("");
                        }
                      } else {
                        setTitleError("");
                      }
                    }}
                    className={`input-field ${titleError ? "border-red-500 focus:ring-red-500" : ""}`}
                    placeholder="Título de la publicación"
                  />
                  {titleError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {titleError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenido
                  </label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewPost((prev) => ({ ...prev, content: value }));
                      // Validación en tiempo real
                      if (value.length > 0) {
                        const validation = validate(value);
                        if (!validation.isValid) {
                          setContentError(
                            validation.errors[0] || "Error de validación",
                          );
                        } else {
                          setContentError("");
                        }
                      } else {
                        setContentError("");
                      }
                    }}
                    className={`input-field ${contentError ? "border-red-500 focus:ring-red-500" : ""}`}
                    rows={4}
                    placeholder="Describe tu publicación..."
                  />
                  {contentError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {contentError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categorías
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                    {categorias.map((categoria) => {
                      console.log(
                        "🔍 [DEBUG] Estructura completa de categoría:",
                        categoria,
                      );
                      const isSelected = modalSelectedCategories.includes(
                        categoria.id_etiqueta,
                      );
                      console.log(
                        `🔍 [RENDER] Renderizando categoría ${categoria.etiqueta} (ID: ${categoria.id_etiqueta}):`,
                        { isSelected, modalSelectedCategories },
                      );

                      return (
                        <label
                          key={categoria.id_etiqueta}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                          style={{
                            // En modo oscuro evitar blanco puro en hover
                            // El CSS global ya ajusta .hover:bg-gray-50, esto es por si falta la clase
                            backgroundColor: "transparent",
                          }}
                        >
                          <input
                            type="checkbox"
                            id={`categoria-${categoria.id_etiqueta}`}
                            name={`categoria-${categoria.id_etiqueta}`}
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              console.log(
                                "🔍 [CHECKBOX] Click directo en:",
                                categoria.etiqueta,
                                "ID:",
                                categoria.id_etiqueta,
                              );
                              console.log(
                                "🔍 [CHECKBOX] Checkbox checked:",
                                e.target.checked,
                              );
                              handleCategoryClick(categoria.id_etiqueta);
                            }}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">
                            {categoria.etiqueta}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Campo de ubicación opcional */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación (opcional)
                  </label>
                  <LocationAutocomplete
                    value={newPost.location}
                    onChange={(value) =>
                      setNewPost((prev) => ({ ...prev, location: value }))
                    }
                    placeholder="Calle, número, barrio, ciudad en Córdoba"
                    className="input-field w-full"
                  />
                </div>

                {/* Sección de imágenes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imágenes (opcional)
                  </label>

                  {/* Input para subir imágenes */}
                  <div className="mb-3">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Subir Imágenes
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Máximo 5 imágenes, 5MB cada una
                    </p>
                  </div>

                  {/* Vista previa de imágenes */}
                  {newPost.imagenes.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {newPost.imagenes.map((imagen, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imagen}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowCreatePost(false);
                    setModalSelectedCategories([]);
                    setCategoryStates({});
                    setEditingPostId(null); // Reset editing state
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={creatingPost}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePost}
                  className="btn-primary flex items-center"
                  disabled={creatingPost}
                >
                  {creatingPost && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {creatingPost
                    ? editingPostId
                      ? "Actualizando..."
                      : "Publicando..."
                    : editingPostId
                      ? "Actualizar"
                      : "Publicar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-purple-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Cargando publicaciones...</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handlePostClick(post.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
                    {post.author.role === "ong" ? (
                      <Building className="w-6 h-6 text-white" />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {post.title}
                      </h3>
                      {post.author.role === "ong" && (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                          ONG
                        </span>
                      )}
                    </div>

                    {/* Solo mostrar categorías en la vista de lista */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full flex items-center"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Mensaje para ver detalles y botones de acción */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 italic">
                        Haz clic para ver la descripción completa, ubicación,
                        imágenes y comentarios
                      </p>

                      {/* Botones de editar/eliminar para el autor */}
                      {user && user.id_usuario === post.id_usuario && (
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPost(post);
                            }}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                            title="Editar publicación"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span className="text-xs">Editar</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEliminarPublicacion(post.id);
                            }}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
                            title="Eliminar publicación"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-xs">Eliminar</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div
                      className="flex items-center justify-between"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-6">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center space-x-2 ${
                            post.isLiked
                              ? "text-red-600"
                              : "text-gray-500 hover:text-red-600"
                          }`}
                        >
                          <Heart
                            className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`}
                          />
                          <span>{post.likes}</span>
                        </button>

                        <button
                          onClick={() => handleToggleComments(post.id)}
                          className="flex items-center space-x-2 text-gray-500 hover:text-purple-600"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span>{post.comments}</span>
                        </button>

                        <button
                          onClick={() => handleShare(post.id, post.title)}
                          className="flex items-center space-x-2 text-gray-500 hover:text-purple-600"
                        >
                          <Share2 className="w-5 h-5" />
                          <span>Compartir</span>
                        </button>

                        {/* Botón de editar para posts propios */}
                        {user && user.id_usuario === post.id_usuario && (
                          <button
                            onClick={() => handleEditPost(post)}
                            className="flex items-center space-x-2 text-gray-500 hover:text-blue-600"
                            title="Editar publicación"
                          >
                            <Edit3 className="w-5 h-5" />
                            <span>Editar</span>
                          </button>
                        )}

                        {post.imagenes && post.imagenes.length > 0 && (
                          <button
                            onClick={() => handleTogglePostExpansion(post.id)}
                            className="flex items-center space-x-2 text-gray-500 hover:text-purple-600"
                          >
                            <Image className="w-5 h-5" />
                            <span>
                              {expandedPost === post.id
                                ? "Ver menos"
                                : "Ver más"}
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Botón eliminar - solo visible para el autor */}
                      {user && post.id_usuario === user.id_usuario && (
                        <button
                          onClick={() => handleEliminarPublicacion(post.id)}
                          className="flex items-center space-x-2 text-red-500 hover:text-red-700 transition-colors"
                          title="Eliminar publicación"
                        >
                          <Trash2 className="w-5 h-5" />
                          <span className="text-sm">Eliminar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vista expandida de imágenes */}
                {expandedPost === post.id &&
                  post.imagenes &&
                  post.imagenes.length > 0 && (
                    <div
                      className="mt-4 border-t pt-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Galería de Imágenes
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {post.imagenes.map((imagen, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={imagen}
                              alt={`Imagen ${index + 1} de ${post.title}`}
                              className="w-full h-64 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => {
                                // Abrir imagen en nueva ventana
                                window.open(imagen, "_blank");
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-90 rounded-full p-2">
                                <Image className="w-6 h-6 text-gray-700" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))
          )}

          {!loading && filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron publicaciones
              </h3>
              <p className="text-gray-600">
                Intenta ajustar los filtros o términos de búsqueda
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
