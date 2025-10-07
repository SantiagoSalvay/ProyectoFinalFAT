import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Tag, 
  Calendar, 
  User, 
  Building,
  Image,
  Edit3,
  Trash2
} from 'lucide-react'
import InlineComments from '../components/InlineComments'

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
  imagenes?: string[]
  tags: string[]
  location?: string
  likes: number
  comments: number
  createdAt: Date
  isLiked?: boolean
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedComments, setExpandedComments] = useState(false)

  useEffect(() => {
    if (id) {
      loadPost()
    }
  }, [id])

  const loadPost = async () => {
    try {
      setLoading(true)
      const postData = await api.getPublicacion(id!)
      
      // Transformar la fecha de string a Date
      const postFormateado = {
        ...postData,
        createdAt: new Date(postData.createdAt)
      }
      
      setPost(postFormateado)
    } catch (error) {
      console.error('Error al cargar publicación:', error)
      setError('Error al cargar la publicación')
      toast.error('Error al cargar la publicación')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para dar like')
      return
    }

    try {
      await api.likePublicacion(id!)
      // Recargar el post para obtener el estado actualizado
      await loadPost()
    } catch (error) {
      console.error('Error al dar like:', error)
      toast.error('Error al dar like')
    }
  }

  const handleShare = async () => {
    if (!post) return

    const shareUrl = `${window.location.origin}/forum/${post.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          url: shareUrl,
        })
        toast.success('¡Compartido exitosamente!')
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error al compartir:', error)
        }
      }
    } else {
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

  const handleDelete = async () => {
    if (!post || !user || post.id_usuario !== user.id_usuario) return

    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      return
    }

    try {
      await api.eliminarPublicacion(post.id)
      toast.success('Publicación eliminada exitosamente')
      navigate('/forum')
    } catch (error) {
      console.error('Error al eliminar publicación:', error)
      toast.error('Error al eliminar la publicación')
    }
  }

  const handleEdit = () => {
    if (!post || !user || post.id_usuario !== user.id_usuario) return
    // Navegar al foro con el post cargado para edición
    navigate('/forum', { state: { editPost: post } })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando publicación...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Publicación no encontrada</h1>
          <p className="text-gray-600 mb-6">La publicación que buscas no existe o ha sido eliminada.</p>
          <button
            onClick={() => navigate('/forum')}
            className="btn-primary"
          >
            Volver al Foro
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con botón de volver */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/forum')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al Foro
          </button>
        </div>

        {/* Contenido principal */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          {/* Header del post */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                {post.author.role === 'ong' ? (
                  <Building className="w-6 h-6 text-purple-600" />
                ) : (
                  <User className="w-6 h-6 text-purple-600" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {post.author.name}
                  </h2>
                  {post.author.role === 'ong' && (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                      ONG
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {post.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones de acción del autor */}
            {user && post.id_usuario === user.id_usuario && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleEdit}
                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Editar publicación"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  title="Eliminar publicación"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          {/* Contenido */}
          <div className="prose prose-lg max-w-none mb-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Etiquetas */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
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

          {/* Ubicación */}
          {post.location && (
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Ubicación:</span>
              <span>{post.location}</span>
            </div>
          )}

          {/* Imágenes */}
          {post.imagenes && post.imagenes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Galería de Imágenes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {post.imagenes.map((imagen, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imagen}
                      alt={`Imagen ${index + 1} de ${post.title}`}
                      className="w-full h-64 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
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

          {/* Acciones */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 transition-colors ${
                  post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                <span>{post.likes}</span>
              </button>

              <button
                onClick={() => setExpandedComments(!expandedComments)}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-600"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-500 hover:text-green-600"
              >
                <Share2 className="w-5 h-5" />
                <span>Compartir</span>
              </button>
            </div>
          </div>

          {/* Comentarios */}
          {expandedComments && (
            <div className="mt-6 pt-6 border-t">
              <InlineComments
                publicacionId={post.id}
                isExpanded={expandedComments}
                onToggle={() => setExpandedComments(!expandedComments)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
