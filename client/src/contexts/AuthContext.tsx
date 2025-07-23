import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'person' | 'ong'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  organization?: string
  location?: string
  bio?: string
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

interface RegisterData {
  email: string
  password: string
  name: string
  role: UserRole
  organization?: string
  location?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular verificación de sesión guardada
    const savedUser = localStorage.getItem('demos_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('demos_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, _password: string) => {
    setIsLoading(true)
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock user data - en producción esto vendría de tu backend
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: 'person',
        createdAt: new Date(),
        avatar: '/placeholder-user.jpg'
      }
      
      setUser(mockUser)
      localStorage.setItem('demos_user', JSON.stringify(mockUser))
    } catch (error) {
      throw new Error('Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    setIsLoading(true)
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        role: userData.role,
        organization: userData.organization,
        location: userData.location,
        createdAt: new Date(),
        avatar: '/placeholder-user.jpg'
      }
      
      setUser(newUser)
      localStorage.setItem('demos_user', JSON.stringify(newUser))
    } catch (error) {
      throw new Error('Error al registrarse')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('demos_user')
  }

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 