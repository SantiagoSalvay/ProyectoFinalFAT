"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, CreditCard, DollarSign } from "lucide-react"

const ongsDisponibles = [
  {
    id: 1,
    nombre: "Manos Unidas",
    categoria: "Desarrollo Social",
    descripcion: "Ayudamos a comunidades vulnerables con programas de desarrollo integral.",
    meta: 50000,
    recaudado: 32500,
    imagen: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 2,
    nombre: "Fundación Esperanza",
    categoria: "Educación",
    descripcion: "Brindamos educación de calidad a niños en situación de vulnerabilidad.",
    meta: 30000,
    recaudado: 18750,
    imagen: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 3,
    nombre: "Corazones Solidarios",
    categoria: "Salud",
    descripcion: "Proporcionamos atención médica gratuita en comunidades rurales.",
    meta: 40000,
    recaudado: 25600,
    imagen: "/placeholder.svg?height=100&width=100",
  },
]

export default function DonarPage() {
  const [selectedOng, setSelectedOng] = useState<number | null>(null)
  const [donationAmount, setDonationAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("tarjeta")
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  const handleDonate = () => {
    if (selectedOng && donationAmount) {
      setShowPaymentForm(true)
    }
  }

  const processDonation = () => {
    alert(`¡Gracias por tu donación de $${donationAmount}! Tu contribución hace la diferencia.`)
    setShowPaymentForm(false)
    setDonationAmount("")
    setSelectedOng(null)
  }

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
            <h1 className="text-5xl font-bold text-[#2b555f] mb-4">DONAR</h1>
            <p className="text-xl text-[#2b555f]">Tu contribución puede cambiar vidas</p>
          </div>

          {!showPaymentForm ? (
            <>
              {/* ONGs disponibles */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {ongsDisponibles.map((ong) => (
                  <div
                    key={ong.id}
                    className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                      selectedOng === ong.id
                        ? "border-[#00445d] bg-[#73e4fd] bg-opacity-20"
                        : "border-[#2b555f] hover:border-[#00445d]"
                    }`}
                    onClick={() => setSelectedOng(ong.id)}
                  >
                    <div className="text-center mb-4">
                      <img
                        src={ong.imagen || "/placeholder.svg"}
                        alt={ong.nombre}
                        className="w-20 h-20 rounded-full mx-auto mb-4"
                      />
                      <h3 className="text-xl font-bold text-[#2b555f] mb-2">{ong.nombre}</h3>
                      <p className="text-sm text-[#2b555f] bg-[#73e4fd] bg-opacity-30 px-3 py-1 rounded-full inline-block">
                        {ong.categoria}
                      </p>
                    </div>

                    <p className="text-[#2b555f] text-sm mb-4">{ong.descripcion}</p>

                    {/* Barra de progreso */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-[#2b555f] mb-2">
                        <span>Recaudado: ${ong.recaudado.toLocaleString()}</span>
                        <span>Meta: ${ong.meta.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-[#00445d] h-3 rounded-full transition-all"
                          style={{ width: `${(ong.recaudado / ong.meta) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-[#2b555f] mt-1">
                        {Math.round((ong.recaudado / ong.meta) * 100)}% completado
                      </p>
                    </div>

                    {selectedOng === ong.id && (
                      <div className="bg-[#00445d] text-white p-2 rounded-lg text-center">
                        <Heart className="w-4 h-4 inline mr-2" />
                        Seleccionada para donar
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Formulario de donación */}
              {selectedOng && (
                <div className="bg-[#73e4fd] bg-opacity-20 rounded-2xl p-8 max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-[#2b555f] mb-6 text-center">Realizar Donación</h2>

                  <div className="space-y-6">
                    {/* Monto */}
                    <div>
                      <label className="block text-lg font-semibold text-[#2b555f] mb-2">Monto a donar</label>
                      <div className="flex gap-4 mb-4">
                        {[100, 500, 1000, 2500].map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setDonationAmount(amount.toString())}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                              donationAmount === amount.toString()
                                ? "bg-[#00445d] text-white"
                                : "bg-white text-[#2b555f] border border-[#2b555f] hover:bg-[#2b555f] hover:text-white"
                            }`}
                          >
                            ${amount}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#2b555f]" />
                        <input
                          type="number"
                          placeholder="Monto personalizado"
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
                        />
                      </div>
                    </div>

                    {/* Método de pago */}
                    <div>
                      <label className="block text-lg font-semibold text-[#2b555f] mb-2">Método de pago</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setPaymentMethod("tarjeta")}
                          className={`p-4 rounded-lg border-2 transition-colors ${
                            paymentMethod === "tarjeta"
                              ? "border-[#00445d] bg-[#00445d] text-white"
                              : "border-[#2b555f] text-[#2b555f] hover:border-[#00445d]"
                          }`}
                        >
                          <CreditCard className="w-6 h-6 mx-auto mb-2" />
                          Tarjeta
                        </button>
                        <button
                          onClick={() => setPaymentMethod("transferencia")}
                          className={`p-4 rounded-lg border-2 transition-colors ${
                            paymentMethod === "transferencia"
                              ? "border-[#00445d] bg-[#00445d] text-white"
                              : "border-[#2b555f] text-[#2b555f] hover:border-[#00445d]"
                          }`}
                        >
                          <DollarSign className="w-6 h-6 mx-auto mb-2" />
                          Transferencia
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleDonate}
                      disabled={!donationAmount}
                      className="w-full bg-[#00445d] text-white py-4 rounded-lg text-xl font-semibold hover:bg-[#2b555f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continuar con la donación
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Formulario de pago */
            <div className="bg-[#73e4fd] bg-opacity-20 rounded-2xl p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-[#2b555f] mb-6 text-center">Completar Pago</h2>

              <div className="bg-white rounded-lg p-6 mb-6">
                <h3 className="font-bold text-[#2b555f] mb-2">Resumen de donación</h3>
                <p className="text-[#2b555f]">ONG: {ongsDisponibles.find((ong) => ong.id === selectedOng)?.nombre}</p>
                <p className="text-[#2b555f]">Monto: ${donationAmount}</p>
                <p className="text-[#2b555f]">
                  Método: {paymentMethod === "tarjeta" ? "Tarjeta de crédito" : "Transferencia bancaria"}
                </p>
              </div>

              {paymentMethod === "tarjeta" && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Número de tarjeta"
                    className="w-full px-4 py-3 border-2 border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="MM/AA"
                      className="px-4 py-3 border-2 border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      className="px-4 py-3 border-2 border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Nombre del titular"
                    className="w-full px-4 py-3 border-2 border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
                  />
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={processDonation}
                  className="flex-1 bg-[#00445d] text-white py-3 rounded-lg font-semibold hover:bg-[#2b555f] transition-colors"
                >
                  Confirmar donación
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
