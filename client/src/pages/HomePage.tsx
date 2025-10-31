import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Users, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// Hook personalizado para animaciones al hacer scroll usando Intersection Observer
const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1, rootMargin: '-50px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  return { ref, isVisible }
}

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const { ref: featuresRef, isVisible: featuresVisible } = useScrollAnimation()
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation()
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation()
  
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 z-10 animate-fade-in">
          <div className="text-center">
            <div className="mb-6 sm:mb-8 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 transition-all duration-300">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-pulse" />
                Conectando corazones, transformando vidas
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-4 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              <span className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 bg-clip-text text-transparent inline-block animate-gradient">
                Demos+
              </span>
              <br />
              <span className="text-white/90">Plataforma de</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent inline-block animate-gradient">
                Solidaridad
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed text-white/90 px-4 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
              Únete a nuestra comunidad donde las personas y organizaciones trabajan juntas 
              para crear un impacto positivo en el mundo. Donar, hacer voluntariado y 
              conectar con causas que importan.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    Comenzar Ahora
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                  <Link
                    to="/mission"
                    className="w-full sm:w-auto btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg backdrop-blur-sm hover:scale-105 transition-all duration-300"
                  >
                    Conoce Nuestra Misión
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Ir al Dashboard
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900" ref={featuresRef}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${featuresVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="text-center mb-12 sm:mb-16" >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent">
              ¿Por qué elegir Demos+?
            </h2>
            <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-4" style={{ color: 'var(--color-muted)' }}>
              Nuestra plataforma está diseñada para facilitar la conexión entre 
              personas que quieren ayudar y organizaciones que necesitan apoyo.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg text-center group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-200 dark:border-purple-500/30">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-purple-300">
                Donaciones Transparentes
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Conecta directamente con organizaciones verificadas y sigue el impacto 
                de tus donaciones en tiempo real.
              </p>
            </div>

            {/* Feature 2 */}
            <div 
              className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg text-center group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-200 dark:border-emerald-500/30">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-emerald-300">
                Voluntariado Activo
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Encuentra oportunidades de voluntariado que se adapten a tus habilidades 
                y horarios disponibles.
              </p>
            </div>

            {/* Feature 3 */}
            <div 
              className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg text-center group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 sm:col-span-2 lg:col-span-1 border border-gray-200 dark:border-orange-500/30">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-orange-300">
                Comunidad Solidaria
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Únete a una comunidad de personas comprometidas con el cambio social 
                y comparte experiencias.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-purple-600 to-purple-800 overflow-hidden" ref={statsRef}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${statsVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="text-center mb-12 sm:mb-16" >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
              Nuestro Impacto
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-purple-100 px-4">
              Juntos estamos creando un mundo mejor
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div 
              className="text-center p-4 sm:p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-300">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">500+</div>
              <div className="text-sm sm:text-base text-purple-200">Organizaciones</div>
            </div>
            <div 
              className="text-center p-4 sm:p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-300">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">10K+</div>
              <div className="text-sm sm:text-base text-purple-200">Voluntarios</div>
            </div>
            <div 
              className="text-center p-4 sm:p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-300">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">$2M+</div>
              <div className="text-sm sm:text-base text-purple-200">Donaciones</div>
            </div>
            <div 
              className="text-center p-4 sm:p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-300 col-span-2 lg:col-span-1">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">50K+</div>
              <div className="text-sm sm:text-base text-purple-200">Vidas Impactadas</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Solo para usuarios no autenticados */}
      {!isAuthenticated && (
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-purple-50 to-emerald-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-emerald-900/20" ref={ctaRef}>
          <div className={`max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 ${ctaVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-600 via-purple-700 to-emerald-600 dark:from-purple-300 dark:via-purple-400 dark:to-emerald-400 bg-clip-text text-transparent">
              ¿Listo para hacer la diferencia?
            </h2>
            <p 
              className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 px-4 text-gray-700 dark:text-gray-300">
              Únete a miles de personas que ya están creando un impacto positivo 
              en sus comunidades y en el mundo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 dark:from-purple-500 dark:to-purple-600 dark:hover:from-purple-600 dark:hover:to-purple-700 text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium"
              >
                Registrarse Ahora
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium"
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