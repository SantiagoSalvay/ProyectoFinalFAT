import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { GlobalLoading } from '../components/GlobalLoading'

interface LoadingContextType {
  globalLoading: boolean
  loadingMessage: string
  startGlobalLoading: (message?: string) => void
  stopGlobalLoading: () => void
  withGlobalLoading: <T extends any[], R>(
    asyncFunction: (...args: T) => Promise<R>,
    message?: string
  ) => (...args: T) => Promise<R>
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
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

  const value = {
    globalLoading,
    loadingMessage,
    startGlobalLoading,
    stopGlobalLoading,
    withGlobalLoading
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <GlobalLoading isLoading={globalLoading} message={loadingMessage} />
    </LoadingContext.Provider>
  )
}

export function useLoadingContext() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoadingContext must be used within a LoadingProvider')
  }
  return context
}
