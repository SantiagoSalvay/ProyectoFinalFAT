import { Link } from 'react-router-dom'
import { Heart, Shield, Cookie, Settings, Eye, Database, Lock, Globe } from 'lucide-react'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-purple-800 py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Política de Cookies
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
            Entiende cómo utilizamos las cookies para mejorar tu experiencia en Demos+
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Introducción */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              ¿Qué son las Cookies?
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo 
              cuando visitas nuestra plataforma. Nos ayudan a recordar tus preferencias, 
              mejorar tu experiencia de navegación y analizar cómo utilizas nuestros servicios.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Valores y Compromiso */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Heart className="w-8 h-8 text-purple-600 mr-3" />
              Nuestro Compromiso con la Transparencia
            </h2>
            <div className="bg-purple-50 p-6 rounded-lg mb-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                En Demos+, creemos en la transparencia total sobre cómo utilizamos las cookies. 
                Nuestra misión de conectar personas con causas que importan solo puede lograrse 
                cuando nuestros usuarios comprenden y controlan su experiencia digital.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Transparencia
                </h3>
                <p className="text-gray-600">
                  Te explicamos claramente qué cookies utilizamos y por qué, 
                  sin jerga técnica innecesaria.
                </p>
              </div>
              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Control Total
                </h3>
                <p className="text-gray-600">
                  Tú decides qué cookies aceptar y puedes cambiar 
                  tus preferencias en cualquier momento.
                </p>
              </div>
              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Privacidad
                </h3>
                <p className="text-gray-600">
                  Respetamos tu privacidad y solo utilizamos cookies 
                  que son necesarias o que has aceptado explícitamente.
                </p>
              </div>
            </div>
          </div>

          {/* Tipos de Cookies */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <Cookie className="w-8 h-8 text-purple-600 mr-3" />
              Tipos de Cookies que Utilizamos
            </h2>
            
            <div className="space-y-8">
              {/* Cookies Esenciales */}
              <div className="card p-6 border-l-4 border-green-500">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Lock className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Cookies Esenciales
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Estas cookies son absolutamente necesarias para el funcionamiento básico 
                      de nuestra plataforma. No se pueden desactivar.
                    </p>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">¿Qué hacen?</h4>
                      <ul className="text-gray-600 space-y-1 text-sm">
                        <li>• Mantener tu sesión iniciada</li>
                        <li>• Recordar tus preferencias de idioma</li>
                        <li>• Garantizar la seguridad de la plataforma</li>
                        <li>• Permitir el funcionamiento de formularios</li>
                      </ul>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      <strong>Duración:</strong> Sesión o hasta 1 año
                    </div>
                  </div>
                </div>
              </div>

              {/* Cookies de Rendimiento */}
              <div className="card p-6 border-l-4 border-blue-500">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Cookies de Rendimiento y Análisis
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Estas cookies nos ayudan a entender cómo los usuarios interactúan 
                      con nuestra plataforma para poder mejorarla.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">¿Qué hacen?</h4>
                      <ul className="text-gray-600 space-y-1 text-sm">
                        <li>• Contar visitantes y páginas vistas</li>
                        <li>• Identificar páginas más populares</li>
                        <li>• Medir el tiempo de permanencia</li>
                        <li>• Detectar errores y problemas técnicos</li>
                        <li>• Analizar patrones de navegación</li>
                      </ul>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      <strong>Duración:</strong> Hasta 2 años
                    </div>
                    <div className="mt-2 text-sm text-blue-600">
                      <strong>Puedes desactivarlas:</strong> Sí, pero esto puede afectar la funcionalidad
                    </div>
                  </div>
                </div>
              </div>

              {/* Cookies de Funcionalidad */}
              <div className="card p-6 border-l-4 border-purple-500">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Settings className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Cookies de Funcionalidad
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Estas cookies mejoran tu experiencia recordando tus preferencias 
                      y personalizando el contenido.
                    </p>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">¿Qué hacen?</h4>
                      <ul className="text-gray-600 space-y-1 text-sm">
                        <li>• Recordar tus preferencias de visualización</li>
                        <li>• Personalizar el contenido mostrado</li>
                        <li>• Recordar configuraciones de accesibilidad</li>
                        <li>• Mantener preferencias de notificaciones</li>
                        <li>• Recordar filtros y búsquedas recientes</li>
                      </ul>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      <strong>Duración:</strong> Hasta 1 año
                    </div>
                    <div className="mt-2 text-sm text-purple-600">
                      <strong>Puedes desactivarlas:</strong> Sí, pero perderás personalización
                    </div>
                  </div>
                </div>
              </div>

              {/* Cookies de Marketing */}
              <div className="card p-6 border-l-4 border-orange-500">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Globe className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Cookies de Marketing y Publicidad
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Estas cookies se utilizan para mostrar contenido relevante y 
                      medir la efectividad de nuestras campañas.
                    </p>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">¿Qué hacen?</h4>
                      <ul className="text-gray-600 space-y-1 text-sm">
                        <li>• Mostrar contenido personalizado</li>
                        <li>• Medir la efectividad de campañas</li>
                        <li>• Evitar mostrar el mismo anuncio repetidamente</li>
                        <li>• Proporcionar funciones de redes sociales</li>
                        <li>• Crear perfiles de audiencia</li>
                      </ul>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      <strong>Duración:</strong> Hasta 2 años
                    </div>
                    <div className="mt-2 text-sm text-orange-600">
                      <strong>Puedes desactivarlas:</strong> Sí, completamente opcionales
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cookies Específicas */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Cookies Específicas que Utilizamos
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                      Nombre de Cookie
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                      Propósito
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                      Tipo
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                      Duración
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">
                      demos_session
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-600">
                      Mantener la sesión del usuario
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Esencial
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-600">
                      Sesión
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">
                      demos_preferences
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-600">
                      Recordar preferencias del usuario
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        Funcionalidad
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-600">
                      1 año
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">
                      demos_analytics
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-600">
                      Análisis de uso de la plataforma
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        Análisis
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-600">
                      2 años
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">
                      demos_cookie_consent
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-600">
                      Recordar preferencias de cookies
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Esencial
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-600">
                      1 año
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Control de Cookies */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Cómo Controlar las Cookies
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Configuración en Nuestra Plataforma
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Puedes gestionar tus preferencias de cookies directamente desde nuestra plataforma:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <Settings className="w-6 h-6 text-purple-600 mr-3" />
                    <span className="font-semibold text-gray-900">Centro de Preferencias de Cookies</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Accede a tu perfil y ve a "Configuración de Privacidad" para personalizar 
                    qué tipos de cookies aceptas.
                  </p>
                  <Link 
                    to="/profile" 
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Ir a Configuración
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Configuración del Navegador
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  También puedes controlar las cookies a través de la configuración de tu navegador:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="card p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Chrome</h4>
                    <p className="text-gray-600 text-sm mb-2">
                      Configuración → Privacidad y seguridad → Cookies y otros datos del sitio
                    </p>
                    <a 
                      href="https://support.google.com/chrome/answer/95647" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 text-sm"
                    >
                      Ver guía completa →
                    </a>
                  </div>
                  <div className="card p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Firefox</h4>
                    <p className="text-gray-600 text-sm mb-2">
                      Opciones → Privacidad y seguridad → Cookies y datos del sitio
                    </p>
                    <a 
                      href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 text-sm"
                    >
                      Ver guía completa →
                    </a>
                  </div>
                  <div className="card p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Safari</h4>
                    <p className="text-gray-600 text-sm mb-2">
                      Preferencias → Privacidad → Cookies y datos de sitios web
                    </p>
                    <a 
                      href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 text-sm"
                    >
                      Ver guía completa →
                    </a>
                  </div>
                  <div className="card p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Edge</h4>
                    <p className="text-gray-600 text-sm mb-2">
                      Configuración → Cookies y permisos del sitio → Cookies y datos almacenados
                    </p>
                    <a 
                      href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 text-sm"
                    >
                      Ver guía completa →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cookies de Terceros */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Cookies de Terceros
            </h2>
            
            <div className="space-y-6">
              <p className="text-gray-600 leading-relaxed">
                Algunos de nuestros socios de confianza también pueden establecer cookies 
                en tu dispositivo. Estos incluyen:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Proveedores de Análisis
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Utilizamos Google Analytics para entender cómo los usuarios 
                    interactúan con nuestra plataforma.
                  </p>
                  <a 
                    href="https://policies.google.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 text-sm"
                  >
                    Política de Privacidad de Google →
                  </a>
                </div>
                
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Proveedores de Pago
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Nuestros procesadores de pago pueden establecer cookies 
                    para garantizar transacciones seguras.
                  </p>
                  <a 
                    href="https://www.mercadopago.com.ar/privacidad" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 text-sm"
                  >
                    Política de MercadoPago →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Impacto de Desactivar Cookies */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              ¿Qué Pasa si Desactivo las Cookies?
            </h2>
            
            <div className="bg-yellow-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ⚠️ Importante
              </h3>
              <p className="text-gray-700">
                Desactivar ciertas cookies puede afectar la funcionalidad de nuestra plataforma. 
                Te explicamos qué puedes esperar:
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Si desactivas cookies esenciales:
                </h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• No podrás iniciar sesión</li>
                  <li>• Los formularios no funcionarán correctamente</li>
                  <li>• La plataforma puede no cargar adecuadamente</li>
                  <li>• Perderás tu sesión al cerrar el navegador</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Si desactivas cookies de funcionalidad:
                </h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• No recordaremos tus preferencias</li>
                  <li>• Tendrás que configurar la plataforma cada vez</li>
                  <li>• El contenido no se personalizará</li>
                  <li>• Perderás filtros y búsquedas guardadas</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              ¿Tienes Preguntas sobre las Cookies?
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 leading-relaxed mb-4">
                Si tienes preguntas sobre nuestra política de cookies o necesitas ayuda 
                para configurar tus preferencias, no dudes en contactarnos:
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Email:</strong> cookies@demosplus.com
                </p>
                <p className="text-gray-700">
                  <strong>Teléfono:</strong> +54 351 XXX-XXXX
                </p>
                <p className="text-gray-700">
                  <strong>Horario:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM (GMT-3)
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Controla tu Experiencia Digital
            </h2>
            <p className="text-xl text-purple-100 mb-6">
              Personaliza tu experiencia en Demos+ configurando tus preferencias de cookies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/profile"
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Configurar Cookies
              </Link>
              <Link
                to="/privacy"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-purple-600 transition-colors"
              >
                Ver Política de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
