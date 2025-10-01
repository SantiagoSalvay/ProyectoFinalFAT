import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

export type AuthOperationType = 'login' | 'register' | 'logout' | 'verify' | 'reset-password' | 'forgot-password'

interface AuthLoadingState {
  isLoading: boolean
  operation: AuthOperationType | null
  message: string
}

interface UseAuthLoadingReturn {
  isLoading: boolean
  operation: AuthOperationType | null
  message: string
  startLoading: (operation: AuthOperationType, message?: string) => void
  stopLoading: () => void
  withAuthLoading: <T extends any[], R>(
    operation: AuthOperationType,
    asyncFunction: (...args: T) => Promise<R>,
    options?: AuthLoadingOptions
  ) => (...args: T) => Promise<R>
}

interface AuthLoadingOptions {
  loadingMessage?: string
  successMessage?: string
  errorMessage?: string
  showSuccessToast?: boolean
  showErrorToast?: boolean
}

const DEFAULT_MESSAGES: Record<AuthOperationType, string> = {
  login: 'Iniciando sesión...',
  register: 'Creando tu cuenta...',
  logout: 'Cerrando sesión...',
  verify: 'Verificando...',
  'reset-password': 'Restableciendo contraseña...',
  'forgot-password': 'Enviando enlace de recuperación...'
}

const SUCCESS_MESSAGES: Record<AuthOperationType, string> = {
  login: '¡Bienvenido de vuelta!',
  register: '¡Cuenta creada exitosamente!',
  logout: 'Sesión cerrada correctamente',
  verify: 'Verificación exitosa',
  'reset-password': 'Contraseña restablecida',
  'forgot-password': 'Correo enviado exitosamente'
}

/**
 * Hook personalizado para manejar estados de carga en operaciones de autenticación
 * Proporciona mensajes personalizados y manejo de errores específicos para cada operación
 */
export function useAuthLoading(): UseAuthLoadingReturn {
  const [state, setState] = useState<AuthLoadingState>({
    isLoading: false,
    operation: null,
    message: ''
  })

  const startLoading = useCallback((operation: AuthOperationType, message?: string) => {
    setState({
      isLoading: true,
      operation,
      message: message || DEFAULT_MESSAGES[operation]
    })
  }, [])

  const stopLoading = useCallback(() => {
    setState({
      isLoading: false,
      operation: null,
      message: ''
    })
  }, [])

  const withAuthLoading = useCallback(
    <T extends any[], R>(
      operation: AuthOperationType,
      asyncFunction: (...args: T) => Promise<R>,
      options: AuthLoadingOptions = {}
    ) => {
      const {
        loadingMessage,
        successMessage,
        errorMessage,
        showSuccessToast = true,
        showErrorToast = true
      } = options

      return async (...args: T): Promise<R> => {
        startLoading(operation, loadingMessage)
        try {
          const result = await asyncFunction(...args)
          
          if (showSuccessToast) {
            toast.success(successMessage || SUCCESS_MESSAGES[operation])
          }
          
          return result
        } catch (error) {
          if (showErrorToast) {
            const message = error instanceof Error ? error.message : (errorMessage || 'Ha ocurrido un error')
            toast.error(message)
          }
          throw error
        } finally {
          stopLoading()
        }
      }
    },
    [startLoading, stopLoading]
  )

  return {
    isLoading: state.isLoading,
    operation: state.operation,
    message: state.message,
    startLoading,
    stopLoading,
    withAuthLoading
  }
}

/**
 * Hook simplificado específico para login
 */
export function useLoginLoading() {
  const { isLoading, message, withAuthLoading } = useAuthLoading()
  
  const withLoginLoading = useCallback(
    <T extends any[], R>(
      asyncFunction: (...args: T) => Promise<R>,
      customMessage?: string
    ) => {
      return withAuthLoading('login', asyncFunction, {
        loadingMessage: customMessage,
        showSuccessToast: true,
        showErrorToast: true
      })
    },
    [withAuthLoading]
  )

  return { isLoading, message, withLoginLoading }
}

/**
 * Hook simplificado específico para registro
 */
export function useRegisterLoading() {
  const { isLoading, message, withAuthLoading } = useAuthLoading()
  
  const withRegisterLoading = useCallback(
    <T extends any[], R>(
      asyncFunction: (...args: T) => Promise<R>,
      customMessage?: string
    ) => {
      return withAuthLoading('register', asyncFunction, {
        loadingMessage: customMessage,
        showSuccessToast: false, // El registro maneja su propio success
        showErrorToast: true
      })
    },
    [withAuthLoading]
  )

  return { isLoading, message, withRegisterLoading }
}

