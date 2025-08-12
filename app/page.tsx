"use client"

import Link from "next/link"
import Header from "@/components/Header"
import HeartPin from "@/components/HeartPin"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Heart location pins */}
          <div className="absolute top-20 left-1/4">
            <HeartPin color="#73e4fd" size="lg" className="opacity-80" />
          </div>

          <div className="absolute top-32 right-1/4">
            <HeartPin color="#00445d" size="md" className="opacity-80" />
          </div>

          <div className="absolute top-16 right-1/3 w-20 h-20 bg-[#00445d] rounded-full opacity-60"></div>

          {/* Abstract background shapes */}
          <div className="absolute bottom-0 left-0 w-full h-64 opacity-30">
            <svg viewBox="0 0 800 200" className="w-full h-full">
              <path d="M0,200 Q100,150 200,180 T400,160 T600,170 T800,150 L800,200 Z" fill="#73e4fd" />
              <path d="M0,200 Q150,160 300,190 T600,180 T800,170 L800,200 Z" fill="#2b555f" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-bold text-[#2b555f] mb-6">BIENVENIDO</h1>

            <p className="text-2xl md:text-3xl text-[#2b555f] mb-12 font-medium">gracias por ayudarnos a ayudar</p>

            <Link
              href="/login"
              className="bg-[#00445d] text-white px-12 py-4 rounded-lg text-xl font-semibold hover:bg-[#2b555f] transition-colors mb-20 inline-block"
            >
              comenzemos
            </Link>

            {/* Cards Section */}
            <div className="grid md:grid-cols-3 gap-8 mt-20">
              {/* Card 1 */}
              <Link href="/por-que-existe" className="relative group">
                <div className="bg-white border-2 border-[#2b555f] rounded-lg p-8 min-h-[200px] flex flex-col justify-center transform group-hover:scale-105 transition-transform shadow-lg">
                  <h2 className="text-xl md:text-2xl font-bold text-[#2b555f] leading-tight">
                    POR QUE
                    <br />
                    EXISTE
                    <br />
                    LA PAGINA?
                  </h2>
                </div>
                <div className="absolute -top-4 -right-4">
                  <HeartPin color="#ff6b6b" size="md" />
                </div>
              </Link>

              {/* Card 2 */}
              <Link href="/registrar-ong" className="relative group">
                <div className="bg-white border-2 border-[#2b555f] rounded-lg p-8 min-h-[200px] flex flex-col justify-center transform group-hover:scale-105 transition-transform shadow-lg">
                  <h2 className="text-xl md:text-2xl font-bold text-[#2b555f] leading-tight">
                    REGISTRAR
                    <br />
                    UNA
                    <br />
                    ONG
                  </h2>
                </div>
                <div className="absolute -top-4 -right-4">
                  <HeartPin color="#ffd93d" size="md" />
                </div>
              </Link>

              {/* Card 3 */}
              <Link href="/iniciar-como-ong" className="relative group">
                <div className="bg-white border-2 border-[#2b555f] rounded-lg p-8 min-h-[200px] flex flex-col justify-center transform group-hover:scale-105 transition-transform shadow-lg">
                  <h2 className="text-xl md:text-2xl font-bold text-[#2b555f] leading-tight">
                    INICIAR
                    <br />
                    COMO
                    <br />
                    ONG
                  </h2>
                </div>
                <div className="absolute -top-4 -right-4">
                  <HeartPin color="#73e4fd" size="md" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
