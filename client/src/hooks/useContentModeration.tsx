import { useState, useCallback } from 'react'
import { 
  moderateContent, 
  validateTitle, 
  isSpam, 
  checkFlood,
  getContentSuggestions,
  type ModerationResult 
} from '../utils/contentModeration'
import { toast } from 'react-hot-toast'

interface UseContentModerationOptions {
  strict?: boolean
  showToasts?: boolean
  checkSpam?: boolean
  checkFlood?: boolean
}

interface UseContentModerationReturn {
  validate: (content: string) => ModerationResult
  validateWithFeedback: (content: string) => boolean
  validateTitle: (title: string) => ModerationResult
  validateTitleWithFeedback: (title: string) => boolean
  checkSpam: (content: string) => boolean
  checkFlood: (userId: string) => boolean
  getSuggestions: (content: string) => string[]
  lastResult: ModerationResult | null
}

/**
 * Hook para moderación de contenido en componentes
 * Proporciona validación y feedback automático para comentarios y publicaciones
 */
export function useContentModeration(
  options: UseContentModerationOptions = {}
): UseContentModerationReturn {
  const {
    strict = false,
    showToasts = true,
    checkSpam: shouldCheckSpam = true,
    checkFlood: shouldCheckFlood = true
  } = options

  const [lastResult, setLastResult] = useState<ModerationResult | null>(null)

  /**
   * Valida el contenido y retorna el resultado
   */
  const validate = useCallback((content: string): ModerationResult => {
    const result = moderateContent(content, strict)
    setLastResult(result)
    return result
  }, [strict])

  /**
   * Valida el contenido y muestra toasts automáticamente
   * Retorna true si es válido, false si no
   */
  const validateWithFeedback = useCallback((content: string): boolean => {
    const result = validate(content)

    if (!showToasts) {
      return result.isValid
    }

    // Mostrar errores
    if (result.errors.length > 0) {
      result.errors.forEach(error => {
        toast.error(error, {
          duration: 4000,
          icon: '🚫'
        })
      })
    }

    // Mostrar advertencias
    if (result.warnings.length > 0 && result.severity !== 'none') {
      result.warnings.forEach(warning => {
        toast(warning, {
          duration: 3000,
          icon: '⚠️',
          style: {
            background: '#fef3c7',
            color: '#92400e'
          }
        })
      })
    }

    // Verificar spam adicional
    if (shouldCheckSpam && result.isValid && isSpam(content)) {
      toast.error('El contenido fue detectado como spam', {
        icon: '🚨'
      })
      return false
    }

    return result.isValid
  }, [validate, showToasts, shouldCheckSpam])

  /**
   * Valida un título
   */
  const validateTitleFunc = useCallback((title: string): ModerationResult => {
    const result = validateTitle(title)
    setLastResult(result)
    return result
  }, [])

  /**
   * Valida un título con feedback automático
   */
  const validateTitleWithFeedback = useCallback((title: string): boolean => {
    const result = validateTitleFunc(title)

    if (!showToasts) {
      return result.isValid
    }

    if (result.errors.length > 0) {
      result.errors.forEach(error => {
        toast.error(error, {
          duration: 4000,
          icon: '🚫'
        })
      })
    }

    if (result.warnings.length > 0) {
      result.warnings.forEach(warning => {
        toast(warning, {
          duration: 3000,
          icon: '⚠️'
        })
      })
    }

    return result.isValid
  }, [validateTitleFunc, showToasts])

  /**
   * Verifica si el contenido es spam
   */
  const checkSpamFunc = useCallback((content: string): boolean => {
    return isSpam(content)
  }, [])

  /**
   * Verifica flood (múltiples mensajes rápidos)
   */
  const checkFloodFunc = useCallback((userId: string): boolean => {
    if (!shouldCheckFlood) {
      return false
    }

    const isFlooding = checkFlood(userId)
    
    if (isFlooding && showToasts) {
      toast.error('Estás enviando mensajes demasiado rápido. Por favor, espera un momento.', {
        icon: '⏱️',
        duration: 5000
      })
    }

    return isFlooding
  }, [shouldCheckFlood, showToasts])

  /**
   * Obtiene sugerencias para mejorar el contenido
   */
  const getSuggestions = useCallback((content: string): string[] => {
    return getContentSuggestions(content)
  }, [])

  return {
    validate,
    validateWithFeedback,
    validateTitle: validateTitleFunc,
    validateTitleWithFeedback,
    checkSpam: checkSpamFunc,
    checkFlood: checkFloodFunc,
    getSuggestions,
    lastResult
  }
}

/**
 * Hook simplificado para validación de comentarios
 */
export function useCommentValidation() {
  const moderation = useContentModeration({
    strict: false,
    showToasts: true,
    checkSpam: true,
    checkFlood: true
  })

  const validateComment = useCallback((
    content: string, 
    userId?: string
  ): boolean => {
    // Verificar flood si se proporciona userId
    if (userId && moderation.checkFlood(userId)) {
      return false
    }

    // Validar contenido
    return moderation.validateWithFeedback(content)
  }, [moderation])

  return {
    validateComment,
    ...moderation
  }
}

/**
 * Hook simplificado para validación de publicaciones
 */
export function usePostValidation() {
  const moderation = useContentModeration({
    strict: true,
    showToasts: true,
    checkSpam: true,
    checkFlood: false
  })

  const validatePost = useCallback((
    title: string,
    content: string
  ): boolean => {
    // Validar título
    const titleValid = moderation.validateTitleWithFeedback(title)
    if (!titleValid) {
      return false
    }

    // Validar contenido
    const contentValid = moderation.validateWithFeedback(content)
    if (!contentValid) {
      return false
    }

    return true
  }, [moderation])

  return {
    validatePost,
    ...moderation
  }
}


