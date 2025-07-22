import Link from "next/link"
import Header from "@/components/Header"
import HeartPin from "@/components/HeartPin"

export default function OngConfirmacionPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4">
            <HeartPin color="#73e4fd" size="lg" className="opacity-80" />
          </div>
          <div className="absolute top-32 right-1/4">
            <HeartPin color="#00445d" size="md" className="opacity-80" />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-64 opacity-30">
            <svg viewBox="0 0 800 200" className="w-full h-full">
              <path d="M0,200 Q100,150 200,180 T400,160 T600,170 T800,150 L800,200 Z" fill="#73e4fd" />
              <path d="M0,200 Q150,160 300,190 T600,180 T800,170 L800,200 Z" fill="#2b555f" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#73e4fd] bg-opacity-20 rounded-2xl p-12 shadow-lg">
              <div className="mb-8">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-[#2b555f] mb-6">¡Registro Recibido!</h1>
              </div>

              <div className="bg-white bg-opacity-80 rounded-lg p-8 mb-8">
                <p className="text-xl text-[#2b555f] leading-relaxed mb-4">
                  <strong>Su ONG será registrada pronto</strong>
                </p>
                <p className="text-lg text-[#2b555f]">
                  Por favor espere confirmación. Le enviaremos un email cuando su organización haya sido verificada y
                  aprobada.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-[#2b555f] font-medium">
                  El proceso de verificación puede tomar entre 2-5 días hábiles.
                </p>

                <Link
                  href="/"
                  className="inline-block bg-[#00445d] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#2b555f] transition-colors"
                >
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
