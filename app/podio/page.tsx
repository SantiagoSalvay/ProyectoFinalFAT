"use client"

import Link from "next/link"
import { Trophy, Star, Users, Heart, TrendingUp } from "lucide-react"

const ongRanking = [
  {
    id: 1,
    nombre: "Manos Unidas",
    categoria: "Desarrollo Social",
    puntuacion: 4.9,
    donaciones: 125000,
    voluntarios: 450,
    proyectos: 23,
    imagen: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    nombre: "Fundación Esperanza",
    categoria: "Educación",
    puntuacion: 4.8,
    donaciones: 98000,
    voluntarios: 320,
    proyectos: 18,
    imagen: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 3,
    nombre: "Corazones Solidarios",
    categoria: "Salud",
    puntuacion: 4.7,
    donaciones: 87500,
    voluntarios: 280,
    proyectos: 15,
    imagen: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 4,
    nombre: "Verde Futuro",
    categoria: "Medio Ambiente",
    puntuacion: 4.6,
    donaciones: 76000,
    voluntarios: 195,
    proyectos: 12,
    imagen: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 5,
    nombre: "Justicia Para Todos",
    categoria: "Derechos Humanos",
    puntuacion: 4.5,
    donaciones: 65000,
    voluntarios: 150,
    proyectos: 9,
    imagen: "/placeholder.svg?height=80&width=80",
  },
]

export default function PodioPage() {
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-[#2b555f] mb-4">PODIO DE ONGs</h1>
            <p className="text-xl text-[#2b555f]">Ranking de las organizaciones más destacadas</p>
          </div>

          {/* Estadísticas generales */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-[#73e4fd] bg-opacity-20 rounded-lg p-6 text-center">
              <Trophy className="w-8 h-8 text-[#2b555f] mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-[#2b555f]">127</h3>
              <p className="text-[#2b555f]">ONGs Registradas</p>
            </div>
            <div className="bg-[#73e4fd] bg-opacity-20 rounded-lg p-6 text-center">
              <Heart className="w-8 h-8 text-[#2b555f] mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-[#2b555f]">$451,500</h3>
              <p className="text-[#2b555f]">Total Donado</p>
            </div>
            <div className="bg-[#73e4fd] bg-opacity-20 rounded-lg p-6 text-center">
              <Users className="w-8 h-8 text-[#2b555f] mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-[#2b555f]">1,395</h3>
              <p className="text-[#2b555f]">Voluntarios Activos</p>
            </div>
            <div className="bg-[#73e4fd] bg-opacity-20 rounded-lg p-6 text-center">
              <TrendingUp className="w-8 h-8 text-[#2b555f] mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-[#2b555f]">77</h3>
              <p className="text-[#2b555f]">Proyectos Activos</p>
            </div>
          </div>

          {/* Podio Top 3 */}
          <div className="flex justify-center items-end mb-12 space-x-8">
            {/* Segundo lugar */}
            <div className="text-center">
              <div className="bg-gray-300 rounded-lg p-6 mb-4 h-32 flex items-center justify-center">
                <img
                  src={ongRanking[1].imagen || "/placeholder.svg"}
                  alt={ongRanking[1].nombre}
                  className="w-16 h-16 rounded-full"
                />
              </div>
              <div className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold text-lg">2°</div>
              <h3 className="font-bold text-[#2b555f] mt-2">{ongRanking[1].nombre}</h3>
              <p className="text-sm text-[#2b555f]">{ongRanking[1].categoria}</p>
            </div>

            {/* Primer lugar */}
            <div className="text-center">
              <div className="bg-yellow-400 rounded-lg p-6 mb-4 h-40 flex items-center justify-center">
                <img
                  src={ongRanking[0].imagen || "/placeholder.svg"}
                  alt={ongRanking[0].nombre}
                  className="w-20 h-20 rounded-full"
                />
              </div>
              <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg font-bold text-xl">1°</div>
              <h3 className="font-bold text-[#2b555f] mt-2 text-lg">{ongRanking[0].nombre}</h3>
              <p className="text-sm text-[#2b555f]">{ongRanking[0].categoria}</p>
            </div>

            {/* Tercer lugar */}
            <div className="text-center">
              <div className="bg-orange-300 rounded-lg p-6 mb-4 h-24 flex items-center justify-center">
                <img
                  src={ongRanking[2].imagen || "/placeholder.svg"}
                  alt={ongRanking[2].nombre}
                  className="w-12 h-12 rounded-full"
                />
              </div>
              <div className="bg-orange-300 text-orange-900 px-4 py-2 rounded-lg font-bold">3°</div>
              <h3 className="font-bold text-[#2b555f] mt-2">{ongRanking[2].nombre}</h3>
              <p className="text-sm text-[#2b555f]">{ongRanking[2].categoria}</p>
            </div>
          </div>

          {/* Ranking completo */}
          <div className="bg-white border-2 border-[#2b555f] rounded-2xl overflow-hidden">
            <div className="bg-[#2b555f] text-white p-4">
              <h2 className="text-2xl font-bold text-center">Ranking Completo</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {ongRanking.map((ong, index) => (
                <div key={ong.id} className="p-6 hover:bg-[#73e4fd] hover:bg-opacity-10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-[#2b555f] w-8">{index + 1}°</div>
                      <img src={ong.imagen || "/placeholder.svg"} alt={ong.nombre} className="w-12 h-12 rounded-full" />
                      <div>
                        <h3 className="font-bold text-[#2b555f] text-lg">{ong.nombre}</h3>
                        <p className="text-[#2b555f] text-sm">{ong.categoria}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="font-bold text-[#2b555f]">{ong.puntuacion}</span>
                        </div>
                        <p className="text-xs text-[#2b555f]">Puntuación</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-[#2b555f]">${ong.donaciones.toLocaleString()}</p>
                        <p className="text-xs text-[#2b555f]">Donaciones</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-[#2b555f]">{ong.voluntarios}</p>
                        <p className="text-xs text-[#2b555f]">Voluntarios</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-[#2b555f]">{ong.proyectos}</p>
                        <p className="text-xs text-[#2b555f]">Proyectos</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
