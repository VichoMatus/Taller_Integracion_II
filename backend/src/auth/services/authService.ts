/**
 * SERVICIO AUTH - CLIENTE HTTP PARA API FASTAPI
 * =============================================
 * 
 * Este servicio actúa como un cliente HTTP que consume la API FastAPI hosteada en OpenCloud
 * específicamente para el módulo de autenticación. Implementa el patrón Backend-for-Frontend (BFF),
 * actuando como proxy entre el frontend React/Next.js y la API externa.
 * 
 * Funcionalidades principales:
 * - Registro y autenticación de usuarios
 * - Gestión de perfiles y contraseñas
 * - Verificación de email y recuperación de contraseña
 * - Manejo de tokens JWT (access/refresh)
 * - Registro de tokens push para notificaciones FCM
 * 
 * Flujos implementados:
 * 1. Registro completo: register → verify-email
 * 2. Autenticación: login → refresh → logout
 * 3. Perfil: getMe → updateMe → changePassword
 * 4. Recuperación: forgotPassword → resetPassword
 * 5. Notificaciones: registerPushToken
 * 
 * Uso desde el frontend:
 * - El frontend hace llamadas a este backend (Node.js)
 * - Este servicio traduce las llamadas a la API FastAPI
 * - Retorna datos estandarizados en formato ApiResponse<T>
 */

import axios, { AxiosInstance } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../../config/config';
import {
  UserRegister, UserRegisterAPI, UserLogin, TokenResponse, ApiResponse, UserPublic,
  UserUpdate, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest,
  VerifyEmailRequest, ResendVerificationRequest, RefreshTokenRequest,
  LogoutRequest, PushTokenRequest, SimpleMessage, AccessTokenOnly
} from '../types/authTypes';

/**
 * CLASE PRINCIPAL DEL SERVICIO AUTH
 * =================================
 */
export class AuthService {
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
   * MÉTODOS DE REGISTRO Y AUTENTICACIÓN
   * ===================================
   */

  /**
   * Registrar nuevo usuario en el sistema
   * @param userData - Datos del usuario a registrar
   * @returns Promise<ApiResponse<TokenResponse>> - Tokens y datos del usuario registrado
   */
  async register(userData: UserRegister): Promise<ApiResponse<TokenResponse>> {
    try {
      console.log('🔄 AuthService: Iniciando registro con datos:', JSON.stringify(userData, null, 2));
      console.log('🔄 AuthService: URL de API:', API_CONFIG.baseURL + API_ENDPOINTS.auth.register);
      
      // Crear objeto sin confirmPassword para enviar a la API
      const { confirmPassword, ...apiData } = userData;
      console.log('🔄 AuthService: Datos para API (sin confirmPassword):', JSON.stringify(apiData, null, 2));
      
      const response = await this.apiClient.post(API_ENDPOINTS.auth.register, apiData);
      
      console.log('✅ AuthService: Registro exitoso', response.data);
      
      // Almacenar token para futuras peticiones
      if (response.data.access_token) {
        this.authToken = response.data.access_token;
      }
      
      return { ok: true, data: response.data };
    } catch (error: any) {
      console.error('❌ AuthService: Error en registro:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      return { 
        ok: false, 
        error: error.response?.data?.detail || error.message || 'Error en el registro de usuario' 
      };
    }
  }

  /**
   * Autenticar usuario en el sistema
   * @param credentials - Email y contraseña del usuario
   * @returns Promise<ApiResponse<TokenResponse>> - Tokens y datos del usuario
   */
  async login(credentials: UserLogin): Promise<ApiResponse<TokenResponse>> {
    try {
      const response = await this.apiClient.post(API_ENDPOINTS.auth.login, credentials);
      
      // Almacenar token para futuras peticiones
      if (response.data.access_token) {
        this.authToken = response.data.access_token;
      }
      
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { 
        ok: false, 
        error: error.response?.data?.detail || 'Error de autenticación' 
      };
    }
  }

  /**
   * Cerrar sesión del usuario
   * @param logoutData - Token de refresco a revocar (opcional)
   * @returns Promise<ApiResponse<SimpleMessage>> - Confirmación de logout
   */
  async logout(logoutData: LogoutRequest = {}): Promise<ApiResponse<SimpleMessage>> {
    try {
      const response = await this.apiClient.post(API_ENDPOINTS.auth.logout, logoutData);
      
      // Limpiar token almacenado
      this.authToken = null;
      
      return { ok: true, data: response.data };
    } catch (error: any) {
      // Limpiar token incluso si hay error
      this.authToken = null;
      return { 
        ok: false, 
        error: error.response?.data?.detail || 'Error al cerrar sesión' 
      };
    }
  }

  /**
   * Refrescar access token
   * @param refreshData - Token de refresco válido
   * @returns Promise<ApiResponse<AccessTokenOnly>> - Nuevo access token
   */
  async refreshToken(refreshData: RefreshTokenRequest): Promise<ApiResponse<AccessTokenOnly>> {
    try {
      const response = await this.apiClient.post(API_ENDPOINTS.auth.refresh, refreshData);
      
      // Actualizar token almacenado
      if (response.data.access_token) {
        this.authToken = response.data.access_token;
      }
      
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { 
        ok: false, 
        error: error.response?.data?.detail || 'Error al refrescar token' 
      };
    }
  }

