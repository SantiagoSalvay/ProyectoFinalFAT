import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import { toast } from 'react-hot-toast'
import { 
  Send, 
  MessageCircle, 
  User, 
  Building, 
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface Comentario {
  id_respuesta: number
  id_foro: number
  id_usuario: number
  mensaje: string
  fecha: string
  usuario: {
    id_usuario: number
    nombre: string
    apellido: string
    tipo_usuario: number
  }
}

interface InlineCommentsProps {
  publicacionId: string
  isExpanded: boolean
  onToggle: () => void
}

export default function InlineComments({ 
  publicacionId, 
  isExpanded, 
  onToggle 
}: InlineCommentsProps) {
  const { user } = useAuth()
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviando, setEnviando] = useState(false)

  // Cargar comentarios cuando se expande
  useEffect(() => {
    if (isExpanded) {
      cargarComentarios()
    }
  }, [isExpanded, publicacionId])

  const cargarComentarios = async () => {
    try {
      setLoading(true)
      const comentariosData = await api.getComentarios(publicacionId)
      setComentarios(comentariosData)
    } catch (error) {
      console.error('Error al cargar comentarios:', error)
      toast.error('Error al cargar los comentarios')
    } finally {
      setLoading(false)
    }
  }

  const handleEnviarComentario = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para comentar')
      return
    }

    if (!nuevoComentario.trim()) {
      toast.error('El comentario no puede estar vacío')
      return
    }

    try {
      setEnviando(true)
      const response = await api.crearComentario(publicacionId, nuevoComentario.trim())
      
      // Agregar el nuevo comentario a la lista
      setComentarios(prev => [...prev, response.comentario])
      setNuevoComentario('')
      toast.success('Comentario publicado exitosamente')
    } catch (error) {
      console.error('Error al crear comentario:', error)
      toast.error('Error al publicar el comentario')
    } finally {
      setEnviando(false)
    }
  }

  const handleEliminarComentario = async (comentarioId: number) => {
    if (!user) {
      toast.error('Debes iniciar sesión')
      return
    }

    try {
      await api.eliminarComentario(comentarioId.toString())
      setComentarios(prev => prev.filter(c => c.id_respuesta !== comentarioId))
      toast.success('Comentario eliminado exitosamente')
    } catch (error) {
      console.error('Error al eliminar comentario:', error)
      toast.error('Error al eliminar el comentario')
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="border-t border-gray-100">
      {/* Header con botón de toggle */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {comentarios.length} comentario{comentarios.length !== 1 ? 's' : ''}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </div>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className="px-4 pb-4">
          {/* Lista de comentarios */}
          <div className="mb-4">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                <span className="ml-2 text-sm text-gray-600">Cargando comentarios...</span>
              </div>
            ) : comentarios.length === 0 ? (
              <div className="text-center py-6">
                <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No hay comentarios aún</p>
                <p className="text-xs text-gray-500 mt-1">Sé el primero en comentar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {comentarios.map((comentario) => (
                  <div key={comentario.id_respuesta} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-7 h-7 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center flex-shrink-0">
                        {comentario.usuario.tipo_usuario === 2 ? (
                          <Building className="w-3 h-3 text-white" />
                        ) : (
                          <User className="w-3 h-3 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {comentario.usuario.nombre} {comentario.usuario.apellido}
                          </span>
                          {comentario.usuario.tipo_usuario === 2 && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                              ONG
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatearFecha(comentario.fecha)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {comentario.mensaje}
                        </p>
                        
                        {/* Botón de eliminar (solo para el autor) */}
                        {user && user.id_usuario === comentario.id_usuario && (
                          <button
                            onClick={() => handleEliminarComentario(comentario.id_respuesta)}
                            className="mt-2 text-xs text-red-600 hover:text-red-800 flex items-center space-x-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Eliminar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulario de nuevo comentario */}
          {user ? (
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <textarea
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    placeholder="Escribe tu comentario..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                    rows={2}
                    disabled={enviando}
                  />
                </div>
                <button
                  onClick={handleEnviarComentario}
                  disabled={enviando || !nuevoComentario.trim()}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
                >
                  {enviando ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{enviando ? 'Enviando...' : 'Enviar'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600 mb-2">Para comentar necesitas iniciar sesión</p>
              <div className="flex space-x-2 justify-center">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => window.location.href = '/register'}
                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                >
                  Registrarse
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
