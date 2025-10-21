/**
 * SERVICIO SUPERADMIN - CLIENTE HTTP PARA API FASTAPI
 * ===================================================
 * 
 * Este servicio actúa como un cliente HTTP que consume la API FastAPI hosteada en   async getUsers(params: any = {}): Promise<ApiResponse> {
    try {
      console.log('🔄 [SuperAdminService] Consultando usuarios a FastAPI con params:', params);
      
      // 🎯 Asegurar que el filtro por rol se aplique correctamente
      const filteredParams = {
        ...params,
        rol: params.rol || 'usuario'  // Por defecto, solo usuarios regulares
      };
      
      console.log('🎯 [SuperAdminService] Parámetros con filtro aplicado:', filteredParams);
      
      const response = await this.apiClient.get(API_ENDPOINTS.usuarios.base, { params: filteredParams });
      console.log('✅ [SuperAdminService] Respuesta de FastAPI recibida:', response.status);
      console.log('📊 [SuperAdminService] Datos de FastAPI:', JSON.stringify(response.data, null, 2));
      
      return { ok: true, data: response.data };
    } catch (error: any) {
      console.error('❌ [SuperAdminService] Error consultando FastAPI:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return { ok: false, error: error.response?.data?.message || 'Error al obtener usuarios' };
    }
  }d.
 * Implementa el patrón Backend-for-Frontend (BFF), actuando como proxy entre el frontend
 * React/Next.js y la API externa.
 * 
 * Funcionalidades principales:
 * - Autenticación con JWT tokens
 * - Gestión de usuarios del sistema
 * - Administración de complejos deportivos
 * - Funciones específicas de SuperAdmin
 * - Dashboard y búsquedas globales
 * 
 * Uso desde el frontend:
 * - El frontend hace llamadas a este backend (Node.js)
 * - Este servicio traduce las llamadas a la API FastAPI
 * - Retorna datos estandarizados en formato ApiResponse<T>
 */

import axios, { AxiosInstance } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../../config/config';
import { LoginRequest, TokenResponse, ApiResponse } from '../types/superAdminTypes';

/**
 * CLASE PRINCIPAL DEL SERVICIO SUPERADMIN
 * =======================================
 */
export class SuperAdminService {
  private apiClient: AxiosInstance; // Cliente HTTP configurado para la API FastAPI
  private authToken: string | null = null; // Token JWT almacenado en memoria

  /**
   * CONSTRUCTOR - Configuración inicial
   * ===================================
   * Inicializa el cliente HTTP con configuración base y interceptors
   */
  constructor() {
    // Crear instancia de axios con configuración base
    this.apiClient = axios.create({
      baseURL: API_CONFIG.baseURL,   // URL base de la API FastAPI
      timeout: API_CONFIG.timeout,   // Timeout para requests
      headers: API_CONFIG.headers,   // Headers por defecto
    });

    // Interceptor para agregar autenticación automáticamente
    this.apiClient.interceptors.request.use((config) => {
      // Agregar token Bearer si está disponible
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      // Agregar API Key si está configurada
      if (API_CONFIG.apiKey) {
        config.headers['X-API-Key'] = API_CONFIG.apiKey;
      }
      return config;
    });
  }

  /**
   * MÉTODOS DE AUTENTICACIÓN
   * ========================
   */

  /**
   * Autenticar usuario en el sistema
   * @param credentials - Email y contraseña del usuario
   * @returns Promise<ApiResponse<TokenResponse>> - Tokens y datos del usuario
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<TokenResponse>> {
    try {
      const response = await this.apiClient.post(API_ENDPOINTS.auth.login, credentials);
      
      // Verificar que el usuario tiene permisos de administrador
      if (response.data.user.rol !== 'super_admin' && response.data.user.rol !== 'admin') {
        return { ok: false, error: 'Usuario no autorizado para el panel de administración' };
      }

      // Almacenar token para futuras peticiones
      this.authToken = response.data.access_token;
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error de autenticación' };
    }
  }

  /**
   * Cerrar sesión del usuario
   * @param refreshToken - Token de refresco para invalidar
   * @returns Promise<ApiResponse> - Confirmación de logout
   */
  async logout(refreshToken: string): Promise<ApiResponse> {
    try {
      await this.apiClient.post(API_ENDPOINTS.auth.logout, { refresh_token: refreshToken });
      this.authToken = null; // Limpiar token almacenado
      return { ok: true, message: 'Sesión cerrada exitosamente' };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al cerrar sesión' };
    }
  }