  /**
   * MÉTODOS DE GESTIÓN DE PERFIL
   * ============================
   */

  /**
   * Obtener perfil del usuario actual
   * @returns Promise<ApiResponse<UserPublic>> - Datos del usuario autenticado
   */
  async getMe(): Promise<ApiResponse<UserPublic>> {
    try {
      const response = await this.apiClient.get(API_ENDPOINTS.auth.me);
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { 
        ok: false, 
        error: error.response?.data?.detail || 'Error al obtener perfil' 
      };
    }
  }

  /**
   * Actualizar perfil del usuario actual
   * @param updateData - Datos a actualizar del perfil
   * @returns Promise<ApiResponse<UserPublic>> - Perfil actualizado
   */
  async updateMe(updateData: UserUpdate): Promise<ApiResponse<UserPublic>> {
    try {
      const response = await this.apiClient.patch(API_ENDPOINTS.auth.updateMe, updateData);
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { 
        ok: false, 
        error: error.response?.data?.detail || 'Error al actualizar perfil' 
      };
    }
  }

  /**
   * Cambiar contraseña del usuario actual
   * @param passwordData - Contraseña actual y nueva contraseña
   * @returns Promise<ApiResponse<SimpleMessage>> - Confirmación del cambio
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<ApiResponse<SimpleMessage>> {
    try {
      const response = await this.apiClient.patch(API_ENDPOINTS.auth.changePassword, passwordData);
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { 
        ok: false, 
        error: error.response?.data?.detail || 'Error al cambiar contraseña' 
      };
    }
  }

  /**
   * MÉTODOS DE VERIFICACIÓN DE EMAIL
   * ================================
   */

  /**
   * Verificar email con token
   * @param verifyData - Token de verificación
   * @returns Promise<ApiResponse<SimpleMessage>> - Confirmación de verificación
   */
  async verifyEmail(verifyData: VerifyEmailRequest): Promise<ApiResponse<SimpleMessage>> {
    try {
      const response = await this.apiClient.post(API_ENDPOINTS.auth.verifyEmail, verifyData);
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { 
        ok: false, 
        error: error.response?.data?.detail || 'Error al verificar email' 
      };
    }
  }

  /**
   * Reenviar verificación de email
   * @param resendData - Email al que reenviar la verificación
   * @returns Promise<ApiResponse<SimpleMessage>> - Confirmación de envío
   */
  async resendVerification(resendData: ResendVerificationRequest): Promise<ApiResponse<SimpleMessage>> {
    try {
      const response = await this.apiClient.post(API_ENDPOINTS.auth.resendVerification, resendData);
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { 
        ok: false, 
        error: error.response?.data?.detail || 'Error al reenviar verificación' 
      };
    }
  }

  /**
   * MÉTODOS DE RECUPERACIÓN DE CONTRASEÑA
   * =====================================
   */

  /**
   * Solicitar recuperación de contraseña
   * @param forgotData - Email del usuario
   * @returns Promise<ApiResponse<SimpleMessage>> - Confirmación de envío
   */
  async forgotPassword(forgotData: ForgotPasswordRequest): Promise<ApiResponse<SimpleMessage>> {
    try {
      const response = await this.apiClient.post(API_ENDPOINTS.auth.forgotPassword, forgotData);
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { 
        ok: false, 
        error: error.response?.data?.detail || 'Error al solicitar recuperación' 
      };
    }
  }

  /**
   * Restablecer contraseña con token
   * @param resetData - Token y nueva contraseña
   * @returns Promise<ApiResponse<TokenResponse>> - Nueva autenticación
   */
  async resetPassword(resetData: ResetPasswordRequest): Promise<ApiResponse<TokenResponse>> {
    try {
      const response = await this.apiClient.post(API_ENDPOINTS.auth.resetPassword, resetData);
      
      // Almacenar nuevo token
      if (response.data.access_token) {
        this.authToken = response.data.access_token;
      }
      
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { 
        ok: false, 
        error: error.response?.data?.detail || 'Error al restablecer contraseña' 
      };
    }
  }

  /**
   * MÉTODOS DE NOTIFICACIONES PUSH
   * ==============================
   */

  /**
   * Registrar token FCM para notificaciones push
   * @param pushData - Token FCM y plataforma
   * @returns Promise<ApiResponse<SimpleMessage>> - Confirmación de registro
   */
  async registerPushToken(pushData: PushTokenRequest): Promise<ApiResponse<SimpleMessage>> {
    try {
      const response = await this.apiClient.post(API_ENDPOINTS.auth.pushToken, pushData);
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { 
        ok: false, 
        error: error.response?.data?.detail || 'Error al registrar token push' 
      };
    }
  }

  /**
   * MÉTODOS DE UTILIDAD
   * ===================
   */

  /**
   * Establecer token de autenticación manualmente
   * @param token - Token JWT a establecer
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Limpiar token de autenticación
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  /**
   * Obtener token actual (para debugging)
   * @returns string | null - Token actual o null
   */
  getCurrentToken(): string | null {
    return this.authToken;
  }
}
