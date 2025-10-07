import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { toast } from 'react-hot-toast'
import { api } from '../services/api'
import ClickableMapModal from '../components/ClickableMapModal'
import InlineComments from '../components/InlineComments'
import { usePostValidation } from '../hooks/useContentModeration'
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
  X
} from 'lucide-react'

interface Post {
  id: string
  title: string
  content: string
  author: {
    id: string
    name: string
    role: 'person' | 'ong'
    organization?: string
    avatar?: string
  }
  id_usuario?: number
  image?: string
  imagenes?: string[]
  tags: string[]
  location?: string
  likes: number
  comments: number
  createdAt: Date
  isLiked?: boolean
}

interface Categoria {
  id_categoria: number
  etiqueta: string
}

export default function ForumPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const { validatePost } = usePostValidation()
  const [posts, setPosts] = useState<Post[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingPost, setCreatingPost] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    coordinates: [number, number];
  } | null>(null)

  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [showAllCategories, setShowAllCategories] = useState(false)

  // Leer filtro desde query param al montar
  useEffect(() => {
    if (categorias.length > 0) {
    const params = new URLSearchParams(window.location.search);
    const filtro = params.get('filtro');
      
    if (filtro === 'voluntariado' || filtro === 'volunteering') {
        const voluntariadoCategory = categorias.find(c => c.etiqueta === 'Voluntariado');
        if (voluntariadoCategory) {
          setSelectedCategories([voluntariadoCategory.id_categoria]);
        }
    }
    if (filtro === 'donaciones' || filtro === 'donations') {
        const donacionCategory = categorias.find(c => c.etiqueta === 'Donacion');
        if (donacionCategory) {
          setSelectedCategories([donacionCategory.id_categoria]);
        }
      }
    }
  }, [categorias]);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    categorias: [] as number[],
    location: '',
    coordinates: null as [number, number] | null,
    imagenes: [] as string[]
  })

  // Estado separado para las categorías seleccionadas en el modal de creación
  const [modalSelectedCategories, setModalSelectedCategories] = useState<number[]>([])
  
  // Estado individual para cada categoría (como backup)
  const [categoryStates, setCategoryStates] = useState<{[key: number]: boolean}>({})
  
  // Ref para manejar checkboxes directamente
  const checkboxRefs = useRef<{[key: number]: HTMLInputElement | null}>({})

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [publicacionesData, categoriasData] = await Promise.all([
        api.getPublicaciones(),
        api.getCategorias()
      ])
      
      // Transformar las fechas de string a Date
      const publicacionesFormateadas = publicacionesData.map(post => ({
        ...post,
        createdAt: new Date(post.createdAt)
      }))
      
      setPosts(publicacionesFormateadas)
      setCategorias(categoriasData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar las publicaciones')
    } finally {
      setLoading(false)
    }
  }

  // Considera ONG si tipo_usuario === 2 (igual que en ProfilePage y DashboardPage)
  const isONG = user?.tipo_usuario === 2
  
  // Log para debugging
  console.log('🔍 [FORUM] Usuario:', user)
  console.log('🔍 [FORUM] tipo_usuario:', user?.tipo_usuario)
  console.log('🔍 [FORUM] isONG:', isONG)

  const handleEliminarPublicacion = async (postId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión')
      return
    }

    if (!window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      return
    }

    try {
      await api.eliminarPublicacion(postId)
      setPosts(prev => prev.filter(post => post.id !== postId))
      toast.success('Publicación eliminada exitosamente')
    } catch (error) {
      console.error('Error al eliminar publicación:', error)
      toast.error('Error al eliminar la publicación')
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    try {
      // Llamar al API para dar/quitar like
      const response = await api.toggleLike(postId)
      
      // Actualizar el estado local con la respuesta del servidor
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: response.totalLikes,
            isLiked: response.liked
          }
        }
        return post
      }))

      // Mostrar mensaje
      toast.success(response.liked ? '¡Te gusta esta publicación!' : 'Ya no te gusta esta publicación', {
        duration: 2000,
        icon: response.liked ? '💜' : '🤍'
      })
    } catch (error) {
      console.error('Error al dar me gusta:', error)
      toast.error('Error al actualizar el me gusta')
    }
  }

  const handleToggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const handleTogglePostExpansion = (postId: string) => {
    setExpandedPost(prev => prev === postId ? null : postId)
  }

  // Función simple para manejar categorías
  const toggleCategory = (categoriaId: number) => {
    console.log('🔍 [TOGGLE] Toggle categoría:', categoriaId);
    console.log('🔍 [TOGGLE] Estado actual:', modalSelectedCategories);
    
    setModalSelectedCategories(prev => {
      const isSelected = prev.includes(categoriaId);
      let newCategories;
      
      if (isSelected) {
        // Remover
        newCategories = prev.filter(id => id !== categoriaId);
        console.log('🔍 [TOGGLE] Removiendo categoría:', categoriaId);
      } else {
        // Agregar
        newCategories = [...prev, categoriaId];
        console.log('🔍 [TOGGLE] Agregando categoría:', categoriaId);
      }
      
      console.log('🔍 [TOGGLE] Nuevo estado:', newCategories);
      return newCategories;
    });
  }

  // Función alternativa usando estado individual
  const toggleCategoryIndividual = (categoriaId: number) => {
    console.log('🔍 [INDIVIDUAL] Toggle categoría individual:', categoriaId);
    
    setCategoryStates(prev => {
      const newState = {
        ...prev,
        [categoriaId]: !prev[categoriaId]
      };
      console.log('🔍 [INDIVIDUAL] Nuevo estado individual:', newState);
      
      // Actualizar también el array de categorías seleccionadas
      const selectedIds = Object.keys(newState)
        .filter(key => newState[parseInt(key)])
        .map(key => parseInt(key));
      
      console.log('🔍 [INDIVIDUAL] IDs seleccionados:', selectedIds);
      setModalSelectedCategories(selectedIds);
      
      return newState;
    });
  }

  // Función que maneja checkboxes directamente con DOM
  const handleCheckboxDirect = (categoriaId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const checkbox = event.target;
    const isChecked = checkbox.checked;
    
    console.log('🔍 [DIRECT] Checkbox directo:', categoriaId, 'Checked:', isChecked);
    console.log('🔍 [DIRECT] Estado actual antes:', modalSelectedCategories);
    
    // Actualizar estado directamente
    setModalSelectedCategories(prev => {
      let newCategories;
      if (isChecked) {
        // Agregar si no está presente
        newCategories = prev.includes(categoriaId) ? prev : [...prev, categoriaId];
      } else {
        // Remover
        newCategories = prev.filter(id => id !== categoriaId);
      }
      
      console.log('🔍 [DIRECT] Nuevo estado:', newCategories);
      return newCategories;
    });
    
    // Forzar el estado del checkbox
    setTimeout(() => {
      checkbox.checked = isChecked;
    }, 0);
  }

  // Función ultra simple para manejar categorías
  const handleCategoryClick = (categoriaId: number) => {
    console.log('🔍 [ULTRA-SIMPLE] Click en categoría:', categoriaId);
    console.log('🔍 [ULTRA-SIMPLE] Estado actual:', modalSelectedCategories);
    
    // Toggle simple
    setModalSelectedCategories(prev => {
      const isSelected = prev.includes(categoriaId);
      let newCategories;
      
      if (isSelected) {
        // Remover
        newCategories = prev.filter(id => id !== categoriaId);
        console.log('🔍 [ULTRA-SIMPLE] Removiendo:', categoriaId);
      } else {
        // Agregar
        newCategories = [...prev, categoriaId];
        console.log('🔍 [ULTRA-SIMPLE] Agregando:', categoriaId);
      }
      
      console.log('🔍 [ULTRA-SIMPLE] Nuevo estado:', newCategories);
      return newCategories;
    });
  }


  const handleShare = async (postId: string, postTitle: string) => {
    const shareUrl = `${window.location.origin}/forum/${postId}`
    
    // Intentar usar la API de Web Share si está disponible (móviles y algunos navegadores modernos)
    if (navigator.share) {
      try {
        await navigator.share({
          title: postTitle,
          text: `Mira esta publicación: ${postTitle}`,
          url: shareUrl
        })
        toast.success('¡Compartido exitosamente!')
      } catch (error: any) {
        // Si el usuario cancela, no mostramos error
        if (error.name !== 'AbortError') {
          console.error('Error al compartir:', error)
        }
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('¡Link copiado al portapapeles!', {
          duration: 3000,
          icon: '🔗'
        })
      } catch (error) {
        console.error('Error al copiar al portapapeles:', error)
        toast.error('No se pudo copiar el link')
      }
    }
  }

  const handlePostClick = (postId: string) => {
    navigate(`/forum/${postId}`)
  }

  const handleCreatePost = async () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    // Validar que el usuario sea ONG
    if (!isONG) {
      toast.error('Solo las ONGs pueden crear publicaciones')
      return
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    if (modalSelectedCategories.length === 0) {
      toast.error('Por favor selecciona al menos una categoría')
      return
    }

    // Validar el contenido con el sistema de moderación
    const isValid = validatePost(newPost.title.trim(), newPost.content.trim())
    
    if (!isValid) {
      // Los errores ya fueron mostrados por el hook
      return
    }

    try {
      setCreatingPost(true)
      
      console.log('📝 [CREATE POST] Datos a enviar:', {
        titulo: newPost.title.trim(),
        descripcion: newPost.content.trim(),
        categorias: modalSelectedCategories,
        ubicacion: newPost.location.trim() || undefined,
        coordenadas: newPost.coordinates || undefined
      })
      console.log('📝 [CREATE POST] Categorías seleccionadas:', modalSelectedCategories);
      console.log('📝 [CREATE POST] Cantidad de categorías seleccionadas:', modalSelectedCategories.length);
      console.log('📝 [CREATE POST] Lista de categorías disponibles:', categorias);
      
      await api.crearPublicacion({
        titulo: newPost.title.trim(),
        descripcion: newPost.content.trim(),
        categorias: modalSelectedCategories,
        ubicacion: newPost.location.trim() || undefined,
        coordenadas: newPost.coordinates || undefined,
        imagenes: newPost.imagenes.length > 0 ? newPost.imagenes : undefined
      })

      setNewPost({ title: '', content: '', categorias: [], location: '', coordinates: null, imagenes: [] })
      setModalSelectedCategories([])
      setCategoryStates({})
      setShowCreatePost(false)
      toast.success('Publicación creada exitosamente')
      
      // Recargar las publicaciones
      await loadData()
    } catch (error: any) {
      console.error('Error al crear publicación:', error)
      
      // Manejar errores específicos de moderación del servidor
      if (error.response?.status === 400) {
        toast.error(error.response.data.error || 'La publicación contiene contenido no permitido')
      } else {
        toast.error('Error al crear la publicación')
      }
    } finally {
      setCreatingPost(false)
    }
  }

  // Función para manejar la selección de ubicación del modal
  const handleLocationSelect = (location: { address: string; coordinates: [number, number] }) => {
    setSelectedLocation(location);
    setNewPost(prev => ({ 
      ...prev, 
      location: location.address,
      coordinates: location.coordinates
    }));
    setShowLocationModal(false);
    toast.success('Ubicación seleccionada correctamente');
  };

  // Función para comprimir imágenes
  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo la proporción
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar la imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a base64 con compresión
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Función para manejar la subida de imágenes
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const maxImages = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (newPost.imagenes.length + files.length > maxImages) {
      toast.error(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    for (const file of Array.from(files)) {
      if (file.size > maxSize) {
        toast.error(`La imagen ${file.name} es muy grande. Máximo 5MB`);
        continue;
      }

      if (!file.type.startsWith('image/')) {
        toast.error(`El archivo ${file.name} no es una imagen válida`);
        continue;
      }

      try {
        // Comprimir la imagen antes de convertirla a base64
        const compressedImage = await compressImage(file, 800, 0.7);
        
        setNewPost(prev => ({
          ...prev,
          imagenes: [...prev.imagenes, compressedImage]
        }));
      } catch (error) {
        console.error('Error al comprimir imagen:', error);
        toast.error(`Error al procesar la imagen ${file.name}`);
      }
    }
  };

  // Función para eliminar una imagen
  const handleRemoveImage = (index: number) => {
    setNewPost(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }));
  };

  // Función para verificar si una publicación requiere ubicación
  const requiresLocation = (categoriasIds: number[]) => {
    const locationRequiredCategories = categoriasIds.filter(catId => {
      const categoria = categorias.find(c => c.id_categoria === catId)
      return categoria?.etiqueta === 'Donacion' || categoria?.etiqueta === 'Voluntariado'
    })
    return locationRequiredCategories.length > 0
  }

  const handleToggleCategory = (categoriaId: number) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoriaId)) {
        return prev.filter(id => id !== categoriaId);
      } else {
        return [...prev, categoriaId];
      }
    });
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSearchTerm('');
  };

  const filteredPosts = posts.filter(post => {
    // Filtro de búsqueda
    const matchesSearch = searchTerm === '' || 
                         post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    // Filtro de categorías
    const matchesCategory = selectedCategories.length === 0 || 
                           selectedCategories.some(catId => {
                             const categoria = categorias.find(c => c.id_categoria === catId);
                             return categoria && post.tags.includes(categoria.etiqueta);
                           });

    return matchesSearch && matchesCategory;
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Foro Comunitario</h1>
            <p className="text-gray-600">Conecta, comparte y colabora con la comunidad</p>
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
                {(showAllCategories ? categorias : categorias.slice(0, 8)).map(categoria => {
                  const isSelected = selectedCategories.includes(categoria.id_categoria);
                  const count = posts.filter(post => post.tags.includes(categoria.etiqueta)).length;
                  
                  return (
                    <button
                      key={categoria.id_categoria}
                      onClick={() => handleToggleCategory(categoria.id_categoria)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {categoria.etiqueta}
                      <span className={`ml-1.5 ${isSelected ? 'text-purple-200' : 'text-gray-500'}`}>
                        ({count})
                      </span>
                    </button>
                  );
                })}

                {categorias.length > 8 && (
                  <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-300 transition-colors"
                  >
                    {showAllCategories ? 'Ver menos' : `Ver todas (${categorias.length})`}
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters */}
            {selectedCategories.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-gray-600">Filtros activos:</span>
                {selectedCategories.map(catId => {
                  const categoria = categorias.find(c => c.id_categoria === catId);
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
              Mostrando <span className="font-semibold text-purple-600">{filteredPosts.length}</span> de {posts.length} publicaciones
              {selectedCategories.length > 0 && (
                <span className="ml-2 text-gray-500">
                  con {selectedCategories.length} {selectedCategories.length === 1 ? 'categoría' : 'categorías'} seleccionada{selectedCategories.length === 1 ? '' : 's'}
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No tienes sesión iniciada</h2>
                <p className="text-gray-600">Para comentar y dar me gusta, necesitas iniciar sesión o registrarte</p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowAuthModal(false)
                    window.location.href = '/login'
                  }}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Iniciar Sesión
                </button>
                
                <button
                  onClick={() => {
                    setShowAuthModal(false)
                    window.location.href = '/register'
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

        {/* Create Post Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nueva Publicación</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                    className="input-field"
                    placeholder="Título de la publicación"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contenido</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    className="input-field"
                    rows={4}
                    placeholder="Describe tu publicación..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categorías</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                    {categorias.map(categoria => {
                      console.log('🔍 [DEBUG] Estructura completa de categoría:', categoria);
                      const isSelected = modalSelectedCategories.includes(categoria.id_etiqueta);
                      console.log(`🔍 [RENDER] Renderizando categoría ${categoria.etiqueta} (ID: ${categoria.id_etiqueta}):`, { isSelected, modalSelectedCategories });
                      
                      return (
                        <label 
                          key={categoria.id_etiqueta} 
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            id={`categoria-${categoria.id_etiqueta}`}
                            name={`categoria-${categoria.id_etiqueta}`}
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              console.log('🔍 [CHECKBOX] Click directo en:', categoria.etiqueta, 'ID:', categoria.id_etiqueta);
                              console.log('🔍 [CHECKBOX] Checkbox checked:', e.target.checked);
                              handleCategoryClick(categoria.id_etiqueta);
                            }}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">{categoria.etiqueta}</span>
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
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPost.location}
                        onChange={(e) => setNewPost(prev => ({ ...prev, location: e.target.value }))}
                        className="input-field flex-1"
                        placeholder="Ciudad, País"
                      />
                      <button
                        type="button"
                        className="p-2 rounded border flex items-center justify-center hover:bg-gray-50 transition-colors"
                        title="Seleccionar ubicación en el mapa"
                        onClick={() => setShowLocationModal(true)}
                        style={{ background: 'color-mix(in oklab, var(--accent) 8%, transparent)', borderColor: 'var(--accent)' }}
                      >
                        <MapPin className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                      </button>
                    </div>
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
                    setShowCreatePost(false)
                    setModalSelectedCategories([])
                    setCategoryStates({})
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
                  {creatingPost && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {creatingPost ? 'Publicando...' : 'Publicar'}
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
            filteredPosts.map(post => (
            <div 
              key={post.id}
              className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handlePostClick(post.id)}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
                  {post.author.role === 'ong' ? (
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
                    {post.author.role === 'ong' && (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                        ONG
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span>{post.author.name}</span>
                    {post.author.organization && (
                      <span>• {post.author.organization}</span>
                    )}
                    {post.location && (
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {post.location}
                      </span>
                    )}
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {post.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{post.content}</p>
                  
                  {/* Imágenes de la publicación */}
                  {post.imagenes && post.imagenes.length > 0 && (
                    <div className="mb-4">
                      {post.imagenes.length === 1 ? (
                        <img
                          src={post.imagenes[0]}
                          alt="Imagen de la publicación"
                          className="w-full max-w-md h-48 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="grid grid-cols-2 gap-2 max-w-md">
                          {post.imagenes.slice(0, 4).map((imagen, index) => (
                            <div key={index} className="relative">
                              <img
                                src={imagen}
                                alt={`Imagen ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              {index === 3 && post.imagenes.length > 4 && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                  <span className="text-white font-semibold">
                                    +{post.imagenes.length - 4}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map(tag => (
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
                  
                  <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center space-x-2 ${
                          post.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
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

                      {post.imagenes && post.imagenes.length > 0 && (
                        <button 
                          onClick={() => handleTogglePostExpansion(post.id)}
                          className="flex items-center space-x-2 text-gray-500 hover:text-purple-600"
                        >
                          <Image className="w-5 h-5" />
                          <span>{expandedPost === post.id ? 'Ver menos' : 'Ver más'}</span>
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
              
              {/* Comentarios inline */}
              <div onClick={(e) => e.stopPropagation()}>
              <InlineComments
                publicacionId={post.id}
                isExpanded={expandedComments.has(post.id)}
                onToggle={() => handleToggleComments(post.id)}
              />
              </div>

              {/* Vista expandida de imágenes */}
              {expandedPost === post.id && post.imagenes && post.imagenes.length > 0 && (
                <div className="mt-4 border-t pt-4" onClick={(e) => e.stopPropagation()}>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Galería de Imágenes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {post.imagenes.map((imagen, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imagen}
                          alt={`Imagen ${index + 1} de ${post.title}`}
                          className="w-full h-64 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => {
                            // Abrir imagen en nueva ventana
                            window.open(imagen, '_blank');
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron publicaciones</h3>
              <p className="text-gray-600">Intenta ajustar los filtros o términos de búsqueda</p>
            </div>
          )}
        </div>

        {/* Modal de selección de ubicación */}
        <ClickableMapModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          onLocationSelect={handleLocationSelect}
          initialLocation={newPost.location}
        />

      </div>
    </div>
  )
} 