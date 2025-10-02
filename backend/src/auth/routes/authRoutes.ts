/**
 * CONFIGURACIÓN DE RUTAS DEL MÓDULO AUTH
 * ======================================
 * 
 * Este archivo define todas las rutas HTTP disponibles para el módulo de autenticación.
 * Las rutas se configuran usando Express Router y se conectan con el controlador.
 * 
 * URL base: /api/auth
 * 
 * Flujos de usuario implementados:
 * 
 * 🆕 REGISTRO COMPLETO:
 * 1. POST /register → Usuario se registra
 * 2. POST /resend-verification → Reenviar email (opcional)
 * 3. POST /verify-email → Verificar cuenta con token
 * 
 * 🔐 AUTENTICACIÓN COMPLETA:
 * 1. POST /login → Iniciar sesión (obtiene access + refresh token)
 * 2. GET /me → Verificar sesión activa
 * 3. POST /refresh → Renovar access token cuando expire
 * 4. POST /logout → Cerrar sesión (revoca tokens)
 * 
 * 👤 GESTIÓN DE PERFIL:
 * 1. GET /me → Obtener datos del usuario
 * 2. PATCH /me → Actualizar perfil
 * 3. PATCH /me/password → Cambiar contraseña
 * 4. POST /me/push-token → Registrar notificaciones
 * 
 * 🔄 RECUPERACIÓN DE CONTRASEÑA:
 * 1. POST /forgot-password → Solicitar reset (envía email)
 * 2. POST /reset-password → Establecer nueva contraseña
 * 
 * Uso desde el frontend:
 * ```typescript
 * // Ejemplo de registro completo
 * const registerUser = async (userData) => {
 *   // 1. Registrar
 *   const response = await fetch('/api/auth/register', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(userData)
 *   });
 *   
 *   // 2. Si es exitoso, obtener tokens
 *   const result = await response.json();
 *   if (result.ok) {
 *     localStorage.setItem('access_token', result.data.access_token);
 *     localStorage.setItem('refresh_token', result.data.refresh_token);
 *   }
 * };
 * 
 * // Ejemplo de login
 * const loginUser = async (email, password) => {
 *   const response = await fetch('/api/auth/login', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ email, password })
 *   });
 *   
 *   const result = await response.json();
 *   if (result.ok) {
 *     localStorage.setItem('access_token', result.data.access_token);
 *     return result.data.user;
 *   }
 * };
 * 
 * // Ejemplo de obtener perfil
 * const getProfile = async () => {
 *   const token = localStorage.getItem('access_token');
 *   const response = await fetch('/api/auth/me', {
 *     headers: { 'Authorization': `Bearer ${token}` }
 *   });
 *   
 *   const result = await response.json();
 *   return result.ok ? result.data : null;
 * };
 * ```
 */

import { Router } from 'express';
import { AuthController } from '../interfaces/controllers/authController';

// Crear router de Express y instancia del controlador
const router = Router();
const controller = new AuthController();

/**
 * RUTAS DE REGISTRO Y AUTENTICACIÓN
 * =================================
 */

// POST /api/auth/register - Registrar nuevo usuario
// Body: { nombre?, apellido?, email, password, telefono? }
// Response: TokenResponse con access_token y user data
router.post('/register', controller.register);

// POST /api/auth/login - Iniciar sesión
// Body: { email, password }
// Response: TokenResponse con access_token y user data
router.post('/login', controller.login);

// POST /api/auth/logout - Cerrar sesión
// Body: { refresh_token? }
// Response: SimpleMessage confirmando el logout
router.post('/logout', controller.logout);

// POST /api/auth/refresh - Refrescar access token
// Body: { refresh_token }
// Response: AccessTokenOnly con nuevo access_token
router.post('/refresh', controller.refreshToken);

/**
 * RUTAS DE GESTIÓN DE PERFIL
 * ==========================
 */

// GET /api/auth/me - Obtener perfil del usuario actual
// Headers: Authorization: Bearer <access_token>
// Response: UserPublic con datos del usuario
router.get('/me', controller.getMe);

// PATCH /api/auth/me - Actualizar perfil del usuario
// Headers: Authorization: Bearer <access_token>
// Body: { nombre?, apellido?, telefono?, avatar_url? }
// Response: UserPublic con datos actualizados
router.patch('/me', controller.updateMe);

// PATCH /api/auth/me/password - Cambiar contraseña
// Headers: Authorization: Bearer <access_token>
// Body: { current_password, new_password }
// Response: SimpleMessage confirmando el cambio
router.patch('/me/password', controller.changePassword);

// POST /api/auth/me/push-token - Registrar token FCM
// Headers: Authorization: Bearer <access_token>
// Body: { token, platform?: 'android' | 'ios' | 'web' }
// Response: SimpleMessage confirmando el registro
router.post('/me/push-token', controller.registerPushToken);

/**
 * RUTAS DE VERIFICACIÓN DE EMAIL
 * ==============================
 */

// POST /api/auth/verify-email - Verificar email con token
// Body: { token }
// Response: SimpleMessage confirmando la verificación
router.post('/verify-email', controller.verifyEmail);

// POST /api/auth/resend-verification - Reenviar email de verificación
// Body: { email }
// Response: SimpleMessage confirmando el envío
router.post('/resend-verification', controller.resendVerification);

/**
 * RUTAS DE RECUPERACIÓN DE CONTRASEÑA
 * ===================================
 */

// POST /api/auth/forgot-password - Solicitar reset de contraseña
// Body: { email }
// Response: SimpleMessage confirmando el envío del email
router.post('/forgot-password', controller.forgotPassword);

// POST /api/auth/reset-password - Restablecer contraseña con token
// Body: { token, new_password }
// Response: TokenResponse con nueva autenticación
router.post('/reset-password', controller.resetPassword);

/**
 * RUTAS DE UTILIDAD Y DEBUG
 * =========================
 */

// GET /api/auth/status - Estado del servicio de autenticación
// Response: Estado del servicio y lista de endpoints disponibles
router.get('/status', controller.getStatus);

export default router;
