import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { toast } from 'react-hot-toast'
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
  UserPlus
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

export default function ForumPage() {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      title: 'Campaña de Donación: Ayuda para Niños en Situación de Calle',
      content: 'Estamos organizando una campaña para ayudar a niños en situación de calle. Necesitamos donaciones de ropa, alimentos y útiles escolares. ¡Cualquier ayuda es bienvenida!',
      author: {
        id: 'ong1',
        name: 'Fundación Ayuda',
        role: 'ong',
        organization: 'Fundación Ayuda'
      },
      tags: ['Donación', 'Niños', 'Educación'],
      location: 'Buenos Aires, Argentina',
      likes: 45,
      comments: 12,
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Voluntariado: Limpieza de Playa',
      content: 'Organizamos una jornada de limpieza de playa este sábado. Necesitamos voluntarios para ayudar a mantener limpio nuestro medio ambiente.',
      author: {
        id: 'ong2',
        name: 'EcoVida',
        role: 'ong',
        organization: 'EcoVida'
      },
      tags: ['Voluntariado', 'Medio Ambiente', 'Limpieza'],
      location: 'Mar del Plata, Argentina',
      likes: 32,
      comments: 8,
      createdAt: new Date('2024-01-14')
    }
  ])

  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: '',
    location: ''
  })

  const isONG = user?.role === 'ong'

  const handleLike = (postId: string) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const isLiked = post.isLiked
        return {
          ...post,
          likes: isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !isLiked
        }
      }
      return post
    }))
  }

  const handleComment = (postId: string) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    
    // Aquí iría la lógica para comentar
    toast.success('Función de comentarios próximamente')
  }

  const handleCreatePost = () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    if (!isONG) {
      toast.error('Solo las ONGs pueden crear publicaciones')
      return
    }

    if (!newPost.title || !newPost.content) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    const post: Post = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      author: {
        id: user!.id.toString(),
        name: user!.name,
        role: user!.role,
        organization: user!.organization
      },
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      location: newPost.location,
      likes: 0,
      comments: 0,
      createdAt: new Date()
    }

    setPosts(prev => [post, ...prev])
    setNewPost({ title: '', content: '', tags: '', location: '' })
    setShowCreatePost(false)
    toast.success('Publicación creada exitosamente')
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'donations' && post.tags.includes('Donación')) ||
                         (selectedFilter === 'volunteering' && post.tags.includes('Voluntariado'))

    return matchesSearch && matchesFilter
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar publicaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todas las publicaciones</option>
              <option value="donations">Donaciones</option>
              <option value="volunteering">Voluntariado</option>
            </select>
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
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Etiquetas (separadas por comas)</label>
                  <input
                    type="text"
                    value={newPost.tags}
                    onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                    className="input-field"
                    placeholder="Donación, Voluntariado, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                  <input
                    type="text"
                    value={newPost.location}
                    onChange={(e) => setNewPost(prev => ({ ...prev, location: e.target.value }))}
                    className="input-field"
                    placeholder="Ciudad, País"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePost}
                  className="btn-primary"
                >
                  Publicar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-6">
          {filteredPosts.map(post => (
            <div key={post.id} className="card p-6">
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
                    <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
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
                      onClick={() => handleComment(post.id)}
                      className="flex items-center space-x-2 text-gray-500 hover:text-purple-600"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.comments}</span>
                    </button>
                    
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-purple-600">
                      <Share2 className="w-5 h-5" />
                      <span>Compartir</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron publicaciones</h3>
              <p className="text-gray-600">Intenta ajustar los filtros o términos de búsqueda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 