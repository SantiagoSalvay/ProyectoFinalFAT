"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageCircle, ThumbsUp, ThumbsDown, Reply, Plus, Search, Filter, Clock, User, Send } from "lucide-react"

interface Comment {
  id: number
  postId: number
  contenido: string
  autor: string
  fecha: Date
  likes: number
  isLiked?: boolean
}

interface Post {
  id: number
  titulo: string
  contenido: string
  autor: string
  categoria: string
  fecha: Date
  likes: number
  dislikes: number
  respuestas: number
  isLiked?: boolean
  isDisliked?: boolean
  showComments?: boolean
}

const postsIniciales: Post[] = [
  {
    id: 1,
    titulo: "¿Cómo organizar un evento benéfico exitoso?",
    contenido:
      "Hola a todos, estoy planeando organizar un evento para recaudar fondos para mi ONG. ¿Alguien tiene experiencia y puede compartir consejos?",
    autor: "María González",
    categoria: "Eventos",
    fecha: new Date(2024, 5, 20),
    likes: 15,
    dislikes: 2,
    respuestas: 8,
  },
  {
    id: 2,
    titulo: "Voluntariado virtual: nuevas oportunidades",
    contenido:
      "Con la digitalización, han surgido muchas oportunidades de voluntariado virtual. ¿Qué experiencias han tenido?",
    autor: "Carlos Ruiz",
    categoria: "Voluntariado",
    fecha: new Date(2024, 5, 19),
    likes: 23,
    dislikes: 1,
    respuestas: 12,
  },
  {
    id: 3,
    titulo: "Impacto de las redes sociales en las ONGs",
    contenido:
      "¿Cómo han utilizado las redes sociales para aumentar la visibilidad de sus causas? Compartamos estrategias.",
    autor: "Ana López",
    categoria: "Marketing",
    fecha: new Date(2024, 5, 18),
    likes: 31,
    dislikes: 0,
    respuestas: 15,
  },
  {
    id: 4,
    titulo: "Transparencia en el uso de donaciones",
    contenido:
      "Es crucial mantener transparencia con los donantes. ¿Qué herramientas usan para reportar el uso de fondos?",
    autor: "Roberto Silva",
    categoria: "Transparencia",
    fecha: new Date(2024, 5, 17),
    likes: 28,
    dislikes: 3,
    respuestas: 9,
  },
]

const comentariosIniciales: Comment[] = [
  {
    id: 1,
    postId: 1,
    contenido:
      "Excelente pregunta! Yo organicé uno el año pasado. Lo más importante es definir bien el público objetivo.",
    autor: "Pedro Martínez",
    fecha: new Date(2024, 5, 20, 14, 30),
    likes: 5,
  },
  {
    id: 2,
    postId: 1,
    contenido: "Recomiendo usar redes sociales para la promoción y conseguir sponsors locales. ¡Funciona muy bien!",
    autor: "Laura Fernández",
    fecha: new Date(2024, 5, 20, 16, 15),
    likes: 8,
  },
  {
    id: 3,
    postId: 2,
    contenido:
      "El voluntariado virtual me ha permitido ayudar desde casa. Especialmente en tareas de diseño y marketing.",
    autor: "Diego Morales",
    fecha: new Date(2024, 5, 19, 10, 45),
    likes: 12,
  },
  {
    id: 4,
    postId: 3,
    contenido: "Instagram Stories han sido clave para nosotros. Mostramos el día a día de nuestros proyectos.",
    autor: "Carmen Vega",
    fecha: new Date(2024, 5, 18, 20, 30),
    likes: 15,
  },
]

