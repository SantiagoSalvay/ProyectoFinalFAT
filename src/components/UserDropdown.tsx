import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { User as UserType } from '../contexts/AuthContext'

interface UserDropdownProps {
  user: UserType
  onLogout: () => void
}

export default function UserDropdown({ user, onLogout }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="hidden sm:block text-sm font-medium text-gray-700">
          {user.name}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            {user.role === 'ong' && user.organization && (
              <p className="text-xs text-gray-500">{user.organization}</p>
            )}
          </div>
          
          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <User className="w-4 h-4 mr-3" />
            Mi Perfil
          </Link>
          
          <Link
            to="/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-4 h-4 mr-3" />
            Configuración
          </Link>
          
          <button
            onClick={() => {
              onLogout()
              setIsOpen(false)
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  )
} 