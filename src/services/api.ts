const API_BASE_URL = 'http://localhost:5000/api';

// Tipos de datos
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'person' | 'ong';
  organization?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  created_at: string;
}

export interface ONG {
  id: number;
  name: string;
  description: string;
  type: 'public' | 'private';
  location: string;
  latitude: number;
  longitude: number;
  website: string;
  phone: string;
  email: string;
  logo?: string;
  impact_score: number;
  projects_count: number;
  volunteers_count: number;
  donations_received: number;
  rating: number;
  rating_count: number;
  total_donations?: number;
  total_volunteers?: number;
  average_rating?: number;
  comments?: Comment[];
  posts?: ForumPost[];
}

export interface ForumPost {
  id: number;
  user_id: number;
  ong_id?: number;
  title: string;
  content: string;
  image?: string;
  tags?: string;
  likes: number;
  comments_count: number;
  created_at: string;
  author_name: string;
  author_role: string;
  ong_name?: string;
  comments?: Comment[];
}

export interface Comment {
  id: number;
  user_id: number;
  post_id?: number;
  ong_id?: number;
  content: string;
  created_at: string;
  user_name: string;
  user_role: string;
}

export interface RankingStats {
  total_ongs: number;
  avg_impact: number;
  avg_rating: number;
  total_projects: number;
  total_volunteers: number;
  total_donations: number;
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
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Autenticación
  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: 'person' | 'ong';
    organization?: string;
    location?: string;
    bio?: string;
  }) {
    const response = await this.request<{ message: string; user: User; token: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );
    this.setToken(response.token);
    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{ message: string; user: User; token: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );
    this.setToken(response.token);
    return response;
  }

  async getProfile() {
    return await this.request<{ user: User }>('/auth/profile');
  }

  async updateProfile(profileData: {
    name: string;
    organization?: string;
    location?: string;
    bio?: string;
  }) {
    return await this.request<{ message: string; user: User }>(
      '/auth/profile',
      {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }
    );
  }

  // ONGs
  async getONGs(filters?: {
    type?: 'public' | 'private';
    location?: string;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.search) params.append('search', filters.search);

    return await this.request<{ ongs: ONG[] }>(`/ongs?${params.toString()}`);
  }

  async getONG(id: number) {
    return await this.request<{ ong: ONG }>(`/ongs/${id}`);
  }

  async createONG(ongData: {
    name: string;
    description: string;
    type: 'public' | 'private';
    location: string;
    latitude: number;
    longitude: number;
    website: string;
    phone: string;
    email: string;
  }) {
    return await this.request<{ message: string; ong: ONG }>(
      '/ongs',
      {
        method: 'POST',
        body: JSON.stringify(ongData),
      }
    );
  }

  async rateONG(id: number, rating: number, comment: string) {
    return await this.request<{ message: string; rating: { rating: number; comment: string } }>(
      `/ongs/${id}/rate`,
      {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      }
    );
  }

  async commentONG(id: number, content: string) {
    return await this.request<{ message: string; comment: Comment }>(
      `/ongs/${id}/comment`,
      {
        method: 'POST',
        body: JSON.stringify({ content }),
      }
    );
  }

  // Foro
  async getForumPosts(filters?: {
    filter?: string;
    search?: string;
    tags?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.filter) params.append('filter', filters.filter);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.tags) params.append('tags', filters.tags);

    return await this.request<{ posts: ForumPost[] }>(`/forum/posts?${params.toString()}`);
  }

  async getForumPost(id: number) {
    return await this.request<{ post: ForumPost }>(`/forum/posts/${id}`);
  }

  async createForumPost(postData: {
    title: string;
    content: string;
    image?: string;
    tags?: string;
    ong_id?: number;
  }) {
    return await this.request<{ message: string; post: ForumPost }>(
      '/forum/posts',
      {
        method: 'POST',
        body: JSON.stringify(postData),
      }
    );
  }

  async commentPost(id: number, content: string) {
    return await this.request<{ message: string; comment: Comment }>(
      `/forum/posts/${id}/comments`,
      {
        method: 'POST',
        body: JSON.stringify({ content }),
      }
    );
  }

  async likePost(id: number) {
    return await this.request<{ message: string }>(
      `/forum/posts/${id}/like`,
      {
        method: 'POST',
      }
    );
  }

  async getPopularTags() {
    return await this.request<{ tags: Array<{ tags: string; count: number }> }>('/forum/tags');
  }

  // Ranking
  async getRanking(sort: string = 'impact', limit: number = 10) {
    return await this.request<{ ranking: ONG[]; sortBy: string; total: number }>(
      `/ranking?sort=${sort}&limit=${limit}`
    );
  }

  async getRankingStats() {
    return await this.request<{
      stats: RankingStats;
      topByImpact: Array<{ name: string; impact_score: number }>;
      topByRating: Array<{ name: string; rating: number; rating_count: number }>;
      topByProjects: Array<{ name: string; projects_count: number }>;
      topByVolunteers: Array<{ name: string; volunteers_count: number }>;
    }>('/ranking/stats');
  }

  async getRankingByLocation(location: string, sort: string = 'impact') {
    return await this.request<{ ranking: ONG[]; location: string; sortBy: string; total: number }>(
      `/ranking/location/${encodeURIComponent(location)}?sort=${sort}`
    );
  }

  async getRankingByType(type: 'public' | 'private', sort: string = 'impact') {
    return await this.request<{ ranking: ONG[]; type: string; sortBy: string; total: number }>(
      `/ranking/type/${type}?sort=${sort}`
    );
  }
}

export const api = new ApiService(); 