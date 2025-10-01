import { useState, useCallback } from 'react'

interface UseFormLoadingReturn {
  isSubmitting: boolean
  isValidating: boolean
  submitProgress: number
  startSubmitting: () => void
  stopSubmitting: () => void
  startValidating: () => void
  stopValidating: () => void
  setProgress: (progress: number) => void
  withFormSubmit: <T extends any[], R>(
    asyncFunction: (...args: T) => Promise<R>,
    options?: FormSubmitOptions
  ) => (...args: T) => Promise<R>
}

interface FormSubmitOptions {
  simulateProgress?: boolean
  progressDuration?: number
  onProgress?: (progress: number) => void
}

/**
 * Hook especializado para manejar estados de carga en formularios
 * Incluye validación, envío y progreso visual
 */
export function useFormLoading(): UseFormLoadingReturn {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [submitProgress, setSubmitProgress] = useState(0)

  const startSubmitting = useCallback(() => {
    setIsSubmitting(true)
    setSubmitProgress(0)
  }, [])

  const stopSubmitting = useCallback(() => {
    setIsSubmitting(false)
    setSubmitProgress(100)
    // Reset progress after animation
    setTimeout(() => setSubmitProgress(0), 500)
  }, [])

  const startValidating = useCallback(() => {
    setIsValidating(true)
  }, [])

  const stopValidating = useCallback(() => {
    setIsValidating(false)
  }, [])

  const setProgress = useCallback((progress: number) => {
    setSubmitProgress(Math.min(Math.max(progress, 0), 100))
  }, [])

  const withFormSubmit = useCallback(
    <T extends any[], R>(
      asyncFunction: (...args: T) => Promise<R>,
      options: FormSubmitOptions = {}
    ) => {
      const {
        simulateProgress = true,
        progressDuration = 2000,
        onProgress
      } = options

      return async (...args: T): Promise<R> => {
        startSubmitting()
        
        let progressInterval: NodeJS.Timeout | null = null
        
        if (simulateProgress) {
          let currentProgress = 0
          const increment = 100 / (progressDuration / 50)
          
          progressInterval = setInterval(() => {
            currentProgress += increment
            if (currentProgress <= 90) {
              const newProgress = Math.min(currentProgress, 90)
              setProgress(newProgress)
              onProgress?.(newProgress)
            }
          }, 50)
        }

        try {
          const result = await asyncFunction(...args)
          
          // Complete progress
          if (simulateProgress) {
            setProgress(100)
            onProgress?.(100)
          }
          
          return result
        } finally {
          if (progressInterval) {
            clearInterval(progressInterval)
          }
          
          // Small delay to show 100% progress
          setTimeout(() => {
            stopSubmitting()
          }, 300)
        }
      }
    },
    [startSubmitting, stopSubmitting, setProgress]
  )

  return {
    isSubmitting,
    isValidating,
    submitProgress,
    startSubmitting,
    stopSubmitting,
    startValidating,
    stopValidating,
    setProgress,
    withFormSubmit
  }
}

/**
 * Hook combinado para formularios de autenticación
 * Combina useAuthLoading con useFormLoading
 */
export function useAuthFormLoading() {
  const formLoading = useFormLoading()
  
  return {
    ...formLoading,
    isLoading: formLoading.isSubmitting || formLoading.isValidating
  }
}

