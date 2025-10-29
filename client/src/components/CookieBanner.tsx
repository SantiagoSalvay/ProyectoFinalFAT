import React from 'react'
import { Link } from 'react-router-dom'
import { Cookie, Check, XCircle } from 'lucide-react'
import { useCookies } from '../hooks/useCookies'

export default function CookieBanner() {
  const {
    showBanner,
    acceptAll,
    rejectAll
  } = useCookies()

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                🍪 Utilizamos cookies para mejorar tu experiencia
              </h3>
              <p className="text-gray-600 text-sm">
                Utilizamos cookies para el funcionamiento de la plataforma, análisis y personalización. 
                Puedes aceptar o rechazar su uso.
              </p>
              <div className="mt-2 text-xs text-gray-500">
                <Link to="/cookies" className="text-purple-600 hover:text-purple-700 underline">
                  Más información sobre cookies
                </Link>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={rejectAll}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Rechazar
            </button>
            <button
              onClick={acceptAll}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Check className="w-4 h-4" />
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
