"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="bg-[#73e4fd] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-4xl md:text-5xl font-bold text-[#2b555f]">
          DEMOS+
        </Link>

        <nav className="hidden md:flex space-x-8">
          <Link
            href="/"
            className={`text-lg font-medium transition-colors ${
              pathname === "/" ? "text-[#00445d]" : "text-[#2b555f] hover:text-[#00445d]"
            }`}
          >
            Inicio
          </Link>
          <Link
            href="/por-que-existe"
            className={`text-lg font-medium transition-colors ${
              pathname === "/por-que-existe" ? "text-[#00445d]" : "text-[#2b555f] hover:text-[#00445d]"
            }`}
          >
            ¿Por qué existe?
          </Link>
          <Link
            href="/registrar-ong"
            className={`text-lg font-medium transition-colors ${
              pathname === "/registrar-ong" ? "text-[#00445d]" : "text-[#2b555f] hover:text-[#00445d]"
            }`}
          >
            Registrar ONG
          </Link>
          <Link
            href="/iniciar-como-ong"
            className={`text-lg font-medium transition-colors ${
              pathname === "/iniciar-como-ong" ? "text-[#00445d]" : "text-[#2b555f] hover:text-[#00445d]"
            }`}
          >
            Iniciar como ONG
          </Link>
        </nav>
      </div>
    </header>
  )
}
