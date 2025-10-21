/**
 * CONTROLADOR SUPERADMIN - ENDPOINTS HTTP
 * ======================================
 * 
 * Este controlador define los endpoints HTTP que el frontend puede consumir.
 * Actúa como intermediario entre las peticiones del cliente y el servicio que consume la API FastAPI.
 * 
 * Patrón utilizado: Backend-for-Frontend (BFF)
 * - Recibe peticiones HTTP del frontend React/Next.js
 * - Delega la lógica al SuperAdminService
 * - Retorna respuestas estandarizadas
 * 
 * Endpoints disponibles:
 * - POST /api/super_admin/auth/login - Autenticación
 * - POST /api/super_admin/auth/logout - Cerrar sesión
 * - GET /api/super_admin/users - Listar usuarios
 * - GET /api/super_admin/users/:id - Obtener usuario
 * - PATCH /api/super_admin/users/:id - Actualizar usuario
 * - DELETE /api/super_admin/users/:id - Eliminar usuario
 * - GET /api/super_admin/complejos - Listar complejos
 * - GET /api/super_admin/complejos/:id - Obtener complejo
 * - GET /api/super_admin/complejos/:id/canchas - Canchas del complejo
 * - POST /api/super_admin/system/parameters - Configuración sistema
 * - GET /api/super_admin/system/statistics - Estadísticas
 * - GET /api/super_admin/system/logs - Logs del sistema
 * - GET /api/super_admin/dashboard - Datos del dashboard
 * - GET /api/super_admin/search?q=term - Búsqueda global
 */

import { Request, Response } from 'express';
import { SuperAdminService } from '../../services/superAdminService';
import { LoginRequest } from '../../types/superAdminTypes';

/**
 * CLASE CONTROLADOR PRINCIPAL
 * ===========================
 */
export class SuperAdminController {
  private service: SuperAdminService;

  constructor() {
    this.service = new SuperAdminService();
  }

  /**
   * ENDPOINTS DE AUTENTICACIÓN
   * ==========================
   */

  /**
   * POST /auth/login
   * Autenticar usuario administrador
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
   * GET /users
   * Listar usuarios con paginación y filtros
   * Query params: ?page=1&page_size=20&q=search&rol=admin
   */
  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      // Extraer el token del header Authorization
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1]; // Remover "Bearer " del token
      
      console.log('🔍 [SuperAdminController] getUsers - Token extraído:', {
        hasAuthHeader: !!authHeader,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
      });

      const result = await this.service.getUsers(req.query, token);
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ [SuperAdminController] Error en getUsers:', error);
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const token = req.headers.authorization?.split(' ')[1];
      const result = await this.service.getUserById(id, token);
      
      const status = result.ok ? 200 : 404;
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const token = req.headers.authorization?.split(' ')[1];
      const result = await this.service.updateUser(id, req.body, token);
      
      const status = result.ok ? 200 : 400;
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const token = req.headers.authorization?.split(' ')[1];
      const result = await this.service.deleteUser(id, token);
      
      const status = result.ok ? 200 : 400;
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  // Complejos - Proxy directo
  getComplejos = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.getComplejos(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  getComplejoById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const result = await this.service.getComplejoById(id, req.query);
      
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

  // SuperAdmin específico
  updateSystemParameters = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.updateSystemParameters(req.body);
      
      const status = result.ok ? 200 : 400;
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  getSystemStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.getSystemStatistics();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  getSystemLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.getSystemLogs();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  // Utilidades
  getDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.getDashboardData();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  globalSearch = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.query.q as string;
      
      if (!query) {
        res.status(400).json({ ok: false, error: 'Parámetro de búsqueda requerido' });
        return;
      }

      const result = await this.service.globalSearch(query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };
}