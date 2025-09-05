import { Loader2 } from 'lucide-react'

interface GlobalLoadingProps {
  isLoading: boolean
  message?: string
}

export function GlobalLoading({ isLoading, message = 'Cargando...' }: GlobalLoadingProps) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4 shadow-xl">
        <Loader2 className="animate-spin text-purple-600" size={48} />
        <p className="text-gray-700 font-medium text-lg">{message}</p>
      </div>
    </div>
  )
}

// Componente de loading para secciones específicas
export function SectionLoading({ isLoading, message = 'Cargando...' }: GlobalLoadingProps) {
  if (!isLoading) return null

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="animate-spin text-purple-600" size={32} />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  )
}

// Componente de loading para botones
export function ButtonLoading({ isLoading, children, className = '' }: {
  isLoading: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {isLoading && <Loader2 className="animate-spin mr-2" size={16} />}
      {children}
    </div>
  )
}

