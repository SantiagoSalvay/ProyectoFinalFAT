import { Loader2, Heart } from 'lucide-react'
import { PulseLoader, LoadingDots, RippleLoader, Spinner } from './LoadingDots'

interface GlobalLoadingProps {
  isLoading: boolean
  message?: string
  variant?: 'spinner' | 'pulse' | 'ripple' | 'heart'
}

export function GlobalLoading({ 
  isLoading, 
  message = 'Cargando...',
  variant = 'spinner' 
}: GlobalLoadingProps) {
  if (!isLoading) return null

  const renderLoader = () => {
    switch (variant) {
      case 'pulse':
        return <PulseLoader size={48} color="#7c3aed" />
      case 'ripple':
        return <RippleLoader size={64} color="#7c3aed" />
      case 'heart':
        return (
          <div className="relative">
            <Heart 
              className="text-purple-600 animate-pulse" 
              size={48} 
              fill="currentColor"
            />
          </div>
        )
      default:
        return <Loader2 className="animate-spin text-purple-600" size={48} />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 flex flex-col items-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-300">
        {renderLoader()}
        <div className="flex flex-col items-center space-y-2">
          <p className="text-gray-700 dark:text-gray-200 font-medium text-lg">{message}</p>
          <LoadingDots size="sm" color="#7c3aed" />
        </div>
      </div>
    </div>
  )
}

// Componente de loading para secciones específicas
export function SectionLoading({ 
  isLoading, 
  message = 'Cargando...',
  variant = 'spinner' 
}: GlobalLoadingProps) {
  if (!isLoading) return null

  const renderLoader = () => {
    switch (variant) {
      case 'pulse':
        return <PulseLoader size={32} color="#7c3aed" />
      case 'ripple':
        return <RippleLoader size={48} color="#7c3aed" />
      case 'heart':
        return (
          <Heart 
            className="text-purple-600 animate-pulse" 
            size={32} 
            fill="currentColor"
          />
        )
      default:
        return <Loader2 className="animate-spin text-purple-600" size={32} />
    }
  }

  return (
    <div className="flex items-center justify-center py-12 animate-in fade-in duration-300">
      <div className="flex flex-col items-center space-y-4">
        {renderLoader()}
        <p className="text-gray-600 dark:text-gray-300 font-medium">{message}</p>
      </div>
    </div>
  )
}

// Componente de loading para botones
export function ButtonLoading({ 
  isLoading, 
  children, 
  className = '',
  spinnerSize = 16,
  variant = 'spinner'
}: {
  isLoading: boolean
  children: React.ReactNode
  className?: string
  spinnerSize?: number
  variant?: 'spinner' | 'dots'
}) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {isLoading && (
        <span className="mr-2">
          {variant === 'dots' ? (
            <LoadingDots size="sm" />
          ) : (
            <Spinner size={spinnerSize} color="currentColor" />
          )}
        </span>
      )}
      {children}
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  children: React.ReactNode
  blur?: boolean
}

/**
 * Componente que muestra un overlay de carga sobre su contenido hijo
 */
export function LoadingOverlay({ 
  isLoading, 
  message = 'Cargando...', 
  children,
  blur = true 
}: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className={`absolute inset-0 bg-black/40 ${blur ? 'backdrop-blur-sm' : ''} flex items-center justify-center z-50 rounded-lg animate-in fade-in duration-200`}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 flex flex-col items-center space-y-3 shadow-lg">
            <Spinner size={32} color="#7c3aed" />
            <p className="text-gray-700 dark:text-gray-200 font-medium">{message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

/**
 * Componente Skeleton para mostrar placeholders durante la carga
 */
export function Skeleton({ 
  className = '', 
  variant = 'text',
  width,
  height 
}: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  }

  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  )
}

