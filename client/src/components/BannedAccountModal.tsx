import { X, AlertTriangle } from 'lucide-react'

interface BannedAccountModalProps {
  isOpen: boolean
  bannedReason?: string
  bannedUntil?: string | null
  permanent?: boolean
  onClose: () => void
}

export default function BannedAccountModal({
  isOpen,
  bannedReason,
  bannedUntil,
  permanent = false,
  onClose
}: BannedAccountModalProps) {
  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">Cuenta Suspendida</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm font-medium text-red-900 dark:text-red-200">
                {permanent 
                  ? 'Tu cuenta ha sido baneada permanentemente'
                  : `Tu cuenta ha sido suspendida temporalmente hasta el ${bannedUntil ? formatDate(bannedUntil) : 'que un administrador la revise'}`
                }
              </p>
            </div>

            <div className="text-left space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Razón del baneo:
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  {bannedReason || 'Violación de las normas de la comunidad'}
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 text-sm">
                  ℹ️ Información importante
                </h4>
                <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                  <li>No podrás iniciar sesión ni publicar contenido</li>
                  <li>Tus publicaciones y comentarios anteriores pueden ser eliminados</li>
                  {permanent && (
                    <li className="font-bold">El baneo es permanente y no puede ser revertido</li>
                  )}
                  {!permanent && bannedUntil && (
                    <li>Podrás volver a acceder a tu cuenta después del {formatDate(bannedUntil)}</li>
                  )}
                </ul>
              </div>

              {!permanent && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2 text-sm">
                    ⚠️ Para evitar futuros problemas
                  </h4>
                  <ul className="text-xs text-amber-800 dark:text-amber-300 space-y-1 list-disc list-inside">
                    <li>Respeta las normas de la comunidad</li>
                    <li>Evita lenguaje ofensivo o discriminatorio</li>
                    <li>No publiques spam o contenido inapropiado</li>
                    <li>Mantén un tono respetuoso en tus interacciones</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}

