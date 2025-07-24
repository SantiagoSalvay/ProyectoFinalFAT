import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api, User } from '../services/api'
import toast from 'react-hot-toast'

export type UserRole = 'person' | 'ong'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (profileData: UpdateProfileData) => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  name: string
  role: UserRole
  organization?: string
  location?: string
  bio?: string
}

interface UpdateProfileData {
  name: string
  organization?: string
  location?: string
  bio?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar token y cargar perfil
    const token = api.getToken()
    if (token) {
      loadProfile()
    } else {
      setIsLoading(false)
    }
  }, [])

  const loadProfile = async () => {
    try {
      const { user } = await api.getProfile()
      setUser(user)
    } catch (error) {
      console.error('Error loading profile:', error)
      api.clearToken()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { user } = await api.login({ email, password })
      setUser(user)
      toast.success('¡Inicio de sesión exitoso!')
    } catch (error) {
      toast.error('Error en el inicio de sesión')
      throw error
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const { user } = await api.register(userData)
      setUser(user)
      toast.success('¡Registro exitoso!')
    } catch (error) {
      toast.error('Error en el registro')
      throw error
    }
  }

  const updateProfile = async (profileData: UpdateProfileData) => {
    try {
      const { user } = await api.updateProfile(profileData)
      setUser(user)
      toast.success('Perfil actualizado exitosamente')
    } catch (error) {
      toast.error('Error al actualizar perfil')
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    api.clearToken()
    toast.success('Sesión cerrada')
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile
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