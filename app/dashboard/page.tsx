import Header from "@/components/Header"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#2b555f] mb-8">¡Bienvenido a DEMOS+!</h1>

          <div className="bg-[#73e4fd] bg-opacity-20 rounded-lg p-8 mb-8">
            <p className="text-xl text-[#2b555f]">
              Has iniciado sesión exitosamente. Aquí podrás gestionar tu perfil y explorar las ONGs disponibles.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-[#2b555f] rounded-lg p-6">
              <h2 className="text-xl font-bold text-[#2b555f] mb-4">Mi Perfil</h2>
              <p className="text-[#2b555f]">Gestiona tu información personal</p>
            </div>

            <div className="bg-white border-2 border-[#2b555f] rounded-lg p-6">
              <h2 className="text-xl font-bold text-[#2b555f] mb-4">Explorar ONGs</h2>
              <p className="text-[#2b555f]">Descubre organizaciones para ayudar</p>
            </div>

            <div className="bg-white border-2 border-[#2b555f] rounded-lg p-6">
              <h2 className="text-xl font-bold text-[#2b555f] mb-4">Mis Donaciones</h2>
              <p className="text-[#2b555f]">Historial de contribuciones</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
