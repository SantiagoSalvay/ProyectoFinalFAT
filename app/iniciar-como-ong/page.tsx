import Header from "@/components/Header"
import Link from "next/link"

export default function IniciarComoOngPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-[#2b555f] mb-8 text-center">INICIAR COMO ONG</h1>

          <div className="bg-[#73e4fd] bg-opacity-20 rounded-lg p-8 mb-12">
            <p className="text-xl text-[#2b555f] text-center leading-relaxed">
              Guía paso a paso para comenzar tu organización no gubernamental y hacer la diferencia en tu comunidad
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-white border-2 border-[#2b555f] rounded-lg p-8">
              <div className="flex items-start space-x-4">
                <div className="bg-[#73e4fd] text-[#2b555f] rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
                  1
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#2b555f] mb-4">Define tu misión</h2>
                  <p className="text-[#2b555f] text-lg">
                    Identifica claramente el problema social que quieres abordar y cómo planeas generar un impacto
                    positivo.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-[#2b555f] rounded-lg p-8">
              <div className="flex items-start space-x-4">
                <div className="bg-[#ffd93d] text-[#2b555f] rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
                  2
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#2b555f] mb-4">Forma tu equipo</h2>
                  <p className="text-[#2b555f] text-lg">
                    Reúne a personas comprometidas que compartan tu visión y puedan aportar diferentes habilidades al
                    proyecto.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-[#2b555f] rounded-lg p-8">
              <div className="flex items-start space-x-4">
                <div className="bg-[#ff6b6b] text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
                  3
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#2b555f] mb-4">Legaliza tu organización</h2>
                  <p className="text-[#2b555f] text-lg">
                    Completa los trámites legales necesarios para constituir oficialmente tu ONG según las leyes de tu
                    país.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-[#2b555f] rounded-lg p-8">
              <div className="flex items-start space-x-4">
                <div className="bg-[#00445d] text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
                  4
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#2b555f] mb-4">Desarrolla un plan de acción</h2>
                  <p className="text-[#2b555f] text-lg">
                    Crea estrategias concretas, establece metas medibles y planifica cómo vas a financiar tus
                    actividades.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/registrar-ong"
              className="inline-block bg-[#00445d] text-white px-12 py-4 rounded-lg text-xl font-semibold hover:bg-[#2b555f] transition-colors"
            >
              ¿Listo para registrar tu ONG?
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
