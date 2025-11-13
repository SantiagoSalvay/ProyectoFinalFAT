import { useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { toast } from 'react-hot-toast'
import { api } from '../services/api'

interface UserProfileData {
  bio?: string
  ubicacion?: string
  telefono?: string
  fecha_nacimiento?: string
  sexo?: string
  intereses?: string[]
  habilidades?: string[]
  disponibilidad?: string
  foto_perfil?: string
}

interface UserActivityData {
  publicacionesCount: number
  comentariosCount: number
  preguntasSinResponder: number
  publicacionesSinImagenes: number
  publicacionesIncompletas: number
}

interface NotificationAnalysis {
  profileCompleteness: number
  missingProfileFields: string[]
  activityIssues: string[]
  recommendations: string[]
}

/**
 * Hook avanzado para gestionar notificaciones dinámicas inteligentes
 */
export function useUserNotifications() {
  const { user, isAuthenticated } = useAuth()
  const { addNotification, removeNotification, notifications } = useNotifications()
  const [analysis, setAnalysis] = useState<NotificationAnalysis | null>(null)
  const [lastCheck, setLastCheck] = useState<number>(0)
  const navigate = useNavigate()

  // Limpiar notificaciones de perfil incompleto al montar
  useEffect(() => {
    const profileIncompleteNotif = notifications.find(n => n.id === 'profile-incomplete')
    if (profileIncompleteNotif) {
      removeNotification('profile-incomplete')
    }
  }, [])

  // Función para analizar el perfil del usuario
  const analyzeUserProfile = useCallback(async (): Promise<UserProfileData | null> => {
    if (!user) return null

    try {
      const profileData = await api.getProfile()
      return profileData.user
    } catch (error) {
      console.error('Error obteniendo datos del perfil:', error)
      return null
    }
  }, [user])

  // Función para analizar la actividad del usuario
  const analyzeUserActivity = useCallback(async (): Promise<UserActivityData | null> => {
    if (!user) return null

    try {
      // Obtener publicaciones del usuario (nota: actualmente no filtra por usuario en el servidor)
      const publicaciones = await api.getPublicaciones()
      // No solicitar comentarios sin un ID de publicación válido para evitar URLs con doble slash
      // const comentarios = await api.getComentarios('')

      // Por ahora, asumir que necesitamos implementar estos métodos en el servidor
      // Para demostración, usar datos simulados
      const publicacionesCount = publicaciones?.length || 0
      const comentariosCount = 0 // Placeholder hasta tener endpoint para listar comentarios del usuario

      // Analizar preguntas sin responder (publicaciones con preguntas abiertas)
      const preguntasSinResponder = publicaciones?.filter(pub =>
        pub.content?.includes('?') && !pub.answered
      ).length || 0

      // Publicaciones sin imágenes
      const publicacionesSinImagenes = publicaciones?.filter(pub =>
        (!pub.imagenes || pub.imagenes.length === 0) &&
        pub.content?.length > 100
      ).length || 0

      // Publicaciones muy cortas o sin contenido sustancial
      const publicacionesIncompletas = publicaciones?.filter(pub =>
        (!pub.content || pub.content.length < 50) &&
        (!pub.imagenes || pub.imagenes.length === 0)
      ).length || 0

      return {
        publicacionesCount,
        comentariosCount,
        preguntasSinResponder,
        publicacionesSinImagenes,
        publicacionesIncompletas
      }
    } catch (error) {
      console.error('Error analizando actividad del usuario:', error)
      return null
    }
  }, [user])

  // Función para realizar análisis completo
  const performCompleteAnalysis = useCallback(async (): Promise<NotificationAnalysis | null> => {
    if (!user) return null

    const [profileData, activityData] = await Promise.all([
      analyzeUserProfile(),
      analyzeUserActivity()
    ])

    if (!profileData && !activityData) return null

    const missingProfileFields: string[] = []
    const activityIssues: string[] = []
    const recommendations: string[] = []

    // Análisis del perfil
    if (profileData) {
      if (!profileData.bio || profileData.bio.trim().length < 20) {
        missingProfileFields.push('biografía detallada')
        recommendations.push('Agrega una biografía que describa quién eres y qué te interesa')
      }

      if (!profileData.ubicacion) {
        missingProfileFields.push('ubicación')
        recommendations.push('Especifica tu ubicación para conectar con personas cercanas')
      }

      if (!profileData.telefono && user.tipo_usuario === 2) {
        missingProfileFields.push('teléfono de contacto')
        recommendations.push('Agrega un teléfono para que las personas puedan contactarte')
      }

      if (!profileData.fecha_nacimiento) {
        missingProfileFields.push('fecha de nacimiento')
        recommendations.push('Comparte tu fecha de nacimiento para personalizar tu experiencia')
      }

      if (!profileData.sexo) {
        missingProfileFields.push('género')
        recommendations.push('Especifica tu género para ayudarnos a mostrarte contenido relevante')
      }

      if (!profileData.intereses || profileData.intereses.length === 0) {
        missingProfileFields.push('intereses')
        recommendations.push('Agrega tus intereses para recibir recomendaciones personalizadas')
      }

      if (!profileData.habilidades || profileData.habilidades.length === 0) {
        missingProfileFields.push('habilidades')
        recommendations.push('Comparte tus habilidades para ayudar a la comunidad')
      }

      if (!profileData.foto_perfil) {
        missingProfileFields.push('foto de perfil')
        recommendations.push('Sube una foto de perfil para personalizar tu cuenta')
      }
    }

    // Análisis de actividad
    if (activityData) {
      if (activityData.preguntasSinResponder > 0) {
        activityIssues.push(`${activityData.preguntasSinResponder} preguntas sin responder`)
        recommendations.push(`Tienes ${activityData.preguntasSinResponder} preguntas esperando respuesta. ¡Ayuda a la comunidad!`)
      }

      if (activityData.publicacionesSinImagenes > 0) {
        activityIssues.push(`${activityData.publicacionesSinImagenes} publicaciones sin imágenes`)
        recommendations.push('Considera agregar imágenes a tus publicaciones para hacerlas más atractivas')
      }

      if (activityData.publicacionesIncompletas > 0) {
        activityIssues.push(`${activityData.publicacionesIncompletas} publicaciones muy cortas`)
        recommendations.push('Desarrolla más tus publicaciones para brindar más valor a la comunidad')
      }

      if (activityData.publicacionesCount === 0) {
        activityIssues.push('sin publicaciones')
        recommendations.push('¡Comparte tu primera publicación! La comunidad quiere conocer tu opinión')
      }

      if (activityData.comentariosCount === 0 && activityData.publicacionesCount > 2) {
        activityIssues.push('poca participación en comentarios')
        recommendations.push('¡Participa en las conversaciones! Deja comentarios en publicaciones que te interesen')
      }
    }

    // Calcular porcentaje de completitud del perfil
    const totalFields = 8 // bio, ubicacion, telefono, fecha_nacimiento, sexo, intereses, habilidades, foto_perfil
    const completedFields = totalFields - missingProfileFields.length
    const profileCompleteness = Math.round((completedFields / totalFields) * 100)

    return {
      profileCompleteness,
      missingProfileFields,
      activityIssues,
      recommendations
    }
  }, [user, analyzeUserProfile, analyzeUserActivity])

  // Función para generar notificaciones basadas en el análisis
  const generateSmartNotifications = useCallback(async () => {
    if (!user) return

    const currentTime = Date.now()
    // Evitar checks muy frecuentes (máximo cada 5 minutos)
    if (currentTime - lastCheck < 5 * 60 * 1000) return

    const analysisResult = await performCompleteAnalysis()
    if (!analysisResult) return

    setLastCheck(currentTime)
    setAnalysis(analysisResult)

    const biographyNotificationId = 'global-missing-biography'
    const biographyMissing = analysisResult.missingProfileFields.some(field =>
      field.toLowerCase().includes('biograf')
    )

    if (biographyMissing) {
      const existingBiographyNotification = notifications.find(n => n.id === biographyNotificationId)

      if (!existingBiographyNotification) {
        addNotification({
          id: biographyNotificationId,
          type: 'warning',
          title: 'Completa tu biografía',
          message: 'Tu biografía está vacía o incompleta. Agrega más información para que la comunidad te conozca mejor.',
          link: '/profile',
          category: 'profile',
          priority: 'medium'
        })
      }
    } else {
      const existingBiographyNotification = notifications.find(n => n.id === biographyNotificationId)
      if (existingBiographyNotification) {
        removeNotification(biographyNotificationId)
      }
    }

    // DESACTIVADO: Notificaciones de perfil incompleto (muy intrusivas y no precisas)
    // if (analysisResult.profileCompleteness < 70) {
    //   const notificationId = 'profile-incomplete'

    //   addNotification({
    //     id: notificationId,
    //     type: 'warning',
    //     title: 'Perfil incompleto',
    //     message: `Tu perfil está ${analysisResult.profileCompleteness}% completo. Completa los datos faltantes para tener una mejor experiencia.`,
    //     link: '/profile'
    //   })
    // }

    // Notificaciones de preguntas sin responder
    if (analysisResult.activityIssues.some(issue => issue.includes('preguntas sin responder'))) {
      const preguntasCount = parseInt(analysisResult.activityIssues.find(issue =>
        issue.includes('preguntas sin responder')
      )?.match(/\d+/)?.[0] || '0')

      if (preguntasCount > 0) {
        addNotification({
          id: 'unanswered-questions',
          type: 'info',
          title: 'Preguntas esperando respuesta',
          message: `Tienes ${preguntasCount} pregunta${preguntasCount > 1 ? 's' : ''} esperando tu respuesta. ¡Ayuda a la comunidad!`,
          link: '/forum?filter=unanswered'
        })
      }
    }

    // Notificaciones de publicaciones sin imágenes
    if (analysisResult.activityIssues.some(issue => issue.includes('publicaciones sin imágenes'))) {
      const publicacionesCount = parseInt(analysisResult.activityIssues.find(issue =>
        issue.includes('publicaciones sin imágenes')
      )?.match(/\d+/)?.[0] || '0')

      if (publicacionesCount > 2) {
        addNotification({
          id: 'posts-without-images',
          type: 'info',
          title: 'Mejora tus publicaciones',
          message: `${publicacionesCount} de tus publicaciones podrían ser más atractivas con imágenes.`,
          link: '/profile?tab=posts'
        })
      }
    }

    // Notificaciones de participación baja
    if (analysisResult.activityIssues.some(issue => issue.includes('sin publicaciones'))) {
      addNotification({
        id: 'no-posts',
        type: 'info',
        title: '¡Comparte con la comunidad!',
        message: 'Aún no has publicado nada. ¡Comparte tus ideas, preguntas o experiencias!',
        link: '/forum/create'
      })
    }

    // Notificaciones de recomendaciones específicas
    if (analysisResult.recommendations.length > 0) {
      const topRecommendation = analysisResult.recommendations[0]
      addNotification({
        id: 'personal-recommendation',
        type: 'info',
        title: 'Recomendación personalizada',
        message: topRecommendation,
        link: '/profile'
      })
    }
  }, [user, lastCheck, performCompleteAnalysis, addNotification, removeNotification, notifications])

  // Función para monitorear respuestas a preguntas
  const monitorQuestionResponses = useCallback(async () => {
    if (!user) return

    try {
      // Obtener publicaciones recientes del usuario que son preguntas
      const publicaciones = await api.getPublicaciones()
      const preguntas = publicaciones?.filter(pub =>
        pub.content?.includes('?') && pub.content.length > 20
      ) || []

      // Verificar respuestas nuevas para cada pregunta
      for (const pregunta of preguntas.slice(0, 5)) { // Limitar a 5 preguntas recientes
        const respuestas = await api.getComentarios(pregunta.id)
        const respuestasNuevas = respuestas?.filter(respuesta =>
          respuesta.fecha_respuesta > new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
        ) || []

        if (respuestasNuevas.length > 0) {
          respuestasNuevas.forEach(respuesta => {
            addNotification({
              id: `question-response-${pregunta.id}-${respuesta.id_respuesta}`,
              type: 'success',
              title: '¡Tu pregunta recibió respuesta!',
              message: `${respuesta.usuario.nombre} respondió: "${respuesta.mensaje.substring(0, 100)}${respuesta.mensaje.length > 100 ? '...' : ''}"`,
              link: `/forum/${pregunta.id}`
            })
          })
        }
      }
    } catch (error) {
      console.error('Error monitoreando respuestas a preguntas:', error)
    }
  }, [user, addNotification])

  useEffect(() => {
    if (!isAuthenticated || !user) return

    // Notificaciones básicas (una vez por sesión)
    const isONG = user.tipo_usuario === 2
    const hasShownWelcome = sessionStorage.getItem(`welcome_${user.id_usuario}`)
    const hasShownMissingData = sessionStorage.getItem(`missing_data_${user.id_usuario}`)

    // Bienvenida
    if (!hasShownWelcome) {
      setTimeout(() => {
        if (isONG) {
          toast.success(`¡Bienvenida ${user.nombre}!`, {
            duration: 4000,
            icon: '🎉',
          })
        } else {
          toast.success(`¡Bienvenido ${user.nombre}!`, {
            duration: 4000,
            icon: '👋',
          })
        }
        sessionStorage.setItem(`welcome_${user.id_usuario}`, 'true')
      }, 1000)
    }

    // Aviso para ONGs: donaciones monetarias no configuradas
    const mpFlagKey = `mp_setup_prompt_${user.id_usuario}`
    const shouldCheckMP = user.tipo_usuario === 2 && !sessionStorage.getItem(mpFlagKey)
    if (shouldCheckMP) {
      (async () => {
        try {
          const status = await api.getOngMPStatus(user.id_usuario)
          if (!status.enabled) {
            addNotification({
              id: `mp-setup-${user.id_usuario}`,
              type: 'warning',
              title: 'Configura tus donaciones',
              message: 'Aún no configuraste las donaciones monetarias. Sigue los pasos para habilitarlas.',
              link: '/pagos/configurar',
              autoHide: false,
              category: 'system',
              priority: 'high'
            })
            // Redirigir a la UI de configuración
            setTimeout(() => {
              navigate('/pagos/configurar')
            }, 1200)
          }
        } catch (e) {
          // silencioso
        } finally {
          sessionStorage.setItem(mpFlagKey, 'true')
        }
      })()
    }

    // Análisis inicial y notificaciones inteligentes
    setTimeout(() => {
      generateSmartNotifications()
      monitorQuestionResponses()
    }, 2000)

    // Actualizar análisis cada 10 minutos
    const analysisInterval = setInterval(generateSmartNotifications, 10 * 60 * 1000)

    // Monitorear respuestas cada 5 minutos
    const responseInterval = setInterval(monitorQuestionResponses, 5 * 60 * 1000)

    return () => {
      clearInterval(analysisInterval)
      clearInterval(responseInterval)
    }
  }, [isAuthenticated, user, generateSmartNotifications, monitorQuestionResponses])

  return {
    analysis,
    generateSmartNotifications,
    monitorQuestionResponses,
    performCompleteAnalysis
  }
}

