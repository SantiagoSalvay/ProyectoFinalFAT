import Header from "@/components/Header"

export default function PorQueExistePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-[#2b555f] mb-8 text-center">¿POR QUÉ EXISTE LA PÁGINA?</h1>

          <div className="bg-[#73e4fd] bg-opacity-20 rounded-lg p-8 mb-8">
            <p className="text-xl text-[#2b555f] leading-relaxed">
              Esta página existe para crear un puente entre las organizaciones no gubernamentales y las personas que
              desean ayudar. Nuestro objetivo es facilitar la conexión y colaboración para generar un impacto positivo
              en la comunidad.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border-2 border-[#2b555f] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#2b555f] mb-4">Nuestra Misión</h2>
              <p className="text-[#2b555f]">
                Conectar a las ONGs con voluntarios, donantes y colaboradores para maximizar el impacto social.
              </p>
            </div>

            <div className="bg-white border-2 border-[#2b555f] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#2b555f] mb-4">Nuestra Visión</h2>
              <p className="text-[#2b555f]">
                Un mundo donde cada persona pueda contribuir fácilmente a causas que le importan.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
