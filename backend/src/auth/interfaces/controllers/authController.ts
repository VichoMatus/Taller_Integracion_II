/**
 * CONTROLADOR AUTH - ENDPOINTS HTTP
 * =================================
 * 
 * Este controlador define los endpoints HTTP que el frontend puede consumir para
 * todas las funcionalidades de autenticación. Actúa como intermediario entre las 
 * peticiones del cliente y el servicio que consume la API FastAPI.
 * 
 * Patrón utilizado: Backend-for-Frontend (BFF)
 * - Recibe peticiones HTTP del frontend React/Next.js
 * - Delega la lógica al AuthService
 * - Retorna respuestas estandarizadas
 * 
 * Endpoints disponibles:
 * 
 * 🔐 AUTENTICACIÓN:
 * - POST /api/auth/register - Registro de usuario
 * - POST /api/auth/login - Iniciar sesión
 * - POST /api/auth/logout - Cerrar sesión
 * - POST /api/auth/refresh - Refrescar access token
 * 
 * 👤 GESTIÓN DE PERFIL:
 * - GET /api/auth/me - Obtener perfil actual
 * - PATCH /api/auth/me - Actualizar perfil
 * - PATCH /api/auth/me/password - Cambiar contraseña
 * - POST /api/auth/me/push-token - Registrar token FCM
 * 
 * 📧 VERIFICACIÓN Y RECUPERACIÓN:
 * - POST /api/auth/verify-email - Verificar email con token
 * - POST /api/auth/resend-verification - Reenviar verificación
 * - POST /api/auth/forgot-password - Solicitar reset de contraseña
 * - POST /api/auth/reset-password - Restablecer contraseña
 */

import { Request, Response } from 'express';
import { AuthService } from '../../services/authService';
import {
  UserRegister, UserLogin, UserUpdate, ChangePasswordRequest,
  VerifyEmailRequest, ResendVerificationRequest, ForgotPasswordRequest,
  ResetPasswordRequest, RefreshTokenRequest, LogoutRequest, PushTokenRequest
} from '../../types/authTypes';

/**
 * CLASE CONTROLADOR PRINCIPAL
 * ===========================
 */
