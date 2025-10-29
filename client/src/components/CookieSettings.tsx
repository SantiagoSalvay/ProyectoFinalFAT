import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Cookie, Settings, RotateCcw, Info, Check, XCircle } from 'lucide-react'
import { useCookies } from '../hooks/useCookies'

export default function CookieSettings() {
  const {
    accepted,
    acceptAll,
    rejectAll,
    clearAllCookies,
    showBannerAgain
  } = useCookies()

  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleReset = () => {
    clearAllCookies()
    setShowResetConfirm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Cookie className="w-6 h-6 text-purple-600" />
            Configuración de Cookies
          </h2>
          <p className="text-gray-600 mt-1">
            Controla el uso de cookies en nuestra plataforma
          </p>
        </div>
        <Link
          to="/cookies"
          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          Ver política completa →
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">
              ¿Qué son las cookies?
            </h3>
            <p className="text-blue-800 text-sm">
              Las cookies son pequeños archivos que se almacenan en tu dispositivo para mejorar 
              tu experiencia en nuestra plataforma. Puedes aceptar o rechazar su uso.
            </p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Estado Actual
        </h3>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-4 h-4 rounded-full ${accepted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className="text-gray-700">
            {accepted ? 'Cookies aceptadas' : 'Cookies rechazadas'}
          </span>
        </div>
        <p className="text-gray-600 text-sm">
          {accepted 
            ? 'Actualmente aceptas el uso de cookies para funcionalidad, análisis y personalización.'
            : 'Actualmente solo utilizamos cookies esenciales para el funcionamiento básico de la plataforma.'
          }
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={acceptAll}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          <Check className="w-4 h-4" />
          Aceptar Cookies
        </button>
        
        <button
          onClick={rejectAll}
          className="flex items-center justify-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          <XCircle className="w-4 h-4" />
          Rechazar Cookies
        </button>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          Restablecer Todo
        </button>

        <button
          onClick={showBannerAgain}
          className="flex items-center justify-center gap-2 px-6 py-3 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors font-medium"
        >
          <Settings className="w-4 h-4" />
          Mostrar Banner Nuevamente
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Restablecer configuración de cookies?
            </h3>
            <p className="text-gray-600 mb-4">
              Esto eliminará todas tus preferencias de cookies y volverás a ver 
              el banner de cookies. ¿Estás seguro?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sí, restablecer
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
