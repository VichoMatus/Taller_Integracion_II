import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '../../config/config';
import { LoginRequest, TokenResponse, ApiResponse } from '../types/superAdminTypes';

// Servicio simplificado que maneja directamente las peticiones a la API FastAPI
export class SuperAdminService {
  private apiClient: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.apiClient = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: API_CONFIG.headers,
    });

    // Interceptor para autenticación
    this.apiClient.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      if (API_CONFIG.apiKey) {
        config.headers['X-API-Key'] = API_CONFIG.apiKey;
      }
      return config;
    });
  }

  // Autenticación
  async login(credentials: LoginRequest): Promise<ApiResponse<TokenResponse>> {
    try {
      const response = await this.apiClient.post('/api/v1/auth/login', credentials);
      
      // Verificar rol de superadmin
      if (response.data.user.rol !== 'superadmin' && response.data.user.rol !== 'admin') {
        return { ok: false, error: 'Usuario no autorizado' };
      }

      this.authToken = response.data.access_token;
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error de autenticación' };
    }
  }

  async logout(refreshToken: string): Promise<ApiResponse> {
    try {
      await this.apiClient.post('/api/v1/auth/logout', { refresh_token: refreshToken });
      this.authToken = null;
      return { ok: true };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al cerrar sesión' };
    }
  }

  // Usuarios - Proxy directo a la API
  async getUsers(params: any = {}): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get('/api/v1/usuarios', { params });
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al obtener usuarios' };
    }
  }

  async getUserById(id: number): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get(`/api/v1/usuarios/${id}`);
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al obtener usuario' };
    }
  }

  async updateUser(id: number, data: any): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.patch(`/api/v1/usuarios/${id}`, data);
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al actualizar usuario' };
    }
  }

  async deleteUser(id: number): Promise<ApiResponse> {
    try {
      await this.apiClient.delete(`/api/v1/usuarios/${id}`);
      return { ok: true, message: 'Usuario desactivado' };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al desactivar usuario' };
    }
  }

  // Complejos - Proxy directo a la API
  async getComplejos(params: any = {}): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get('/api/v1/complejos', { params });
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al obtener complejos' };
    }
  }

  async getComplejoById(id: number, params: any = {}): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get(`/api/v1/complejos/${id}`, { params });
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al obtener complejo' };
    }
  }

  async getComplejoCanchas(id: number): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get(`/api/v1/complejos/${id}/canchas`);
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al obtener canchas' };
    }
  }

  // SuperAdmin específico
  async updateSystemParameters(parametros: any): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.post('/api/v1/superadmin/parametros', parametros);
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al actualizar parámetros' };
    }
  }

  async getSystemStatistics(): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get('/api/v1/superadmin/estadisticas');
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al obtener estadísticas' };
    }
  }

  async getSystemLogs(): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get('/api/v1/superadmin/logs');
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al obtener logs' };
    }
  }

  // Dashboard simplificado
  async getDashboardData(): Promise<ApiResponse> {
    try {
      // Obtener datos básicos para el dashboard
      const [users, complejos] = await Promise.all([
        this.getUsers({ page: 1, page_size: 5 }),
        this.getComplejos({ page: 1, page_size: 5 })
      ]);

      return {
        ok: true,
        data: {
          recentUsers: users.data?.users || users.data || [],
          recentComplejos: complejos.data?.complejos || complejos.data || []
        }
      };
    } catch (error) {
      return { ok: false, error: 'Error al obtener datos del dashboard' };
    }
  }

  // Búsqueda global simplificada
  async globalSearch(query: string): Promise<ApiResponse> {
    try {
      const [users, complejos] = await Promise.all([
        this.getUsers({ q: query, page_size: 5 }),
        this.getComplejos({ q: query, page_size: 5 })
      ]);

      return {
        ok: true,
        data: {
          users: users.data?.users || users.data || [],
          complejos: complejos.data?.complejos || complejos.data || []
        }
      };
    } catch (error) {
      return { ok: false, error: 'Error en la búsqueda' };
    }
  }
}