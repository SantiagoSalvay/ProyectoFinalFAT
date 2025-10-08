import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Users, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/images/imagenhome1.jpg)',
              filter: 'blur(1px) brightness(0.75)',
            }}
        ></div>
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 z-10">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 bg-white/10 backdrop-blur-sm text-white border border-white/20">
                <Heart className="w-4 h-4 mr-2" />
                Conectando corazones, transformando vidas
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
              <span className="bg-gradient-to-r from-purple-300 to-purple-400 bg-clip-text text-transparent">
                Demos+
              </span>
              <br />
              <span className="text-white/90">Plataforma de</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-400 bg-clip-text text-transparent">
                Solidaridad
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed text-white/90">
              Únete a nuestra comunidad donde las personas y organizaciones trabajan juntas 
              para crear un impacto positivo en el mundo. Donar, hacer voluntariado y 
              conectar con causas que importan.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="btn-primary text-lg px-8 py-4 flex items-center bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Comenzar Ahora
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/mission"
                    className="btn-secondary text-lg px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  >
                    Conoce Nuestra Misión
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="btn-primary text-lg px-8 py-4 flex items-center bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Ir al Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" style={{ backgroundColor: 'var(--color-card)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-fg)' }}>
              ¿Por qué elegir Demos+?
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
              Nuestra plataforma está diseñada para facilitar la conexión entre 
              personas que quieren ayudar y organizaciones que necesitan apoyo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-8 text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-fg)' }}>
                Donaciones Transparentes
              </h3>
              <p style={{ color: 'var(--color-muted)' }}>
                Conecta directamente con organizaciones verificadas y sigue el impacto 
                de tus donaciones en tiempo real.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-8 text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-fg)' }}>
                Voluntariado Activo
              </h3>
              <p style={{ color: 'var(--color-muted)' }}>
                Encuentra oportunidades de voluntariado que se adapten a tus habilidades 
                y horarios disponibles.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-8 text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-fg)' }}>
                Comunidad Solidaria
              </h3>
              <p style={{ color: 'var(--color-muted)' }}>
                Únete a una comunidad de personas comprometidas con el cambio social 
                y comparte experiencias.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Nuestro Impacto
            </h2>
            <p className="text-xl text-purple-100">
              Juntos estamos creando un mundo mejor
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-purple-200">Organizaciones</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-purple-200">Voluntarios</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">$2M+</div>
              <div className="text-purple-200">Donaciones</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50K+</div>
              <div className="text-purple-200">Vidas Impactadas</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Solo para usuarios no autenticados */}
      {!isAuthenticated && (
        <section className="py-20" style={{ backgroundColor: 'var(--color-bg)' }}>
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold mb-6" style={{ color: 'var(--color-fg)' }}>
              ¿Listo para hacer la diferencia?
            </h2>
            <p className="text-xl mb-8" style={{ color: 'var(--color-muted)' }}>
              Únete a miles de personas que ya están creando un impacto positivo 
              en sus comunidades y en el mundo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-4"
              >
                Registrarse Ahora
              </Link>
              <Link
                to="/login"
                className="btn-secondary text-lg px-8 py-4"
              >
                Ya Tengo Cuenta
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
} 