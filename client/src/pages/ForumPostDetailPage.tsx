import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { api } from '../services/api'
import InlineComments from '../components/InlineComments'
import { 
  MessageCircle, 
  Heart, 
  Share2, 
  MapPin,
  Tag,
  Calendar,
  User,
  Building,
  Loader2,
  ArrowLeft,
  AlertCircle
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
  image?: string
  tags: string[]
  location?: string
  likes: number
  comments: number
  createdAt: Date
  isLiked?: boolean
}

export default function ForumPostDetailPage() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentsExpanded, setCommentsExpanded] = useState(true)

  useEffect(() => {
    if (postId) {
      loadPost()
    }
  }, [postId])

  const loadPost = async () => {
    if (!postId) return
    
    try {
      setLoading(true)
      setError(null)
      const postData = await api.getPublicacion(postId)
      
      // Transformar la fecha de string a Date
      const postFormateado = {
        ...postData,
        createdAt: new Date(postData.createdAt)
      }
      
      setPost(postFormateado)
    } catch (error) {
      console.error('Error al cargar la publicación:', error)
      setError('No se pudo cargar la publicación')
      toast.error('Error al cargar la publicación')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para dar me gusta')
      return
    }

    if (!postId) return

    try {
      const response = await api.toggleLike(postId)
      
      setPost(prev => prev ? {
        ...prev,
        likes: response.totalLikes,
        isLiked: response.liked
      } : null)

      toast.success(response.liked ? '¡Te gusta esta publicación!' : 'Ya no te gusta esta publicación', {
        duration: 2000,
        icon: response.liked ? '💜' : '🤍'
      })
    } catch (error) {
      console.error('Error al dar me gusta:', error)
      toast.error('Error al actualizar el me gusta')
    }
  }

  const handleShare = async () => {
    if (!post) return
    
    const shareUrl = `${window.location.origin}/forum/${postId}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `Mira esta publicación: ${post.title}`,
          url: shareUrl
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Cargando publicación...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Publicación no encontrada</h2>
          <p className="text-gray-600 mb-6">{error || 'La publicación que buscas no existe o fue eliminada'}</p>
          <button
            onClick={() => navigate('/forum')}
            className="btn-primary flex items-center mx-auto"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al Foro
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/forum')}
          className="flex items-center text-gray-600 hover:text-purple-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al Foro
        </button>

        {/* Post Card */}
        <div className="card p-8 mb-6">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
              {post.author.role === 'ong' ? (
                <Building className="w-8 h-8 text-white" />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
                {post.author.role === 'ong' && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full">
                    ONG
                  </span>
                )}
              </div>
              
              <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500">
                <span className="font-medium text-gray-700">{post.author.name}</span>
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
                  {post.createdAt.toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
          
          {/* Post Content */}
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>
          
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-purple-100 text-purple-800 text-sm rounded-full flex items-center"
                >
                  <Tag className="w-3.5 h-3.5 mr-1.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                post.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
              } transition-colors`}
            >
              <Heart className={`w-6 h-6 ${post.isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{post.likes}</span>
            </button>
            
            <button 
              onClick={() => setCommentsExpanded(!commentsExpanded)}
              className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="font-medium">{post.comments}</span>
            </button>
            
            <button 
              onClick={handleShare}
              className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors"
            >
              <Share2 className="w-6 h-6" />
              <span className="font-medium">Compartir</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="card">
          <InlineComments
            publicacionId={post.id}
            isExpanded={commentsExpanded}
            onToggle={() => setCommentsExpanded(!commentsExpanded)}
          />
        </div>
      </div>
    </div>
  )
}

