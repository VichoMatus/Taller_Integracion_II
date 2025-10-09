/**
 * CONTROLADOR DE AUTENTICACIÓN
 * ===========================
 * 
 * Este controlador maneja las solicitudes HTTP relacionadas con la autenticación.
 * 
 * Puede funcionar en dos modos:
 * 1. Modo local: Utilizando el repositorio local y autenticación JWT
 * 2. Modo API: Consumiendo una API externa (FastAPI)
 * 
 * Uso:
 * - Utilizar el modo local para desarrollo o pruebas rápidas
 * - Utilizar el modo API para integración con el backend principal
 */

import { Request, Response } from 'express';
import { LocalAuthService } from '../../services/localAuthService';
import { AuthService } from '../../services/authService';
import { UserLogin } from '../../types/authTypes';

// Modo de autenticación
const AUTH_MODE = process.env.AUTH_MODE || 'local'; // 'local' | 'api'

export class AuthController {
  private localService: LocalAuthService;
  private apiService: AuthService;

  constructor() {
    this.localService = new LocalAuthService();
    this.apiService = new AuthService();
  }

  /**
   * POST /login
   * Autenticar usuario en el sistema
   * Body: { email, password }
   * Response: { ok: boolean, data?: TokenResponse, error?: string }
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const credentials: UserLogin = req.body;
      
      // Dependiendo del modo de autenticación, usar el servicio correspondiente
      const result = AUTH_MODE === 'api' 
        ? await this.apiService.login(credentials)
        : await this.localService.login(credentials);
      
      // Determinar código de estado según resultado
      const status = result.ok ? 200 : 401;
      
      // Enviar respuesta
      res.status(status).json(result);
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ 
        ok: false, 
        error: 'Error interno del servidor' 
      });
    }
  };

  /**
   * GET /me
   * Obtener perfil de usuario autenticado
   * Header: Authorization: Bearer <token>
   * Response: { ok: boolean, data?: UserPublic, error?: string }
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      // El middleware de autenticación habrá añadido el usuario al request
      if (!req.user) {
        res.status(401).json({ ok: false, error: 'No autenticado' });
        return;
      }
      
      // En modo local, obtener el perfil completo
      if (AUTH_MODE === 'local') {
        const result = await this.localService.getProfile(req.user.id_usuario);
        const status = result.ok ? 200 : 404;
        res.status(status).json(result);
      } 
      // En modo API, usar el servicio de API
      else {
        // En una implementación completa, aquí se llamaría a this.apiService.getMe()
        res.status(200).json({
          ok: true,
          data: req.user
        });
      }
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };
}