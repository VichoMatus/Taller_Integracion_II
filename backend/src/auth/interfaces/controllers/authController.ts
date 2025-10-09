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
  VerifyEmailRequest, ResendVerificationRequest, SendVerificationRequest, ForgotPasswordRequest,
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
   * Body: { nombre?, apellido?, email, password, confirmPassword?, telefono? }
   * Response: { ok: boolean, data?: TokenResponse, error?: string }
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: UserRegister = req.body;
      
      // Validaciones básicas requeridas
      if (!userData.email || !userData.password) {
        res.status(400).json({ 
          ok: false, 
          error: 'Email y contraseña son requeridos' 
        });
        return;
      }

      // Validación de confirmación de contraseña
      if (userData.confirmPassword && userData.password !== userData.confirmPassword) {
        res.status(400).json({ 
          ok: false, 
          error: 'contraseñas no coinciden' 
        });
        return;
      }

      // Validación de longitud mínima de contraseña
      if (userData.password.length < 6) {
        res.status(400).json({ 
          ok: false, 
          error: 'La contraseña debe tener al menos 6 caracteres' 
        });
        return;
      }

      // Validación de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        res.status(400).json({ 
          ok: false, 
          error: 'El formato del email no es válido' 
        });
        return;
      }

      // Validación de teléfono (si se proporciona)
      if (userData.telefono && userData.telefono.length > 0) {
        // Acepta múltiples prefijos internacionales: +56 (Chile), +54 (Argentina), +1 (USA/Canadá), 
        // +34 (España), +52 (México), +57 (Colombia), +51 (Perú), +55 (Brasil), etc.
        const telefonoRegex = /^(\+[1-9]\d{0,3})?[0-9]{7,10}$/;
        if (!telefonoRegex.test(userData.telefono.replace(/[\s-]/g, ''))) {
          res.status(400).json({ 
            ok: false, 
            error: 'El formato del teléfono no es válido (ejemplos: +56912345678, +1234567890, +34123456789)' 
          });
          return;
        }
      }

      console.log('✅ AuthController: Validaciones pasadas, enviando a AuthService');
      
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
   * Verificar email con código
   * Body: { email, code }
   * Response: { ok: boolean, data?: SimpleMessage, error?: string }
   */
  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const verifyData: VerifyEmailRequest = req.body;
      
      // Validación de email y código
      if (!verifyData.email || !verifyData.code) {
        res.status(400).json({ 
          ok: false, 
          error: 'Email y código de verificación son requeridos' 
        });
        return;
      }

      // Validación básica del formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(verifyData.email)) {
        res.status(400).json({ 
          ok: false, 
          error: 'El formato del email no es válido' 
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
   * POST /send-verification
   * Enviar código de verificación
   * Body: { email }
   * Response: { ok: boolean, data?: SimpleMessage, error?: string }
   */
  sendVerification = async (req: Request, res: Response): Promise<void> => {
    try {
      const sendData: SendVerificationRequest = req.body;
      
      // Validación del email
      if (!sendData.email) {
        res.status(400).json({ 
          ok: false, 
          error: 'Email es requerido' 
        });
        return;
      }

      // Validación básica del formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sendData.email)) {
        res.status(400).json({ 
          ok: false, 
          error: 'El formato del email no es válido' 
        });
        return;
      }

      const result = await this.service.sendVerification(sendData);
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
   * Restablecer contraseña con código
   * Body: { email, code, new_password }
   * Response: { ok: boolean, data?: SimpleMessage, error?: string }
   */
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const resetData: ResetPasswordRequest = req.body;
      
      // Validación de campos requeridos
      if (!resetData.email || !resetData.code || !resetData.new_password) {
        res.status(400).json({ 
          ok: false, 
          error: 'Email, código y nueva contraseña son requeridos' 
        });
        return;
      }

      // Validación de longitud mínima de contraseña
      if (resetData.new_password.length < 6) {
        res.status(400).json({ 
          ok: false, 
          error: 'La nueva contraseña debe tener al menos 6 caracteres' 
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
          sendVerification: 'POST /send-verification',
          forgotPassword: 'POST /forgot-password',
          resetPassword: 'POST /reset-password'
        }
      });
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * MÉTODOS DE STATUS POR ENDPOINT
   * ==============================
   */

  /**
   * GET /register/status
   * Verificar conectividad del endpoint de registro
   */
  getRegisterStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const status = await this.service.checkEndpointStatus('register');
      const httpStatus = status.ok ? 200 : 503;
      res.status(httpStatus).json(status);
    } catch (error) {
      res.status(500).json({ 
        ok: false, 
        endpoint: 'register',
        error: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * GET /login/status
   * Verificar conectividad del endpoint de login
   */
  getLoginStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const status = await this.service.checkEndpointStatus('login');
      const httpStatus = status.ok ? 200 : 503;
      res.status(httpStatus).json(status);
    } catch (error) {
      res.status(500).json({ 
        ok: false, 
        endpoint: 'login',
        error: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * GET /logout/status
   * Verificar conectividad del endpoint de logout
   */
  getLogoutStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const status = await this.service.checkEndpointStatus('logout');
      const httpStatus = status.ok ? 200 : 503;
      res.status(httpStatus).json(status);
    } catch (error) {
      res.status(500).json({ 
        ok: false, 
        endpoint: 'logout',
        error: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * GET /me/status
   * Verificar conectividad del endpoint de perfil
   */
  getMeStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const status = await this.service.checkEndpointStatus('me');
      const httpStatus = status.ok ? 200 : 503;
      res.status(httpStatus).json(status);
    } catch (error) {
      res.status(500).json({ 
        ok: false, 
        endpoint: 'me',
        error: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * GET /verify-email/status
   * Verificar conectividad del endpoint de verificación de email
   */
  getVerifyEmailStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const status = await this.service.checkEndpointStatus('verifyEmail');
      const httpStatus = status.ok ? 200 : 503;
      res.status(httpStatus).json(status);
    } catch (error) {
      res.status(500).json({ 
        ok: false, 
        endpoint: 'verifyEmail',
        error: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * GET /resend-verification/status
   * Verificar conectividad del endpoint de reenvío de verificación
   */
  getResendVerificationStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const status = await this.service.checkEndpointStatus('resendVerification');
      const httpStatus = status.ok ? 200 : 503;
      res.status(httpStatus).json(status);
    } catch (error) {
      res.status(500).json({ 
        ok: false, 
        endpoint: 'resendVerification',
        error: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * GET /send-verification/status
   * Verificar conectividad del endpoint de envío de verificación
   */
  getSendVerificationStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const status = await this.service.checkEndpointStatus('sendVerification');
      const httpStatus = status.ok ? 200 : 503;
      res.status(httpStatus).json(status);
    } catch (error) {
      res.status(500).json({ 
        ok: false, 
        endpoint: 'sendVerification',
        error: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * GET /forgot-password/status
   * Verificar conectividad del endpoint de recuperación de contraseña
   */
  getForgotPasswordStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const status = await this.service.checkEndpointStatus('forgotPassword');
      const httpStatus = status.ok ? 200 : 503;
      res.status(httpStatus).json(status);
    } catch (error) {
      res.status(500).json({ 
        ok: false, 
        endpoint: 'forgotPassword',
        error: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * GET /refresh/status
   * Verificar conectividad del endpoint de refresh token
   */
  getRefreshStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const status = await this.service.checkEndpointStatus('refresh');
      const httpStatus = status.ok ? 200 : 503;
      res.status(httpStatus).json(status);
    } catch (error) {
      res.status(500).json({ 
        ok: false, 
        endpoint: 'refresh',
        error: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * GET /reset-password/status
   * Verificar conectividad del endpoint de reset password
   */
  getResetPasswordStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const status = await this.service.checkEndpointStatus('resetPassword');
      const httpStatus = status.ok ? 200 : 503;
      res.status(httpStatus).json(status);
    } catch (error) {
      res.status(500).json({ 
        ok: false, 
        endpoint: 'resetPassword',
        error: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * GET /me/push-token/status
   * Verificar conectividad del endpoint de push tokens
   */
  getPushTokenStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const status = await this.service.checkEndpointStatus('pushToken');
      const httpStatus = status.ok ? 200 : 503;
      res.status(httpStatus).json(status);
    } catch (error) {
      res.status(500).json({ 
        ok: false, 
        endpoint: 'pushToken',
        error: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * GET /status/all
   * Verificar conectividad de todos los endpoints de autenticación
   */
  getAllEndpointsStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const allStatus = await this.service.checkAllEndpointsStatus();
      
      // Verificar si todos los endpoints están funcionando
      const allOk = Object.values(allStatus).every(status => status.ok);
      const httpStatus = allOk ? 200 : 503;
      
      res.status(httpStatus).json({
        ok: allOk,
        service: 'auth',
        timestamp: new Date().toISOString(),
        summary: {
          total: Object.keys(allStatus).length,
          healthy: Object.values(allStatus).filter(s => s.ok).length,
          unhealthy: Object.values(allStatus).filter(s => !s.ok).length
        },
        endpoints: allStatus
      });
    } catch (error) {
      res.status(500).json({ 
        ok: false, 
        service: 'auth',
        error: 'Error interno del servidor al verificar endpoints',
        timestamp: new Date().toISOString()
      });
    }
  };
}
