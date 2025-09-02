import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api, User } from '../services/api'
import toast from 'react-hot-toast'

export type UserRole = 'person' | 'ong'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<any>
  logout: () => void
  updateProfile: (profileData: UpdateProfileData) => Promise<void>
  setUserFromVerification: (user: User, token: string) => void
}

interface RegisterData {
  email: string
  password: string
  name: string
  role: UserRole
  organization?: string
  location: string
  bio?: string
  tipo_usuario?: number
}

interface UpdateProfileData {
  nombre?: string
  apellido?: string
  ubicacion?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('Estado del usuario actualizado:', user);
  }, [user]);

  useEffect(() => {
    const token = api.getToken();
    console.log('Token encontrado:', token ? 'Sí' : 'No');
    if (token) {
      loadProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadProfile = async () => {
    try {
      console.log('Cargando perfil de usuario...');
      const { user } = await api.getProfile();
      console.log('Perfil cargado:', user);
      setUser(user);
    } catch (error) {
      console.error('Error detallado al cargar perfil:', error);
      api.clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log('Intentando login con:', { email, password: '[PROTECTED]' });
      const response = await api.login({ email, password });
      console.log('Respuesta de login:', { ...response, token: response.token ? '[TOKEN]' : null });
      
      if (response.user) {
        setUser(response.user);
        toast.success('¡Inicio de sesión exitoso!');
      } else {
        console.error('No se recibieron datos del usuario en la respuesta');
        toast.error('Error en el inicio de sesión: datos de usuario no recibidos');
      }
    } catch (error) {
      console.error('Error detallado en login:', error);
      toast.error('Error en el inicio de sesión');
      throw error;
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const response = await api.register(userData)
      
      // Si requiere verificación, no establecer usuario aún
      if (response.requiresVerification) {
        // No establecer usuario ni token hasta que se verifique
        return response // Devolver la respuesta para que el componente la maneje
      }
      
      // Si no requiere verificación (flujo anterior)
      if (response.user) {
        setUser(response.user)
        toast.success('¡Registro exitoso!')
      }
      
      return response
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

  const setUserFromVerification = (user: User, token: string) => {
    console.log('Estableciendo usuario desde verificación:', user)
    api.setToken(token)
    setUser(user)
    toast.success('¡Cuenta verificada e inicio de sesión automático!')
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    setUserFromVerification
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