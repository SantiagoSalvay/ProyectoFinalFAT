const API_BASE_URL = 'http://localhost:3001';

export type UserRole = 'person' | 'ong';

// Tipos de datos
export interface User {
  id_usuario: number;
  usuario: string;
  telefono: string;
  correo: string;
  nombre?: string;
  apellido?: string;
  ubicacion?: string;
  bio?: string;
  createdAt?: Date;
}

// Clase API
class ApiService {
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

    console.log('Haciendo petición a:', url);
    console.log('Opciones:', {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      body: options.body ? JSON.parse(options.body as string) : undefined
    });

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
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
        body: options.body ? JSON.parse(options.body as string) : undefined
      });
      throw error;
    }
  }

  // Autenticación
  async register(userData: {
    name: string;
    email: string;
    password: string;
    location: string;
    role: UserRole;
  }) {
    console.log('Iniciando registro con datos:', {
      name: userData.name,
      email: userData.email,
      location: userData.location,
      role: userData.role,
      password: '[PROTECTED]'
    });

    const [nombre, ...apellidoArray] = userData.name.split(' ');
    const apellido = apellidoArray.join(' ');

    if (!nombre || !apellido) {
      throw new Error('Por favor ingresa nombre y apellido');
    }

    try {
      const response = await this.request<{ message: string; user: User; token: string }>(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({
            nombre,
            apellido,
            correo: userData.email,
            contrasena: userData.password,
            usuario: userData.email.split('@')[0],
            telefono: ""
          }),
        }
      );

      console.log('Registro exitoso:', {
        message: response.message,
        user: { ...response.user, contrasena: undefined }
      });

      this.setToken(response.token);
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
            email: credentials.email,
            password: credentials.password
          }),
        }
      );

      this.setToken(response.token);
      return response;
    } catch (error) {
      console.error('Error en el login:', error);
      throw error;
    }
  }

  // Obtener perfil del usuario
  async getProfile() {
    try {
      const response = await this.request<{ user: User }>(
        '/auth/profile',
        {
          method: 'GET'
        }
      );
      return response;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }
  }

  // Actualizar perfil del usuario
  async updateProfile(profileData: {
    nombre?: string;
    apellido?: string;
    telefono?: string;
    ubicacion?: string;
    bio?: string;
  }) {
    try {
      const response = await this.request<{ message: string; user: User }>(
        '/auth/profile',
        {
          method: 'PUT',
          body: JSON.stringify(profileData),
        }
      );
      return response;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  }
}

export const api = new ApiService(); 