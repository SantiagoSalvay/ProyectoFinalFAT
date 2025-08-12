"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Send, Bot, User, Lightbulb, Heart, Users, Target } from "lucide-react"

interface Message {
  id: number
  text: string
  isBot: boolean
  timestamp: Date
}

const respuestasIA = {
  saludo: [
    "¡Hola! Soy tu asistente de DEMOS+. ¿En qué puedo ayudarte hoy?",
    "¡Bienvenido! Estoy aquí para ayudarte a encontrar la ONG perfecta para ti.",
    "¡Hola! ¿Te gustaría que te recomiende algunas ONGs según tus intereses?",
  ],
  educacion: [
    "Te recomiendo 'Fundación Esperanza' que se especializa en educación para niños vulnerables. También está 'Enseñar es Amar' que trabaja con alfabetización de adultos.",
    "Para educación, tenemos excelentes opciones como 'Libros para Todos' y 'Educación Sin Fronteras'. ¿Te interesa algún grupo etario específico?",
  ],
  salud: [
    "En el área de salud, 'Corazones Solidarios' brinda atención médica gratuita. También está 'Salud para Todos' que se enfoca en medicina preventiva.",
    "Te sugiero 'Médicos Voluntarios' y 'Cuidar es Amar' para causas de salud. ¿Hay alguna especialidad médica que te interese más?",
  ],
  ambiente: [
    "'Verde Futuro' es excelente para temas ambientales. También tenemos 'Planeta Limpio' que se enfoca en reciclaje y 'Bosques Eternos' para reforestación.",
    "Para medio ambiente recomiendo 'Eco Vida' y 'Naturaleza Pura'. ¿Te interesa más la conservación o la educación ambiental?",
  ],
  voluntariado: [
    "¡Excelente que quieras ser voluntario! Según tu ubicación y disponibilidad, puedo recomendarte ONGs que necesiten ayuda. ¿Qué días tienes disponibles?",
    "Para voluntariado, tenemos opciones presenciales y virtuales. ¿Prefieres trabajar directamente con personas o en tareas administrativas?",
  ],
  donacion: [
    "Todas nuestras ONGs verificadas aceptan donaciones. Te recomiendo revisar sus proyectos actuales en la sección DONAR. ¿Hay alguna causa específica que te motive?",
    "Para donaciones, puedes ver el impacto directo en la sección PODIO. ¿Te gustaría donar a una causa específica o prefieres que te recomiende según tu presupuesto?",
  ],
}

export default function IAPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "¡Hola! Soy tu asistente inteligente de DEMOS+. Puedo ayudarte a encontrar ONGs, recomendar causas según tus intereses, o responder preguntas sobre voluntariado y donaciones. ¿En qué te puedo ayudar?",
      isBot: true,
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const getIAResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()

    if (message.includes("hola") || message.includes("buenos") || message.includes("saludos")) {
      return respuestasIA.saludo[Math.floor(Math.random() * respuestasIA.saludo.length)]
    }

    if (
      message.includes("educacion") ||
      message.includes("enseñar") ||
      message.includes("escuela") ||
      message.includes("niños")
    ) {
      return respuestasIA.educacion[Math.floor(Math.random() * respuestasIA.educacion.length)]
    }

    if (
      message.includes("salud") ||
      message.includes("medico") ||
      message.includes("hospital") ||
      message.includes("enfermedad")
    ) {
      return respuestasIA.salud[Math.floor(Math.random() * respuestasIA.salud.length)]
    }

    if (
      message.includes("ambiente") ||
      message.includes("medio ambiente") ||
      message.includes("ecologia") ||
      message.includes("naturaleza")
    ) {
      return respuestasIA.ambiente[Math.floor(Math.random() * respuestasIA.ambiente.length)]
    }

    if (message.includes("voluntario") || message.includes("ayudar") || message.includes("colaborar")) {
      return respuestasIA.voluntariado[Math.floor(Math.random() * respuestasIA.voluntariado.length)]
    }

    if (
      message.includes("donar") ||
      message.includes("donacion") ||
      message.includes("dinero") ||
      message.includes("contribuir")
    ) {
      return respuestasIA.donacion[Math.floor(Math.random() * respuestasIA.donacion.length)]
    }

    return "Entiendo tu consulta. Te recomiendo explorar nuestras secciones de PODIO para ver ONGs destacadas, MAPA para encontrar organizaciones cerca de ti, o DONAR para contribuir directamente. ¿Hay algo específico que te interese?"
  }

  const handleSendMessage = () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      isBot: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsTyping(true)

    // Simular respuesta de IA con delay
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: getIAResponse(inputText),
        isBot: true,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const sugerenciasRapidas = [
    { icon: Heart, text: "Quiero donar", query: "¿Cómo puedo hacer una donación?" },
    { icon: Users, text: "Ser voluntario", query: "¿Cómo puedo ser voluntario?" },
    { icon: Target, text: "Encontrar ONGs", query: "¿Qué ONGs me recomiendas?" },
    { icon: Lightbulb, text: "Causas populares", query: "¿Cuáles son las causas más populares?" },
  ]

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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-[#2b555f] mb-4">ASISTENTE IA</h1>
            <p className="text-xl text-[#2b555f]">Tu guía inteligente para encontrar la causa perfecta</p>
          </div>

          {/* Chat Container */}
          <div className="bg-[#73e4fd] bg-opacity-10 rounded-2xl p-6 mb-6">
            {/* Messages */}
            <div className="h-96 overflow-y-auto mb-6 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${message.isBot ? "" : "flex-row-reverse space-x-reverse"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.isBot ? "bg-[#2b555f]" : "bg-[#00445d]"
                      }`}
                    >
                      {message.isBot ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                    </div>
                    <div
                      className={`rounded-lg p-3 ${
                        message.isBot ? "bg-white border border-[#2b555f]" : "bg-[#2b555f] text-white"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.isBot ? "text-gray-500" : "text-gray-200"}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#2b555f] flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-[#2b555f] rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-[#2b555f] rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-[#2b555f] rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-[#2b555f] rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex space-x-4">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta aquí..."
                className="flex-1 px-4 py-3 border-2 border-[#2b555f] rounded-lg focus:outline-none focus:border-[#00445d]"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="bg-[#2b555f] text-white px-6 py-3 rounded-lg hover:bg-[#00445d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sugerencias rápidas */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sugerenciasRapidas.map((sugerencia, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputText(sugerencia.query)
                  setTimeout(handleSendMessage, 100)
                }}
                className="bg-white border-2 border-[#2b555f] rounded-lg p-4 hover:bg-[#73e4fd] hover:bg-opacity-20 transition-colors text-left"
              >
                <sugerencia.icon className="w-6 h-6 text-[#2b555f] mb-2" />
                <h3 className="font-semibold text-[#2b555f] mb-1">{sugerencia.text}</h3>
                <p className="text-sm text-[#2b555f] opacity-75">{sugerencia.query}</p>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
