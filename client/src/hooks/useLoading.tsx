import { useState, useCallback, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface UseLoadingReturn {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  withLoading: <T extends any[], R>(
    asyncFunction: (...args: T) => Promise<R>
  ) => (...args: T) => Promise<R>
  LoadingSpinner: ({ size, className, children }: LoadingSpinnerProps) => JSX.Element
  LoadingOverlay: ({ children, message }: LoadingOverlayProps) => JSX.Element
}

interface LoadingSpinnerProps {
  size?: number
  className?: string
  children?: ReactNode
}

interface LoadingOverlayProps {
  children?: ReactNode
  message?: string
}

export function useLoading(initialState: boolean = false): UseLoadingReturn {
  const [isLoading, setIsLoading] = useState(initialState)

  const withLoading = useCallback(
    <T extends any[], R>(asyncFunction: (...args: T) => Promise<R>) => {
      return async (...args: T): Promise<R> => {
        setIsLoading(true)
        try {
          const result = await asyncFunction(...args)
          return result
        } finally {
          setIsLoading(false)
        }
      }
    },
    []
  )

  const LoadingSpinner = useCallback(
    ({ size = 24, className = '', children }: LoadingSpinnerProps) => {
      if (!isLoading) return <>{children}</>
      
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <Loader2 className="animate-spin" size={size} />
          {children && <span className="ml-2">{children}</span>}
        </div>
      )
    },
    [isLoading]
  )

  const LoadingOverlay = useCallback(
    ({ children, message = 'Cargando...' }: LoadingOverlayProps) => {
      if (!isLoading) return <>{children}</>
      
      return (
        <div className="relative">
          {children}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
              <Loader2 className="animate-spin text-purple-600" size={32} />
              <p className="text-gray-700 font-medium">{message}</p>
            </div>
          </div>
        </div>
      )
    },
    [isLoading]
  )

  return {
    isLoading,
    setIsLoading,
    withLoading,
    LoadingSpinner,
    LoadingOverlay
  }
}

// Hook para loading global de la aplicación
export function useGlobalLoading() {
  const [globalLoading, setGlobalLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')

  const startGlobalLoading = useCallback((message: string = 'Cargando...') => {
    setGlobalLoading(true)
    setLoadingMessage(message)
  }, [])

  const stopGlobalLoading = useCallback(() => {
    setGlobalLoading(false)
    setLoadingMessage('')
  }, [])

  const withGlobalLoading = useCallback(
    <T extends any[], R>(
      asyncFunction: (...args: T) => Promise<R>,
      message: string = 'Cargando...'
    ) => {
      return async (...args: T): Promise<R> => {
        startGlobalLoading(message)
        try {
          const result = await asyncFunction(...args)
          return result
        } finally {
          stopGlobalLoading()
        }
      }
    },
    [startGlobalLoading, stopGlobalLoading]
  )

  return {
    globalLoading,
    loadingMessage,
    startGlobalLoading,
    stopGlobalLoading,
    withGlobalLoading
  }
}

