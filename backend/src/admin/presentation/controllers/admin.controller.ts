import { Request, Response } from "express";
import { ok, fail } from "../../../interfaces/apiEnvelope";
import { 
  GetMisRecursos, GetMisComplejos, GetMisCanchas, GetMisReservas, GetMisEstadisticas, GetEstadisticasComplejo, GetReservasPorDiaSemana, GetReservasPorCancha,
  CreateComplejo, GetComplejo, UpdateComplejo, DeleteComplejo,
  CreateCancha, GetCancha, UpdateCancha, DeleteCancha
} from "../../application/UsersUseCases";

/**
 * Controlador para operaciones del owner de complejos deportivos.
 * Maneja las peticiones HTTP para gestión de complejos, canchas y reservas.
 */
export class AdminController {
  constructor(
    private getMisRecursosUC: GetMisRecursos,
    private getMisComplejosUC: GetMisComplejos,
    private getMisCanchasUC: GetMisCanchas,
    private getMisReservasUC: GetMisReservas,
    private getMisEstadisticasUC: GetMisEstadisticas,
    private getEstadisticasComplejoUC: GetEstadisticasComplejo,
    private getReservasPorDiaSemanaUC: GetReservasPorDiaSemana,
    private getReservasPorCanchaUC: GetReservasPorCancha,
    private createComplejoUC: CreateComplejo,
    private getComplejoUC: GetComplejo,
    private updateComplejoUC: UpdateComplejo,
    private deleteComplejoUC: DeleteComplejo,
    private createCanchaUC: CreateCancha,
    private getCanchaUC: GetCancha,
    private updateCanchaUC: UpdateCancha,
    private deleteCanchaUC: DeleteCancha
  ) {}

  // === HELPER PARA OBTENER OWNER ID ===
  private getOwnerId(req: Request): number {
    // Obtener del JWT o header de prueba
    const ownerId = (req as any)?.user?.id || Number(req.headers["x-user-id"]);
    if (!ownerId) throw new Error("Owner ID no encontrado en el token");
    return ownerId;
  }

  // === PANEL OWNER ===
  
