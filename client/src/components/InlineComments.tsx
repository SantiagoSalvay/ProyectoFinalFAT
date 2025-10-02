import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import { toast } from 'react-hot-toast'
import { useCommentValidation } from '../hooks/useContentModeration'
import { getCooldownRemaining } from '../utils/contentModeration'
import { 
  Send, 
  MessageCircle, 
  User, 
  Building, 
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react'

interface Comentario {
  id_respuesta: number
  id_foro: number
  id_usuario: number
  mensaje: string
  fecha: string
  moderation_status?: string  // pending, approved, rejected
  rejection_reason?: string
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
  const { validateComment, lastResult } = useCommentValidation()
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  // Cargar comentarios cuando se expande
  useEffect(() => {
    if (isExpanded) {
      cargarComentarios()
    }
  }, [isExpanded, publicacionId])

  // Actualizar el contador de cooldown cada segundo
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      const remaining = getCooldownRemaining(user.id_usuario.toString())
      setCooldownSeconds(remaining)
    }, 100) // Actualizar cada 100ms para más precisión

    return () => clearInterval(interval)
  }, [user, comentarios.length]) // Actualizar cuando cambie el número de comentarios

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

    // Validar el comentario con el sistema de moderación
    const isValid = validateComment(nuevoComentario.trim(), user.id_usuario.toString())
    
    if (!isValid) {
      // Los errores ya fueron mostrados por el hook
      return
    }

    try {
      setEnviando(true)
      const response = await api.crearComentario(publicacionId, nuevoComentario.trim())
      
      // Agregar el nuevo comentario a la lista
      setComentarios(prev => [...prev, response.comentario])
      setNuevoComentario('')
      
      // Mostrar mensaje de éxito
      toast.success('Comentario publicado exitosamente')
    } catch (error: any) {
      console.error('Error al crear comentario:', error)
      
      // Manejar errores específicos de moderación del servidor
       if (error.response?.status === 429) {
         toast.error('Debes esperar 10 segundos entre mensajes.', {
           duration: 3000,
           icon: '⏱️'
         })
       } else if (error.response?.status === 400) {
        const errorData = error.response.data
        toast.error(errorData.error || 'El comentario contiene contenido inapropiado', {
          duration: 5000
        })
      } else {
        toast.error('Error al publicar el comentario')
      }
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
                {comentarios.map((comentario) => {
                  const isOwner = user && user.id_usuario === comentario.id_usuario

                  return (
                    <div 
                      key={comentario.id_respuesta} 
                      className="rounded-lg p-3 bg-gray-50"
                    >

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
                          
                          <p className="text-sm leading-relaxed text-gray-700">
                            {comentario.mensaje}
                          </p>
                          
                          {/* Botón de eliminar (solo para el autor) */}
                          {isOwner && (
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
                  )
                })}
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
                    placeholder="Escribe tu comentario... (Recuerda mantener un lenguaje respetuoso)"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm ${
                      lastResult && !lastResult.isValid && nuevoComentario.length > 0
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    rows={2}
                    disabled={enviando}
                  />
                  
                  {/* Indicador de validación en tiempo real */}
                  {lastResult && nuevoComentario.length > 0 && lastResult.warnings.length > 0 && (
                    <div className="mt-2 flex items-start space-x-2 text-xs text-amber-600">
                      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{lastResult.warnings[0]}</span>
                    </div>
                  )}
                </div>
                 <button
                   onClick={handleEnviarComentario}
                   disabled={enviando || !nuevoComentario.trim() || cooldownSeconds > 0}
                   className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm transition-colors min-w-[100px]"
                 >
                   {enviando ? (
                     <>
                       <Loader2 className="w-4 h-4 animate-spin" />
                       <span>Enviando...</span>
                     </>
                   ) : cooldownSeconds > 0 ? (
                     <>
                       <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                       <span>{cooldownSeconds}s</span>
                     </>
                   ) : (
                     <>
                       <Send className="w-4 h-4" />
                       <span>Enviar</span>
                     </>
                   )}
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