export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  /**
   * ENDPOINTS DE REGISTRO Y AUTENTICACIÓN
   * =====================================
   */

  /**
   * POST /register
   * Registrar nuevo usuario en el sistema
   * Body: { nombre?, apellido?, email, password, telefono? }
   * Response: { ok: boolean, data?: TokenResponse, error?: string }
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: UserRegister = req.body;
      
      // Validación básica de email
      if (!userData.email || !userData.password) {
        res.status(400).json({ 
          ok: false, 
          error: 'Email y contraseña son requeridos' 
        });
        return;
      }

      const result = await this.service.register(userData);
      const status = result.ok ? 201 : 400;
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * POST /login
   * Autenticar usuario en el sistema
   * Body: { email, password }
   * Response: { ok: boolean, data?: TokenResponse, error?: string }
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const credentials: UserLogin = req.body;
      
      // Validación básica
      if (!credentials.email || !credentials.password) {
        res.status(400).json({ 
          ok: false, 
          error: 'Email y contraseña son requeridos' 
        });
        return;
      }

      const result = await this.service.login(credentials);
      const status = result.ok ? 200 : 401;
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * POST /logout
   * Cerrar sesión del usuario
   * Body: { refresh_token? }
   * Response: { ok: boolean, data?: SimpleMessage, error?: string }
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const logoutData: LogoutRequest = req.body;
      const result = await this.service.logout(logoutData);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * POST /refresh
   * Refrescar access token
   * Body: { refresh_token }
   * Response: { ok: boolean, data?: AccessTokenOnly, error?: string }
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshData: RefreshTokenRequest = req.body;
      
      // Validación del refresh token
      if (!refreshData.refresh_token) {
        res.status(400).json({ 
          ok: false, 
          error: 'Refresh token es requerido' 
        });
        return;
      }

      const result = await this.service.refreshToken(refreshData);
      const status = result.ok ? 200 : 401;
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * ENDPOINTS DE GESTIÓN DE PERFIL
   * ==============================
   */

  /**
   * GET /me
   * Obtener perfil del usuario actual
   * Headers: Authorization: Bearer <token>
   * Response: { ok: boolean, data?: UserPublic, error?: string }
   */
  getMe = async (req: Request, res: Response): Promise<void> => {
    try {
      // Extraer token del header Authorization
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        this.service.setAuthToken(token);
      }

      const result = await this.service.getMe();
      const status = result.ok ? 200 : 401;
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * PATCH /me
   * Actualizar perfil del usuario actual
   * Body: { nombre?, apellido?, telefono?, avatar_url? }
   * Response: { ok: boolean, data?: UserPublic, error?: string }
   */
  updateMe = async (req: Request, res: Response): Promise<void> => {
    try {
      // Extraer token del header Authorization
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        this.service.setAuthToken(token);
      }

      const updateData: UserUpdate = req.body;
      const result = await this.service.updateMe(updateData);
      const status = result.ok ? 200 : 400;
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * PATCH /me/password
   * Cambiar contraseña del usuario actual
   * Body: { current_password, new_password }
   * Response: { ok: boolean, data?: SimpleMessage, error?: string }
   */
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      // Extraer token del header Authorization
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        this.service.setAuthToken(token);
      }

      const passwordData: ChangePasswordRequest = req.body;
      
      // Validación de campos requeridos
      if (!passwordData.current_password || !passwordData.new_password) {
        res.status(400).json({ 
          ok: false, 
          error: 'Contraseña actual y nueva contraseña son requeridas' 
        });
        return;
      }

      const result = await this.service.changePassword(passwordData);
      const status = result.ok ? 200 : 400;
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * POST /me/push-token
   * Registrar token FCM para notificaciones push
   * Body: { token, platform?: 'android' | 'ios' | 'web' }
   * Response: { ok: boolean, data?: SimpleMessage, error?: string }
   */
  registerPushToken = async (req: Request, res: Response): Promise<void> => {
    try {
      // Extraer token del header Authorization
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        this.service.setAuthToken(token);
      }

      const pushData: PushTokenRequest = req.body;
      
      // Validación del token FCM
      if (!pushData.token) {
        res.status(400).json({ 
          ok: false, 
          error: 'Token FCM es requerido' 
        });
        return;
      }

      const result = await this.service.registerPushToken(pushData);
      const status = result.ok ? 200 : 400;
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * ENDPOINTS DE VERIFICACIÓN DE EMAIL
   * ==================================
   */

  /**
   * POST /verify-email
   * Verificar email con token
   * Body: { token }
   * Response: { ok: boolean, data?: SimpleMessage, error?: string }
   */
  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const verifyData: VerifyEmailRequest = req.body;
      
      // Validación del token
      if (!verifyData.token) {
        res.status(400).json({ 
          ok: false, 
          error: 'Token de verificación es requerido' 
        });
        return;
      }

      const result = await this.service.verifyEmail(verifyData);
      const status = result.ok ? 200 : 400;
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * POST /resend-verification
   * Reenviar verificación de email
   * Body: { email }
   * Response: { ok: boolean, data?: SimpleMessage, error?: string }
   */
  resendVerification = async (req: Request, res: Response): Promise<void> => {
    try {
      const resendData: ResendVerificationRequest = req.body;
      
      // Validación del email
      if (!resendData.email) {
        res.status(400).json({ 
          ok: false, 
          error: 'Email es requerido' 
        });
        return;
      }

      const result = await this.service.resendVerification(resendData);
      const status = result.ok ? 200 : 400;
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * ENDPOINTS DE RECUPERACIÓN DE CONTRASEÑA
   * =======================================
   */

  /**
   * POST /forgot-password
   * Solicitar recuperación de contraseña
   * Body: { email }
   * Response: { ok: boolean, data?: SimpleMessage, error?: string }
   */
  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const forgotData: ForgotPasswordRequest = req.body;
      
      // Validación del email
      if (!forgotData.email) {
        res.status(400).json({ 
          ok: false, 
          error: 'Email es requerido' 
        });
        return;
      }

      const result = await this.service.forgotPassword(forgotData);
      const status = result.ok ? 200 : 400;
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * POST /reset-password
   * Restablecer contraseña con token
   * Body: { token, new_password }
   * Response: { ok: boolean, data?: TokenResponse, error?: string }
   */
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const resetData: ResetPasswordRequest = req.body;
      
      // Validación de campos requeridos
      if (!resetData.token || !resetData.new_password) {
        res.status(400).json({ 
          ok: false, 
          error: 'Token y nueva contraseña son requeridos' 
        });
        return;
      }

      const result = await this.service.resetPassword(resetData);
      const status = result.ok ? 200 : 400;
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * MÉTODOS DE UTILIDAD
   * ===================
   */

  /**
   * GET /status
   * Verificar estado del servicio de autenticación
   * Response: { ok: boolean, service: string, timestamp: string }
   */
  getStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({
        ok: true,
        service: 'auth',
        timestamp: new Date().toISOString(),
        endpoints: {
          register: 'POST /register',
          login: 'POST /login',
          logout: 'POST /logout',
          refresh: 'POST /refresh',
          profile: 'GET /me',
          updateProfile: 'PATCH /me',
          changePassword: 'PATCH /me/password',
          pushToken: 'POST /me/push-token',
          verifyEmail: 'POST /verify-email',
          resendVerification: 'POST /resend-verification',
          forgotPassword: 'POST /forgot-password',
          resetPassword: 'POST /reset-password'
        }
      });
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };
}
