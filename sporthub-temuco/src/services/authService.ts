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
    
    // Guardar tokens, rol y datos del usuario en localStorage
    if (data?.access_token && data?.user) {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_role", data.user.rol);
      localStorage.setItem("userData", JSON.stringify({
        id_usuario: data.user.id_usuario,
        nombre: data.user.nombre || '',
        apellido: data.user.apellido || '',
        email: data.user.email,
        rol: data.user.rol
      }));
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
  },

  // ========================================
  // MÉTODOS LEGACY ADICIONALES PARA COMPATIBILIDAD
  // ========================================

  /**
   * Registrar usuario (versión anterior)
   * @deprecated Usar register() con RegisterRequest en su lugar
   */
  async registrarUsuario(data: RegistroData): Promise<RegistroResponse> {
    try {
      // Validar datos antes de enviar
      const validationError = this.validateRegistroData(data);
      if (validationError) {
        return {
          ok: false,
          error: validationError
        };
      }

      // Adaptar al nuevo formato
      const registerPayload: RegisterRequest = {
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        email: data.email.trim().toLowerCase(),
        contrasena: data.password,
        telefono: data.telefono?.trim() || null
      };

      // Usar el nuevo método register
      const result = await this.register(registerPayload);
      
      // Adaptar la respuesta al formato anterior
      return {
        ok: true,
        data: {
          access_token: result.token,
          user: {
            id: result.usuario.id_usuario.toString(),
            nombre: result.usuario.nombre,
            apellido: result.usuario.apellido,
            email: result.usuario.email
          }
        }
      };
    } catch (error: any) {
      console.error('Error en registro:', error);
      return {
        ok: false,
        error: error.message || 'Error de conexión. Verifica que el servidor esté funcionando.'
      };
    }
  },

  /**
   * Validar datos de registro
   * @deprecated Para uso interno del método legacy
   */
  validateRegistroData(data: RegistroData): string | null {
    // Validar campos requeridos
    if (!data.nombre.trim()) return 'El nombre es requerido';
    if (!data.apellido.trim()) return 'El apellido es requerido';
    if (!data.email.trim()) return 'El email es requerido';
    if (!data.password) return 'La contraseña es requerida';
    if (!data.confirmPassword) return 'La confirmación de contraseña es requerida';

    // Validar formato de email
    if (!this.isValidEmail(data.email)) {
      return 'El formato del email no es válido';
    }

    // Validar longitud de contraseña
    if (data.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar que las contraseñas coincidan
    if (data.password !== data.confirmPassword) {
      return 'Las contraseñas no coinciden';
    }

    // Validar teléfono si se proporciona
    if (data.telefono && !this.isValidPhone(data.telefono)) {
      return 'El formato del teléfono no es válido. Ejemplo: +56912345678';
    }

    return null; // Sin errores
  },

  /**
   * Validar formato de email
   * @deprecated Para uso interno
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validar formato de teléfono internacional
   * @deprecated Para uso interno
   */
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Extraer datos del formulario HTML
   * @deprecated Para uso interno
   */
  extractFormData(form: HTMLFormElement): RegistroData {
    const formData = new FormData(form);
    
    return {
      nombre: (formData.get('nombre') as string) || '',
      apellido: (formData.get('apellido') as string) || '',
      email: (formData.get('email') as string) || '',
      password: (formData.get('password') as string) || '',
      confirmPassword: (formData.get('confirmPassword') as string) || '',
      telefono: (formData.get('telefono') as string) || ''
    };
  }
};

// ========================================
// INTERFACES LEGACY PARA COMPATIBILIDAD
// ========================================

/**
 * @deprecated Usar RegisterRequest en su lugar
 */
export interface RegistroData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmPassword: string;
  telefono: string | null;
}

/**
 * @deprecated Usar BFFTokenResponse en su lugar
 */
export interface RegistroResponse {
  ok: boolean;
  data?: {
    access_token: string;
    user: {
      id: string;
      nombre: string;
      apellido: string;
      email: string;
    };
  };
  error?: string;
}

// Exportar el servicio como default
export default authService;
