"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, Search, Filter, Phone, Mail, Globe } from "lucide-react"

const ongsEnMapa = [
  {
    id: 1,
    nombre: "Manos Unidas",
    categoria: "Desarrollo Social",
    ubicacion: "Buenos Aires, Argentina",
    coordenadas: { lat: -34.6037, lng: -58.3816 },
    telefono: "+54 11 1234-5678",
    email: "contacto@manosunidas.org",
    web: "www.manosunidas.org",
    descripcion: "Ayudamos a comunidades vulnerables con programas de desarrollo integral.",
  },
  {
    id: 2,
    nombre: "Fundación Esperanza",
    categoria: "Educación",
    ubicacion: "Córdoba, Argentina",
    coordenadas: { lat: -31.4201, lng: -64.1888 },
    telefono: "+54 351 987-6543",
    email: "info@esperanza.org",
    web: "www.esperanza.org",
    descripcion: "Brindamos educación de calidad a niños en situación de vulnerabilidad.",
  },
  {
    id: 3,
    nombre: "Corazones Solidarios",
    categoria: "Salud",
    ubicacion: "Rosario, Argentina",
    coordenadas: { lat: -32.9442, lng: -60.6505 },
    telefono: "+54 341 555-0123",
    email: "salud@corazones.org",
    web: "www.corazones.org",
    descripcion: "Proporcionamos atención médica gratuita en comunidades rurales.",
  },
  {
    id: 4,
    nombre: "Verde Futuro",
    categoria: "Medio Ambiente",
    ubicacion: "Mendoza, Argentina",
    coordenadas: { lat: -32.8895, lng: -68.8458 },
    telefono: "+54 261 444-7890",
    email: "ambiente@verdefuturo.org",
    web: "www.verdefuturo.org",
    descripcion: "Protegemos el medio ambiente y promovemos la sustentabilidad.",
  },
]

export default function MapaPage() {
  const [selectedOng, setSelectedOng] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("todas")

  const filteredOngs = ongsEnMapa.filter((ong) => {
    const matchesSearch =
      ong.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ong.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "todas" || ong.categoria === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["todas", ...Array.from(new Set(ongsEnMapa.map((ong) => ong.categoria)))]

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#73e4fd] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/main-dashboard" className="text-4xl md:text-5xl font-bold text-[#2b555f]">
            DEMOS+
          </Link>
          <Link
            href="/main-dashboard"
            className="border-2 border-[#2b555f] text-[#2b555f] px-6 py-2 rounded-lg font-semibold hover:bg-[#2b555f] hover:text-white transition-colors"
          >
            VOLVER
          </Link>
        </div>
      </header>

      <main className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-[#2b555f] mb-4">MAPA DE ONGs</h1>
            <p className="text-xl text-[#2b555f]">Encuentra organizaciones cerca de ti</p>
          </div>

          {/* Filtros y búsqueda */}
          <div className="bg-[#73e4fd] bg-opacity-20 rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#2b555f]" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#2b555f]" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 border-2 border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d] bg-white"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "todas" ? "Todas las categorías" : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Lista de ONGs */}
            <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto">
              <h2 className="text-2xl font-bold text-[#2b555f] mb-4">ONGs Encontradas ({filteredOngs.length})</h2>
              {filteredOngs.map((ong) => (
                <div
                  key={ong.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedOng === ong.id
                      ? "border-[#00445d] bg-[#73e4fd] bg-opacity-20"
                      : "border-[#2b555f] hover:border-[#00445d]"
                  }`}
                  onClick={() => setSelectedOng(ong.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-[#2b555f]">{ong.nombre}</h3>
                    <MapPin className="w-5 h-5 text-[#2b555f] flex-shrink-0" />
                  </div>
                  <p className="text-sm text-[#2b555f] bg-[#73e4fd] bg-opacity-30 px-2 py-1 rounded-full inline-block mb-2">
                    {ong.categoria}
                  </p>
                  <p className="text-sm text-[#2b555f] mb-2">{ong.ubicacion}</p>
                  <p className="text-xs text-[#2b555f]">{ong.descripcion}</p>
                </div>
              ))}
            </div>

            {/* Mapa real de Google Maps */}
            <div className="lg:col-span-2">
              <div className="bg-[#73e4fd] bg-opacity-10 rounded-lg overflow-hidden">
                <h3 className="text-xl font-bold text-[#2b555f] p-4 bg-white bg-opacity-50">Mapa Interactivo</h3>

                {/* Google Maps iframe */}
                <div className="relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27255.215401610676!2d-64.27770880779302!3d-31.36168550868848!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x943298ceee5aebb9%3A0xa1a6cf96ea9389e6!2sFundaci%C3%B3n%20ACTUM!5e0!3m2!1ses!2sar!4v1750768527869!5m2!1ses!2sar"
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full"
                  />
                </div>

                {/* Información de la ONG seleccionada */}
                {selectedOng && (
                  <div className="p-4 bg-white bg-opacity-90">
                    {(() => {
                      const ong = ongsEnMapa.find((o) => o.id === selectedOng)
                      return ong ? (
                        <div>
                          <h4 className="text-lg font-bold text-[#2b555f] mb-2">{ong.nombre}</h4>
                          <p className="text-sm text-[#2b555f] mb-3">{ong.descripcion}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 text-[#2b555f] mr-2" />
                              <span className="text-[#2b555f]">{ong.telefono}</span>
                            </div>
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 text-[#2b555f] mr-2" />
                              <span className="text-[#2b555f]">{ong.email}</span>
                            </div>
                            <div className="flex items-center">
                              <Globe className="w-4 h-4 text-[#2b555f] mr-2" />
                              <span className="text-[#2b555f]">{ong.web}</span>
                            </div>
                          </div>
                        </div>
                      ) : null
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
