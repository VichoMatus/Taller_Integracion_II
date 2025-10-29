/**
 * TIPOS Y INTERFACES DEL MÓDULO AUTH
 * ==================================
 * 
 * Este archivo define todas las interfaces TypeScript utilizadas en el módulo Auth.
 * Estas interfaces están basadas en los schemas de la API FastAPI y aseguran
 * la consistencia de tipos entre el frontend y backend.
 * 
 * Funcionalidades cubiertas:
 * - Registro y autenticación de usuarios
 * - Gestión de perfiles y contraseñas
 * - Verificación de email y recuperación de contraseña
 * - Tokens JWT (access/refresh) y push tokens FCM
 * - Respuestas estandarizadas de la API
 * 
 * Uso: Importar estas interfaces en controladores, servicios y componentes frontend
 * Ejemplo: import { UserLogin, TokenResponse } from './types/authTypes';
 */

/**
 * INTERFACES DE REGISTRO Y AUTENTICACIÓN
 * ======================================
 */

/**
 * REGISTRO POR PASOS (2-STEP REGISTRATION)
 * ========================================
 */

/**
 * Datos para iniciar el proceso de registro (POST /auth/register/init)
 * Envía los datos completos pero solo genera OTP, no crea el usuario aún
 */
export interface RegisterInitRequest {
  nombre: string;           // Nombre del usuario (requerido en este flujo)
  apellido: string;         // Apellido del usuario (requerido en este flujo)
  email: string;            // Email único del usuario
  password: string;         // Contraseña del usuario
  telefono: string;         // Número de teléfono (requerido en este flujo)
}

/**
 * Respuesta del endpoint de inicio de registro
 * Contiene el token firmado para completar el proceso
 */
export interface RegisterInitResponse {
  action_token: string;     // Token firmado para validar en el siguiente paso
  message: string;          // Mensaje informativo sobre el OTP enviado
}

/**
 * Datos para completar el registro (POST /auth/register/verify)
 * Valida OTP + action_token y crea el usuario verificado
 */
export interface RegisterVerifyRequest {
  email: string;            // Email del usuario (debe coincidir con el del action_token)
  code: string;             // Código OTP de 6 dígitos recibido por email
  action_token: string;     // Token recibido en el paso /register/init
}

/**
 * Credenciales para iniciar sesión
 * Utilizada en el endpoint POST /auth/login
 */
export interface UserLogin {
  email: string;            // Email del usuario
  password: string;         // Contraseña del usuario
}

/**
 * Respuesta completa de autenticación
 * Retornada por endpoints de login, register y reset-password
 */
export interface TokenResponse {
  access_token: string;     // JWT token para autenticación de requests
  token_type: string;       // Tipo de token (siempre "bearer")
  user: UserPublic;         // Datos públicos del usuario autenticado
}

/**
 * Respuesta solo con access token
 * Retornada por el endpoint de refresh token
 */
export interface AccessTokenOnly {
  access_token: string;     // Nuevo JWT token
  token_type: string;       // Tipo de token (siempre "bearer")
}

/**
 * INTERFACES DE USUARIO
 * =====================
 */

/**
 * Datos públicos de un usuario (sin información sensible)
 * Utilizada para mostrar información del usuario en el frontend
 */
export interface UserPublic {
  id_usuario: number;                                          // ID único del usuario
  nombre?: string;                                             // Nombre del usuario
  apellido?: string;                                           // Apellido del usuario
  email: string;                                               // Email del usuario
  telefono?: string;                                           // Teléfono (opcional)
  avatar_url?: string;                                         // URL del avatar (opcional)
  rol: 'usuario' | 'admin' | 'super_admin';                   // Rol en el sistema
}

/**
 * Datos para actualizar el perfil del usuario
 * Utilizada en el endpoint PATCH /auth/me
 */
export interface UserUpdate {
  nombre?: string;          // Nuevo nombre (opcional)
  apellido?: string;        // Nuevo apellido (opcional)
  telefono?: string;        // Nuevo teléfono (opcional)
  avatar_url?: string;      // Nueva URL del avatar (opcional)
}

/**
 * INTERFACES DE GESTIÓN DE CONTRASEÑA
 * ===================================
 */

/**
 * Datos para cambiar la contraseña actual
 * Utilizada en el endpoint PATCH /auth/me/password
 */
