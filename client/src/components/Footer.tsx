import { Link } from 'react-router-dom'
import { Heart, Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { isAuthenticated } = useAuth()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <Heart className="w-8 h-8 text-purple-500 mr-3" />
              <span className="text-2xl font-bold">Demos+</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Conectando corazones, transformando vidas. Nuestra plataforma facilita la solidaridad 
              y crea un impacto positivo en el mundo conectando personas con organizaciones sin fines de lucro.
            </p>
            
            {/* Redes sociales */}
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/mission" className="text-gray-300 hover:text-white transition-colors">
                  Nuestra Misión
                </Link>
              </li>
              {isAuthenticated && (
                <>
                  <li>
                    <Link to="/map" className="text-gray-300 hover:text-white transition-colors">
                      Mapa
                    </Link>
                  </li>
                  <li>
                    <Link to="/ranking" className="text-gray-300 hover:text-white transition-colors">
                      Ranking
                    </Link>
                  </li>
                  <li>
                    <Link to="/forum" className="text-gray-300 hover:text-white transition-colors">
                      Foro
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-300">
                <Mail className="w-4 h-4 mr-3 text-purple-400" />
                <a href="mailto:info@demos.org" className="hover:text-white transition-colors">
                  info@demos.org
                </a>
              </li>
              <li className="flex items-center text-gray-300">
                <Phone className="w-4 h-4 mr-3 text-purple-400" />
                <a href="tel:+5491112345678" className="hover:text-white transition-colors">
                  +54 9 11 1234-5678
                </a>
              </li>
              <li className="flex items-start text-gray-300">
                <MapPin className="w-4 h-4 mr-3 mt-1 text-purple-400" />
                <span>
                  Buenos Aires, Argentina<br />
                  Av. Corrientes 1234
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Demos+. Todos los derechos reservados.
            </p>
            
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Política de Privacidad
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Términos de Servicio
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
                Política de Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 