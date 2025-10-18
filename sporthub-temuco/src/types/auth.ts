// Login con credenciales normales
export interface LoginRequest {
  email: string;
  contrasena: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id_usuario: number | string;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
  };
}

// Registro Legacy (mantener para compatibilidad)
export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  contrasena: string;
  telefono?: string | null;
}

// ========================================
// REGISTRO DE 2 PASOS (NUEVO SISTEMA)
// ========================================

// Paso 1: Iniciar registro (POST /auth/register/init)
export interface RegisterInitRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono: string;
}

// Respuesta del paso 1
export interface RegisterInitResponse {
  action_token: string;
  message: string;
}

// Paso 2: Verificar OTP (POST /auth/register/verify)
export interface RegisterVerifyRequest {
  email: string;
  code: string;
  action_token: string;
}

// Datos del usuario autenticado (me)
export interface MeResponse {
  id_usuario: number | string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  rol: string;
  esta_activo: boolean;
  verificado: boolean;
  avatar_url?: string | null;
  bio?: string | null;
}

// ========================================
// NUEVOS TIPOS PARA BFF (Backend for Frontend)
// ========================================

// Estructura de respuesta del BFF
export interface BFFResponse<T = any> {
  ok: boolean;              
  data?: T;                 
  message?: string;         
  error?: string;           
}

// Respuesta completa del BFF para login/register
export interface BFFTokenResponse {
  access_token: string;     
  token_type: string;       
  user: {
    id_usuario: number;
    nombre?: string;
    apellido?: string;
    email: string;
    telefono?: string;
    avatar_url?: string;
    rol: 'usuario' | 'admin' | 'super_admin';
  };
}

// Solo access token (para refresh)
export interface BFFAccessTokenOnly {
  access_token: string;
  token_type: string;
}

// Actualización de perfil
export interface UserUpdateRequest {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  avatar_url?: string;
}

// Cambio de contraseña
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// Verificación de email
export interface VerifyEmailRequest {
  email: string;
  code: string;
}

// Reenvío de verificación
export interface ResendVerificationRequest {
  email: string;
}

// Envío de código de verificación
export interface SendVerificationRequest {
  email: string;
}

// Recuperación de contraseña
export interface ForgotPasswordRequest {
  email: string;
}

// Reset de contraseña
export interface ResetPasswordRequest {
  email: string;
  code: string;
  new_password: string;
}

// Refresh token
export interface RefreshTokenRequest {
  refresh_token: string;
}

// Logout
export interface LogoutRequest {
  refresh_token?: string;
}

// Push token FCM
export interface PushTokenRequest {
  token: string;
  platform?: 'android' | 'ios' | 'web';
}

// Mensaje simple
export interface SimpleMessage {
  message: string;
}