export interface ChangePasswordRequest {
  current_password: string; // Contraseña actual (para verificación)
  new_password: string;     // Nueva contraseña (min 8 caracteres)
}

/**
 * Solicitud de recuperación de contraseña
 * Utilizada en el endpoint POST /auth/forgot-password
 */
export interface ForgotPasswordRequest {
  email: string;            // Email del usuario que olvidó su contraseña
}

/**
 * Restablecer contraseña con código
 * Utilizada en el endpoint POST /auth/reset-password
 */
export interface ResetPasswordRequest {
  email: string;            // Email del usuario
  code: string;             // Código de restablecimiento recibido por email (4-12 chars)
  new_password: string;     // Nueva contraseña (min 8 caracteres)
}

/**
 * INTERFACES DE VERIFICACIÓN DE EMAIL
 * ===================================
 */

/**
 * Verificar email con código
 * Utilizada en el endpoint POST /auth/verify-email
 */
export interface VerifyEmailRequest {
  email: string;            // Email del usuario a verificar
  code: string;             // Código de verificación recibido por email (4-12 chars)
}

/**
 * Reenviar verificación de email
 * Utilizada en el endpoint POST /auth/resend-verification
 */
export interface ResendVerificationRequest {
  email: string;            // Email al que reenviar la verificación
}

/**
 * Enviar código de verificación
 * Utilizada en el endpoint POST /auth/send-verification
 */
export interface SendVerificationRequest {
  email: string;            // Email al que enviar el código de verificación
}

/**
 * INTERFACES DE TOKENS Y SESIONES
 * ===============================
 */

/**
 * Refrescar access token
 * Utilizada en el endpoint POST /auth/refresh
 */
export interface RefreshTokenRequest {
  refresh_token: string;    // Token de refresco válido
}

/**
 * Cerrar sesión
 * Utilizada en el endpoint POST /auth/logout
 */
export interface LogoutRequest {
  refresh_token?: string;   // Token de refresco a revocar (opcional)
}

/**
 * Registrar token de notificaciones push (FCM)
 * Utilizada en el endpoint POST /auth/me/push-token
 */
export interface PushTokenRequest {
  token: string;                                    // Token FCM del dispositivo
  platform?: 'android' | 'ios' | 'web';           // Plataforma del dispositivo
}

/**
 * INTERFACES DE RESPUESTAS DE LA API
 * ==================================
 */

/**
 * Mensaje simple de respuesta
 * Utilizada para confirmaciones y mensajes informativos
 */
export interface SimpleMessage {
  message: string;          // Mensaje descriptivo de la operación
}

/**
 * Estructura estándar de respuesta de la API
 * Utilizada para mantener consistencia en todas las respuestas del servidor
 * 
 * @template T - Tipo de datos que contiene la respuesta
 */
export interface ApiResponse<T = any> {
  ok: boolean;              // Indica si la operación fue exitosa
  data?: T;                 // Datos de respuesta (cuando ok: true)
  message?: string;         // Mensaje informativo (opcional)
  error?: string;           // Mensaje de error (cuando ok: false)
}

/**
 * TIPOS DE UTILIDAD
 * =================
 */

/**
 * Tipos de rol disponibles en el sistema
 */
export type UserRole = 'usuario' | 'admin' | 'super_admin';

/**
 * Plataformas soportadas para notificaciones push
 */
export type PushPlatform = 'android' | 'ios' | 'web';

/**
 * INTERFACES DE STATUS Y HEALTH CHECK
 * ===================================
 */

/**
 * Respuesta de status de un endpoint específico
 */
export interface EndpointStatus {
  ok: boolean;                    // Si el endpoint está disponible
  endpoint: string;               // Nombre del endpoint
  url?: string;                   // URL completa del endpoint
  responseTime?: number;          // Tiempo de respuesta en ms
  statusCode?: number;            // Código HTTP de respuesta
  error?: string;                 // Mensaje de error si hay problemas
  timestamp: string;              // Timestamp del check
}

/**
 * Tipos de endpoints disponibles para hacer health check
 */
export type EndpointType = 'registerInit' | 'registerVerify' | 'login' | 'logout' | 'refresh' | 'me' | 'verifyEmail' | 'resendVerification' | 'sendVerification' | 'forgotPassword' | 'resetPassword' | 'pushToken';
