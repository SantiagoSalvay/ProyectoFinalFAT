import { Link } from 'react-router-dom'
import { Heart, Shield, Users, Globe, Lock, Eye, Database, Mail, Phone, MapPin } from 'lucide-react'

export default function PrivacyPage() {
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
            Política de Privacidad
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
            Protegemos tu privacidad y datos personales con los más altos estándares de seguridad
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Introducción */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Compromiso con tu Privacidad
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              En Demos+, valoramos profundamente tu privacidad y nos comprometemos a proteger 
              tu información personal. Esta Política de Privacidad explica cómo recopilamos, 
              usamos, almacenamos y protegemos tu información cuando utilizas nuestra plataforma.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Misión y Valores */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Heart className="w-8 h-8 text-purple-600 mr-3" />
              Nuestros Valores de Privacidad
            </h2>
            <div className="bg-purple-50 p-6 rounded-lg mb-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                Creemos que la transparencia y la protección de datos son fundamentales para 
                construir confianza en nuestra comunidad. Nuestra misión de conectar personas 
                con causas que importan solo puede lograrse cuando nuestros usuarios se sienten 
                seguros y protegidos.
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
                  Mantenemos la transparencia en todas nuestras operaciones y 
                  facilitamos el seguimiento del impacto de las donaciones.
                </p>
              </div>
              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Seguridad
                </h3>
                <p className="text-gray-600">
                  Implementamos las mejores prácticas de seguridad para proteger 
                  tu información personal y financiera.
                </p>
              </div>
              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Control del Usuario
                </h3>
                <p className="text-gray-600">
                  Tú tienes control total sobre tu información personal y puedes 
                  modificarla o eliminarla en cualquier momento.
                </p>
              </div>
            </div>
          </div>

          {/* Información que Recopilamos */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <Database className="w-8 h-8 text-purple-600 mr-3" />
              Información que Recopilamos
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  1. Información Personal
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Recopilamos información que nos proporcionas directamente cuando:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Creas una cuenta (nombre, apellido, email)</li>
                  <li>Completas tu perfil (ubicación, biografía, teléfono)</li>
                  <li>Realizas donaciones (información de pago)</li>
                  <li>Participas en actividades de voluntariado</li>
                  <li>Contactas nuestro servicio de atención al cliente</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  2. Información de Uso
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Recopilamos automáticamente información sobre cómo usas nuestra plataforma:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Páginas visitadas y tiempo de permanencia</li>
                  <li>Actividades realizadas en la plataforma</li>
                  <li>Dispositivo y navegador utilizado</li>
                  <li>Dirección IP y ubicación geográfica general</li>
                  <li>Cookies y tecnologías similares</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  3. Información de Organizaciones
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Para organizaciones verificadas, también recopilamos información adicional 
                  como documentos de verificación, información fiscal y detalles de contacto 
                  para garantizar la transparencia y legitimidad.
                </p>
              </div>
            </div>
          </div>

          {/* Cómo Usamos tu Información */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <Eye className="w-8 h-8 text-purple-600 mr-3" />
              Cómo Usamos tu Información
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  1. Proporcionar y Mejorar Nuestros Servicios
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Conectar donantes con organizaciones verificadas</li>
                  <li>Facilitar oportunidades de voluntariado</li>
                  <li>Proporcionar herramientas de seguimiento de impacto</li>
                  <li>Mejorar la funcionalidad y experiencia del usuario</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  2. Comunicación
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Enviar confirmaciones de donaciones y actividades</li>
                  <li>Notificar sobre nuevas oportunidades de voluntariado</li>
                  <li>Proporcionar actualizaciones sobre el impacto de tus donaciones</li>
                  <li>Responder a consultas y solicitudes de soporte</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  3. Seguridad y Cumplimiento
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Verificar identidades y prevenir fraudes</li>
                  <li>Cumplir con obligaciones legales y regulatorias</li>
                  <li>Proteger los derechos y seguridad de nuestros usuarios</li>
                  <li>Investigar y prevenir actividades ilegales</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  4. Análisis y Desarrollo
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Analizar patrones de uso para mejorar nuestros servicios</li>
                  <li>Desarrollar nuevas funcionalidades</li>
                  <li>Generar estadísticas agregadas y anónimas</li>
                  <li>Realizar investigaciones sobre impacto social</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Compartir Información */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Cuándo Compartimos tu Información
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Nunca Vendemos tu Información Personal
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  No vendemos, alquilamos ni comercializamos tu información personal a terceros 
                  para fines comerciales. Tu privacidad es sagrada para nosotros.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Compartimos Información Solo Cuando:
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li><strong>Con organizaciones verificadas:</strong> Para facilitar donaciones y voluntariado</li>
                  <li><strong>Con proveedores de servicios:</strong> Para procesar pagos y operar la plataforma</li>
                  <li><strong>Por requerimiento legal:</strong> Cuando la ley lo exija</li>
                  <li><strong>Para proteger derechos:</strong> Para proteger nuestros derechos o los de otros usuarios</li>
                  <li><strong>Con tu consentimiento:</strong> Cuando explícitamente nos autorices</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Seguridad de Datos */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Seguridad de tus Datos
            </h2>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Implementamos múltiples capas de seguridad para proteger tu información:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Seguridad Técnica</h4>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Encriptación SSL/TLS para todas las comunicaciones</li>
                    <li>• Almacenamiento seguro de contraseñas</li>
                    <li>• Sistemas de monitoreo y detección de intrusiones</li>
                    <li>• Copias de seguridad regulares y seguras</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Prácticas Organizacionales</h4>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Acceso limitado solo al personal autorizado</li>
                    <li>• Capacitación regular en seguridad de datos</li>
                    <li>• Auditorías de seguridad periódicas</li>
                    <li>• Políticas estrictas de manejo de datos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Tus Derechos */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Tus Derechos sobre tus Datos
            </h2>
            
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Derecho de Acceso
                </h3>
                <p className="text-gray-600">
                  Puedes solicitar una copia de toda la información personal que tenemos sobre ti.
                </p>
              </div>
              
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Derecho de Rectificación
                </h3>
                <p className="text-gray-600">
                  Puedes corregir o actualizar cualquier información inexacta o incompleta.
                </p>
              </div>
              
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Derecho de Eliminación
                </h3>
                <p className="text-gray-600">
                  Puedes solicitar la eliminación de tu información personal en ciertas circunstancias.
                </p>
              </div>
              
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Derecho de Portabilidad
                </h3>
                <p className="text-gray-600">
                  Puedes solicitar que transfiramos tu información a otro servicio.
                </p>
              </div>
              
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Derecho de Oposición
                </h3>
                <p className="text-gray-600">
                  Puedes oponerte al procesamiento de tu información para ciertos fines.
                </p>
              </div>
            </div>
          </div>

          {/* Cookies */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Cookies y Tecnologías Similares
            </h2>
            
            <div className="space-y-6">
              <p className="text-gray-600 leading-relaxed">
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestra plataforma. 
                Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Cookies Esenciales
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Necesarias para el funcionamiento básico de la plataforma, como mantener 
                    tu sesión iniciada y recordar tus preferencias.
                  </p>
                </div>
                
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Cookies Analíticas
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Nos ayudan a entender cómo los usuarios interactúan con nuestra plataforma 
                    para poder mejorarla.
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                Puedes controlar las cookies a través de la configuración de tu navegador. 
                Sin embargo, deshabilitar ciertas cookies puede afectar la funcionalidad de la plataforma.
              </p>
            </div>
          </div>

          {/* Retención de Datos */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Retención de Datos
            </h2>
            
            <div className="space-y-6">
              <p className="text-gray-600 leading-relaxed">
                Conservamos tu información personal solo durante el tiempo necesario para cumplir 
                con los propósitos descritos en esta política, a menos que la ley requiera 
                un período de retención más largo.
              </p>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Períodos de Retención Típicos:
                </h3>
                <ul className="text-gray-600 space-y-2">
                  <li><strong>Cuentas activas:</strong> Mientras tu cuenta esté activa</li>
                  <li><strong>Datos de donaciones:</strong> 7 años (requerimiento fiscal)</li>
                  <li><strong>Datos de voluntariado:</strong> 3 años después de la última actividad</li>
                  <li><strong>Datos de comunicación:</strong> 2 años</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Menores de Edad */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Protección de Menores
            </h2>
            
            <div className="bg-yellow-50 p-6 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos 
                intencionalmente información personal de menores de edad. Si descubrimos que hemos 
                recopilado información de un menor, la eliminaremos inmediatamente.
              </p>
            </div>
          </div>

          {/* Cambios en la Política */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Cambios en esta Política
            </h2>
            
            <p className="text-gray-600 leading-relaxed">
              Podemos actualizar esta Política de Privacidad ocasionalmente para reflejar cambios 
              en nuestras prácticas o por razones legales. Te notificaremos sobre cambios significativos 
              a través de la plataforma o por email. Te recomendamos revisar esta política periódicamente.
            </p>
          </div>

          {/* Contacto */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <Mail className="w-8 h-8 text-purple-600 mr-3" />
              Contacto y Consultas
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 leading-relaxed mb-4">
                Si tienes preguntas sobre esta Política de Privacidad o sobre cómo manejamos tu información, 
                por favor contáctanos:
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-gray-700">
                    <strong>Email:</strong> privacy@demosplus.com
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-gray-700">
                    <strong>Teléfono:</strong> +54 351 XXX-XXXX
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-gray-700">
                    <strong>Dirección:</strong> Córdoba, Argentina
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-4">
                <strong>Horario de atención:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM (GMT-3)
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Tu Privacidad es Nuestra Prioridad
            </h2>
            <p className="text-xl text-purple-100 mb-6">
              Únete a nuestra comunidad segura y transparente para crear un impacto positivo en el mundo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Crear Cuenta Segura
              </Link>
              <Link
                to="/terms"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-purple-600 transition-colors"
              >
                Ver Términos de Servicio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
