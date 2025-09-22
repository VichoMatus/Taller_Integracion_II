/**
 * CONTROLADOR USUARIO - ENDPOINTS HTTP
 * ===================================
 * 
 * Este controlador define los endpoints HTTP para la gestión de usuarios.
 * Actúa como intermediario entre las peticiones del cliente y el servicio correspondiente.
 * 
 * Patrón utilizado: Backend-for-Frontend (BFF)
 * - Recibe peticiones HTTP del frontend React/Next.js
 * - Delega la lógica al UserService
 * - Retorna respuestas estandarizadas
 * 
 * Endpoints disponibles:
 * - POST /api/usuario/auth/login - Autenticación
 * - POST /api/usuario/auth/logout - Cerrar sesión
 * - GET /api/usuario/profile - Obtener perfil de usuario
 * - PATCH /api/usuario/profile - Actualizar perfil de usuario
 * - GET /api/usuario/complejos - Listar complejos del usuario
 * - GET /api/usuario/complejos/:id - Obtener complejo del usuario
 * - GET /api/usuario/complejos/:id/canchas - Canchas del complejo del usuario
 */

import { Request, Response } from 'express';
import { UserService } from '../../services/usuarioService';
import { LoginRequest } from '../../types/usuarioTypes';

/**
 * CLASE CONTROLADOR PRINCIPAL
 * ===========================
 */
export class UserController {
  private service: UserService;

  constructor() {
    this.service = new UserService();
  }

  /**
   * ENDPOINTS DE AUTENTICACIÓN
   * ==========================
   */

  /**
   * POST /auth/login
   * Autenticar usuario
   * Body: { email: string, password: string }
   * Response: { ok: boolean, data?: TokenResponse, error?: string }
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const credentials: LoginRequest = req.body;
      const result = await this.service.login(credentials);
      
      const status = result.ok ? 200 : 401;
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * POST /auth/logout
   * Cerrar sesión del usuario
   * Body: { refresh_token: string }
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refresh_token } = req.body;
      const result = await this.service.logout(refresh_token);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * ENDPOINTS DE GESTIÓN DE USUARIOS
   * ================================
   */

  /**
   * GET /profile
   * Obtener perfil del usuario autenticado
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId; // Suponiendo que el ID de usuario está en el token
      const result = await this.service.getUserById(userId);
      
      const status = result.ok ? 200 : 404;
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * PATCH /profile
   * Actualizar perfil del usuario autenticado
   * Body: { nombre?: string, email?: string, telefono?: string }
   */
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const result = await this.service.updateUser(userId, req.body);
      
      const status = result.ok ? 200 : 400;
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  // Complejos del usuario - Proxy directo
  getComplejos = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const result = await this.service.getComplejosByUserId(userId, req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  getComplejoById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const id = parseInt(req.params.id);
      const result = await this.service.getComplejoByIdAndUserId(id, userId, req.query);
      
      const status = result.ok ? 200 : 404;
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  getComplejoCanchas = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const result = await this.service.getComplejoCanchas(id);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  /**
   * Normaliza los datos de usuario recibidos de la API para el frontend.
   * - Renombra campos
   * - Elimina información innecesaria
   * - Formatea fechas
   * - Convierte valores nulos/undefined
   */
  normalizeUsuarioData(apiData: any): any {
    if (!apiData) return null;

    return {
        id: apiData.id,
        nombre: apiData.nombre,
        email: apiData.email,
        telefono: apiData.telefono ?? '',
        rol: apiData.rol,
        activo: Boolean(apiData.activo),
        fechaRegistro: apiData.fecha_registro 
            ? new Date(apiData.fecha_registro).toISOString() 
            : null,
        // Puedes agregar más campos normalizados según lo que requiera el frontend
        // Ejemplo: avatar: apiData.avatar_url ?? null,
    };
  }
}