/**
 * TIPOS Y INTERFACES DEL MÓDULO SUPERADMIN
 * =====================================
 * 
 * Este archivo define todas las interfaces TypeScript utilizadas en el módulo SuperAdmin.
 * Estas interfaces aseguran la consistencia de tipos entre el frontend y backend,
 * y definen la estructura de datos que se intercambia con la API FastAPI hosteada.
 * 
 * Uso: Importar estas interfaces en controladores, servicios y componentes frontend
 * Ejemplo: import { LoginRequest, ApiResponse } from './types/superAdminTypes';
 */

/**
 * INTERFACES DE AUTENTICACIÓN
 * ===========================
 */

/**
 * Estructura de datos para el login de usuario
 * Utilizada cuando el frontend envía credenciales de acceso
 */
export interface LoginRequest {
  email: string;    // Email del usuario (requerido)
  password: string; // Contraseña del usuario (requerido)
}

/**
 * Respuesta del servidor al realizar login exitoso
 * Contiene tokens JWT y datos del usuario autenticado
 */
export interface TokenResponse {
  access_token: string;  // JWT token para autenticación de requests
  refresh_token: string; // Token para renovar el access_token
  token_type: string;    // Tipo de token (generalmente "Bearer")
  user: UserPublic;      // Datos públicos del usuario logueado
}

/**
 * INTERFACES DE USUARIO
 * =====================
 */

/**
 * Datos públicos de un usuario (sin información sensible)
 * Utilizada para mostrar información de usuarios en el frontend
 */
export interface UserPublic {
  id_usuario: number;                                           // ID único del usuario
  nombre: string;                                               // Nombre del usuario
  apellido: string;                                             // Apellido del usuario
  email: string;                                                // Email del usuario
  telefono?: string;                                            // Teléfono (opcional)
  avatar?: string;                                              // URL del avatar (opcional)
  rol: 'usuario' | 'dueno' | 'admin' | 'superadmin';          // Rol del usuario en el sistema
  activo: boolean;                                              // Estado activo/inactivo
  verificado: boolean;                                          // Si el email está verificado
  fecha_creacion: string;                                       // Fecha de creación (ISO format)
}

/**
 * INTERFACES DE CONSULTAS Y PAGINACIÓN
 * ====================================
 */

/**
 * Parámetros base para consultas paginadas
 * Utilizada en endpoints que retornan listas con paginación
 */
export interface BaseQuery {
  page?: number;      // Número de página (default: 1)
  page_size?: number; // Cantidad de elementos por página (default: 20)
}

/**
 * INTERFACES DE RESPUESTAS API
 * ============================
 */

/**
 * Estructura estándar de respuesta de la API
 * Utilizada para mantener consistencia en todas las respuestas del servidor
 * 
 * @template T - Tipo de datos que contiene la respuesta
 */
export interface ApiResponse<T = any> {
  ok: boolean;      // Indica si la operación fue exitosa
  data?: T;         // Datos de respuesta (cuando ok: true)
  message?: string; // Mensaje informativo (opcional)
  error?: string;   // Mensaje de error (cuando ok: false)
}