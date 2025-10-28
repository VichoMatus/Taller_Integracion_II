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
  UserLogin, TokenResponse, ApiResponse, UserPublic,
  UserUpdate, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest,
  VerifyEmailRequest, ResendVerificationRequest, SendVerificationRequest, RefreshTokenRequest,
  LogoutRequest, PushTokenRequest, SimpleMessage, AccessTokenOnly, EndpointStatus, EndpointType,
  RegisterInitRequest, RegisterInitResponse, RegisterVerifyRequest
} from '../types/authTypes';

/**
 * CLASE PRINCIPAL DEL SERVICIO AUTH
 * =================================
 */
export class AuthService {
  private apiClient: AxiosInstance; // Cliente HTTP configurado para la API FastAPI
  private authToken: string | null = null; // Token JWT almacenado en memoria

  /**
   * Normaliza el rol del usuario a minúsculas y convierte variantes
   * @param rol - Rol del usuario (puede venir en mayúsculas, minúsculas o mixto)
   * @returns string - Rol normalizado en minúsculas
   */
  private normalizeRole(rol: string): string {
    const normalized = rol.toLowerCase().trim();
    
    // Mapear roles específicos para mantener consistencia
    switch (normalized) {
      case 'admin':
        return 'admin';
      case 'super_admin':
      case 'superadmin':
        return 'super_admin';
      case 'usuario':
      case 'user':
        return 'usuario';
      default:
        return normalized;
    }
  }



  /**
   * Normaliza los datos del usuario, especialmente el rol
   * @param userData - Datos del usuario que pueden venir con rol en cualquier formato
   * @returns UserPublic - Datos del usuario con rol normalizado
   */
  private async normalizeUserDataAsync(userData: any): Promise<any> {
    if (!userData) return userData;
    
    console.log('🔍 [AuthService.normalizeUserDataAsync] Datos recibidos completos:', {
      id_usuario: userData.id_usuario,
      id: userData.id,
      nombre: userData.nombre,
      email: userData.email,
      rol: userData.rol,
      rolTipo: typeof userData.rol,
      todosLosCampos: Object.keys(userData)
    });
    
    const normalizedRole = userData.rol ? this.normalizeRole(userData.rol) : userData.rol;
    
    console.log('🔄 [AuthService.normalizeUserDataAsync] Normalización de rol:', {
      original: userData.rol,
      normalizado: normalizedRole
    });

    // ✅ OBTENER complejo_id para usuarios admin
    let complejo_id = userData.complejo_id;
    
    if (normalizedRole === 'admin' && !complejo_id) {
      try {
        console.log('🏢 [AuthService.normalizeUserDataAsync] Obteniendo complejo_id para admin:', userData.id_usuario);
        
        // Hacer request al endpoint de complejos para obtener el complejo del admin
        const complejoResponse = await this.apiClient.get(`/api/complejos/admin/${userData.id_usuario}`);
        
        if (complejoResponse.data?.ok && complejoResponse.data?.data?.length > 0) {
          complejo_id = complejoResponse.data.data[0].id_complejo;
          console.log('✅ [AuthService.normalizeUserDataAsync] complejo_id obtenido:', complejo_id);
        } else {
          console.log('⚠️ [AuthService.normalizeUserDataAsync] No se encontró complejo para admin:', userData.id_usuario);
        }
      } catch (error) {
        console.error('❌ [AuthService.normalizeUserDataAsync] Error obteniendo complejo_id:', error);
        // No lanzar error, continuar sin complejo_id
      }
    }
    
    return {
      ...userData,
      rol: normalizedRole,
      complejo_id
    };
  }

