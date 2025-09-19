import { Request, Response } from 'express';
import { SuperAdminService } from '../../services/superAdminService';
import { LoginRequest } from '../../types/superAdminTypes';

// Controlador simplificado - Solo pasa datos entre frontend y API
export class SuperAdminController {
  private service: SuperAdminService;

  constructor() {
    this.service = new SuperAdminService();
  }

  // Auth
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

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refresh_token } = req.body;
      const result = await this.service.logout(refresh_token);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  // Users - Proxy directo
  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.getUsers(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const result = await this.service.getUserById(id);
      
      const status = result.ok ? 200 : 404;
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const result = await this.service.updateUser(id, req.body);
      
      const status = result.ok ? 200 : 400;
      res.status(status).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const result = await this.service.deleteUser(id);
      
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