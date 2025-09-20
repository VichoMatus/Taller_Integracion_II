import { Request, Response } from "express";
import { ok, fail } from "../../../interfaces/apiEnvelope";
import { 
  ListCanchas, 
  GetCancha, 
  CreateCancha, 
  UpdateCancha, 
  DeleteCancha,
  CambiarEstadoCancha,
  GetCanchasDisponibles
} from "../../application/CanchasUseCases";

/**
 * Controlador para operaciones de canchas.
 * Maneja las peticiones HTTP para gestión de canchas deportivas.
 */
export class CanchasController {
  constructor(
    private listCanchasUC: ListCanchas,
    private getCanchaUC: GetCancha,
    private createCanchaUC: CreateCancha,
    private updateCanchaUC: UpdateCancha,
    private deleteCanchaUC: DeleteCancha,
    private cambiarEstadoUC: CambiarEstadoCancha,
    private getCanchasDisponiblesUC: GetCanchasDisponibles
  ) {}

  /**
   * Lista canchas con paginación y filtros.
   * GET /canchas
   */
  list = async (req: Request, res: Response) => {
    try {
      const filters = {
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
        q: req.query.q as string | undefined,
        tipo: req.query.tipo as any,
        estado: req.query.estado as any,
        establecimientoId: req.query.establecimientoId ? Number(req.query.establecimientoId) : undefined,
        techada: req.query.techada ? req.query.techada === 'true' : undefined,
        precioMax: req.query.precioMax ? Number(req.query.precioMax) : undefined,
        capacidadMin: req.query.capacidadMin ? Number(req.query.capacidadMin) : undefined,
      };
      
      const result = await this.listCanchasUC.execute(filters);
      res.json(ok(result));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Obtiene una cancha específica.
   * GET /canchas/:id
   */
  get = async (req: Request, res: Response) => {
    try {
      const cancha = await this.getCanchaUC.execute(Number(req.params.id));
      res.json(ok(cancha));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Crea una nueva cancha.
   * POST /canchas
   */
  create = async (req: Request, res: Response) => {
    try {
      const cancha = await this.createCanchaUC.execute(req.body);
      res.status(201).json(ok(cancha));
    } catch (e: any) {
      res.status(e?.statusCode ?? 400).json(fail(e?.statusCode ?? 400, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Actualiza una cancha.
   * PATCH /canchas/:id
   */
  update = async (req: Request, res: Response) => {
    try {
      const cancha = await this.updateCanchaUC.execute(Number(req.params.id), req.body);
      res.json(ok(cancha));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Elimina una cancha.
   * DELETE /canchas/:id
   */
  delete = async (req: Request, res: Response) => {
    try {
      await this.deleteCanchaUC.execute(Number(req.params.id));
      res.json(ok({ deleted: true }));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Cambia el estado de una cancha.
   * PATCH /canchas/:id/estado
   */
  cambiarEstado = async (req: Request, res: Response) => {
    try {
      const { estado } = req.body;
      if (!estado) {
        return res.status(400).json(fail(400, "Estado es requerido"));
      }
      
      const cancha = await this.cambiarEstadoUC.execute(Number(req.params.id), estado);
      res.json(ok(cancha));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Obtiene canchas disponibles en un período.
   * GET /canchas/disponibles
   */
  getDisponibles = async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin, tipo } = req.query;
      
      if (!fechaInicio || !fechaFin) {
        return res.status(400).json(fail(400, "fechaInicio y fechaFin son requeridos"));
      }
      
      const inicio = new Date(fechaInicio as string);
      const fin = new Date(fechaFin as string);
      
      const canchas = await this.getCanchasDisponiblesUC.execute(inicio, fin, tipo as any);
      res.json(ok(canchas));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };
}