  /**
   * Versión síncrona para compatibilidad
   * NOTA: No puede obtener complejo_id asincrónicamente, solo preserva si ya existe
   */
  private normalizeUserData(userData: any): any {
    if (!userData) return userData;
    
    return {
      ...userData,
      rol: userData.rol ? this.normalizeRole(userData.rol) : userData.rol,
      complejo_id: userData.complejo_id // Preservar complejo_id si ya existe
    };
  }

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
   * Iniciar proceso de registro (envía OTP, no crea usuario aún)
   * @param userData - Datos completos del usuario para pre-registro
   * @returns Promise<ApiResponse<RegisterInitResponse>> - Action token para completar el proceso
   */
  async registerInit(userData: RegisterInitRequest): Promise<ApiResponse<RegisterInitResponse>> {
    try {
      console.log('🔄 AuthService: Iniciando registro por pasos con datos:', JSON.stringify(userData, null, 2));
      console.log('🔄 AuthService: URL de API:', API_CONFIG.baseURL + API_ENDPOINTS.auth.registerInit);
      
      const response = await this.apiClient.post(API_ENDPOINTS.auth.registerInit, userData);
      
      console.log('✅ AuthService: Init registro exitoso, OTP enviado', response.data);
      return { ok: true, data: response.data };
    } catch (error: any) {
      console.error('❌ AuthService: Error en init registro:', {
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
        error: error.response?.data?.detail || error.message || 'Error al iniciar proceso de registro' 
      };
    }
  }

  /**
   * Verificar OTP y completar el registro (crea el usuario verificado)
   * @param verifyData - Email, código OTP y action token
   * @returns Promise<ApiResponse<TokenResponse>> - Tokens y datos del usuario creado
   */
  async registerVerify(verifyData: RegisterVerifyRequest): Promise<ApiResponse<TokenResponse>> {
    try {
      console.log('🔄 AuthService: Verificando OTP y completando registro:', JSON.stringify(verifyData, null, 2));
      console.log('🔄 AuthService: URL de API:', API_CONFIG.baseURL + API_ENDPOINTS.auth.registerVerify);
      
      const response = await this.apiClient.post(API_ENDPOINTS.auth.registerVerify, verifyData);
      
      console.log('✅ AuthService: Registro completo exitoso', response.data);
      
      // Almacenar token para futuras peticiones
      if (response.data.access_token) {
        this.authToken = response.data.access_token;
      }
      
      // 🔥 NORMALIZAR ROL: Convertir a minúsculas y super_admin → super_admin
      const normalizedData = {
        ...response.data,
        user: response.data.user ? this.normalizeUserData(response.data.user) : response.data.user
      };
      
      return { ok: true, data: normalizedData };
    } catch (error: any) {
      console.error('❌ AuthService: Error en verificación de registro:', {
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
        error: error.response?.data?.detail || error.message || 'Error al verificar código de registro' 
      };
    }
  }

  /**
   * MÉTODOS DE PRE-REGISTRO CON VERIFICACIÓN DE EMAIL
   * =================================================
   */

  /**
   * Pre-registrar usuario y enviar correo de verificación
  /**
   * Autenticar usuario en el sistema
   * @param credentials - Email y contraseña del usuario
   * @returns Promise<ApiResponse<TokenResponse>> - Tokens y datos del usuario
   */
  async login(credentials: UserLogin): Promise<ApiResponse<TokenResponse>> {
    try {
      console.log('🔄 [AuthService.login] Iniciando login con credenciales:', {
        email: credentials.email,
        url: `${API_CONFIG.baseURL}${API_ENDPOINTS.auth.login}`
      });
      
      const response = await this.apiClient.post(API_ENDPOINTS.auth.login, credentials);
      
      console.log('🔍 [AuthService.login] Respuesta COMPLETA de FastAPI:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        dataCompleta: response.data
      });
      
      console.log('🔍 [AuthService.login] Usuario específico de la respuesta:', {
        user: response.data.user,
        rolRecibido: response.data.user?.rol,
        rolTipo: typeof response.data.user?.rol,
        idUsuario: response.data.user?.id_usuario || response.data.user?.id,
        email: response.data.user?.email
      });
      
      // Almacenar token para futuras peticiones
      if (response.data.access_token) {
        this.authToken = response.data.access_token;
      }
      
      // 🔥 NORMALIZAR ROL: Aplicar correcciones y normalización
      const normalizedData = {
        ...response.data,
        user: response.data.user ? await this.normalizeUserDataAsync(response.data.user) : response.data.user
      };
      
      console.log('✅ [AuthService.login] Resultado final después de normalización:', {
        originalRol: response.data.user?.rol,
        normalizedRol: normalizedData.user?.rol,
        userId: normalizedData.user?.id_usuario || normalizedData.user?.id
      });
      
      return { ok: true, data: normalizedData };
    } catch (error: any) {
      console.error('❌ [AuthService.login] Error en login:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
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
   * @returns Promise<ApiResponse<UserPublic>> - Perfil del usuario
   */
  async getMe(): Promise<ApiResponse<UserPublic>> {
    try {
      const response = await this.apiClient.get(API_ENDPOINTS.auth.me);
      
      // ✅ USAR VERSION ASINCRONA: Normalizar rol y obtener complejo_id para admins
      const normalizedData = await this.normalizeUserDataAsync(response.data);
      
      console.log('🔄 [AuthService.getMe] Datos normalizados:', {
        original: response.data?.rol,
        normalizado: normalizedData?.rol,
        complejo_id: normalizedData?.complejo_id
      });
      
      return { ok: true, data: normalizedData };
    } catch (error: any) {
      return { 
        ok: false, 
        error: error.response?.data?.detail || 'Error al obtener perfil' 
      };
    }
  }  /**
   * Actualizar perfil del usuario actual
   * @param updateData - Datos a actualizar del perfil
   * @returns Promise<ApiResponse<UserPublic>> - Perfil actualizado
   */
  async updateMe(updateData: UserUpdate): Promise<ApiResponse<UserPublic>> {
    try {
      const response = await this.apiClient.patch(API_ENDPOINTS.auth.updateMe, updateData);
      
      // 🔥 NORMALIZAR ROL: Convertir a minúsculas y super_admin → super_admin
      const normalizedData = this.normalizeUserData(response.data);
      
      return { ok: true, data: normalizedData };
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
   * Verificar email con código
   * @param verifyData - Email y código de verificación
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
   * Enviar código de verificación
   * @param sendData - Email al que enviar el código de verificación
   * @returns Promise<ApiResponse<SimpleMessage>> - Confirmación de envío
   */
  async sendVerification(sendData: SendVerificationRequest): Promise<ApiResponse<SimpleMessage>> {
    try {
      const response = await this.apiClient.post(API_ENDPOINTS.auth.sendVerification, sendData);
      return { ok: true, data: response.data };
    } catch (error: any) {
      return { 
        ok: false, 
        error: error.response?.data?.detail || 'Error al enviar verificación' 
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
   * Restablecer contraseña con código
   * @param resetData - Email, código y nueva contraseña
   * @returns Promise<ApiResponse<SimpleMessage>> - Confirmación del cambio
   */
  async resetPassword(resetData: ResetPasswordRequest): Promise<ApiResponse<SimpleMessage>> {
    try {
      const response = await this.apiClient.post(API_ENDPOINTS.auth.resetPassword, resetData);
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

  /**
   * MÉTODOS DE HEALTH CHECK Y STATUS
   * ================================
   */

  /**
   * Verificar el status de conectividad de un endpoint específico
   * @param endpointType - Tipo de endpoint a verificar
   * @returns Promise<EndpointStatus> - Estado del endpoint
   */
  async checkEndpointStatus(endpointType: EndpointType): Promise<EndpointStatus> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    // Mapear tipos de endpoint a URLs
    const endpointMap: Record<EndpointType, string> = {
      registerInit: API_ENDPOINTS.auth.registerInit,
      registerVerify: API_ENDPOINTS.auth.registerVerify,
      login: API_ENDPOINTS.auth.login,
      logout: API_ENDPOINTS.auth.logout,
      refresh: API_ENDPOINTS.auth.refresh,
      me: API_ENDPOINTS.auth.me,
      verifyEmail: API_ENDPOINTS.auth.verifyEmail,
      resendVerification: API_ENDPOINTS.auth.resendVerification,
      sendVerification: API_ENDPOINTS.auth.sendVerification,
      forgotPassword: API_ENDPOINTS.auth.forgotPassword,
      resetPassword: API_ENDPOINTS.auth.resetPassword,
      pushToken: API_ENDPOINTS.auth.pushToken
    };

    const endpoint = endpointMap[endpointType];
    const fullUrl = `${API_CONFIG.baseURL}${endpoint}`;

    try {
      // Para endpoints que requieren autenticación, hacer un HEAD request
      // Para endpoints públicos, hacer un OPTIONS request para verificar CORS
      const method = ['me', 'pushToken'].includes(endpointType) ? 'head' : 'options';
      
      const response = await this.apiClient.request({
        method,
        url: endpoint,
        timeout: 5000, // 5 segundos timeout
        validateStatus: (status) => status < 500 // Considerar 4xx como disponible pero con error de validación
      });

      const responseTime = Date.now() - startTime;

      return {
        ok: true,
        endpoint: endpointType,
        url: fullUrl,
        responseTime,
        statusCode: response.status,
        timestamp
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;

      // Si es un error de red (ECONNREFUSED, timeout, etc.)
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
        return {
          ok: false,
          endpoint: endpointType,
          url: fullUrl,
          responseTime,
          error: `Conexión fallida: ${error.message}`,
          timestamp
        };
      }

      // Si es un error HTTP pero el servidor respondió
      if (error.response) {
        return {
          ok: false,
          endpoint: endpointType,
          url: fullUrl,
          responseTime,
          statusCode: error.response.status,
          error: `HTTP ${error.response.status}: ${error.response.statusText}`,
          timestamp
        };
      }

      // Otros errores
      return {
        ok: false,
        endpoint: endpointType,
        url: fullUrl,
        responseTime,
        error: error.message || 'Error desconocido',
        timestamp
      };
    }
  }

  /**
   * Verificar el status de todos los endpoints de autenticación
   * @returns Promise<Record<EndpointType, EndpointStatus>> - Status de todos los endpoints
   */
  async checkAllEndpointsStatus(): Promise<Record<EndpointType, EndpointStatus>> {
    const endpoints: EndpointType[] = ['registerInit', 'registerVerify', 'login', 'logout', 'refresh', 'me', 'verifyEmail', 'resendVerification', 'sendVerification', 'forgotPassword', 'resetPassword', 'pushToken'];
    
    const statusChecks = endpoints.map(async (endpoint) => {
      const status = await this.checkEndpointStatus(endpoint);
      return { endpoint, status };
    });

    const results = await Promise.all(statusChecks);
    
    return results.reduce((acc, { endpoint, status }) => {
      acc[endpoint] = status;
      return acc;
    }, {} as Record<EndpointType, EndpointStatus>);
  }
}