  /**
   * MÉTODOS DE GESTIÓN DE USUARIOS
   * ==============================
   */

  /**
   * Obtener lista de usuarios con paginación y filtros
   * @param params - Parámetros de consulta (page, page_size, filtros)
   * @param token - Token JWT del usuario autenticado
   * @returns Promise<ApiResponse> - Lista paginada de usuarios
   */
  async getUsers(params: any = {}, token?: string): Promise<ApiResponse> {
    try {
      // Preparar headers con token si está disponible
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      console.log('🔍 [SuperAdminService] Haciendo petición a FastAPI:', {
        url: `${API_CONFIG.baseURL}${API_ENDPOINTS.usuarios.base}`,
        params,
        hasToken: !!token
      });

      const response = await this.apiClient.get(API_ENDPOINTS.usuarios.base, { 
        params,
        headers
      });
      
      console.log('✅ [SuperAdminService] Respuesta de FastAPI recibida:', response.status);
      return { ok: true, data: response.data };
    } catch (error: any) {
      console.error('❌ [SuperAdminService] Error al obtener usuarios:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return { ok: false, error: error.response?.data?.message || error.message || 'Error al obtener usuarios' };
    }
  }

  /**
   * Obtener usuario específico por ID
   */
  async getUserById(id: number, token?: string): Promise<ApiResponse> {
    try {
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await this.apiClient.get(API_ENDPOINTS.usuarios.byId(id), { headers });
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al obtener usuario' };
    }
  }

  /**
   * Actualizar datos de usuario
   */
  async updateUser(id: number, data: any, token?: string): Promise<ApiResponse> {
    try {
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await this.apiClient.patch(API_ENDPOINTS.usuarios.byId(id), data, { headers });
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al actualizar usuario' };
    }
  }

  /**
   * Desactivar/eliminar usuario (soft delete)
   */
  async deleteUser(id: number, token?: string): Promise<ApiResponse> {
    try {
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      await this.apiClient.delete(API_ENDPOINTS.usuarios.byId(id), { headers });
      return { ok: true, message: 'Usuario desactivado correctamente' };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al desactivar usuario' };
    }
  }

  /**
   * MÉTODOS DE GESTIÓN DE COMPLEJOS DEPORTIVOS
   * ==========================================
   */

  /** Obtener lista de complejos con filtros y paginación */
  async getComplejos(params: any = {}): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get(API_ENDPOINTS.complejos.base, { params });
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al obtener complejos' };
    }
  }

  async getComplejoById(id: number, params: any = {}): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get(API_ENDPOINTS.complejos.byId(id), { params });
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al obtener complejo' };
    }
  }

  async getComplejoCanchas(id: number): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get(API_ENDPOINTS.complejos.canchas(id));
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al obtener canchas' };
    }
  }

  // SuperAdmin específico
  async updateSystemParameters(parametros: any): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.post(API_ENDPOINTS.super_admin.parametros, parametros);
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al actualizar parámetros' };
    }
  }

  async getSystemStatistics(): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get(API_ENDPOINTS.super_admin.estadisticas);
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { ok: false, error: error.response?.data?.message || 'Error al obtener estadísticas' };
    }
  }

  async getSystemLogs(): Promise<ApiResponse> {
    try {
      const response = await this.apiClient.get(API_ENDPOINTS.super_admin.logs);
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