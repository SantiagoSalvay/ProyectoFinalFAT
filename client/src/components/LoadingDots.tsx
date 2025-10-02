import { CSSProperties } from 'react'

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

/**
 * Componente de animación de puntos de carga
 * Muestra tres puntos que se animan en secuencia
 */
export function LoadingDots({ size = 'md', color = 'currentColor', className = '' }: LoadingDotsProps) {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  }

  const dotSize = sizeClasses[size]

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      <div
        className={`${dotSize} rounded-full animate-bounce`}
        style={{ 
          backgroundColor: color,
          animationDelay: '0ms',
          animationDuration: '1.4s'
        }}
      />
      <div
        className={`${dotSize} rounded-full animate-bounce`}
        style={{ 
          backgroundColor: color,
          animationDelay: '160ms',
          animationDuration: '1.4s'
        }}
      />
      <div
        className={`${dotSize} rounded-full animate-bounce`}
        style={{ 
          backgroundColor: color,
          animationDelay: '320ms',
          animationDuration: '1.4s'
        }}
      />
    </div>
  )
}

interface LoadingTextProps {
  text: string
  showDots?: boolean
  className?: string
}

/**
 * Componente de texto con animación de puntos
 */
export function LoadingText({ text, showDots = true, className = '' }: LoadingTextProps) {
  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <span>{text}</span>
      {showDots && <LoadingDots size="sm" />}
    </div>
  )
}

interface PulseLoaderProps {
  size?: number
  color?: string
  className?: string
}

/**
 * Componente de loader con animación de pulso
 */
export function PulseLoader({ size = 40, color = '#7c3aed', className = '' }: PulseLoaderProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Círculo exterior */}
      <div
        className="absolute inset-0 rounded-full animate-ping opacity-75"
        style={{ backgroundColor: color }}
      />
      {/* Círculo interior */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ 
          backgroundColor: color,
          transform: 'scale(0.6)'
        }}
      />
    </div>
  )
}

interface ProgressBarProps {
  progress: number
  height?: number
  color?: string
  backgroundColor?: string
  className?: string
  showPercentage?: boolean
  animated?: boolean
}

/**
 * Componente de barra de progreso
 */
export function ProgressBar({ 
  progress, 
  height = 4, 
  color = '#7c3aed',
  backgroundColor = '#e5e7eb',
  className = '',
  showPercentage = false,
  animated = true
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100)

  return (
    <div className={className}>
      <div 
        className="w-full rounded-full overflow-hidden"
        style={{ height, backgroundColor }}
      >
        <div
          className={`h-full rounded-full ${animated ? 'transition-all duration-300 ease-out' : ''}`}
          style={{ 
            width: `${clampedProgress}%`,
            backgroundColor: color
          }}
        />
      </div>
      {showPercentage && (
        <div className="text-xs text-center mt-1" style={{ color }}>
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  )
}

interface SpinnerProps {
  size?: number
  color?: string
  thickness?: number
  className?: string
}

/**
 * Componente de spinner circular personalizado
 */
export function Spinner({ size = 24, color = '#7c3aed', thickness = 3, className = '' }: SpinnerProps) {
  return (
    <div
      className={`inline-block animate-spin rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        border: `${thickness}px solid rgba(124, 58, 237, 0.1)`,
        borderTopColor: color
      }}
    />
  )
}

interface BouncingDotsProps {
  count?: number
  size?: number
  color?: string
  className?: string
}

/**
 * Componente con múltiples puntos rebotando
 */
export function BouncingDots({ count = 3, size = 8, color = '#7c3aed', className = '' }: BouncingDotsProps) {
  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-full animate-bounce"
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            animationDelay: `${index * 0.15}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  )
}

interface RippleLoaderProps {
  size?: number
  color?: string
  className?: string
}

/**
 * Componente con efecto de ondas expansivas (ripple)
 */
export function RippleLoader({ size = 64, color = '#7c3aed', className = '' }: RippleLoaderProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {[0, 1].map((index) => (
        <div
          key={index}
          className="absolute inset-0 rounded-full border-4 animate-ping"
          style={{
            borderColor: color,
            animationDelay: `${index * 0.5}s`,
            animationDuration: '1.5s'
          }}
        />
      ))}
    </div>
  )
}

