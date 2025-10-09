import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api, User } from '../services/api'
import toast from 'react-hot-toast'

export type UserRole = 'person' | 'ong'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (userData: RegisterData) => Promise<any>
  logout: () => void
  updateProfile: (profileData: UpdateProfileData) => Promise<void>
  setUserFromVerification: (user: User, token: string) => void
  setUser: (user: User | null) => void
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName?: string
  role: UserRole
  organization?: string
  location: string
  coordinates?: [number, number]
  bio?: string
  tipo_usuario?: number
}

interface UpdateProfileData {
  nombre?: string
  apellido?: string
  ubicacion?: string
  bio?: string
  telefono?: string
  redes_sociales?: any
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

  const loadProfile = async (retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1500; // 1.5 segundos
    let shouldStopLoading = true;
    
    try {
      console.log(`Cargando perfil de usuario... (intento ${retryCount + 1}/${maxRetries + 1})`);
      const { user } = await api.getProfile();
      console.log('Perfil cargado:', user);
      setUser(user);
    } catch (error: any) {
      console.error('Error detallado al cargar perfil:', error);
      
      // Solo eliminar token si es error de autenticación (401, 403)
      // No eliminar si es error de red o servidor (500, problemas de BD)
      const errorMessage = error?.message || '';
      const isAuthError = errorMessage.includes('401') || 
                         errorMessage.includes('403') || 
                         errorMessage.includes('Token') ||
                         errorMessage.includes('no autorizado') ||
                         errorMessage.includes('unauthorized');
      
      if (isAuthError) {
        console.log('❌ Error de autenticación - cerrando sesión');
        api.clearToken();
        setUser(null);
      } else if (retryCount < maxRetries) {
        // Error de conexión - reintentar
        console.log(`⚠️ Error de conexión - reintentando en ${retryDelay}ms...`);
        shouldStopLoading = false;
        setTimeout(() => {
          loadProfile(retryCount + 1);
        }, retryDelay);
        return; // No finalizar loading aún
      } else {
        // Se agotaron los reintentos
        console.log('❌ Se agotaron los reintentos - manteniendo token para reintento manual');
        setUser(null);
        toast.error('Error de conexión con el servidor. Por favor, recarga la página.');
      }
    } finally {
      // Solo finalizar loading si no vamos a reintentar
      if (shouldStopLoading) {
        setIsLoading(false);
      }
    }
  }

  const login = async (email: string, password: string): Promise<User> => {
    try {
      console.log('Intentando login con:', { email, password: '[PROTECTED]' });
      const response = await api.login({ email, password });
      console.log('Respuesta de login:', { ...response, token: response.token ? '[TOKEN]' : null });
      
      if (response.user) {
        setUser(response.user);
        toast.success('¡Inicio de sesión exitoso!');
        return response.user;
      } else {
        console.error('No se recibieron datos del usuario en la respuesta');
        toast.error('Error en el inicio de sesión: datos de usuario no recibidos');
        throw new Error('Datos de usuario no recibidos');
      }
    } catch (error) {
      console.error('Error detallado en login:', error);
      toast.error('Error en el inicio de sesión');
      throw error as any;
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
      console.log('🔄 [AuthContext] Actualizando perfil con:', profileData)
      
      const { user } = await api.updateProfile(profileData)
      
      console.log('✅ [AuthContext] Usuario recibido del backend:', user)
      
      if ((user as any).redes_sociales) {
        console.log('✅ [AuthContext] Redes sociales en usuario:', (user as any).redes_sociales)
      }
      
      setUser(user)
      
      console.log('✅ [AuthContext] Usuario actualizado en el estado')
      
      // NO forzar recarga automática para mantener los logs
      
      toast.success('Perfil actualizado exitosamente')
    } catch (error) {
      console.error('❌ [AuthContext] Error al actualizar perfil:', error)
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
    setUserFromVerification,
    setUser
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