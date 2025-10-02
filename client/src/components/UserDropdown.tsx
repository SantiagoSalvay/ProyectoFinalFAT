import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import type { User as ApiUser } from '../services/api'

export interface UserDropdownProps {
  user: ApiUser;
  onLogout: () => void;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export function UserDropdown({ user, onLogout, isOpen, setIsOpen }: UserDropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = typeof isOpen === 'boolean' && typeof setIsOpen === 'function'
  const isOpenFinal = isControlled ? isOpen : internalOpen
  const setIsOpenFinal = isControlled ? setIsOpen! : setInternalOpen
  const dropdownRef = useRef<HTMLDivElement>(null)

  const displayName = user.nombre || user.usuario || user.correo

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenFinal(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setIsOpenFinal])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpenFinal(!isOpenFinal)}
        className="flex items-center space-x-2 p-2 rounded-lg transition-colors"
        style={{ backgroundColor: 'transparent', color: 'var(--color-fg)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'color-mix(in oklab, var(--color-fg) 8%, transparent)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
      >
        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="hidden sm:block text-sm font-medium" style={{ color: 'var(--color-fg)' }}>
          {displayName}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpenFinal ? 'rotate-180' : ''}`} style={{ color: 'var(--color-muted)' }} />
      </button>

      {isOpenFinal && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-2 z-50"
             style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-fg)' }}>
          <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--color-fg)' }}>{displayName}</p>
            {user.correo ? (
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                {user.correo.length > 15 ? user.correo.slice(0, 15) + '...' : user.correo}
              </p>
            ) : null}
          </div>
          <Link
            to="/profile"
            onClick={() => setIsOpenFinal(false)}
            className="flex items-center px-4 py-2 text-sm transition-colors"
            style={{ color: 'var(--color-fg)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'color-mix(in oklab, var(--color-fg) 8%, transparent)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent' }}
          >
            <User className="w-4 h-4 mr-3" />
            Mi Perfil
          </Link>
          
          <button
            onClick={() => {
              onLogout()
              setIsOpenFinal(false)
            }}
            className="flex items-center w-full px-4 py-2 text-sm transition-colors"
            style={{ color: '#ef4444' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'color-mix(in oklab, #ef4444 14%, transparent)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  )
}