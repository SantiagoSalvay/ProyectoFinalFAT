"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Settings, LogOut } from "lucide-react"

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    // Limpiar cualquier dato de sesión almacenado
    localStorage.removeItem("userSession")
    sessionStorage.clear()

    // Mostrar mensaje de confirmación
    alert("Sesión cerrada exitosamente")

    // Redirigir al inicio
    router.push("/")
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-[#2b555f] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#00445d] transition-colors"
      >
        <User className="w-6 h-6 text-white" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <Link
            href="/mi-informacion"
            className="flex items-center px-4 py-2 text-[#2b555f] hover:bg-[#73e4fd] hover:bg-opacity-20 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-4 h-4 mr-3" />
            Mi información
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-[#2b555f] hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
