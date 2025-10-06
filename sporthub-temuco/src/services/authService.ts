import api from "@/config/backend";
import { 
  LoginRequest, LoginResponse, RegisterRequest, MeResponse,
  BFFTokenResponse, BFFAccessTokenOnly, UserUpdateRequest, ChangePasswordRequest,
  VerifyEmailRequest, ResendVerificationRequest, SendVerificationRequest,
  ForgotPasswordRequest, ResetPasswordRequest, RefreshTokenRequest,
  LogoutRequest, PushTokenRequest, SimpleMessage
} from "@/types/auth";

/**
 * Servicio de autenticación actualizado para el BFF
 * Maneja tanto los métodos legacy como los nuevos endpoints
 */
export const authService = {
  
  // ========================================
  // MÉTODOS LEGACY (mantener compatibilidad)
  // ========================================
  
  async login(payload: LoginRequest) {
    // Adaptar el payload al formato esperado por el BFF
    const bffPayload = {
      email: payload.email,
      password: payload.contrasena // Convertir 'contrasena' a 'password'
    };
    
    const data = await api.post<BFFTokenResponse>("/auth/login", bffPayload).then(r => r.data);
    
    // Guardar tokens en el formato que espera el código existente
    if (data?.access_token) {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("access_token", data.access_token);
    }
    
    // Retornar en el formato legacy esperado
    return {
      token: data.access_token,
      usuario: {
        id_usuario: data.user.id_usuario,
        nombre: data.user.nombre || '',
        apellido: data.user.apellido || '',
        email: data.user.email,
        rol: data.user.rol
      }
    } as LoginResponse;
  },

  async register(payload: RegisterRequest) {
    // Adaptar el payload al formato esperado por el BFF
    const bffPayload = {
      nombre: payload.nombre,
      apellido: payload.apellido,
      email: payload.email,
      password: payload.contrasena, // Convertir 'contrasena' a 'password'
      telefono: payload.telefono
    };
    
    const data = await api.post<BFFTokenResponse>("/auth/register", bffPayload).then(r => r.data);
    
    // Guardar tokens
    if (data?.access_token) {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("access_token", data.access_token);
    }
    
    // Retornar en el formato legacy esperado
    return {
      token: data.access_token,
      usuario: {
        id_usuario: data.user.id_usuario,
        nombre: data.user.nombre || '',
        apellido: data.user.apellido || '',
        email: data.user.email,
        rol: data.user.rol
      }
    } as LoginResponse;
  },

  async me() {
    const data = await api.get("/auth/me").then(r => r.data);
    return data as MeResponse;
  },

  async refresh() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No hay refresh token disponible');
    }
    
    const payload: RefreshTokenRequest = { refresh_token: refreshToken };
    const data = await api.post<BFFAccessTokenOnly>("/auth/refresh", payload).then(r => r.data);
    
    // Actualizar tokens
    if (data?.access_token) {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("access_token", data.access_token);
    }
    
    return {
      token: data.access_token,
      usuario: {
        id_usuario: 0,
        nombre: '',
        apellido: '',
        email: '',
        rol: 'usuario'
      }
    } as LoginResponse;
  },

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const payload: LogoutRequest = refreshToken ? { refresh_token: refreshToken } : {};
      await api.post<SimpleMessage>("/auth/logout", payload);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  },

  async loginGoogle(googleToken: string) {
    // Mantener el método para compatibilidad, pero no está implementado en el BFF
    throw new Error('Google login no implementado en el BFF');
  },

  // ========================================
  // NUEVOS MÉTODOS DEL BFF
  // ========================================

  /**
   * Actualizar perfil del usuario
   */
  async updateProfile(payload: UserUpdateRequest) {
    return api.patch("/auth/me", payload).then(r => r.data);
  },

  /**
   * Cambiar contraseña
   */
  async changePassword(payload: ChangePasswordRequest) {
    return api.patch<SimpleMessage>("/auth/me/password", payload).then(r => r.data);
  },

  /**
   * Verificar email con código
   */
  async verifyEmail(payload: VerifyEmailRequest) {
    return api.post<SimpleMessage>("/auth/verify-email", payload).then(r => r.data);
  },

  /**
   * Reenviar código de verificación
   */
  async resendVerification(payload: ResendVerificationRequest) {
    return api.post<SimpleMessage>("/auth/resend-verification", payload).then(r => r.data);
  },

  /**
   * Enviar código de verificación
   */
  async sendVerification(payload: SendVerificationRequest) {
    return api.post<SimpleMessage>("/auth/send-verification", payload).then(r => r.data);
  },

  /**
   * Solicitar recuperación de contraseña
   */
  async forgotPassword(payload: ForgotPasswordRequest) {
    return api.post<SimpleMessage>("/auth/forgot-password", payload).then(r => r.data);
  },

  /**
   * Restablecer contraseña con código
   */
  async resetPassword(payload: ResetPasswordRequest) {
    return api.post<SimpleMessage>("/auth/reset-password", payload).then(r => r.data);
  },

  /**
   * Registrar token FCM para notificaciones push
   */
  async registerPushToken(payload: PushTokenRequest) {
    return api.post<SimpleMessage>("/auth/me/push-token", payload).then(r => r.data);
  },

  // ========================================
  // MÉTODOS DE STATUS Y HEALTH CHECK
  // ========================================

  /**
   * Verificar estado del servicio de auth
   */
  async getStatus() {
    return api.get("/auth/status").then(r => r.data);
  },

  /**
   * Verificar estado de un endpoint específico
   */
  async getEndpointStatus(endpoint: string) {
    return api.get(`/auth/${endpoint}/status`).then(r => r.data);
  },

  /**
   * Verificar estado de todos los endpoints
   */
  async getAllEndpointsStatus() {
    return api.get("/auth/status/all").then(r => r.data);
  },

  // ========================================
  // UTILIDADES
  // ========================================

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!(localStorage.getItem('access_token') || localStorage.getItem('token'));
  },

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    return localStorage.getItem('access_token') || localStorage.getItem('token');
  },

  /**
   * Limpiar sesión
   */
  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};
