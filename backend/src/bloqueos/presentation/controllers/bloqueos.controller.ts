import { Request, Response } from "express";
import { ok, fail } from "../../../interfaces/apiEnvelope";
import { 
  ListBloqueos, 
  GetBloqueo, 
  CreateBloqueo, 
  UpdateBloqueo, 
  DeleteBloqueo,
  VerificarConflictoBloqueo,
  GetBloqueosActivos,
  GetBloqueosByCreador,
  ActivarBloqueo,
  DesactivarBloqueo
} from "../../application/BloqueosUseCases";

/**
 * Controlador para operaciones de bloqueos.
 * Maneja las peticiones HTTP para gestión de bloqueos de canchas.
 */
export class BloqueosController {
  constructor(
    private listBloqueosUC: ListBloqueos,
    private getBloqueoUC: GetBloqueo,
    private createBloqueoUC: CreateBloqueo,
    private updateBloqueoUC: UpdateBloqueo,
    private deleteBloqueoUC: DeleteBloqueo,
    private verificarConflictoUC: VerificarConflictoBloqueo,
    private getBloqueosActivosUC: GetBloqueosActivos,
    private getBloqueosByCreadorUC: GetBloqueosByCreador,
    private activarBloqueoUC: ActivarBloqueo,
    private desactivarBloqueoUC: DesactivarBloqueo
  ) {}

  /**
   * Lista bloqueos con paginación y filtros.
   * GET /bloqueos
   */
  list = async (req: Request, res: Response) => {
    try {
      const filters = {
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
        canchaId: req.query.canchaId ? Number(req.query.canchaId) : undefined,
        complejoId: req.query.complejoId ? Number(req.query.complejoId) : undefined,
        tipo: req.query.tipo as any,
        estado: req.query.estado as any,
        fechaDesde: req.query.fechaDesde ? new Date(req.query.fechaDesde as string) : undefined,
        fechaHasta: req.query.fechaHasta ? new Date(req.query.fechaHasta as string) : undefined,
        creadoPorId: req.query.creadoPorId ? Number(req.query.creadoPorId) : undefined,
        soloActivos: req.query.soloActivos ? req.query.soloActivos === 'true' : undefined,
        q: req.query.q as string | undefined,
      };
      
      const result = await this.listBloqueosUC.execute(filters);
      res.json(ok(result));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Obtiene un bloqueo específico.
   * GET /bloqueos/:id
   */
  get = async (req: Request, res: Response) => {
    try {
      const bloqueo = await this.getBloqueoUC.execute(Number(req.params.id));
      res.json(ok(bloqueo));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Crea un nuevo bloqueo.
   * POST /bloqueos
   */
  create = async (req: Request, res: Response) => {
    try {
      const input = {
        ...req.body,
        fechaInicio: new Date(req.body.fechaInicio),
        fechaFin: new Date(req.body.fechaFin),
      };
      
      const bloqueo = await this.createBloqueoUC.execute(input);
      res.status(201).json(ok(bloqueo));
    } catch (e: any) {
      res.status(e?.statusCode ?? 400).json(fail(e?.statusCode ?? 400, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Actualiza un bloqueo.
   * PATCH /bloqueos/:id
   */
  update = async (req: Request, res: Response) => {
    try {
      const input = { ...req.body };
      
      // Convertir fechas si están presentes
      if (req.body.fechaInicio) {
        input.fechaInicio = new Date(req.body.fechaInicio);
      }
      if (req.body.fechaFin) {
        input.fechaFin = new Date(req.body.fechaFin);
      }
      
      const bloqueo = await this.updateBloqueoUC.execute(Number(req.params.id), input);
      res.json(ok(bloqueo));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Elimina un bloqueo.
   * DELETE /bloqueos/:id
   */
  delete = async (req: Request, res: Response) => {
    try {
      await this.deleteBloqueoUC.execute(Number(req.params.id));
      res.json(ok({ deleted: true }));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Verifica conflictos con otros bloqueos.
   * POST /bloqueos/verificar-conflicto
   */
  verificarConflicto = async (req: Request, res: Response) => {
    try {
      const { canchaId, fechaInicio, fechaFin, bloqueoId } = req.body;
      
      if (!canchaId || !fechaInicio || !fechaFin) {
        return res.status(400).json(fail(400, "canchaId, fechaInicio y fechaFin son requeridos"));
      }
      
      const hayConflicto = await this.verificarConflictoUC.execute({
        canchaId: Number(canchaId),
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        bloqueoId: bloqueoId ? Number(bloqueoId) : undefined,
      });
      
      res.json(ok({ hayConflicto }));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Obtiene bloqueos activos para una cancha.
   * GET /bloqueos/activos/:canchaId
   */
  getActivos = async (req: Request, res: Response) => {
    try {
      const canchaId = Number(req.params.canchaId);
      const { fechaInicio, fechaFin } = req.query;
      
      if (!fechaInicio || !fechaFin) {
        return res.status(400).json(fail(400, "fechaInicio y fechaFin son requeridos"));
      }
      
      const bloqueos = await this.getBloqueosActivosUC.execute(
        canchaId,
        new Date(fechaInicio as string),
        new Date(fechaFin as string)
      );
      
      res.json(ok(bloqueos));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Obtiene bloqueos de un creador específico.
   * GET /bloqueos/creador/:creadoPorId
   */
  getByCreador = async (req: Request, res: Response) => {
    try {
      const creadoPorId = Number(req.params.creadoPorId);
      const bloqueos = await this.getBloqueosByCreadorUC.execute(creadoPorId);
      res.json(ok(bloqueos));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Activa un bloqueo.
   * POST /bloqueos/:id/activar
   */
  activar = async (req: Request, res: Response) => {
    try {
      const bloqueo = await this.activarBloqueoUC.execute(Number(req.params.id));
      res.json(ok(bloqueo));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Desactiva un bloqueo.
   * POST /bloqueos/:id/desactivar
   */
  desactivar = async (req: Request, res: Response) => {
    try {
      const bloqueo = await this.desactivarBloqueoUC.execute(Number(req.params.id));
      res.json(ok(bloqueo));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };
}