  /**
   * Obtiene resumen de recursos del owner.
   * GET /admin/mis/recursos
   */
  getMisRecursos = async (req: Request, res: Response) => {
    try {
      const ownerId = this.getOwnerId(req);
      const recursos = await this.getMisRecursosUC.execute(ownerId);
      res.json(ok(recursos));
    } catch (e: any) { 
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); 
    }
  };

  /**
   * Obtiene complejos del owner.
   * GET /admin/mis/complejos
   */
  getMisComplejos = async (req: Request, res: Response) => {
    try {
      const ownerId = this.getOwnerId(req);
      const complejos = await this.getMisComplejosUC.execute(ownerId);
      res.json(ok(complejos));
    } catch (e: any) { 
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); 
    }
  };

  /**
   * Obtiene canchas del owner.
   * GET /admin/mis/canchas
   */
  getMisCanchas = async (req: Request, res: Response) => {
    try {
      const ownerId = this.getOwnerId(req);
      const canchas = await this.getMisCanchasUC.execute(ownerId);
      res.json(ok(canchas));
    } catch (e: any) { 
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); 
    }
  };

  /**
   * Obtiene reservas del owner.
   * GET /admin/mis/reservas
   */
  getMisReservas = async (req: Request, res: Response) => {
    try {
      const ownerId = this.getOwnerId(req);
      const filtros = {
        fecha_desde: req.query.fecha_desde as string,
        fecha_hasta: req.query.fecha_hasta as string,
        estado: req.query.estado as string
      };
      const reservas = await this.getMisReservasUC.execute(ownerId, filtros);
      res.json(ok(reservas));
    } catch (e: any) { 
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); 
    }
  };

  /**
   * Obtiene estadísticas del owner.
   * GET /admin/mis/estadisticas
   */
  getMisEstadisticas = async (req: Request, res: Response) => {
    try {
      const ownerId = this.getOwnerId(req);
      const estadisticas = await this.getMisEstadisticasUC.execute(ownerId);
      res.json(ok(estadisticas));
    } catch (e: any) { 
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); 
    }
  };

  /**
   * Obtiene estadísticas detalladas de un complejo específico.
   * GET /admin/complejos/:id/estadisticas
   */
  getEstadisticasComplejo = async (req: Request, res: Response) => {
    try {
      const ownerId = this.getOwnerId(req);
      const complejoId = Number(req.params.id);
      const estadisticas = await this.getEstadisticasComplejoUC.execute(ownerId, complejoId);
      res.json(ok(estadisticas));
    } catch (e: any) { 
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); 
    }
  };

  /**
   * Obtiene reservas agrupadas por día de la semana para gráficos de barras.
   * GET /admin/complejos/:id/estadisticas/reservas-semana
   */
  getReservasPorDiaSemana = async (req: Request, res: Response) => {
    try {
      const ownerId = this.getOwnerId(req);
      const complejoId = Number(req.params.id);
      const diasAtras = req.query.dias ? Number(req.query.dias) : undefined;
      const datos = await this.getReservasPorDiaSemanaUC.execute(ownerId, complejoId, diasAtras);
      res.json(ok(datos));
    } catch (e: any) { 
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); 
    }
  };

  /**
   * Obtiene reservas agrupadas por cancha para gráficos de barras comparativos.
   * GET /admin/complejos/:id/estadisticas/reservas-cancha
   */
  getReservasPorCancha = async (req: Request, res: Response) => {
    try {
      const ownerId = this.getOwnerId(req);
      const complejoId = Number(req.params.id);
      const diasAtras = req.query.dias ? Number(req.query.dias) : undefined;
      const datos = await this.getReservasPorCanchaUC.execute(ownerId, complejoId, diasAtras);
      res.json(ok(datos));
    } catch (e: any) { 
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); 
    }
  };

  // === GESTIÓN DE COMPLEJOS ===

  /**
   * Lista complejos del owner.
   * GET /admin/complejos
   */
  listComplejos = async (req: Request, res: Response) => {
    try {
      const ownerId = this.getOwnerId(req);
      const complejos = await this.getMisComplejosUC.execute(ownerId);
      res.json(ok(complejos));
    } catch (e: any) { 
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); 
    }
  };

  /**
   * Crea un complejo.
   * POST /admin/complejos
   */
  createComplejo = async (req: Request, res: Response) => {
    try {
      const ownerId = this.getOwnerId(req);
      const complejo = await this.createComplejoUC.execute(ownerId, req.body);
      res.status(201).json(ok(complejo));
    } catch (e: any) { 
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); 
    }
  };

  /**
   * Obtiene un complejo específico.
   * GET /admin/complejos/:id
   */
  getComplejo = async (req: Request, res: Response) => {
    try {
      const ownerId = this.getOwnerId(req);
      const complejoId = Number(req.params.id);
      const complejo = await this.getComplejoUC.execute(ownerId, complejoId);
      res.json(ok(complejo));
    } catch (e: any) { 
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); 
    }
  };

  /**
   * Actualiza un complejo.
   * PATCH /admin/complejos/:id
   */
  updateComplejo = async (req: Request, res: Response) => {
    try {
      const ownerId = this.getOwnerId(req);
      const complejoId = Number(req.params.id);
      const complejo = await this.updateComplejoUC.execute(ownerId, complejoId, req.body);
      res.json(ok(complejo));
    } catch (e: any) { 
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); 
    }
  };

  /**
   * Elimina un complejo.
   * DELETE /admin/complejos/:id
   */
  deleteComplejo = async (req: Request, res: Response) => {
    try {
      const ownerId = this.getOwnerId(req);
      const complejoId = Number(req.params.id);
      await this.deleteComplejoUC.execute(ownerId, complejoId);
      res.json(ok({ deleted: true }));
    } catch (e: any) { 
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); 
    }
  };

  // === GESTIÓN DE CANCHAS ===

  /**
   * Lista canchas del owner.
   * GET /admin/canchas
   */
  listCanchas = async (req: Request, res: Response) => {
    try {
      const ownerId = this.getOwnerId(req);
      const canchas = await this.getMisCanchasUC.execute(ownerId);
      res.json(ok(canchas));
    } catch (e: any) { 
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); 
    }
  };

  /**
   * Crea una cancha.
   * POST /admin/canchas
   */
  createCancha = async (req: Request, res: Response) => {
    try {
      const ownerId = this.getOwnerId(req);
      const cancha = await this.createCanchaUC.execute(ownerId, req.body);
      res.status(201).json(ok(cancha));
    } catch (e: any) { 
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); 
    }
  };

  /**
   * Obtiene una cancha específica.
   * GET /admin/canchas/:id
   */
  getCancha = async (req: Request, res: Response) => {
    try {
      const ownerId = this.getOwnerId(req);
      const canchaId = Number(req.params.id);
      const cancha = await this.getCanchaUC.execute(ownerId, canchaId);
      res.json(ok(cancha));
    } catch (e: any) { 
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); 
    }
  };

  /**
   * Actualiza una cancha.
   * PATCH /admin/canchas/:id
   */
  updateCancha = async (req: Request, res: Response) => {
    try {
      const ownerId = this.getOwnerId(req);
      const canchaId = Number(req.params.id);
      const cancha = await this.updateCanchaUC.execute(ownerId, canchaId, req.body);
      res.json(ok(cancha));
    } catch (e: any) { 
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); 
    }
  };

  /**
   * Elimina una cancha.
   * DELETE /admin/canchas/:id
   */
  deleteCancha = async (req: Request, res: Response) => {
    try {
      const ownerId = this.getOwnerId(req);
      const canchaId = Number(req.params.id);
      await this.deleteCanchaUC.execute(ownerId, canchaId);
      res.json(ok({ deleted: true }));
    } catch (e: any) { 
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details)); 
    }
  };
}
