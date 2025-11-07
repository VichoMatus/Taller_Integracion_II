import { Request, Response } from "express";
import { ok, fail } from "../../../interfaces/apiEnvelope";
import { 
  ListResenas, 
  CreateResena, 
  UpdateResena, 
  DeleteResena,
  ReportarResena
} from "../../application/ResenasUseCases";

/**
 * Controlador para operaciones de reseñas.
 * Basado en la API FastAPI de Taller4.
 * Maneja las peticiones HTTP para gestión de reseñas.
 */
export class ResenasController {
  constructor(
    private listResenasUC: ListResenas,
    private createResenaUC: CreateResena,
    private updateResenaUC: UpdateResena,
    private deleteResenaUC: DeleteResena,
    private reportarResenaUC: ReportarResena
  ) {}

  /**
   * Lista reseñas con filtros opcionales (por cancha o complejo).
   * GET /resenas
   * Query params: id_cancha, id_complejo, order, page, page_size
   */
  list = async (req: Request, res: Response) => {
    try {
      const filters = {
        idCancha: req.query.idCancha ? Number(req.query.idCancha) : undefined,
        idComplejo: req.query.idComplejo ? Number(req.query.idComplejo) : undefined,
        order: req.query.order as any,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      };
      
      const result = await this.listResenasUC.execute(filters);
      res.json(ok(result));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Crea una nueva reseña.
   * POST /resenas
   */
  create = async (req: Request, res: Response) => {
    try {
      const resena = await this.createResenaUC.execute(req.body);
      res.status(201).json(ok(resena));
    } catch (e: any) {
      res.status(e?.statusCode ?? 400).json(fail(e?.statusCode ?? 400, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Actualiza una reseña.
   * PATCH /resenas/:id
   */
  update = async (req: Request, res: Response) => {
    try {
      const resena = await this.updateResenaUC.execute(Number(req.params.id), req.body);
      res.json(ok(resena));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Elimina una reseña (permisos: autor, admin/dueno, superadmin).
   * DELETE /resenas/:id
   */
  delete = async (req: Request, res: Response) => {
    try {
      await this.deleteResenaUC.execute(Number(req.params.id));
      res.status(204).send();
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };

  /**
   * Reporta una reseña por contenido inapropiado.
   * POST /resenas/:id/reportar
   * Body: { motivo?: string }
   */
  reportar = async (req: Request, res: Response) => {
    try {
      const { motivo } = req.body;
      
      const result = await this.reportarResenaUC.execute(Number(req.params.id), motivo);
      res.status(201).json(ok(result));
    } catch (e: any) {
      res.status(e?.statusCode ?? 500).json(fail(e?.statusCode ?? 500, e?.message ?? "Error", e?.details));
    }
  };
}