export default function ForoPage() {
  const [posts, setPosts] = useState<Post[]>(postsIniciales)
  const [comments, setComments] = useState<Comment[]>(comentariosIniciales)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("todas")
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")
  const [newPost, setNewPost] = useState({
    titulo: "",
    contenido: "",
    categoria: "General",
  })

  const categories = ["todas", "Eventos", "Voluntariado", "Marketing", "Transparencia", "General", "Educación", "Salud"]

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.contenido.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "todas" || post.categoria === filterCategory
    return matchesSearch && matchesCategory
  })

  const getCommentsForPost = (postId: number) => {
    return comments.filter((comment) => comment.postId === postId)
  }

  const handleLike = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          if (post.isLiked) {
            return { ...post, likes: post.likes - 1, isLiked: false }
          } else {
            return {
              ...post,
              likes: post.likes + 1,
              isLiked: true,
              dislikes: post.isDisliked ? post.dislikes - 1 : post.dislikes,
              isDisliked: false,
            }
          }
        }
        return post
      }),
    )
  }

  const handleDislike = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          if (post.isDisliked) {
            return { ...post, dislikes: post.dislikes - 1, isDisliked: false }
          } else {
            return {
              ...post,
              dislikes: post.dislikes + 1,
              isDisliked: true,
              likes: post.isLiked ? post.likes - 1 : post.likes,
              isLiked: false,
            }
          }
        }
        return post
      }),
    )
  }

  const handleCommentLike = (commentId: number) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          if (comment.isLiked) {
            return { ...comment, likes: comment.likes - 1, isLiked: false }
          } else {
            return { ...comment, likes: comment.likes + 1, isLiked: true }
          }
        }
        return comment
      }),
    )
  }

  const toggleComments = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return { ...post, showComments: !post.showComments }
        }
        return post
      }),
    )
  }

  const handleReply = (postId: number) => {
    if (replyText.trim()) {
      const newComment: Comment = {
        id: comments.length + 1,
        postId: postId,
        contenido: replyText,
        autor: "Usuario Actual",
        fecha: new Date(),
        likes: 0,
      }
      setComments([...comments, newComment])

      // Actualizar contador de respuestas
      setPosts(
        posts.map((post) => {
          if (post.id === postId) {
            return { ...post, respuestas: post.respuestas + 1, showComments: true }
          }
          return post
        }),
      )

      setReplyText("")
      setReplyingTo(null)
    }
  }

  const handleCreatePost = () => {
    if (newPost.titulo && newPost.contenido) {
      const post: Post = {
        id: posts.length + 1,
        titulo: newPost.titulo,
        contenido: newPost.contenido,
        autor: "Usuario Actual",
        categoria: newPost.categoria,
        fecha: new Date(),
        likes: 0,
        dislikes: 0,
        respuestas: 0,
      }
      setPosts([post, ...posts])
      setNewPost({ titulo: "", contenido: "", categoria: "General" })
      setShowNewPostForm(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#73e4fd] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/main-dashboard" className="text-4xl md:text-5xl font-bold text-[#2b555f]">
            DEMOS+
          </Link>
          <Link
            href="/main-dashboard"
            className="border-2 border-[#2b555f] text-[#2b555f] px-6 py-2 rounded-lg font-semibold hover:bg-[#2b555f] hover:text-white transition-colors"
          >
            VOLVER
          </Link>
        </div>
      </header>

      <main className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-[#2b555f] mb-4">FORO COMUNITARIO</h1>
            <p className="text-xl text-[#2b555f]">Conecta, comparte y aprende con la comunidad</p>
          </div>

          {/* Controles superiores */}
          <div className="bg-[#73e4fd] bg-opacity-20 rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#2b555f]" />
                  <input
                    type="text"
                    placeholder="Buscar en el foro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#2b555f]" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="pl-10 pr-8 py-3 border-2 border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d] bg-white"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "todas" ? "Todas las categorías" : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={() => setShowNewPostForm(true)}
                className="bg-[#00445d] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2b555f] transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nueva Publicación
              </button>
            </div>
          </div>

          {/* Formulario de nueva publicación */}
          {showNewPostForm && (
            <div className="bg-white border-2 border-[#2b555f] rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-[#2b555f] mb-4">Crear Nueva Publicación</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Título de la publicación"
                  value={newPost.titulo}
                  onChange={(e) => setNewPost({ ...newPost, titulo: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
                />
                <select
                  value={newPost.categoria}
                  onChange={(e) => setNewPost({ ...newPost, categoria: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
                >
                  {categories.slice(1).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder="Contenido de la publicación"
                  value={newPost.contenido}
                  onChange={(e) => setNewPost({ ...newPost, contenido: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d] resize-vertical"
                />
                <div className="flex gap-4">
                  <button
                    onClick={handleCreatePost}
                    className="bg-[#00445d] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2b555f] transition-colors"
                  >
                    Publicar
                  </button>
                  <button
                    onClick={() => setShowNewPostForm(false)}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de publicaciones */}
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white border-2 border-[#2b555f] rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-[#2b555f]">{post.titulo}</h3>
                      <span className="bg-[#73e4fd] bg-opacity-30 text-[#2b555f] px-3 py-1 rounded-full text-sm font-medium">
                        {post.categoria}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#2b555f] mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{post.autor}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{post.fecha.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[#2b555f] mb-4 leading-relaxed">{post.contenido}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        post.isLiked ? "bg-green-100 text-green-600" : "text-[#2b555f] hover:bg-green-50"
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="font-semibold">{post.likes}</span>
                    </button>
                    <button
                      onClick={() => handleDislike(post.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        post.isDisliked ? "bg-red-100 text-red-600" : "text-[#2b555f] hover:bg-red-50"
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span className="font-semibold">{post.dislikes}</span>
                    </button>
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-2 text-[#2b555f] hover:bg-[#73e4fd] hover:bg-opacity-20 px-3 py-2 rounded-lg transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="font-semibold">{post.respuestas} respuestas</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                    className="flex items-center gap-2 bg-[#73e4fd] text-[#2b555f] px-4 py-2 rounded-lg hover:bg-[#2b555f] hover:text-white transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    Responder
                  </button>
                </div>

                {/* Formulario de respuesta */}
                {replyingTo === post.id && (
                  <div className="mt-4 p-4 bg-[#73e4fd] bg-opacity-10 rounded-lg">
                    <div className="flex gap-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Escribe tu respuesta..."
                        rows={3}
                        className="flex-1 px-3 py-2 border-2 border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d] resize-vertical"
                      />
                      <button
                        onClick={() => handleReply(post.id)}
                        disabled={!replyText.trim()}
                        className="bg-[#00445d] text-white px-4 py-2 rounded-lg hover:bg-[#2b555f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Enviar
                      </button>
                    </div>
                  </div>
                )}

                {/* Comentarios */}
                {post.showComments && (
                  <div className="mt-6 space-y-4">
                    <h4 className="font-semibold text-[#2b555f] border-b border-[#2b555f] pb-2">
                      Respuestas ({getCommentsForPost(post.id).length})
                    </h4>
                    {getCommentsForPost(post.id).map((comment) => (
                      <div key={comment.id} className="bg-[#73e4fd] bg-opacity-10 rounded-lg p-4 ml-6">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm text-[#2b555f]">
                            <User className="w-4 h-4" />
                            <span className="font-semibold">{comment.autor}</span>
                            <span>•</span>
                            <span>{comment.fecha.toLocaleString()}</span>
                          </div>
                          <button
                            onClick={() => handleCommentLike(comment.id)}
                            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                              comment.isLiked ? "bg-green-100 text-green-600" : "text-[#2b555f] hover:bg-green-50"
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span className="text-sm font-semibold">{comment.likes}</span>
                          </button>
                        </div>
                        <p className="text-[#2b555f]">{comment.contenido}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-[#2b555f] mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-[#2b555f] mb-2">No se encontraron publicaciones</h3>
              <p className="text-[#2b555f]">Intenta cambiar los filtros de búsqueda o crea una nueva publicación.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
