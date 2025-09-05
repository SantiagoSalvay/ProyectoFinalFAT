
const API_BASE_URL = 'http://localhost:3001';

export type UserRole = 'person' | 'ong';

// Tipos de datos
export interface User {
  id_usuario: number;
  usuario: string;
  correo: string;
  nombre?: string;
  apellido?: string;
  ubicacion?: string;
  createdAt?: Date;
}

// Clase API
class ApiService {
  // Obtener ONGs (usuarios tipo 2)
  async getONGs() {
    try {
      const response = await this.request<{ ongs: User[] }>('/auth/ongs', {
        method: 'GET'
      });
      return response.ongs;
    } catch (error) {
      console.error('Error al obtener ONGs:', error);
      throw error;
    }
  }
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    if (!token && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
      throw new Error('No hay token de autenticación');
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    console.log('Haciendo petición a:', url);
    console.log('Headers:', headers);
    console.log('Opciones:', {
      ...options,
      headers,
      body: options.body ? JSON.parse(options.body as string) : undefined
    });

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      console.log('Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('Datos recibidos:', data);
      } else {
        data = await response.text();
        console.log('Texto recibido:', data);
      }

      if (!response.ok) {
        throw new Error(typeof data === 'object' ? data.error : `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error detallado en la API:', {
        error,
        url,
        method: options.method,
        headers,
        body: options.body ? JSON.parse(options.body as string) : undefined
      });
      throw error;
    }
  }

  // Autenticación
  async register(userData: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    location: string;
    role: UserRole;
    organization?: string;
    tipo_usuario?: number;
  }) {
    console.log('Iniciando registro con datos:', {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      location: userData.location,
      role: userData.role,
      organization: userData.organization,
      tipo_usuario: userData.tipo_usuario,
      password: '[PROTECTED]'
    });

    try {
      const response = await this.request<{ 
        message: string; 
        user?: User; 
        token?: string; 
        requiresVerification?: boolean 
      }>(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({
            nombre: userData.firstName || '',
            apellido: userData.lastName || '',
            correo: userData.email || '',
            contrasena: userData.password || '',
            usuario: (userData.email && userData.email.split('@')[0]) || userData.email || '',
            ubicacion: userData.location || '',
            tipo_usuario: userData.tipo_usuario || 1
          }),
        }
      );

      console.log('Registro exitoso:', {
        message: response.message,
        requiresVerification: response.requiresVerification,
        user: response.user ? { ...response.user, contrasena: undefined } : undefined
      });

      // Solo guardar token si no requiere verificación
      if (response.token && !response.requiresVerification) {
        this.setToken(response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Error en el registro:', error);
      throw error;
    }
  }

  // Login de usuario
  async login(credentials: { email: string; password: string }) {
    try {
      const response = await this.request<{ message: string; user: User; token: string }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({
            correo: credentials.email,
            contrasena: credentials.password
          }),
        }
      );

      if (response.token) {
        this.setToken(response.token);
      }
      return response;
    } catch (error) {
      console.error('Error en el login:', error);
      throw error;
    }
  }

  // Obtener perfil del usuario
  async getProfile() {
    try {
      console.log('Obteniendo perfil de usuario...');
      const response = await this.request<{ user: User }>(
        '/auth/profile',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.getToken()}`
          }
        }
      );
      console.log('Perfil obtenido:', response);
      return response;
    } catch (error) {
      console.error('Error detallado al obtener perfil:', error);
      throw error;
    }
  }

  // Actualizar perfil del usuario
  async updateProfile(profileData: {
    nombre?: string;
    apellido?: string;
    ubicacion?: string;
  }) {
    try {
      console.log('Actualizando perfil con datos:', profileData);
      const response = await this.request<{ message: string; user: User }>(
        '/auth/profile',
        {
          method: 'PUT',
          body: JSON.stringify(profileData),
        }
      );
      console.log('Perfil actualizado:', response);
      return response;
    } catch (error) {
      console.error('Error detallado al actualizar perfil:', error);
      throw error;
    }
  }
}

export const api = new ApiService(); 