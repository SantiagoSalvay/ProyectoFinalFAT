import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Users, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: 'color-mix(in oklab, var(--accent) 16%, transparent)', color: 'var(--color-fg)', border: '1px solid var(--color-border)' }}>
                <Heart className="w-4 h-4 mr-2" />
                Conectando corazones, transformando vidas
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ color: 'var(--color-fg)' }}>
              <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                Demos+
              </span>
              <br />
              <span style={{ color: 'var(--color-muted)' }}>Plataforma de</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                Solidaridad
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Únete a nuestra comunidad donde las personas y organizaciones trabajan juntas 
              para crear un impacto positivo en el mundo. Donar, hacer voluntariado y 
              conectar con causas que importan.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-4 flex items-center"
              >
                Comenzar Ahora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/mission"
                className="btn-secondary text-lg px-8 py-4"
              >
                Conoce Nuestra Misión
              </Link>
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

      {/* CTA Section */}
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
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 