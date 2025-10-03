
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
  bio?: string;
  createdAt?: Date;
  tipo_usuario?: number;
}

export interface ONG {
  id: number;
  name: string;
  description: string;
  location: string;
  email: string;
  type: 'public' | 'private';
  rating: number;
  volunteers_count: number;
  projects_count: number;
  website: string;
  phone: string;
}

// Clase API
class ApiService {
  // Obtener donaciones realizadas por el usuario autenticado
  async getDonacionesRealizadas() {
    try {
      const response = await this.request<any[]>('/auth/donaciones/realizadas', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.getToken()}`
        }
      });
      return response;
    } catch (error) {
      console.error('Error al obtener donaciones realizadas:', error);
      throw error;
    }
  }
  // Obtener datos de TipoONG por id de usuario
  async getTipoONGById(id_usuario: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile/tipoong/${id_usuario}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.getToken() && { Authorization: `Bearer ${this.getToken()}` })
        }
      });
      if (!response.ok) throw new Error('Error al obtener datos de TipoONG');
      const data = await response.json();
      return data.tipoONG;
    } catch (error) {
      console.error('Error al obtener datos de TipoONG por id:', error);
      return null;
    }
  }
  // Guardar datos de TipoONG para el usuario autenticado
  async saveTipoONG(data: { grupo_social: string; necesidad: string }) {
    try {
      const response = await this.request<{ tipoONG: any }>(
        '/auth/profile/tipoong',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      );
      return response.tipoONG;
    } catch (error) {
      console.error('Error al guardar datos de TipoONG:', error);
      throw error;
    }
  }
  // Obtener ONGs (usuarios tipo 2)
  async getONGs(filters?: { type?: string; location?: string }) {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.type) queryParams.append('type', filters.type);
      if (filters?.location) queryParams.append('location', filters.location);
      
      const queryString = queryParams.toString();
      const endpoint = `/api/ongs${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 [API] Obteniendo ONGs desde:', `${API_BASE_URL}${endpoint}`);
      console.log('🔍 [API] Filtros aplicados:', filters);
      
      const response = await this.request<{ ongs: ONG[] }>(endpoint, {
        method: 'GET'
      });
      
      console.log('✅ [API] ONGs obtenidas exitosamente:', response.ongs?.length || 0, 'ONGs');
      return response;
    } catch (error) {
      console.error('❌ [API] Error al obtener ONGs:', error);
      console.error('❌ [API] Detalles del error:', {
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

    // Obtener datos de TipoONG para el usuario autenticado
    async getTipoONG() {
      try {
        const response = await this.request<{ tipoONG: { ID_tipo: number; grupo_social: string | null; necesidad: string | null } | null }>(
          '/auth/profile/tipoong',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${this.getToken()}`
            }
          }
        );
        return response.tipoONG;
      } catch (error) {
        console.error('Error al obtener datos de TipoONG:', error);
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
      console.log('🌐 [API] Haciendo petición:', {
        url,
        method: options.method || 'GET',
        headers: Object.keys(headers)
      });
      
      const response = await fetch(url, config);
      console.log('📡 [API] Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });
      
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('📦 [API] Datos JSON recibidos:', data);
      } else {
        data = await response.text();
        console.log('📄 [API] Texto recibido:', data);
      }

      if (!response.ok) {
        const errorMessage = typeof data === 'object' && data.error 
          ? data.error 
          : `HTTP error! status: ${response.status} - ${response.statusText}`;
        console.error('❌ [API] Error HTTP:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('✅ [API] Petición exitosa');
      return data;
    } catch (error) {
      console.error('💥 [API] Error en la petición:', {
        error: error instanceof Error ? error.message : error,
        url,
        method: options.method,
        headers: Object.keys(headers),
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
    bio?: string;
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

  // Métodos del foro
  async getCategorias() {
    try {
      const response = await this.request<{ id_categoria: number; etiqueta: string }[]>(
        '/api/forum/categorias',
        {
          method: 'GET'
        }
      );
      return response;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  }

  async getPublicaciones() {
    try {
      const response = await this.request<any[]>(
        '/api/forum/publicaciones',
        {
          method: 'GET'
        }
      );
      return response;
    } catch (error) {
      console.error('Error al obtener publicaciones:', error);
      throw error;
    }
  }

  async getPublicacion(publicacionId: string) {
    try {
      const response = await this.request<any>(
        `/api/forum/publicaciones/${publicacionId}`,
        {
          method: 'GET'
        }
      );
      return response;
    } catch (error) {
      console.error('Error al obtener publicación:', error);
      throw error;
    }
  }

  async crearPublicacion(data: {
    titulo: string;
    descripcion: string;
    categorias: number[];
    ubicacion?: string;
    coordenadas?: [number, number];
  }) {
    try {
      const response = await this.request<{ message: string; id: number }>(
        '/api/forum/publicaciones',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      return response;
    } catch (error) {
      console.error('Error al crear publicación:', error);
      throw error;
    }
  }

  // Métodos para comentarios
  async getComentarios(publicacionId: string) {
    try {
      const response = await this.request<any[]>(
        `/api/forum/publicaciones/${publicacionId}/comentarios`,
        {
          method: 'GET'
        }
      );
      return response;
    } catch (error) {
      console.error('Error al obtener comentarios:', error);
      throw error;
    }
  }

  async crearComentario(publicacionId: string, mensaje: string) {
    try {
      const response = await this.request<{ 
        message: string; 
        comentario: any;
        needsApproval?: boolean;
        status?: string;
        warning?: {
          count: number;
          remaining: number;
          message: string;
        };
      }>(
        `/api/forum/publicaciones/${publicacionId}/comentarios`,
        {
          method: 'POST',
          body: JSON.stringify({ mensaje }),
        }
      );
      return response;
    } catch (error) {
      console.error('Error al crear comentario:', error);
      throw error;
    }
  }

  async getModerationStats() {
    try {
      const response = await this.request<{
        warningsCount: number;
        maxWarnings: number;
        isBanned: boolean;
        bannedReason?: string;
        bannedUntil?: string;
        totalInfractions: number;
        recentInfractions: any[];
      }>('/api/forum/moderation/stats');
      return response;
    } catch (error) {
      console.error('Error al obtener estadísticas de moderación:', error);
      throw error;
    }
  }

  async eliminarComentario(comentarioId: string) {
    try {
      const response = await this.request<{ message: string }>(
        `/api/forum/comentarios/${comentarioId}`,
        {
          method: 'DELETE',
        }
      );
      return response;
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      throw error;
    }
  }

  // Dar/quitar "me gusta" a una publicación
  async toggleLike(publicacionId: string) {
    try {
      const response = await this.request<{ 
        message: string; 
        liked: boolean;
        totalLikes: number;
      }>(
        `/api/forum/publicaciones/${publicacionId}/like`,
        {
          method: 'POST',
        }
      );
      return response;
    } catch (error) {
      console.error('Error al dar/quitar me gusta:', error);
      throw error;
    }
  }

  // Obtener estado de likes de una publicación
  async getLikes(publicacionId: string) {
    try {
      const response = await this.request<{ 
        totalLikes: number;
        isLiked: boolean;
      }>(
        `/api/forum/publicaciones/${publicacionId}/like`,
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error) {
      console.error('Error al obtener likes:', error);
      throw error;
    }
  }

  // Métodos para ONGs
  async calificarONG(ongId: number, puntuacion: number, comentario?: string) {
    try {
      const response = await this.request<{ 
        message: string; 
        calificacion: any;
        nuevoPromedio: number;
        totalCalificaciones: number;
      }>(
        `/api/ongs/${ongId}/calificar`,
        {
          method: 'POST',
          body: JSON.stringify({ puntuacion, comentario }),
        }
      );
      return response;
    } catch (error) {
      console.error('Error al calificar ONG:', error);
      throw error;
    }
  }

  async obtenerMiCalificacion(ongId: number) {
    try {
      const response = await this.request<{
        hasRated: boolean;
        puntuacion?: number;
        comentario?: string;
        fecha?: string;
      }>(
        `/api/ongs/${ongId}/mi-calificacion`,
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error) {
      console.error('Error al obtener calificación:', error);
      throw error;
    }
  }

  async rateONG(ongId: number, rating: number, comment: string) {
    try {
      const response = await this.request<{ message: string }>(
        `/api/ongs/${ongId}/rate`,
        {
          method: 'POST',
          body: JSON.stringify({ rating, comment }),
        }
      );
      return response;
    } catch (error) {
      console.error('Error al calificar ONG:', error);
      throw error;
    }
  }

  async commentONG(ongId: number, content: string) {
    try {
      const response = await this.request<{ message: string }>(
        `/api/ongs/${ongId}/comment`,
        {
          method: 'POST',
          body: JSON.stringify({ content }),
        }
      );
      return response;
    } catch (error) {
      console.error('Error al comentar ONG:', error);
      throw error;
    }
  }
}

export const api = new ApiService(); 