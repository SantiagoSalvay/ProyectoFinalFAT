import { Link } from 'react-router-dom'
import { Heart, Shield, Users, Globe, FileText, Mail } from 'lucide-react'

export default function TermsPage() {
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
            Términos y Servicios
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
            Conoce nuestros términos de uso y políticas que rigen la plataforma Demos+
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Introducción */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Bienvenido a Demos+
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Estos términos y condiciones ("Términos") rigen el uso de la plataforma Demos+ 
              ("Plataforma", "Servicio") operada por nosotros ("nosotros", "nuestro", "la empresa"). 
              Al acceder o usar nuestro servicio, usted acepta estar sujeto a estos términos.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Misión y Propósito */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <Heart className="w-8 h-8 text-purple-600 mr-3" />
              Nuestra Misión
            </h2>
            <div className="bg-purple-50 p-6 rounded-lg mb-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                Conectar personas con causas que importan, facilitando la solidaridad y creando 
                un impacto positivo en el mundo. Creemos que la tecnología puede ser una herramienta 
                poderosa para conectar a las personas con las causas que les importan.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  El Problema que Resolvemos
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Muchas personas quieren ayudar pero no saben cómo o dónde</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Las organizaciones tienen dificultades para conectar con voluntarios y donantes</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Falta de transparencia en el uso de donaciones</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Barreras geográficas y de información</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Nuestra Solución
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Plataforma que conecta directamente personas con organizaciones</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Sistema de verificación y transparencia para todas las organizaciones</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Herramientas para seguimiento del impacto de las donaciones</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Comunidad global de personas comprometidas con el cambio social</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Valores */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <Shield className="w-8 h-8 text-purple-600 mr-3" />
              Nuestros Valores y Principios
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Solidaridad
                </h3>
                <p className="text-gray-600">
                  Creemos en el poder de la colaboración y el apoyo mutuo para 
                  crear un mundo mejor para todos.
                </p>
              </div>
              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-white" />
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
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Impacto Global
                </h3>
                <p className="text-gray-600">
                  Trabajamos para crear un impacto positivo que trascienda 
                  fronteras y beneficie a comunidades de todo el mundo.
                </p>
              </div>
            </div>
          </div>

          {/* Términos de Uso */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Términos de Uso
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  1. Aceptación de los Términos
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Al acceder y usar Demos+, usted acepta cumplir con estos términos y condiciones. 
                  Si no está de acuerdo con alguna parte de estos términos, no debe usar nuestro servicio.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  2. Descripción del Servicio
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Demos+ es una plataforma que conecta personas con organizaciones sin fines de lucro, 
                  facilitando donaciones, voluntariado y apoyo social. Nuestros servicios incluyen:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Conectar donantes con organizaciones verificadas</li>
                  <li>Facilitar oportunidades de voluntariado</li>
                  <li>Proporcionar herramientas de seguimiento de impacto</li>
                  <li>Crear una comunidad de personas comprometidas con el cambio social</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  3. Cuentas de Usuario
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Para usar ciertas funciones de la plataforma, debe crear una cuenta. Usted es responsable de:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Proporcionar información precisa y actualizada</li>
                  <li>Mantener la confidencialidad de su contraseña</li>
                  <li>Todas las actividades que ocurran bajo su cuenta</li>
                  <li>Notificarnos inmediatamente sobre cualquier uso no autorizado</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  4. Organizaciones Verificadas
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Todas las organizaciones en nuestra plataforma pasan por un proceso de verificación 
                  para asegurar su legitimidad y transparencia. Sin embargo, no podemos garantizar 
                  el uso específico de las donaciones por parte de las organizaciones.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  5. Donaciones y Pagos
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Las donaciones monetarias se procesan a través de proveedores de pago seguros. 
                  Usted acepta que:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Las donaciones son voluntarias y no reembolsables</li>
                  <li>Nosotros no retenemos comisiones de las donaciones</li>
                  <li>Los pagos están sujetos a los términos de los proveedores de pago</li>
                  <li>Debe proporcionar información de pago precisa y válida</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  6. Contenido del Usuario
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Usted es responsable del contenido que publique en la plataforma. Al publicar contenido, usted garantiza que:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>El contenido es suyo o tiene derecho a usarlo</li>
                  <li>El contenido no viola derechos de terceros</li>
                  <li>El contenido es apropiado y no ofensivo</li>
                  <li>El contenido cumple con nuestras políticas de comunidad</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  7. Privacidad y Protección de Datos
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Su privacidad es importante para nosotros. Consulte nuestra 
                  <Link to="/privacy" className="text-purple-600 hover:text-purple-700 underline">
                    Política de Privacidad
                  </Link> para obtener información detallada sobre cómo recopilamos, 
                  usamos y protegemos su información personal.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  8. Limitación de Responsabilidad
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Demos+ se proporciona "tal como está" sin garantías de ningún tipo. 
                  No seremos responsables por daños directos, indirectos, incidentales o 
                  consecuentes que puedan resultar del uso de nuestro servicio.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  9. Modificaciones
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                  Los cambios entrarán en vigor inmediatamente después de su publicación en la plataforma. 
                  Su uso continuado del servicio constituye aceptación de los términos modificados.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  10. Terminación
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Podemos terminar o suspender su cuenta en cualquier momento por violación 
                  de estos términos o por cualquier otra razón a nuestra discreción.
                </p>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <Mail className="w-8 h-8 text-purple-600 mr-3" />
              Contacto
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 leading-relaxed mb-4">
                Si tiene preguntas sobre estos términos y condiciones, por favor contáctenos:
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@demosplus.com
                </p>
                <p className="text-gray-700">
                  <strong>Dirección:</strong> Córdoba, Argentina
                </p>
                <p className="text-gray-700">
                  <strong>Horario de atención:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM (GMT-3)
                </p>
              </div>
            </div>
          </div>

          {/* Impacto */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Nuestro Impacto
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Juntos estamos creando un cambio real y medible en el mundo:
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
                <div className="text-gray-600">Organizaciones Verificadas</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600 mb-2">10K+</div>
                <div className="text-gray-600">Voluntarios Activos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">$2M+</div>
                <div className="text-gray-600">En Donaciones</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">50K+</div>
                <div className="text-gray-600">Vidas Impactadas</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para hacer la diferencia?
            </h2>
            <p className="text-xl text-purple-100 mb-6">
              Únete a nuestra comunidad y comienza a crear un impacto positivo hoy mismo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Crear Cuenta
              </Link>
              <Link
                to="/"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-purple-600 transition-colors"
              >
                Explorar ONGs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
