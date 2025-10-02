import { Request, Response } from "express";
import { ok, fail } from "../../../interfaces/apiEnvelope";
import { 
  ListComplejos, 
  GetComplejo, 
  CreateComplejo, 
  UpdateComplejo, 
  DeleteComplejo,
  CambiarEstadoComplejo,
  GetComplejosByDuenio
} from "../../application/ComplejosUseCases";

/**
 * Controlador para operaciones de complejos deportivos.
 * Maneja las peticiones HTTP para gestión de establecimientos deportivos.
 */
export class ComplejosController {
  constructor(
    private listComplejosUC: ListComplejos,
    private getComplejoUC: GetComplejo,
    private createComplejoUC: CreateComplejo,
    private updateComplejoUC: UpdateComplejo,
    private deleteComplejoUC: DeleteComplejo,
    private cambiarEstadoUC: CambiarEstadoComplejo,
    private getComplejosByDuenioUC: GetComplejosByDuenio
  ) {}

  /**
   * Lista complejos con paginación y filtros.
   * GET /complejos
   */
  list = async (req: Request, res: Response) => {
    try {
      const filters = {
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
        q: req.query.q as string | undefined,
        estado: req.query.estado as any,
        comuna: req.query.comuna as string | undefined,
        region: req.query.region as string | undefined,
        duenioId: req.query.duenioId ? Number(req.query.duenioId) : undefined,
        calificacionMin: req.query.calificacionMin ? Number(req.query.calificacionMin) : undefined,
        servicios: req.query.servicios ? (req.query.servicios as string).split(',') as any : undefined,
      };
      
      const result = await this.listComplejosUC.execute(filters);
      res.json(ok(result));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Obtiene un complejo específico.
   * GET /complejos/:id
   */
  get = async (req: Request, res: Response) => {
    try {
      const complejo = await this.getComplejoUC.execute(Number(req.params.id));
      res.json(ok(complejo));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Crea un nuevo complejo.
   * POST /complejos
   */
  create = async (req: Request, res: Response) => {
    try {
      const complejo = await this.createComplejoUC.execute(req.body);
      res.status(201).json(ok(complejo));
    } catch (e: any) {
      res.status(e?.statusCode ?? 400).json(fail(e?.statusCode ?? 400, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Actualiza un complejo.
   * PATCH /complejos/:id
   */
  update = async (req: Request, res: Response) => {
    try {
      const complejo = await this.updateComplejoUC.execute(Number(req.params.id), req.body);
      res.json(ok(complejo));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Elimina un complejo.
   * DELETE /complejos/:id
   */
  delete = async (req: Request, res: Response) => {
    try {
      await this.deleteComplejoUC.execute(Number(req.params.id));
      res.json(ok({ deleted: true }));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Cambia el estado de un complejo.
   * PATCH /complejos/:id/estado
   */
  cambiarEstado = async (req: Request, res: Response) => {
    try {
      const { estado } = req.body;
      if (!estado) {
        return res.status(400).json(fail(400, "Estado es requerido"));
      }
      
      const complejo = await this.cambiarEstadoUC.execute(Number(req.params.id), estado);
      res.json(ok(complejo));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Obtiene complejos de un dueño específico.
   * GET /complejos/duenio/:duenioId
   */
  getByDuenio = async (req: Request, res: Response) => {
    try {
      const complejos = await this.getComplejosByDuenioUC.execute(Number(req.params.duenioId));
      res.json(ok(complejos));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };
}
